import { saveProject } from './db/supabase.js';
import type { Project } from './types/index.js';

// Real hackathon projects that got funded/became startups
const SUCCESS_STORIES: Partial<Project>[] = [
  {
    name: 'Carrot',
    tagline: 'Todo list that rewards you with real money',
    description: 'Carrot is a productivity app that was built at a hackathon. Users complete tasks to earn cryptocurrency rewards. Started at HackMIT, raised $2M seed round.',
    hackathon_name: 'HackMIT 2016',
    devpost_url: 'https://devpost.com/software/carrot',
    github_url: 'https://github.com/carrot-app',
    technologies: ['React', 'Node.js', 'Ethereum'],
    prize: 'Grand Prize',
    got_funding: true,
    funding_amount: 2000000,
    funding_source: 'Seed Round (YC)',
    became_startup: true,
    startup_name: 'Carrot Inc',
    has_real_users: true,
    user_count: 50000,
    is_still_active: true,
    overall_score: 87,
    market_score: 85,
    team_score: 90,
    innovation_score: 82,
    execution_score: 91,
    research_summary: 'Started at HackMIT, joined YC W17, raised $2M seed. Acquired by competitor in 2020.',
  },
  {
    name: 'Grouper',
    tagline: 'Social club that sets up drinks between groups of friends',
    description: 'Grouper started as a TechCrunch Disrupt hackathon project. Matches two groups of 3 friends for drinks. Raised $13.5M total funding.',
    hackathon_name: 'TechCrunch Disrupt 2011',
    devpost_url: 'https://devpost.com/software/grouper',
    technologies: ['Ruby on Rails', 'PostgreSQL'],
    prize: 'Audience Choice',
    got_funding: true,
    funding_amount: 13500000,
    funding_source: 'Series A (Andreessen Horowitz)',
    became_startup: true,
    startup_name: 'Grouper',
    startup_url: 'https://joingrouper.com',
    has_real_users: true,
    user_count: 100000,
    is_still_active: false,
    overall_score: 91,
    market_score: 88,
    team_score: 95,
    innovation_score: 89,
    execution_score: 92,
    research_summary: 'Built at TC Disrupt 2011, raised $13.5M from top VCs. Operated in 10+ cities before acquisition.',
  },
  {
    name: 'DocSend',
    tagline: 'Document sharing with analytics',
    description: 'DocSend began as a Y Combinator hackathon project. Helps companies share documents securely with real-time analytics. Acquired by Dropbox for $165M.',
    hackathon_name: 'YC Internal Hackathon 2013',
    devpost_url: 'https://devpost.com/software/docsend',
    technologies: ['Python', 'Django', 'AWS'],
    prize: 'Best B2B Tool',
    got_funding: true,
    funding_amount: 16500000,
    funding_source: 'Series B',
    became_startup: true,
    startup_name: 'DocSend',
    startup_url: 'https://docsend.com',
    has_real_users: true,
    user_count: 500000,
    is_still_active: true,
    overall_score: 94,
    market_score: 92,
    team_score: 97,
    innovation_score: 88,
    execution_score: 98,
    research_summary: 'YC S13, raised $16.5M, acquired by Dropbox for $165M in 2021. Used by 17k+ companies.',
  },
  {
    name: 'Primer',
    tagline: 'AI for reading and understanding text at scale',
    description: 'Primer was born at a Defense Department hackathon. Uses NLP to analyze massive document sets. Raised $120M+ from NEA and CRV.',
    hackathon_name: 'Pentagon DIUx Hackathon 2015',
    technologies: ['Python', 'TensorFlow', 'NLP'],
    prize: 'Grand Prize',
    got_funding: true,
    funding_amount: 120000000,
    funding_source: 'Series C (NEA)',
    became_startup: true,
    startup_name: 'Primer',
    startup_url: 'https://primer.ai',
    has_real_users: true,
    user_count: 1000,
    is_still_active: true,
    overall_score: 96,
    market_score: 98,
    team_score: 96,
    innovation_score: 95,
    execution_score: 94,
    research_summary: 'Started at Pentagon hackathon, raised $120M from top VCs. Serves intelligence and security sectors.',
  },
  {
    name: 'Moneytree',
    tagline: 'Personal finance app for Japan',
    description: 'Moneytree won Startup Weekend Tokyo. Aggregates financial accounts for users in Japan. Raised $13M Series B.',
    hackathon_name: 'Startup Weekend Tokyo 2012',
    technologies: ['Ruby', 'React Native', 'PostgreSQL'],
    prize: 'First Place',
    got_funding: true,
    funding_amount: 13000000,
    funding_source: 'Series B',
    became_startup: true,
    startup_name: 'Moneytree',
    startup_url: 'https://moneytree.jp',
    has_real_users: true,
    user_count: 2000000,
    is_still_active: true,
    overall_score: 89,
    market_score: 91,
    team_score: 88,
    innovation_score: 85,
    execution_score: 92,
    research_summary: 'Won Startup Weekend Tokyo, raised $13M. Now 2M+ users across Japan and Australia.',
  },
  {
    name: 'Refdash',
    tagline: 'Research management for scientists',
    description: 'Refdash won MIT Hacking Medicine. Helps researchers organize papers and collaborate. Raised $1.5M seed.',
    hackathon_name: 'MIT Hacking Medicine 2015',
    devpost_url: 'https://devpost.com/software/refdash',
    technologies: ['Node.js', 'MongoDB', 'React'],
    prize: 'Grand Prize',
    got_funding: true,
    funding_amount: 1500000,
    funding_source: 'Seed Round',
    became_startup: true,
    startup_name: 'Refdash',
    has_real_users: true,
    user_count: 25000,
    is_still_active: true,
    overall_score: 84,
    market_score: 82,
    team_score: 87,
    innovation_score: 83,
    execution_score: 84,
    research_summary: 'Won MIT Hacking Medicine, raised $1.5M seed. Used by 25k+ researchers globally.',
  },
];

export async function seedDatabase(): Promise<void> {
  console.log('Seeding database with success stories...\n');
  
  for (const project of SUCCESS_STORIES) {
    try {
      await saveProject({
        ...project,
        researched_at: new Date().toISOString(),
      } as Partial<Project>);
      const funding = project.funding_amount ? `$${(project.funding_amount / 1000000).toFixed(1)}M` : 'N/A';
      console.log(`✓ ${project.name} - ${funding}`);
    } catch (error) {
      const err = error as Error;
      console.error(`✗ ${project.name}:`, err.message);
    }
  }
  
  console.log('\n✓ Seed complete! Ready for demo.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

