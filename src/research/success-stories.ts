import dotenv from 'dotenv'
import { researchSuccessStories } from './exa-agent.js'

dotenv.config()

console.log('🎯 Success Stories Agent\n')

const useAgentic = process.argv.includes('--agentic') || !process.argv.includes('--no-agentic')

researchSuccessStories(useAgentic)
  .then(() => {
    console.log('\n✓ Success stories research completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })

