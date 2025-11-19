import { createLLMClient } from '../research/exa-agent.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { Project } from '../types/index.js';

// Define the VC interface here since it's not in the backend types yet
export interface VC {
  id: string
  name: string
  description: string
  focus_geography: string[]
  focus_sectors: string[]
  investment_stages: string[]
  typical_check_size: string
  philosophy: string
}

const MatchAnalysisSchema = z.object({
  match_score: z.number().min(0).max(100).describe("Overall match score from 0-100"),
  overall_assessment: z.string().describe("A summary paragraph of the analysis"),
  strengths: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).describe("Key strengths of the project"),
  concerns: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).describe("Key concerns or risks"),
  sector_fit: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string()
  }),
  geography_fit: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string()
  }),
  stage_fit: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string()
  }),
  team_fit: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string()
  }),
  market_fit: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string()
  }),
  recommendation: z.string().describe("Final recommendation: Invest, Watch, or Pass"),
  verification_checks: z.array(z.object({
    check: z.string().describe("What was verified (e.g., 'Sector Alignment', 'Geography')"),
    passed: z.boolean(),
    notes: z.string().describe("Evidence or reasoning")
  })).describe("List of specific criteria verified against the VC thesis"),
  next_steps: z.array(z.string()).describe("Recommended next steps")
});

export async function analyzeMatch(project: Project, vc: VC) {
  const { client, defaultModel } = createLLMClient();

  const prompt = `
    You are a Senior Investment Partner at ${vc.name}.
    Your job is to rigorously screen this hackathon project against your investment thesis.
    
    --- VC PROFILE ---
    Name: ${vc.name}
    Description: ${vc.description}
    Focus Sectors: ${vc.focus_sectors.join(', ')}
    Focus Geography: ${vc.focus_geography.join(', ')}
    Stage: ${vc.investment_stages.join(', ')}
    Philosophy: ${vc.philosophy}
    
    --- PROJECT DATA ---
    Name: ${project.name}
    Tagline: ${project.tagline}
    Description: ${project.description}
    Hackathon: ${project.hackathon_name}
    Prize Won: ${project.prize || 'Unknown'}
    Tech Stack: ${project.technologies?.join(', ') || 'Unknown'}
    Research Summary: ${project.research_summary || 'No deep research available yet.'}
    Active Status: ${project.is_still_active ? 'Active' : 'Inactive/Unknown'}
    
    --- INSTRUCTIONS ---
    1. **Verify Alignment**: First, check if the project strictly matches the VC's Sector and Geography. If not, the score should be low.
    2. **Analyze Quality**: Look for signals of quality (Hackathon winner? Active repo? Founders?).
    3. **Be Critical**: Do not be overly optimistic. Most hackathon projects are not investable. Only give high scores (>80) to exceptional matches.
    4. **Evidence-Based**: Cite specific parts of the project description or research summary in your reasoning.
    
    Generate a detailed investment memo in JSON format.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: defaultModel,
      messages: [
        { role: "system", content: "You are a VC analyst. Output valid JSON matching the schema." },
        { role: "user", content: prompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_match",
          description: "Analyzes the match between a project and a VC",
          parameters: zodToJsonSchema(MatchAnalysisSchema as any),
        }
      }],
      tool_choice: { type: "function", function: { name: "analyze_match" } }
    });

    const toolCall = completion.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("LLM did not return a tool call");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return MatchAnalysisSchema.parse(parsed);

  } catch (error) {
    console.error("Error in analyzeMatch:", error);
    throw error;
  }
}
