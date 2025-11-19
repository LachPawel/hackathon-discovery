import { researchAllProjects, discoverHackathons } from './exa-agent.js';
import { scrapeAndSave } from '../scraper/devpost.js';
import { agenticDiscoverHackathons } from './agentic-enhanced.js';
import Exa from 'exa-js';
import dotenv from 'dotenv';

dotenv.config();

async function discoverScrapeAndResearch(useAgentic: boolean = true, useEnhancedAgentic: boolean = false): Promise<void> {
  const mode = useEnhancedAgentic ? 'ENHANCED AGENTIC' : (useAgentic ? 'AGENTIC' : 'SCRIPTED');
  console.log(`🤖 ${mode} RESEARCH MODE`);
  console.log('=== Step 1: Discovering Hackathons with Exa ===\n');
  
  let attempts = 0;
  let hackathons: Array<{ name: string; url: string; slug: string; source?: string }> = [];
  const maxAttempts = 3;
  
  // Use enhanced agentic discovery if enabled
  if (useEnhancedAgentic && process.env.EXA_API_KEY) {
    const exa = new Exa(process.env.EXA_API_KEY);
    hackathons = await agenticDiscoverHackathons('Devpost hackathon winners 2024 and 2025', 10, exa);
  } else {
    // Original agentic discovery with retry logic
    while (hackathons.length === 0 && attempts < maxAttempts) {
      attempts++;
      console.log(`\nDiscovery attempt ${attempts}/${maxAttempts}...`);
      
      hackathons = await discoverHackathons('Devpost hackathon winners 2024 and 2025', 10, useAgentic);
      
      if (hackathons.length === 0 && attempts < maxAttempts) {
        console.log('⚠ No hackathons found. Trying different search strategy...');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  if (hackathons.length === 0) {
    console.log('⚠ No hackathons found after multiple attempts. Proceeding with existing projects...\n');
    return await researchAllProjects(useAgentic, useEnhancedAgentic);
  }
  
  console.log(`\n=== Step 2: Scraping ${hackathons.length} Hackathons ===\n`);
  
  // Scrape each discovered hackathon with error recovery
  let successfulScrapes = 0;
  for (const hackathon of hackathons) {
    console.log(`\nScraping: ${hackathon.name}`);
    try {
      await scrapeAndSave(hackathon.url, hackathon.name, 20); // Increased limit
      successfulScrapes++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      const err = error as Error;
      console.error(`✗ Error scraping ${hackathon.name}:`, err.message);
      // Continue with next hackathon instead of failing completely
    }
  }
  
  console.log(`\n✓ Successfully scraped ${successfulScrapes}/${hackathons.length} hackathons`);
  console.log(`\n=== Step 3: Researching Projects ===\n`);
  
  // Research all projects (including newly scraped ones)
  await researchAllProjects(useAgentic, useEnhancedAgentic);
}

// Check command line arguments
const shouldDiscover = process.argv[2] !== '--no-discover';
const useAgentic = process.argv.includes('--agentic') || !process.argv.includes('--no-agentic');
const useEnhancedAgentic = process.argv.includes('--enhanced-agentic') || process.argv.includes('--full-agentic');

if (shouldDiscover) {
  discoverScrapeAndResearch(useAgentic, useEnhancedAgentic).then(() => {
    console.log('\n✓ Complete workflow finished');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else {
  // Just research existing projects
  researchAllProjects(useAgentic, useEnhancedAgentic).then(() => {
    console.log('\n✓ Research complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}


