import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveProject, supabase } from '../db/supabase.js';
import type { ScrapedProject, ScrapedProjectData } from '../types/index.js';

export async function scrapeHackathonWinners(hackathonUrl: string, hackathonName: string): Promise<ScrapedProject[]> {
  console.log(`\nScraping: ${hackathonName} (${hackathonUrl})`);
  
  // Validate URL format
  if (!hackathonUrl || !hackathonUrl.startsWith('http')) {
    console.error(`  ✗ Invalid URL: ${hackathonUrl}`);
    return [];
  }
  
  try {
    const response = await axios.get(hackathonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 404, etc.
    });
    
    if (response.status === 404) {
      console.log(`  ⚠ Hackathon page not found (404)`);
      return [];
    }
    
    if (response.status !== 200) {
      console.log(`  ⚠ Unexpected status: ${response.status}`);
      return [];
    }
    
    const $ = cheerio.load(response.data);
    const projects: ScrapedProject[] = [];
    
    // Devpost project gallery structure - try multiple selectors
    const selectors = [
      '#software-entries .software-entry',
      '.software-entry',
      '.gallery-entry',
      '[data-software-id]'
    ];
    
    let foundProjects = false;
    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        const $elem = $(elem);
        const projectLink = $elem.find('a.block-wrapper-link, a[href*="/software/"]').first().attr('href');
        
        if (projectLink) {
          foundProjects = true;
          projects.push({
            devpost_url: projectLink.startsWith('http') ? projectLink : `https://devpost.com${projectLink}`,
            hackathon_name: hackathonName
          });
        }
      });
      
      if (foundProjects) break;
    }
    
    if (projects.length === 0) {
      console.log(`  ⚠ No projects found. Page might use different structure.`);
    } else {
      console.log(`  ✓ Found ${projects.length} projects`);
    }
    
    return projects;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error(`  ✗ Connection error: ${error.message}`);
      } else if (error.response) {
        console.error(`  ✗ HTTP ${error.response.status}: ${error.message}`);
      } else {
        console.error(`  ✗ Error scraping gallery: ${error.message}`);
      }
    } else {
      const err = error as Error;
      console.error(`  ✗ Error scraping gallery: ${err.message}`);
    }
    return [];
  }
}

export async function scrapeProjectDetails(projectUrl: string, hackathonName: string): Promise<ScrapedProjectData | null> {
  try {
    const response = await axios.get(projectUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract all details
    const name = $('h1#app-title').text().trim();
    const tagline = $('p.large.mb3').first().text().trim();
    const description = $('#app-details-left').text().trim().slice(0, 2000);
    
    // Links
    const github_url = $('a[href*="github.com"]').first().attr('href') || undefined;
    const demo_url = $('a.software-links').filter((i, el) => 
      $(el).text().toLowerCase().includes('try')
    ).first().attr('href') || undefined;
    
    // Image
    const image_url = $('#gallery img').first().attr('src') || undefined;
    
    // Technologies - look for tags
    const technologies: string[] = [];
    $('#built-with a').each((i, elem) => {
      technologies.push($(elem).text().trim());
    });
    
    // Prizes won
    const prizes: string[] = [];
    $('.winner-award').each((i, elem) => {
      prizes.push($(elem).text().trim());
    });
    
    // Team
    const founders: Array<{ name: string; devpost_url?: string }> = [];
    $('#software-team .software-team-member').each((i, elem) => {
      const $member = $(elem);
      const founderName = $member.find('.user-profile-name').text().trim();
      const founderUrl = $member.find('a').attr('href');
      
      if (founderName) {
        founders.push({
          name: founderName,
          devpost_url: founderUrl
        });
      }
    });
    
    return {
      details: {
        name: name || 'Unnamed Project',
        tagline,
        description,
        devpost_url: projectUrl,
        github_url,
        demo_url,
        image_url,
        technologies,
        prize: prizes.join(', ') || undefined,
        hackathon_name: hackathonName,
      },
      founders
    };
  } catch (error) {
    const err = error as Error;
    console.error(`Error scraping ${projectUrl}:`, err.message);
    return null;
  }
}

export async function scrapeAndSave(
  hackathonUrlOrLimit: string | number,
  hackathonNameOrLimit?: string | number,
  limit?: number
): Promise<void> {
  // Handle different function signatures for backward compatibility
  const hackathons: Array<{ url: string; name: string }> = [];
  let projectLimit = 15;
  
  if (typeof hackathonUrlOrLimit === 'string' && hackathonUrlOrLimit.startsWith('http')) {
    // New signature: scrapeAndSave(url, name, limit)
    hackathons.push({ 
      url: hackathonUrlOrLimit, 
      name: (typeof hackathonNameOrLimit === 'string' ? hackathonNameOrLimit : 'Unknown Hackathon')
    });
    projectLimit = (typeof limit === 'number' ? limit : 15);
  } else {
    // Old signature: scrapeAndSave(limit) - but no hardcoded hackathons anymore
    // This will only work if called with a URL, otherwise return empty
    if (typeof hackathonUrlOrLimit === 'number') {
      projectLimit = hackathonUrlOrLimit;
      console.log('No hackathons provided. Use discoverHackathons() first or provide a URL.');
      return;
    }
    projectLimit = 50; // Increased limit
  }
  
  console.log('Starting Devpost scraper...\n');
  
  for (const hackathon of hackathons) {
    const projectUrls = await scrapeHackathonWinners(hackathon.url, hackathon.name);
    
    for (const project of projectUrls.slice(0, projectLimit)) {
      console.log(`\nProcessing: ${project.devpost_url}`);
      
      const projectData = await scrapeProjectDetails(project.devpost_url, project.hackathon_name);
      
      if (projectData) {
        try {
          // Check for duplicates by name
          const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('name', projectData.details.name)
            .single();

          if (existing) {
            console.log(`  ⚠ Skipping duplicate: ${projectData.details.name}`);
            continue;
          }

          await saveProject({
            ...projectData.details,
            technologies: projectData.details.technologies || []
          });
          console.log(`✓ Saved: ${projectData.details.name}`);
        } catch (error) {
          const err = error as Error;
          console.error(`✗ Failed:`, err.message);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

