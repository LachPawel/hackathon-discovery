export interface Project {
  id: string
  name: string
  tagline?: string | null
  description?: string | null
  hackathon_name: string
  hackathon_date?: string | null
  prize?: string | null
  devpost_url?: string | null
  github_url?: string | null
  demo_url?: string | null
  video_url?: string | null
  image_url?: string | null
  technologies?: string[] | null
  got_funding?: boolean | null
  funding_amount?: number | null
  funding_source?: string | null
  became_startup?: boolean | null
  startup_name?: string | null
  startup_url?: string | null
  has_real_users?: boolean | null
  user_count?: number | null
  is_still_active?: boolean | null
  last_activity_date?: string | null
  market_score?: number | null
  team_score?: number | null
  innovation_score?: number | null
  execution_score?: number | null
  overall_score?: number | null
  research_summary?: string | null
  research_sources?: string[] | null
  researched_at?: string | null
  source_type?: string | null
  origin_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Founder {
  id: string
  name: string
  email?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  twitter_url?: string | null
  current_role?: string | null
  current_company?: string | null
  location?: string | null
  bio?: string | null
  founded_startup?: boolean | null
  joined_company?: string | null
  raised_funding?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProjectWithFounders extends Project {
  founders?: Array<{
    founder: Founder
    role?: string | null
  }>
}

export interface Stats {
  total_projects: number
  got_funding: number
  became_startups: number
  has_users: number
}

export interface ProjectFilters {
  got_funding?: boolean
  became_startup?: boolean
}

export interface ScrapeRequest {
  url: string
}

export interface ApiError {
  error: string
  message?: string
}

export interface Hackathon {
  name: string
  url: string
  slug: string
  source?: string
}

export interface ExaSearchResult {
  url: string
  text?: string | null
  title?: string | null
}

export interface ProjectAnalysis {
  got_funding: boolean
  funding_amount: number | null
  funding_source: string | null
  funding_round?: string | null
  funding_date?: string | null
  became_startup: boolean
  startup_name: string | null
  startup_url: string | null
  has_real_users: boolean
  user_count: number | null
  is_still_active: boolean
  summary: string
  achievements?: string | null
  reasoning?: string | null
  key_metrics?: string | null
  timeline?: string | null
  scores: {
    market: number
    team: number
    innovation: number
    execution: number
    overall: number
  }
}

export interface ScrapedProject {
  devpost_url: string
  hackathon_name: string
}

export interface ProjectDetails {
  name: string
  tagline?: string
  description?: string
  devpost_url: string
  github_url?: string
  demo_url?: string
  image_url?: string
  technologies: string[]
  prize?: string
  hackathon_name: string
}

export interface FounderData {
  name: string
  devpost_url?: string
}

export interface ScrapedProjectData {
  details: ProjectDetails
  founders: FounderData[]
}

export interface LLMClient {
  client: any
  defaultModel: string
  provider: 'OpenAI' | 'OpenRouter'
}

