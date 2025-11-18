import Exa from 'exa-js';
import { createLLMClient } from './exa-agent.js';
import { supabase } from '../db/supabase.js';
import type { Project, ExaSearchResult, ProjectAnalysis } from '../types/index.js';
import { truncateText } from './exa-agent.js';

// Memory store for learning from past successes
interface QueryMemory {
  projectType: string;
  successfulQueries: string[];
  failedQueries: string[];
  context: string;
  timestamp: Date;
}

class AgenticMemory {
  private memory: QueryMemory[] = [];
  private maxMemorySize = 50;

  // Find similar projects and their successful queries
  findSimilarPatterns(project: Project): string[] {
    const projectType = this.categorizeProject(project);
    const similar = this.memory
      .filter(m => m.projectType === projectType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    // Extract successful queries from similar projects
    const successfulQueries = new Set<string>();
    similar.forEach(m => {
      m.successfulQueries.forEach(q => successfulQueries.add(q));
    });

    return Array.from(successfulQueries);
  }

  // Save successful query patterns
  saveSuccess(project: Project, queries: string[], results: ExaSearchResult[]): void {
    const projectType = this.categorizeProject(project);
    const successfulQueries = queries.filter((q, i) => {
      // Consider query successful if it returned relevant results
      return results.some(r => 
        r.text?.toLowerCase().includes(project.name.toLowerCase()) ||
        r.text?.toLowerCase().includes(project.hackathon_name.toLowerCase())
      );
    });

    this.memory.push({
      projectType,
      successfulQueries,
      failedQueries: queries.filter(q => !successfulQueries.includes(q)),
      context: `${project.name} - ${project.hackathon_name}`,
      timestamp: new Date()
    });

    // Keep memory size manageable
    if (this.memory.length > this.maxMemorySize) {
      this.memory = this.memory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxMemorySize);
    }
  }

  private categorizeProject(project: Project): string {
    const tech = (project.technologies || []).join(' ').toLowerCase();
    const desc = (project.description || '').toLowerCase();
    
    if (tech.includes('ai') || tech.includes('ml') || desc.includes('artificial intelligence')) {
      return 'ai-ml';
    }
    if (tech.includes('blockchain') || tech.includes('web3') || tech.includes('crypto')) {
      return 'blockchain';
    }
    if (tech.includes('mobile') || tech.includes('ios') || tech.includes('android')) {
      return 'mobile';
    }
    if (tech.includes('hardware') || tech.includes('iot') || tech.includes('arduino')) {
      return 'hardware';
    }
    return 'general';
  }
}

const agenticMemory = new AgenticMemory();

// Evaluate search result quality
async function evaluateResultQuality(
  query: string,
  results: ExaSearchResult[],
  project: Project
): Promise<{ quality: number; feedback: string; shouldRefine: boolean }> {
  const { client: llmClient, defaultModel } = createLLMClient();

  const resultsSummary = results
    .slice(0, 3)
    .map(r => `- ${r.url}: ${truncateText(r.text, 100)}`)
    .join('\n');

  const prompt = `Evaluate the quality of these search results for finding information about a hackathon project.

QUERY: "${query}"
PROJECT: ${project.name}
HACKATHON: ${project.hackathon_name}

RESULTS:
${resultsSummary}

Rate the quality (0-100) and provide feedback:
- 80-100: Excellent, highly relevant results
- 60-79: Good, mostly relevant
- 40-59: Moderate, some relevant results
- 20-39: Poor, few relevant results
- 0-19: Very poor, no relevant results

Return JSON:
{
  "quality": number (0-100),
  "feedback": "brief explanation of why this score",
  "shouldRefine": boolean (true if quality < 60 and we should try a better query)
}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a quality evaluator for search results. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const evaluation = JSON.parse(completion.choices[0].message.content || '{}') as {
      quality?: number;
      feedback?: string;
      shouldRefine?: boolean;
    };

    return {
      quality: evaluation.quality || 50,
      feedback: evaluation.feedback || 'Unable to evaluate',
      shouldRefine: evaluation.shouldRefine ?? (evaluation.quality ? evaluation.quality < 60 : true)
    };
  } catch (error) {
    // Fallback: simple heuristic
    const hasRelevantResults = results.some(r =>
      r.text?.toLowerCase().includes(project.name.toLowerCase()) ||
      r.text?.toLowerCase().includes(project.hackathon_name.toLowerCase())
    );

    return {
      quality: hasRelevantResults ? 70 : 30,
      feedback: hasRelevantResults ? 'Some relevant results found' : 'No relevant results',
      shouldRefine: !hasRelevantResults
    };
  }
}

// Refine query based on feedback
async function refineQuery(
  originalQuery: string,
  results: ExaSearchResult[],
  project: Project,
  feedback: string
): Promise<string> {
  const { client: llmClient, defaultModel } = createLLMClient();

  const resultsSummary = results
    .slice(0, 2)
    .map(r => `- ${r.url}: ${truncateText(r.text, 80)}`)
    .join('\n');

  const prompt = `The previous search query didn't return good results. Generate a better, more specific query.

ORIGINAL QUERY: "${originalQuery}"
PROJECT: ${project.name}
DESCRIPTION: ${truncateText(project.description || '', 100)}
TECHNOLOGIES: ${(project.technologies || []).slice(0, 3).join(', ')}
HACKATHON: ${project.hackathon_name}

PREVIOUS RESULTS (for context):
${resultsSummary}

FEEDBACK: ${feedback}

Generate a NEW, IMPROVED search query (max 60 chars) that:
- Is more specific to this project
- Targets funding, startup status, or user growth
- Uses better keywords based on the project details

Return JSON: {"refined_query": "new query here"}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a search query optimizer. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}') as { refined_query?: string };
    return result.refined_query || originalQuery;
  } catch (error) {
    // Fallback: add project name to query
    return `${project.name} ${originalQuery}`;
  }
}

// Create dynamic research plan
async function createResearchPlan(project: Project): Promise<string[]> {
  const { client: llmClient, defaultModel } = createLLMClient();

  // Check memory for similar projects
  const learnedQueries = agenticMemory.findSimilarPatterns(project);

  const prompt = `Create a research plan for finding post-hackathon information about this project.

PROJECT: ${project.name}
DESCRIPTION: ${truncateText(project.description || '', 150)}
TECHNOLOGIES: ${(project.technologies || []).join(', ')}
HACKATHON: ${project.hackathon_name}

${learnedQueries.length > 0 ? `LEARNED FROM SIMILAR PROJECTS:\n${learnedQueries.slice(0, 3).map(q => `- ${q}`).join('\n')}\n` : ''}

Create 4-5 search queries (max 60 chars each) in order of priority:
1. Most likely to find funding information
2. Most likely to find startup/company formation
3. Most likely to find user growth/traction
4. Most likely to find founder updates
5. General post-hackathon news

Return JSON: {"plan": ["query1", "query2", ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a research planner. Create strategic search queries. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}') as { plan?: string[] };
    return result.plan || [];
  } catch (error) {
    // Fallback plan
    return [
      `${project.name} funding raised`,
      `${project.name} startup company`,
      `${project.name} users growth`,
      `${project.name} founders update`
    ];
  }
}

// Decide next action based on results
async function decideNextAction(
  project: Project,
  currentResults: ExaSearchResult[],
  completedQueries: string[],
  plan: string[]
): Promise<{ action: 'continue' | 'refine' | 'deep_dive' | 'complete'; query?: string; reason: string }> {
  const { client: llmClient, defaultModel } = createLLMClient();

  const resultsSummary = currentResults
    .slice(0, 5)
    .map(r => `- ${truncateText(r.text, 100)}`)
    .join('\n');

  const prompt = `Based on research progress, decide the next action.

PROJECT: ${project.name}
COMPLETED QUERIES: ${completedQueries.length}
REMAINING IN PLAN: ${plan.length - completedQueries.length}

CURRENT RESULTS SUMMARY:
${resultsSummary}

Decide next action:
- "continue": Proceed with next query in plan (if we have more queries and results are decent)
- "refine": Current query needs refinement (if results are poor)
- "deep_dive": We found something interesting, investigate deeper (if we found funding/startup signals)
- "complete": We have enough information (if we found comprehensive info)

Return JSON: {"action": "continue|refine|deep_dive|complete", "reason": "brief explanation"}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a research coordinator. Decide the next step. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}') as {
      action?: string;
      reason?: string;
    };

    const action = result.action || 'continue';
    return {
      action: action as 'continue' | 'refine' | 'deep_dive' | 'complete',
      reason: result.reason || 'Proceeding with plan'
    };
  } catch (error) {
    // Fallback: continue if we have more queries
    return {
      action: plan.length > completedQueries.length ? 'continue' : 'complete',
      reason: 'Fallback decision'
    };
  }
}

// Enhanced agentic research with feedback loops and self-correction
export async function agenticResearchProject(
  project: Project,
  exa: Exa
): Promise<ProjectAnalysis | null> {
  console.log(`\n🤖 Agentic Research: ${project.name}`);
  console.log(`   Mode: Enhanced (with feedback, self-correction, planning)`);

  // Step 1: Create research plan
  console.log(`\n📋 Step 1: Creating research plan...`);
  let plan = await createResearchPlan(project);
  console.log(`   Plan: ${plan.length} queries`);

  // Step 2: Execute plan with feedback loops
  const allResults: ExaSearchResult[] = [];
  const completedQueries: string[] = [];
  const maxRefinements = 2;

  for (let i = 0; i < plan.length; i++) {
    let currentQuery = plan[i];
    let refinements = 0;

    while (refinements <= maxRefinements) {
      console.log(`\n🔍 Query ${i + 1}/${plan.length}: "${currentQuery}"`);

      try {
        // Execute search
        const searchResults = await exa.searchAndContents(currentQuery, {
          type: 'auto',
          numResults: 5,
          useAutoprompt: true,
        });

        const results = searchResults?.results || [];

        if (results.length === 0) {
          console.log(`   ⚠️  No results found`);
          
          // Self-correction: Generate alternative query
          if (refinements < maxRefinements) {
            console.log(`   🔄 Self-correcting: Generating alternative query...`);
            currentQuery = await refineQuery(currentQuery, [], project, 'No results returned');
            refinements++;
            await new Promise(r => setTimeout(r, 2000));
            continue;
          } else {
            console.log(`   ⏭️  Skipping after ${maxRefinements} refinements`);
            break;
          }
        }

        // Feedback loop: Evaluate result quality
        console.log(`   📊 Evaluating result quality...`);
        const evaluation = await evaluateResultQuality(currentQuery, results, project);
        console.log(`   Quality: ${evaluation.quality}/100 - ${evaluation.feedback}`);

        // If quality is poor, refine query
        if (evaluation.shouldRefine && refinements < maxRefinements) {
          console.log(`   🔄 Refining query based on feedback...`);
          currentQuery = await refineQuery(currentQuery, results, project, evaluation.feedback);
          refinements++;
          await new Promise(r => setTimeout(r, 2000));
          continue; // Try again with refined query
        }

        // Results are good enough, add them
        allResults.push(...results);
        completedQueries.push(currentQuery);
        console.log(`   ✓ Added ${results.length} results`);

        // Decide next action
        const nextAction = await decideNextAction(project, allResults, completedQueries, plan);
        console.log(`   🎯 Next action: ${nextAction.action} - ${nextAction.reason}`);

        if (nextAction.action === 'deep_dive') {
          // Generate additional focused queries for deep dive
          console.log(`   🔬 Deep dive: Generating focused follow-up queries...`);
          const deepDiveQueries = await createResearchPlan(project);
          plan.push(...deepDiveQueries.slice(0, 2)); // Add 2 more queries
        } else if (nextAction.action === 'complete') {
          console.log(`   ✅ Sufficient information gathered`);
          break; // Exit query loop
        }

        break; // Move to next query in plan

      } catch (error) {
        const err = error as Error;
        console.error(`   ✗ Error: ${err.message}`);

        // Self-correction: Try alternative approach
        if (refinements < maxRefinements) {
          console.log(`   🔄 Self-correcting: Trying alternative query...`);
          currentQuery = await refineQuery(currentQuery, [], project, `Error: ${err.message}`);
          refinements++;
          await new Promise(r => setTimeout(r, 3000));
          continue;
        } else {
          console.log(`   ⏭️  Skipping after ${maxRefinements} refinements`);
          break;
        }
      }

      await new Promise(r => setTimeout(r, 1500)); // Rate limit
    }
  }

  if (allResults.length === 0) {
    console.log(`\n⚠️  No results found after all attempts`);
    return null;
  }

  // Step 3: Analyze with AI (using existing function)
  console.log(`\n📊 Step 3: Analyzing ${allResults.length} results...`);
  const { analyzeWithAI } = await import('./exa-agent.js');
  const analysis = await analyzeWithAI(project, allResults);

  // Step 4: Save to memory for future learning
  console.log(`\n💾 Step 4: Saving successful patterns to memory...`);
  agenticMemory.saveSuccess(project, completedQueries, allResults);

  console.log(`\n✅ Agentic research complete!`);
  console.log(`   Successful queries: ${completedQueries.length}`);
  console.log(`   Total results: ${allResults.length}`);

  return analysis;
}

// Enhanced hackathon discovery with self-correction
export async function agenticDiscoverHackathons(
  query: string,
  limit: number,
  exa: Exa
): Promise<Array<{ name: string; url: string; slug: string; source?: string }>> {
  console.log(`\n🤖 Agentic Hackathon Discovery`);
  
  const { client: llmClient, defaultModel } = createLLMClient();
  let attempts = 0;
  const maxAttempts = 3;
  let allResults: ExaSearchResult[] = [];

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n📋 Attempt ${attempts}/${maxAttempts}`);

    // Generate search queries
    const searchQueries = await generateSearchQueriesWithContext(query, limit, attempts);
    console.log(`   Generated ${searchQueries.length} queries`);

    // Execute searches
    for (const searchQuery of searchQueries) {
      try {
        const searchResults = await exa.searchAndContents(searchQuery, {
          type: 'auto',
          numResults: 15,
          useAutoprompt: true,
        });

        if (searchResults?.results) {
          allResults.push(...searchResults.results);
        }
        await new Promise(r => setTimeout(r, 1500));
      } catch (error) {
        const err = error as Error;
        console.error(`   ⚠️  Error: ${err.message}`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Evaluate if we found enough hackathons
    const hackathons = extractHackathonsFromResults(allResults);
    
    if (hackathons.length >= limit) {
      console.log(`   ✓ Found ${hackathons.length} hackathons`);
      return hackathons.slice(0, limit);
    }

    if (attempts < maxAttempts) {
      console.log(`   ⚠️  Only found ${hackathons.length} hackathons, trying different strategy...`);
      // Self-correction: Adjust strategy
      query = await adjustDiscoveryStrategy(query, hackathons.length, attempts);
    }
  }

  const hackathons = extractHackathonsFromResults(allResults);
  return hackathons.slice(0, limit);
}

async function generateSearchQueriesWithContext(
  query: string,
  limit: number,
  attempt: number
): Promise<string[]> {
  const { client: llmClient, defaultModel } = createLLMClient();

  const prompt = `Generate ${3 + attempt} search queries to find Devpost hackathons.

ORIGINAL QUERY: "${query}"
ATTEMPT: ${attempt}/3
TARGET: Find ${limit} hackathons

${attempt > 1 ? 'Previous attempts found few results. Try different strategies:\n- Use different keywords\n- Try broader or narrower searches\n- Include specific years or event types\n' : ''}

Return JSON: {"queries": ["query1", "query2", ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a search strategist. Adapt queries based on attempt number. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}') as { queries?: string[] };
    return result.queries || [];
  } catch (error) {
    return [
      `Devpost hackathon winners 2025`,
      `Devpost hackathon winners 2024`,
      `Devpost project gallery 2025`
    ];
  }
}

async function adjustDiscoveryStrategy(
  currentQuery: string,
  foundCount: number,
  attempt: number
): Promise<string> {
  const { client: llmClient, defaultModel } = createLLMClient();

  const prompt = `Adjust the discovery strategy. Previous query found only ${foundCount} hackathons.

CURRENT QUERY: "${currentQuery}"
ATTEMPT: ${attempt}

Generate a NEW, DIFFERENT query that:
- Uses alternative keywords
- Tries a different approach
- Is more likely to find hackathon pages

Return JSON: {"adjusted_query": "new query"}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a search strategist. Adjust strategy when results are poor. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}') as { adjusted_query?: string };
    return result.adjusted_query || currentQuery;
  } catch (error) {
    return currentQuery;
  }
}

function extractHackathonsFromResults(results: ExaSearchResult[]): Array<{ name: string; url: string; slug: string; source?: string }> {
  const hackathons: Array<{ name: string; url: string; slug: string; source?: string }> = [];
  const seenUrls = new Set<string>();
  const invalidSlugs = new Set(['www', 'devpost', 'help', 'challenges', 'software', 'users', 'api']);

  for (const result of results) {
    const url = result.url;
    const text = result.text || '';
    const devpostUrlPattern = /https?:\/\/([a-z0-9-]+)\.devpost\.com([^\s\)]*)/gi;
    const matches = [...text.matchAll(devpostUrlPattern), ...url.matchAll(devpostUrlPattern)];

    for (const match of matches) {
      const hackathonSlug = match[1];
      const path = match[2] || '';

      if (invalidSlugs.has(hackathonSlug) || hackathonSlug.length < 3) continue;

      let galleryUrl: string;
      if (path.includes('project-gallery')) {
        galleryUrl = `https://${hackathonSlug}.devpost.com${path.split('?')[0]}`;
      } else {
        galleryUrl = `https://${hackathonSlug}.devpost.com/project-gallery`;
      }

      if (seenUrls.has(galleryUrl)) continue;
      seenUrls.add(galleryUrl);

      // Extract hackathon name
      const nameMatch = text.match(new RegExp(`${hackathonSlug}[^\\s]*\\s+([A-Z][a-zA-Z0-9\\s&-]+(?:Hackathon|Hack))`, 'i'));
      const name = nameMatch ? nameMatch[1] : `${hackathonSlug} Hackathon`;

      hackathons.push({
        name: name.trim(),
        url: galleryUrl,
        slug: hackathonSlug,
        source: result.url
      });
    }
  }

  return hackathons;
}

