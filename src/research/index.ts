import { researchAllProjects, discoverHackathons, researchSuccessStories } from './exa-agent.js';
import { discoverSuccessStories as discoverWebSuccessStories } from './discover-success.js';
import { scrapeAndSave } from '../scraper/devpost.js';

async function discoverScrapeAndResearch(useAgentic: boolean = true): Promise<void> {
  console.log('🤖 AGENTIC RESEARCH MODE');
  console.log('=== Step 1: Discovering Hackathons with Exa ===\n');
  
  let attempts = 0;
  let hackathons: Array<{ name: string; url: string; slug: string; source?: string }> = [];
  const maxAttempts = 3;
  
  // Agentic discovery with retry logic
  while (hackathons.length === 0 && attempts < maxAttempts) {
    attempts++;
    console.log(`\nDiscovery attempt ${attempts}/${maxAttempts}...`);
    
    hackathons = await discoverHackathons('Devpost hackathon winners 2024 and 2025', 5, useAgentic);
    
    if (hackathons.length === 0 && attempts < maxAttempts) {
      console.log('⚠ No hackathons found. Trying different search strategy...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  if (hackathons.length === 0) {
    console.log('⚠ No hackathons found after multiple attempts. Proceeding with existing projects...\n');
    return await researchAllProjects(useAgentic);
  }
  
  console.log(`\n=== Step 2: Scraping ${hackathons.length} Hackathons ===\n`);
  
  // Scrape each discovered hackathon with error recovery
  let successfulScrapes = 0;
  for (const hackathon of hackathons) {
    console.log(`\nScraping: ${hackathon.name}`);
    try {
      await scrapeAndSave(hackathon.url, hackathon.name, 10);
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
  await researchAllProjects(useAgentic);
  
  console.log(`\n=== Step 4: Discovering Web Success Stories ===\n`);
  await discoverWebSuccessStories(20, useAgentic);
  
  console.log(`\n=== Step 5: Deep Research on Success Stories ===\n`);
  
  // Deep research on success stories
  await researchSuccessStories(useAgentic);
}

// Check command line arguments
const shouldDiscover = process.argv[2] !== '--no-discover';
const useAgentic = process.argv.includes('--agentic') || !process.argv.includes('--no-agentic');
const onlySuccessStories = process.argv.includes('--success-stories');
const onlyWebDiscovery = process.argv.includes('--discover-web');

if (onlyWebDiscovery) {
  const limit = Number(process.argv[3]) || 20;
  discoverWebSuccessStories(limit, useAgentic).then(() => {
    console.log('\n✓ Web success stories discovery complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else if (onlySuccessStories) {
  // Just research success stories
  researchSuccessStories(useAgentic).then(() => {
    console.log('\n✓ Success stories research complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else if (shouldDiscover) {
  discoverScrapeAndResearch(useAgentic).then(() => {
    console.log('\n✓ Complete workflow finished');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else {
  // Just research existing projects
  researchAllProjects(useAgentic).then(() => {
    console.log('\n✓ Research complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

