import axios from 'axios'
import type { Project, VC, MatchAnalysis } from '../types'

const API_URL = '/api'

export async function generateMatchAnalysis(project: Project, vc: VC): Promise<MatchAnalysis> {
  // Use OpenAI API via backend endpoint
  try {
    const { data } = await axios.post<MatchAnalysis>(`${API_URL}/match/${project.id}`)
    return data
  } catch (error) {
    console.error('Error generating match analysis:', error)
    // Fallback to basic analysis if API fails
    return generateFallbackAnalysis(project, vc)
  }
}

function generateFallbackAnalysis(project: Project, vc: VC): MatchAnalysis {
  // Simple fallback analysis if API fails
  const projectStory = project.research_summary || project.description || project.tagline || ''
  
  return {
    match_score: 60,
    overall_assessment: `Basic analysis indicates moderate potential for ${vc.name}. The project shows promise but a detailed AI analysis is currently unavailable.`,
    strengths: project.prize ? [{
      title: 'Hackathon Winner',
      description: 'The project has demonstrated technical capability and resourcefulness by winning a hackathon, which aligns with e2.vc\'s founder-first approach.'
    }] : [],
    concerns: [],
    sector_fit: {
      score: 50,
      analysis: `Moderate sector alignment. Unable to perform detailed analysis.`
    },
    geography_fit: {
      score: 50,
      analysis: `Moderate geographic fit. Unable to perform detailed analysis.`
    },
    stage_fit: {
      score: 70,
      analysis: `Reasonable stage fit. As a hackathon winner, the project is likely at pre-seed/seed stage suitable for ${vc.name}'s investment profile.`
    },
    team_fit: {
      score: 60,
      analysis: `Moderate team fit. Hackathon winners typically demonstrate technical capability and resourcefulness.`
    },
    market_fit: {
      score: 50,
      analysis: `Moderate market potential. Unable to perform detailed analysis.`
    },
    recommendation: 'Unable to generate detailed recommendation. Please try again or contact support.',
    next_steps: [
      'Try refreshing the match analysis',
      'Ensure OpenAI API key is configured in backend',
      'Check project details are complete'
    ]
  }
}
