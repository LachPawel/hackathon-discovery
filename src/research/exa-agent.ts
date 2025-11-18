import Exa from 'exa-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { supabase } from '../db/supabase.js';
import type { Project, Hackathon, ExaSearchResult, ProjectAnalysis, LLMClient } from '../types/index.js';

dotenv.config();

if (!process.env.EXA_API_KEY) {
  throw new Error('EXA_API_KEY is required');
}

const exa = new Exa(process.env.EXA_API_KEY);

// Unified LLM client supporting both OpenAI and OpenRouter
export function createLLMClient(): LLMClient {
  // Only use OpenRouter if explicitly enabled (default to OpenAI)
  // Check for explicit flag, ignore OPENROUTER_API_KEY if flag not set
  const useOpenRouter = process.env.USE_OPENROUTER === 'true';
  
  if (useOpenRouter && !process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  USE_OPENROUTER=true but OPENROUTER_API_KEY not set. Falling back to OpenAI.');
  }
  
  const apiKey = useOpenRouter && process.env.OPENROUTER_API_KEY
    ? process.env.OPENROUTER_API_KEY
    : process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Either OPENAI_API_KEY or OPENROUTER_API_KEY must be set');
  }
  
  const baseURL = useOpenRouter 
    ? 'https://openrouter.ai/api/v1'
    : undefined;
  
  const defaultModel = useOpenRouter
    ? (process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo')
    : (process.env.OPENAI_MODEL || 'gpt-4-turbo-preview');
  
  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: useOpenRouter ? {
      'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://github.com',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'Hackathon Discovery'
    } : undefined,
  });
  
  return { client, defaultModel, provider: useOpenRouter ? 'OpenRouter' : 'OpenAI' };
}

const { client: llmClient, defaultModel: defaultLLMModel, provider: llmProvider } = createLLMClient();

// Log which provider is being used (only once when module loads)
if (process.env.NODE_ENV !== 'test') {
  console.log(`🤖 LLM Provider: ${llmProvider} | Model: ${defaultLLMModel}`);
}

// Helper to truncate text to limit token usage
function truncateText(text: string | null | undefined, maxLength: number = 200): string {
  if (!text) return 'N/A';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

interface QueryContext {
  query?: string;
  limit?: number;
  previousAttempts?: number;
}

async function generateResearchQueries(project: Project): Promise<string[]> {
  // Use LLM to generate adaptive research queries based on project details
  // Limit text lengths to reduce token usage
  const prompt = `Generate 3-4 short search queries (max 50 chars each) to find post-hackathon info:

PROJECT: ${truncateText(project.name, 50)}
DESC: ${truncateText(project.description || project.tagline || null, 100)}
TECH: ${truncateText((project.technologies || []).slice(0, 3).join(', '), 50)}
HACKATHON: ${truncateText(project.hackathon_name, 50)}

Search for: funding, startup launch, users, founder updates.

Return JSON: {"queries": ["short query1", "short query2", ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a research agent. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{}') as { queries?: string[] };
    return result.queries || [];
  } catch (error) {
    const err = error as Error;
    console.error('Error generating research queries:', err.message);
    // Fallback to default queries
    return [
      `${project.name} hackathon project funding raised`,
      `${project.name} startup launch users`,
      `${project.name} founders after hackathon`,
    ];
  }
}

export async function researchProject(project: Project, useAgentic: boolean = true): Promise<ProjectAnalysis | null> {
  console.log(`\nResearching: ${project.name}`);
  
  // Generate adaptive search queries using LLM
  const queries = useAgentic 
    ? await generateResearchQueries(project)
    : [
    `${project.name} hackathon project funding raised`,
    `${project.name} startup launch users`,
    `${project.name} founders after hackathon`,
  ];
  
  console.log(`  Using ${queries.length} research queries`);
  
  const allResults: ExaSearchResult[] = [];
  
  for (const query of queries) {
    try {
      const searchResults = await exa.searchAndContents(query, {
        type: 'auto',
        numResults: 5,
        useAutoprompt: true,
      });
      
      allResults.push(...(searchResults.results || []));
      await new Promise(r => setTimeout(r, 1000)); // Rate limit
    } catch (error) {
      const err = error as Error;
      console.error(`Exa search error for "${query}":`, err.message);
    }
  }
  
  if (allResults.length === 0) {
    return null;
  }
  
  // Use AI to analyze findings
  const analysis = await analyzeWithAI(project, allResults);
  
  // Update database
  await supabase
    .from('projects')
    .update({
      got_funding: analysis.got_funding,
      funding_amount: analysis.funding_amount,
      funding_source: analysis.funding_source,
      became_startup: analysis.became_startup,
      startup_name: analysis.startup_name,
      startup_url: analysis.startup_url,
      has_real_users: analysis.has_real_users,
      user_count: analysis.user_count,
      is_still_active: analysis.is_still_active,
      research_summary: buildResearchSummary(analysis),
      research_sources: allResults.map(r => r.url),
      researched_at: new Date().toISOString(),
      market_score: analysis.scores.market,
      team_score: analysis.scores.team,
      innovation_score: analysis.scores.innovation,
      execution_score: analysis.scores.execution,
      overall_score: analysis.scores.overall,
    })
    .eq('id', project.id);
  
  return analysis;
}

export async function analyzeWithAI(project: Project, searchResults: ExaSearchResult[]): Promise<ProjectAnalysis> {
  // Limit context to reduce token usage - take first 5 results, truncate each
  const context = searchResults
    .slice(0, 5)
    .map(r => `Source: ${r.url}\n${truncateText(r.text, 300)}\n`)
    .join('\n---\n');
  
  const prompt = `Analyze post-hackathon journey:

PROJECT: ${truncateText(project.name, 50)}
DESC: ${truncateText(project.description || project.tagline || null, 150)}
HACKATHON: ${truncateText(project.hackathon_name, 50)}

FINDINGS:
${context}

Provide a JSON analysis with:
{
  "got_funding": boolean,
  "funding_amount": number or null,
  "funding_source": string or null,
  "became_startup": boolean,
  "startup_name": string or null,
  "startup_url": string or null,
  "has_real_users": boolean,
  "user_count": number or null,
  "is_still_active": boolean,
  "summary": "2-3 sentence summary of what happened after the hackathon",
  "achievements": "List key achievements, milestones, or notable accomplishments (if any)",
  "reasoning": "Brief explanation of why this project succeeded or failed post-hackathon",
  "scores": {
    "market": 0-100 (market opportunity),
    "team": 0-100 (team quality/execution),
    "innovation": 0-100 (uniqueness),
    "execution": 0-100 (how far they got),
    "overall": 0-100 (average)
  }
}

If no evidence found, return false/null for tracking fields but still provide scores and reasoning.`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a VC analyst researching hackathon projects. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}') as ProjectAnalysis;
    console.log(`✓ Analysis complete for ${project.name}`);
    return analysis;
  } catch (error) {
    const err = error as Error;
    console.error(`AI analysis error:`, err.message);
    return {
      got_funding: false,
      became_startup: false,
      has_real_users: false,
      is_still_active: false,
      funding_amount: null,
      funding_source: null,
      startup_name: null,
      startup_url: null,
      user_count: null,
      summary: 'Research could not be completed',
      achievements: null,
      reasoning: 'Unable to complete research analysis',
      scores: { market: 50, team: 50, innovation: 50, execution: 50, overall: 50 }
    };
  }
}

async function generateSearchQueries(context: QueryContext = {}): Promise<string[]> {
  // Use LLM to generate adaptive search queries based on context
  // Limit context to reduce token usage
  const contextStr = JSON.stringify({
    query: truncateText(context.query, 50),
    limit: context.limit || 5
  });
  
  const prompt = `Generate 3-4 short queries (max 60 chars) to find Devpost hackathons with winners/project galleries.

Context: ${contextStr}

Queries should:
- Target 2025, 2024 hackathons
- Find project galleries/winners
- Be specific but concise

Return JSON: {"queries": ["query1", "query2", ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a research agent. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{}') as { queries?: string[] };
    return result.queries || [];
  } catch (error) {
    const err = error as Error;
    console.error('Error generating queries:', err.message);
    // Fallback to default queries
    return [
      `Devpost hackathon winners 2025 project gallery site:devpost.com`,
      `Devpost hackathon winners 2024 project gallery site:devpost.com`,
      `Devpost hackathon winners project gallery 2025`,
      `Devpost hackathon winners project gallery 2024`,
      `major hackathons Devpost project gallery winners 2025`
    ];
  }
}

async function prioritizeHackathons(hackathons: Hackathon[], context: QueryContext = {}): Promise<Hackathon[]> {
  // Use LLM to prioritize hackathons based on relevance and quality
  if (hackathons.length === 0) return [];
  
  // Limit hackathon names/URLs to reduce tokens
  const hackathonsList = hackathons
    .slice(0, 10) // Limit to 10 for token savings
    .map((h, i) => `${i + 1}. ${truncateText(h.name, 40)}`)
    .join('\n');
  
  const prompt = `Rank these hackathons by: relevance, quality winners, recency.

${hackathonsList}

Return JSON: {"ranked_indices": [2, 0, 1, ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a research agent. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{}') as { ranked_indices?: number[] };
    const ranked = result.ranked_indices || [];
    return ranked.map(i => hackathons[i]).filter(Boolean);
  } catch (error) {
    const err = error as Error;
    console.error('Error prioritizing hackathons:', err.message);
    return hackathons; // Return original order if prioritization fails
  }
}

export async function discoverHackathons(query: string = 'Devpost hackathon winners 2024 and 2025', limit: number = 5, useAgentic: boolean = true): Promise<Hackathon[]> {
  console.log(`\n🤖 Agentic discovery mode: ${useAgentic ? 'ON' : 'OFF'}`);
  console.log(`Discovering hackathons with Exa: "${query}"`);
  
  try {
    // Generate adaptive search queries using LLM
    const searchQueries = useAgentic 
      ? await generateSearchQueries({ query, limit, previousAttempts: 0 })
      : [
          `Devpost hackathon winners 2025 project gallery site:devpost.com`,
          `Devpost hackathon winners 2024 project gallery site:devpost.com`,
          `Devpost hackathon winners project gallery 2025`,
          `Devpost hackathon winners project gallery 2024`,
          `major hackathons Devpost project gallery winners 2025`
        ];
    
    console.log(`Generated ${searchQueries.length} search queries`);
    
    const allResults: ExaSearchResult[] = [];
    
    for (const searchQuery of searchQueries) {
      try {
        const searchResults = await exa.searchAndContents(searchQuery, {
          type: 'auto',
          numResults: 15,
          useAutoprompt: true,
        });
        
        allResults.push(...(searchResults.results || []));
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
      } catch (error) {
        const err = error as Error;
        console.error(`Exa search error for "${searchQuery}":`, err.message);
      }
    }
    
    const hackathons: Hackathon[] = [];
    const seenUrls = new Set<string>();
    
    // Invalid slugs to skip
    const invalidSlugs = new Set(['www', 'devpost', 'help', 'challenges', 'software', 'users', 'api']);
    
    for (const result of allResults) {
      const url = result.url;
      const text = result.text || '';
      
      // Extract all Devpost URLs from the result
      const devpostUrlPattern = /https?:\/\/([a-z0-9-]+)\.devpost\.com([^\s\)]*)/gi;
      const matches = [...text.matchAll(devpostUrlPattern), ...url.matchAll(devpostUrlPattern)];
      
      for (const match of matches) {
        const hackathonSlug = match[1];
        const path = match[2] || '';
        
        // Skip invalid slugs
        if (invalidSlugs.has(hackathonSlug) || hackathonSlug.length < 3) {
          continue;
        }
        
        // Check if this is a project gallery URL or we can construct one
        let galleryUrl: string;
        if (path.includes('project-gallery')) {
          galleryUrl = `https://${hackathonSlug}.devpost.com${path.split('?')[0]}`;
        } else {
          galleryUrl = `https://${hackathonSlug}.devpost.com/project-gallery`;
        }
        
        // Skip if we've already seen this hackathon
        if (seenUrls.has(galleryUrl)) continue;
        seenUrls.add(galleryUrl);
        
        // Extract hackathon name from text
        let hackathonName: string | null = null;
        
        // Try multiple patterns to extract name
        const namePatterns = [
          /(?:hackathon|event)[^:]*:?\s*([^\n\.]{5,60})/i,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+(?:hackathon|hack)/i,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+202[0-9]/i,
          new RegExp(`(${hackathonSlug.replace(/-/g, '[-\\s]+')})`, 'i'),
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = text.match(pattern);
          if (nameMatch && nameMatch[1]) {
            hackathonName = nameMatch[1].trim();
            if (hackathonName.length > 4 && hackathonName.length < 80) {
              break;
            }
          }
        }
        
        // Fallback to formatting the slug
        if (!hackathonName || hackathonName.length < 5) {
          hackathonName = hackathonSlug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\b(ai|api|ml|iot|web|app|ui|ux|saas|b2b|b2c)\b/gi, (m) => m.toUpperCase());
        }
        
        hackathons.push({
          name: hackathonName,
          url: galleryUrl,
          slug: hackathonSlug,
          source: url
        });
      }
    }
    
    // Remove duplicates and validate URLs
    const uniqueHackathons: Hackathon[] = [];
    const seenSlugs = new Set<string>();
    
    for (const hackathon of hackathons) {
      if (!seenSlugs.has(hackathon.slug) && hackathon.url.startsWith('http')) {
        seenSlugs.add(hackathon.slug);
        uniqueHackathons.push(hackathon);
      }
    }
    
    console.log(`✓ Found ${uniqueHackathons.length} unique hackathons`);
    
    // Validate URLs are properly formatted
    let validHackathons = uniqueHackathons
      .filter(h => {
        const isValid = h.url && 
                       h.url.startsWith('https://') && 
                       h.url.includes('.devpost.com') &&
                       h.url.includes('project-gallery') &&
                       h.slug && 
                       h.slug.length > 3 &&
                       h.name && 
                       h.name.length > 3;
        
        if (!isValid) {
          console.log(`  ⚠ Skipping invalid hackathon: ${h.name} - ${h.url}`);
        }
        return isValid;
      });
    
    console.log(`✓ Validated ${validHackathons.length} hackathons`);
    
    // Agentic prioritization
    if (useAgentic && validHackathons.length > 0) {
      console.log(`\n🤖 Prioritizing hackathons using AI reasoning...`);
      validHackathons = await prioritizeHackathons(validHackathons, { query, limit });
      console.log(`✓ Prioritized ${validHackathons.length} hackathons`);
    }
    
    // Log discovered hackathons
    validHackathons.slice(0, limit).forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.name} - ${h.url}`);
    });
    
    return validHackathons.slice(0, limit);
  } catch (error) {
    const err = error as Error;
    console.error(`Exa discovery error:`, err.message);
    return [];
  }
}

export async function researchAllProjects(useAgentic: boolean = true): Promise<void> {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .is('researched_at', null)
    .limit(10);
  
  console.log(`Found ${projects?.length || 0} projects to research`);
  
  if (!projects || projects.length === 0) {
    console.log('No projects to research');
    return;
  }
  
  for (const project of projects as Project[]) {
    try {
      await researchProject(project, useAgentic);
      await new Promise(r => setTimeout(r, 3000)); // Rate limit
    } catch (error) {
      const err = error as Error;
      console.error(`Error researching ${project.name}:`, err.message);
      // Continue with next project instead of failing completely
    }
  }
}

export async function researchSuccessStories(useAgentic: boolean = true): Promise<void> {
  console.log('\n🎯 Researching Success Stories (Funded/Startup Projects)\n');
  
  // Get projects that are marked as success stories but may need deeper research
  const { data: successProjects } = await supabase
    .from('projects')
    .select('*')
    .or('got_funding.eq.true,became_startup.eq.true')
    .order('overall_score', { ascending: false })
    .limit(20);
  
  if (!successProjects || successProjects.length === 0) {
    console.log('⚠️  No success stories found in database.');
    console.log('   This means no projects are marked as funded or startups yet.');
    console.log('   Run "npm run research" first to identify success stories.\n');
    
    // Check if there are any projects at all
    const { data: allProjects } = await supabase
      .from('projects')
      .select('id, name, got_funding, became_startup')
      .limit(5);
    
    if (allProjects && allProjects.length > 0) {
      console.log(`   Found ${allProjects.length} projects in database.`);
      console.log('   They may need initial research to identify success stories.\n');
    } else {
      console.log('   No projects found in database. Run scraper first.\n');
    }
    
    return;
  }
  
  console.log(`Found ${successProjects.length} success stories to research in depth\n`);
  
  for (const project of successProjects as Project[]) {
    try {
      console.log(`\n📊 Deep research: ${project.name}`);
      
      // Generate focused queries for success stories
      const queries = useAgentic 
        ? await generateSuccessStoryQueries(project)
        : [
            `${project.name} funding round amount`,
            `${project.name} startup company`,
            `${project.name} users customers`,
            `${project.name} revenue growth`
          ];
      
      const allResults: ExaSearchResult[] = [];
      
      for (const query of queries) {
        try {
          const searchResults = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 3, // Reduced for cost
            useAutoprompt: true,
          });
          
          allResults.push(...(searchResults.results || []));
          await new Promise(r => setTimeout(r, 1000)); // Rate limit
        } catch (error) {
          const err = error as Error;
          console.error(`  Exa search error:`, err.message);
        }
      }
      
      if (allResults.length > 0) {
        // Deep analysis specifically for success stories with detailed reasoning
        const analysis = await analyzeSuccessStory(project, allResults);
        
        // Build comprehensive summary with achievements and reasoning
        const detailedSummary = buildSuccessStorySummary(analysis, project);
        
        // Update with more detailed information
        await supabase
          .from('projects')
          .update({
            got_funding: analysis.got_funding,
            funding_amount: analysis.funding_amount,
            funding_source: analysis.funding_source,
            became_startup: analysis.became_startup,
            startup_name: analysis.startup_name,
            startup_url: analysis.startup_url,
            has_real_users: analysis.has_real_users,
            user_count: analysis.user_count,
            is_still_active: analysis.is_still_active,
            research_summary: detailedSummary,
            research_sources: [...(project.research_sources || []), ...allResults.map(r => r.url)],
            researched_at: new Date().toISOString(),
            market_score: analysis.scores.market,
            team_score: analysis.scores.team,
            innovation_score: analysis.scores.innovation,
            execution_score: analysis.scores.execution,
            overall_score: analysis.scores.overall,
          })
          .eq('id', project.id);
        
        console.log(`  ✓ Updated: ${project.name}`);
        if (analysis.achievements) {
          console.log(`    Achievements: ${truncateText(analysis.achievements, 100)}`);
        }
      }
      
      await new Promise(r => setTimeout(r, 3000)); // Rate limit
    } catch (error) {
      const err = error as Error;
      console.error(`  ✗ Error: ${err.message}`);
    }
  }
  
  console.log(`\n✓ Success stories research complete`);
}

export async function analyzeSuccessStory(project: Project, searchResults: ExaSearchResult[]): Promise<ProjectAnalysis> {
  // Enhanced analysis for success stories with detailed reasoning
  const context = searchResults
    .slice(0, 8) // More results for success stories
    .map(r => `Source: ${r.url}\n${truncateText(r.text, 400)}\n`)
    .join('\n---\n');
  
  const prompt = `Provide detailed analysis of this SUCCESSFUL hackathon project:

PROJECT: ${truncateText(project.name, 50)}
DESC: ${truncateText(project.description || project.tagline || null, 200)}
HACKATHON: ${truncateText(project.hackathon_name, 50)}
CURRENT STATUS: ${project.got_funding ? 'Funded' : ''} ${project.became_startup ? 'Became Startup' : ''}

RESEARCH FINDINGS:
${context}

Provide detailed JSON analysis:
{
  "got_funding": boolean,
  "funding_amount": number or null,
  "funding_source": string (e.g., "Y Combinator", "Sequoia Capital", "Angel investors"),
  "funding_round": string (e.g., "Seed", "Series A", "Pre-seed"),
  "funding_date": string or null (YYYY-MM format if known),
  "became_startup": boolean,
  "startup_name": string or null,
  "startup_url": string or null,
  "has_real_users": boolean,
  "user_count": number or null,
  "is_still_active": boolean,
  "achievements": "Detailed list of key achievements, milestones, awards, partnerships, or notable accomplishments. Be specific with dates, numbers, and facts.",
  "reasoning": "Comprehensive explanation (3-5 sentences) of WHY this project succeeded: What made it successful? What factors contributed? What was the path from hackathon to success?",
  "key_metrics": "Specific metrics if available: revenue, users, growth rate, partnerships, etc.",
  "timeline": "Brief timeline of major events post-hackathon (if available)",
  "summary": "2-3 sentence executive summary",
  "scores": {
    "market": 0-100,
    "team": 0-100,
    "innovation": 0-100,
    "execution": 0-100,
    "overall": 0-100
  }
}

Be thorough and specific. Include concrete facts, numbers, and dates when available.`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a VC analyst providing detailed research on successful startups. Respond only with valid JSON. Be specific and factual.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}') as ProjectAnalysis;
    return analysis;
  } catch (error) {
    const err = error as Error;
    console.error(`  AI analysis error:`, err.message);
    // Fallback to regular analysis
    return await analyzeWithAI(project, searchResults);
  }
}

export function buildResearchSummary(analysis: ProjectAnalysis): string | null {
  // Build summary with achievements and reasoning for regular research
  let summary = analysis.summary || '';
  
  if (analysis.achievements) {
    summary += `\n\n🎯 Achievements:\n${analysis.achievements}`;
  }
  
  if (analysis.reasoning) {
    summary += `\n\n💡 Analysis:\n${analysis.reasoning}`;
  }
  
  return summary || null;
}

function buildSuccessStorySummary(analysis: ProjectAnalysis, project: Project): string {
  // Build a comprehensive summary with achievements and reasoning for success stories
  let summary = analysis.summary || '';
  
  if (analysis.achievements) {
    summary += `\n\n🎯 Key Achievements:\n${analysis.achievements}`;
  }
  
  if (analysis.reasoning) {
    summary += `\n\n💡 Why This Project Succeeded:\n${analysis.reasoning}`;
  }
  
  if (analysis.key_metrics) {
    summary += `\n\n📊 Key Metrics:\n${analysis.key_metrics}`;
  }
  
  if (analysis.timeline) {
    summary += `\n\n📅 Timeline:\n${analysis.timeline}`;
  }
  
  if (analysis.funding_source && analysis.funding_amount) {
    summary += `\n\n💰 Funding: ${analysis.funding_amount} from ${analysis.funding_source}${analysis.funding_round ? ` (${analysis.funding_round})` : ''}${analysis.funding_date ? ` in ${analysis.funding_date}` : ''}`;
  }
  
  return summary;
}

async function generateSuccessStoryQueries(project: Project): Promise<string[]> {
  const prompt = `Generate 4-5 short queries (max 50 chars) for deep research on a successful hackathon project:

PROJECT: ${truncateText(project.name, 50)}
STATUS: ${project.got_funding ? 'Funded' : ''} ${project.became_startup ? 'Startup' : ''}

Focus on: funding details, achievements, milestones, user growth, company news, partnerships.

Return JSON: {"queries": ["short query1", ...]}`;

  try {
    const completion = await llmClient.chat.completions.create({
      model: defaultLLMModel,
      messages: [
        { role: 'system', content: 'You are a research agent. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{}') as { queries?: string[] };
    return result.queries || [];
  } catch (error) {
    const err = error as Error;
    console.error('Error generating success story queries:', err.message);
    return [
      `${truncateText(project.name, 30)} funding achievements`,
      `${truncateText(project.name, 30)} startup milestones`,
      `${truncateText(project.name, 30)} users growth`,
      `${truncateText(project.name, 30)} success story`
    ];
  }
}

