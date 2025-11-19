import { TavilyResearchAgent } from './tavily-agent.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log("🚀 Starting Tavily Agentic Research...\n");

  if (!process.env.TAVILY_API_KEY) {
    console.error("❌ Error: TAVILY_API_KEY is missing in .env file");
    process.exit(1);
  }

  const agent = new TavilyResearchAgent();

  // 1. Discovery Phase
  console.log("--- PHASE 1: DISCOVERY ---");
  const winners = await agent.discoverHackathonWinners("top AI hackathon winners 2024 devpost");
  
  if (winners.length === 0) {
    console.log("No winners found. Exiting.");
    return;
  }

  console.log(`\nFound ${winners.length} projects:`);
  winners.forEach(w => console.log(`- ${w.projectName} (${w.hackathonName}): ${w.description}`));

  // 2. Analysis Phase (Analyze the first 2 for demo purposes)
  console.log("\n--- PHASE 2: DEEP DIVE ANALYSIS ---");
  
  for (const winner of winners.slice(0, 2)) {
    console.log(`\nAnalyzing ${winner.projectName}...`);
    const analysis = await agent.analyzeProject(winner.projectName, winner.hackathonName);
    
    if (analysis) {
      console.log(`\n📊 Report for ${winner.projectName}:`);
      console.log(`   Score: ${analysis.startupPotentialScore}/10`);
      console.log(`   Status: ${analysis.isActive ? 'Active 🟢' : 'Inactive 🔴'}`);
      console.log(`   Founders: ${analysis.founders.join(', ')}`);
      console.log(`   GitHub: ${analysis.githubUrl || 'Not found'}`);
      console.log(`   Reasoning: ${analysis.reasoning}`);
    }
  }
}

run().catch(console.error);
