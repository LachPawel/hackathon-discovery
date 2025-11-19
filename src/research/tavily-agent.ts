import { tavily } from '@tavily/core';
import { createLLMClient } from './exa-agent.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Initialize Tavily client
const tavilyClient = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

// Zod schemas for structured output
const HackathonWinnerSchema = z.object({
  projectName: z.string().describe("The name of the winning project"),
  description: z.string().describe("A one-sentence description of what the project does"),
  hackathonName: z.string().describe("The name of the hackathon they won"),
  prize: z.string().optional().describe("The specific prize or place they won (e.g., '1st Place', 'Best UI')"),
  projectUrl: z.string().optional().describe("URL to the project page (Devpost, GitHub, etc.)"),
  technologies: z.array(z.string()).optional().describe("List of technologies used"),
});

const HackathonWinnersListSchema = z.object({
  winners: z.array(HackathonWinnerSchema).describe("List of hackathon winners found"),
});

const ProjectAnalysisSchema = z.object({
  isActive: z.boolean().describe("Whether the project seems to be currently active"),
  hasRecentCommits: z.boolean().describe("Whether there are code commits in the last 3 months"),
  founders: z.array(z.string()).describe("Names of the founders/creators"),
  startupPotentialScore: z.number().min(1).max(10).describe("A score from 1-10 on potential to be a real startup"),
  reasoning: z.string().describe("Explanation for the score and status"),
  githubUrl: z.string().optional().describe("The GitHub repository URL if found"),
  websiteUrl: z.string().optional().describe("The live website URL if found"),
  devpostUrl: z.string().optional().describe("The Devpost project URL if found"),
});

export class TavilyResearchAgent {
  private llmClient;
  private model;

  constructor() {
    if (!tavilyClient) {
      console.warn('⚠️ TAVILY_API_KEY is not set. Search features will not work.');
    }
    const { client, defaultModel } = createLLMClient();
    this.llmClient = client;
    this.model = defaultModel;
  }

  /**
   * Step 1: Discovery
   * Search for recent hackathon winners using Tavily's search optimized for agents.
   */
  async discoverHackathonWinners(query: string = "major hackathon winners 2024 2025 devpost ethglobal solana ai"): Promise<z.infer<typeof HackathonWinnerSchema>[]> {
    console.log(`🔍 Searching for: ${query}`);
    
    if (!tavilyClient) throw new Error("Tavily API Key missing");

    try {
      // 1. Perform the search
      const searchResult = await tavilyClient.search(query, {
        searchDepth: "advanced",
        maxResults: 10,
        includeAnswer: true,
      });

      console.log(`✓ Found ${searchResult.results.length} search results. Analyzing with LLM...`);

      // 2. Use LLM to extract structured data from the search context
      const context = searchResult.results.map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n');
      
      const prompt = `
        You are a Hackathon Scout. Your goal is to find *high-quality* winning projects from the provided search results.
        Only include projects that clearly won a prize (1st, 2nd, 3rd, or major category).
        Ignore participation-only projects.
        
        Extract a list of winning projects, their hackathon, and what they do.
        
        Search Context:
        ${context}
      `;

      const completion = await this.llmClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a helpful research assistant. Output valid JSON matching the schema." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_winners",
            description: "Extracts hackathon winners from text",
            parameters: zodToJsonSchema(HackathonWinnersListSchema as any),
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_winners" } }
      });

      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (!toolCall) {
        console.warn("⚠ LLM did not return a tool call.");
        return [];
      }

      const parsed = JSON.parse(toolCall.function.arguments);
      const result = HackathonWinnersListSchema.parse(parsed);
      
      return result.winners;

    } catch (error) {
      console.error("Error in discoverHackathonWinners:", error);
      return [];
    }
  }

  /**
   * Step 2: Deep Dive & Analysis
   * Research a specific project to determine its viability.
   */
  async analyzeProject(projectName: string, hackathonName?: string): Promise<z.infer<typeof ProjectAnalysisSchema> | null> {
    console.log(`🔬 Deep diving into: ${projectName}...`);
    
    if (!tavilyClient) throw new Error("Tavily API Key missing");

    try {
      // 1. Targeted search for the project
      const query = `"${projectName}" hackathon project "${hackathonName || ''}" github devpost linkedin founders`;
      const searchResult = await tavilyClient.search(query, {
        searchDepth: "advanced",
        maxResults: 5,
      });

      // 2. Analyze with LLM
      const context = searchResult.results.map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n');

      const prompt = `
        Analyze the hackathon project "${projectName}" based on the search results.
        Look for:
        - GitHub repository (is it active?)
        - Founders (who are they?)
        - Live website
        - Devpost URL (very important!)
        - Signs of it becoming a startup (funding, users, hiring)
        
        Rate its "Startup Potential" from 1-10.
        
        Search Context:
        ${context}
      `;

      const completion = await this.llmClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a Venture Capital Analyst. Be critical and realistic." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_project",
            description: "Analyzes a project's viability",
            parameters: zodToJsonSchema(ProjectAnalysisSchema as any),
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_project" } }
      });

      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (!toolCall) return null;

      const parsed = JSON.parse(toolCall.function.arguments);
      return ProjectAnalysisSchema.parse(parsed);

    } catch (error) {
      console.error(`Error analyzing project ${projectName}:`, error);
      return null;
    }
  }
}
