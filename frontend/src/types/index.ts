export interface Project {
  id: string
  name: string
  tagline?: string
  description?: string
  hackathon_name: string
  hackathon_date?: string
  prize?: string
  devpost_url?: string
  github_url?: string
  demo_url?: string
  video_url?: string
  image_url?: string
  technologies?: string[]
  got_funding?: boolean
  funding_amount?: number
  funding_source?: string
  became_startup?: boolean
  startup_name?: string
  startup_url?: string
  has_real_users?: boolean
  user_count?: number
  is_still_active?: boolean
  market_score?: number
  team_score?: number
  innovation_score?: number
  execution_score?: number
  overall_score?: number
  research_summary?: string
  research_sources?: string[]
  researched_at?: string
  source_type?: string
  origin_url?: string
}

export interface Stats {
  total_projects: number
  got_funding: number
  became_startups: number
  has_users: number
}

export interface VC {
  id: string
  name: string
  description: string
  focus_geography: string[]
  focus_sectors: string[]
  investment_stages: string[]
  typical_check_size: string
  philosophy: string
  notable_exits?: string[]
  portfolio_companies?: string[]
  website?: string
}

export interface MatchAnalysis {
  match_score: number
  overall_assessment: string
  strengths: {
    title: string
    description: string
  }[]
  concerns: {
    title: string
    description: string
  }[]
  sector_fit: {
    score: number
    analysis: string
  }
  geography_fit: {
    score: number
    analysis: string
  }
  stage_fit: {
    score: number
    analysis: string
  }
  team_fit: {
    score: number
    analysis: string
  }
  market_fit: {
    score: number
    analysis: string
  }
  recommendation: string
  verification_checks?: {
    check: string
    passed: boolean
    notes: string
  }[]
  next_steps: string[]
}
