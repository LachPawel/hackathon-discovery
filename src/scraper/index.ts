import { scrapeAndSave } from './devpost.js';

const hackathonUrl = process.argv[2];
const hackathonName = process.argv[3];
const limit = process.argv[4] ? parseInt(process.argv[4]) : 15;

console.log('Starting Devpost scraper...\n');

if (hackathonUrl && hackathonUrl.startsWith('http')) {
  // Scrape specific hackathon
  scrapeAndSave(hackathonUrl, hackathonName, limit).then(() => {
    console.log('\n✓ Scraping complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else {
  // Scrape default hackathons with limit
  const projectLimit = hackathonUrl ? parseInt(hackathonUrl) : 15;
  scrapeAndSave(projectLimit).then(() => {
    console.log('\n✓ Scraping complete');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

