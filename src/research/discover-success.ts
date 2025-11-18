import dotenv from 'dotenv'
import Exa from 'exa-js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { supabase } from '../db/supabase.js'
import { analyzeSuccessStory, buildResearchSummary } from './exa-agent.js'
import type { Project, ExaSearchResult, ProjectAnalysis } from '../types/index.js'

dotenv.config()

if (!process.env.EXA_API_KEY) {
  throw new Error('EXA_API_KEY not set')
}

const exa = new Exa(process.env.EXA_API_KEY)
const DEFAULT_LIMIT = 25

const DISCOVERY_QUERIES = [
  'hackathon project raised seed funding 2024 2025',
  'hackathon winner startup launched product users',
  'hackathon project became startup raised funding',
  'hackathon demo product launched real users',
  'hackathon project acquired company',
  'hackathon winner YC Y Combinator',
  'hackathon project series A funding',
  'hackathon built app startup users'
]

const SUCCESS_KEYWORDS = [
  'raised',
  'funding',
  'million',
  'seed round',
  'series a',
  'series b',
  'investment',
  'acquired',
  'acquisition',
  'partnership',
  'launched',
  'users',
  'traction',
  'went viral',
  'backed by',
  'secured funding'
]

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))
const filePath = fileURLToPath(import.meta.url)
const cliPath = process.argv[1] ? path.resolve(process.argv[1]) : ''

interface Candidate {
  name: string
  description?: string | null
  snippet?: string
  sourceTitle?: string | null
  hackathonName: string
  hackathonDate?: string | null
  devpostUrl?: string | null
  sourceUrl: string
  sourceDomain?: string | null
  sourceResult: ExaSearchResult
  imageUrl?: string | null
  signal: 'funding' | 'traction' | 'acquisition' | null
  technologies?: string[]
}

// Keywords that indicate this is NOT a hackathon project (but rather an article/blog)
const ARTICLE_KEYWORDS = [
  'announcing',
  'winners of',
  'here are the',
  'top seed startups',
  'these are the',
  'celebrating innovation',
  'hackathon rewind',
  'what happens after',
  'blog',
  'article',
  'news',
  'press release',
  'prnewswire',
  'techcrunch',
  'linkedin.com/posts',
  'linkedin.com/pulse'
]

// Keywords that indicate this IS about a specific project
const PROJECT_KEYWORDS = [
  'built at',
  'created at',
  'developed at',
  'won',
  'project',
  'app',
  'platform',
  'startup',
  'raised',
  'funding',
  'demo',
  'prototype'
]

const sanitizeName = (title: string = ''): string => {
  let cleaned = title
    .replace(/[-–|].*$/, '')
    .replace(/Devpost/i, '')
    .replace(/Winner/i, '')
    .replace(/Announcing/i, '')
    .replace(/Here are the/i, '')
    .replace(/These are the/i, '')
    .replace(/Winners of/i, '')
    .replace(/Celebrating Innovation:/i, '')
    .replace(/2024 Hackathon Rewind:/i, '')
    .replace(/What Happens After the Hackathon:/i, '')
    .replace(/Turning Winning Ideas into/i, '')
    .replace(/s$/, '') // Remove trailing 's' from "winners", "announcements", etc.
    .trim()
  
  // If it's too long, it's probably a headline/article title, not a project name
  if (cleaned.length > 100) {
    return ''
  }
  
  return cleaned
}

const extractHackathon = (text: string = ''): string => {
  // Try to find specific hackathon names
  const patterns = [
    /(?:at|from|during|won|built at|created at)\s+([A-Z][a-zA-Z0-9\s&-]+(?:Hackathon|Hack)(?:\s+[0-9]{4})?)/i,
    /([A-Z][a-zA-Z0-9\s&-]+(?:Hackathon|Hack)(?:\s+[0-9]{4})?)/i,
    /(?:hackathon|hack)\s+([A-Z][a-zA-Z0-9\s&-]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const hackathon = match[1].trim().replace(/\s+/g, ' ')
      if (hackathon.length > 5 && hackathon.length < 80) {
        return hackathon
      }
    }
  }
  
  return 'Unknown Hackathon'
}

// Check if the result is actually about a hackathon project (not just an article)
const isValidHackathonProject = (result: ExaSearchResult): boolean => {
  const text = `${result.title || ''} ${result.text || ''}`.toLowerCase()
  const url = result.url?.toLowerCase() || ''
  
  // Skip if it's clearly an article/blog post
  if (ARTICLE_KEYWORDS.some(keyword => text.includes(keyword) || url.includes(keyword))) {
    return false
  }
  
  // Skip LinkedIn posts, blog posts, news articles
  if (url.includes('/blog/') || 
      url.includes('/posts/') || 
      url.includes('/pulse/') ||
      url.includes('prnewswire') ||
      url.includes('techcrunch.com') ||
      url.includes('linkedin.com/posts') ||
      url.includes('linkedin.com/pulse')) {
    return false
  }
  
  // Must mention a specific project AND hackathon context
  const hasProjectMention = PROJECT_KEYWORDS.some(keyword => text.includes(keyword))
  const hasHackathonContext = text.includes('hackathon') || text.includes('built at') || text.includes('won')
  
  // Must have both project mention and hackathon context
  if (!hasProjectMention || !hasHackathonContext) {
    return false
  }
  
  // Skip if it's just listing winners or announcing a hackathon
  if (text.includes('winners of') && !text.includes('project') && !text.includes('startup')) {
    return false
  }
  
  // Skip if it's too generic (just talking about hackathons in general)
  if (text.includes('hackathon') && !text.match(/(?:built|created|won|developed|project|startup|raised)/i)) {
    return false
  }
  
  return true
}

const findDevpostUrl = (result: ExaSearchResult): string | null => {
  if (result.url?.includes('devpost.com')) return result.url
  const textMatch = result.text?.match(/https?:\/\/[^\s"]*devpost\.com[^\s"]*/i)
  return textMatch ? textMatch[0] : null
}

const hasSuccessSignal = (text: string = ''): boolean => {
  const blob = text.toLowerCase()
  return SUCCESS_KEYWORDS.some(keyword => blob.includes(keyword))
}

const detectSignal = (text: string = ''): 'funding' | 'traction' | 'acquisition' | null => {
  const blob = text.toLowerCase()
  if (blob.includes('acquired') || blob.includes('acquisition')) return 'acquisition'
  if (blob.includes('raised') || blob.includes('funding') || blob.includes('investment') || blob.includes('seed round') || blob.includes('series')) return 'funding'
  if (blob.includes('users') || blob.includes('traction') || blob.includes('launched')) return 'traction'
  return null
}

const sanitizeSources = (sources: (string | null | undefined)[] = []): string[] => {
  const unique = new Set<string>()
  const cleaned: string[] = []

  for (const src of sources) {
    if (!src) continue
    try {
      const url = new URL(src)
      const normalized = url.href.replace(/\/$/, '')
      if (unique.has(normalized)) continue
      unique.add(normalized)
      cleaned.push(normalized)
    } catch {
      // ignore invalid URLs
    }
  }
  return cleaned
}

const ensureScores = (analysis: ProjectAnalysis): ProjectAnalysis['scores'] => {
  analysis.scores = analysis.scores || {
    market: 50,
    team: 50,
    innovation: 50,
    execution: 50,
    overall: 50
  }
  if (!analysis.scores.overall) {
    const values = ['market', 'team', 'innovation', 'execution']
      .map(key => analysis.scores[key as keyof typeof analysis.scores])
      .filter((value): value is number => typeof value === 'number')
    const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 82
    analysis.scores.overall = Math.round(average)
  }
  return analysis.scores
}

const gatherContext = async (name: string, hackathonName: string): Promise<ExaSearchResult[]> => {
  try {
    const followup = await exa.searchAndContents(
      `${name} ${hackathonName} funding success milestone`,
      {
        type: 'auto',
        numResults: 6,
        useAutoprompt: true
      }
    )
    return followup?.results || []
  } catch (error) {
    const err = error as Error
    console.error('  Context search error:', err.message)
    return []
  }
}

const findExistingProject = async (candidate: Candidate): Promise<Project | null> => {
  if (candidate.devpostUrl) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('devpost_url', candidate.devpostUrl)
      .maybeSingle()
    if (data) return data as Project
  }

  let query = supabase.from('projects').select('*').ilike('name', candidate.name)
  if (candidate.hackathonName && candidate.hackathonName !== 'Unknown Hackathon') {
    query = query.ilike('hackathon_name', candidate.hackathonName)
  }

  const { data } = await query.limit(1).maybeSingle()
  return (data as Project) || null
}

// Validate if this is actually a hackathon project (not just an article/blog)
const validateWithLLM = async (candidate: Candidate): Promise<boolean> => {
  // First use heuristics for quick filtering
  const text = `${candidate.sourceTitle || ''} ${candidate.description || ''}`.toLowerCase()
  const nameLower = candidate.name.toLowerCase()
  
  // Must mention the project name or have project indicators
  const hasProjectName = text.includes(nameLower) || 
                         text.includes('project') || 
                         text.includes('startup') || 
                         text.includes('app') ||
                         text.includes('platform')
  
  // Must have hackathon context
  const hasHackathonContext = text.includes('hackathon') || 
                              text.includes('built at') || 
                              text.includes('won') || 
                              text.includes('created at') ||
                              text.includes('developed at')
  
  if (!hasProjectName || !hasHackathonContext) {
    return false
  }
  
  // Additional check: if name is too long or looks like a headline, skip
  if (candidate.name.length > 80) {
    return false
  }
  
  // Try LLM validation for better accuracy (optional, uses heuristics if LLM unavailable)
  try {
    const exaAgentModule = await import('./exa-agent.js')
    const { createLLMClient } = exaAgentModule
    
    if (createLLMClient) {
      const { client: llmClient, defaultModel } = createLLMClient()
      
      const prompt = `Is this about a SPECIFIC hackathon project (not an article/blog post)?

TITLE: ${candidate.name}
TEXT: ${(candidate.description || candidate.snippet || '').slice(0, 400)}

Respond with JSON: {"is_project": boolean, "reason": "brief explanation"}`

      const completion = await llmClient.chat.completions.create({
        model: defaultModel,
        messages: [
          { role: 'system', content: 'You are a validator. Determine if this is about a specific hackathon project, not a general article or blog post. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })
      
      const result = JSON.parse(completion.choices[0].message.content || '{}') as { is_project?: boolean }
      return result.is_project === true
    }
  } catch (error) {
    // If LLM validation fails, use heuristics (already passed above)
    const err = error as Error
    console.log(`  ⚠ LLM validation failed, using heuristics: ${err.message}`)
  }
  
  return true // Passed heuristic checks
}

const processCandidate = async (candidate: Candidate, contextResults: ExaSearchResult[]): Promise<void> => {
  // Validate with LLM that this is actually a project
  const isValid = await validateWithLLM(candidate)
  if (!isValid) {
    console.log(`  ⚠ Skipping: Not a valid hackathon project`)
    return
  }
  
  const existing = await findExistingProject(candidate)
  const projectForAnalysis: Project = existing || {
    id: '',
    name: candidate.name,
    description: candidate.description || candidate.snippet || null,
    hackathon_name: candidate.hackathonName
  } as Project

  const context = contextResults.length ? contextResults : [candidate.sourceResult]
  const analysis = await analyzeSuccessStory(projectForAnalysis, context)
  analysis.scores = ensureScores(analysis)

  if (candidate.signal === 'funding' && !analysis.got_funding) {
    analysis.got_funding = true
    analysis.funding_source = analysis.funding_source || candidate.sourceDomain || null
  }
  if (candidate.signal === 'traction' && !analysis.has_real_users) {
    analysis.has_real_users = true
  }

  const summary = buildResearchSummary(analysis)
  const newSources = sanitizeSources([
    candidate.sourceUrl,
    ...context.map(r => r.url)
  ])

  if (!newSources.length) {
    console.log('  ⚠ Skipping candidate (no valid sources)')
    return
  }

  const combinedSources = sanitizeSources([
    ...(existing?.research_sources || []),
    ...newSources
  ])

  const firstSummaryLine = summary?.split('\n')[0]?.trim() || null

  const payload = {
    name: candidate.name,
    description: candidate.description || existing?.description || null,
    tagline: candidate.sourceTitle || existing?.tagline || firstSummaryLine || undefined,
    hackathon_name: candidate.hackathonName,
    hackathon_date: candidate.hackathonDate || existing?.hackathon_date || null,
    devpost_url: candidate.devpostUrl || existing?.devpost_url || null,
    image_url: candidate.imageUrl || existing?.image_url || null,
    source_type: 'web',
    origin_url: candidate.sourceUrl,
    research_summary: summary,
    research_sources: combinedSources,
    researched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    got_funding: analysis.got_funding,
    funding_amount: analysis.funding_amount,
    funding_source: analysis.funding_source,
    became_startup: analysis.became_startup,
    startup_name: analysis.startup_name,
    startup_url: analysis.startup_url,
    has_real_users: analysis.has_real_users,
    user_count: analysis.user_count,
    is_still_active: analysis.is_still_active,
    market_score: analysis.scores.market,
    team_score: analysis.scores.team,
    innovation_score: analysis.scores.innovation,
    execution_score: analysis.scores.execution,
    overall_score: analysis.scores.overall
  }

  if (existing?.id) {
    await supabase.from('projects').update(payload).eq('id', existing.id)
    console.log(`  ↺ Updated existing project (${existing.id})`)
  } else {
    await supabase
      .from('projects')
      .insert([{ ...payload, technologies: candidate.technologies || [] }])
    console.log('  ✳ Added new project from web discovery')
  }
}

const handleResult = async (result: ExaSearchResult, seenKeys: Set<string>): Promise<boolean> => {
  // First check if this is actually about a hackathon project (not just an article)
  if (!isValidHackathonProject(result)) {
    return false
  }

  const name = sanitizeName(result.title || result.url)
  if (!name || name.length < 5 || name.length > 100) return false

  const textBlob = `${result.title || ''} ${result.text || ''}`
  if (!hasSuccessSignal(textBlob)) return false

  if (!result.url || result.url.includes('devpost.com')) return false
  
  // Additional validation: name shouldn't look like an article title
  const nameLower = name.toLowerCase()
  if (nameLower.startsWith('announcing') || 
      nameLower.startsWith('here are') ||
      nameLower.startsWith('these are') ||
      nameLower.startsWith('winners of') ||
      nameLower.startsWith('celebrating') ||
      nameLower.includes('hackathon winners') ||
      nameLower.includes('hackathon rewind')) {
    return false
  }

  const candidate: Candidate = {
    name,
    description: result.text?.slice(0, 500) || null,
    snippet: result.text || undefined,
    sourceTitle: result.title || null,
    hackathonName: extractHackathon(result.text || ''),
    hackathonDate: null,
    devpostUrl: findDevpostUrl(result),
    sourceUrl: result.url,
    sourceDomain: (() => {
      try {
        return new URL(result.url).hostname.replace(/^www\./, '')
      } catch {
        return null
      }
    })(),
    sourceResult: result,
    imageUrl: (result as any).image || (result as any).main_image || (result as any).thumbnail || null,
    signal: detectSignal(textBlob)
  }

  const dedupeKey = `${candidate.name.toLowerCase()}|${candidate.hackathonName.toLowerCase()}`
  if (seenKeys.has(dedupeKey)) return false
  seenKeys.add(dedupeKey)

  console.log(`\n🔎 Candidate: ${candidate.name}`)
  console.log(`   Hackathon: ${candidate.hackathonName}`)
  console.log(`   Source: ${candidate.sourceUrl}`)

  const context = await gatherContext(candidate.name, candidate.hackathonName)
  await processCandidate(candidate, context)
  await delay(1500)
  return true
}

export async function discoverSuccessStories(limit: number = DEFAULT_LIMIT, _useAgentic: boolean = true): Promise<void> {
  if (!process.env.EXA_API_KEY) {
    throw new Error('EXA_API_KEY not set')
  }

  console.log('🌍 Discovering success stories across the web\n')

  const seenKeys = new Set<string>()
  let processed = 0

  for (const query of DISCOVERY_QUERIES) {
    if (processed >= limit) break
    console.log(`\n🚀 Query: ${query}`)
    try {
      const search = await exa.searchAndContents(query, {
        type: 'auto',
        numResults: 10,
        useAutoprompt: true
      })

      for (const result of search.results || []) {
        if (processed >= limit) break
        const ok = await handleResult(result, seenKeys)
        if (ok) processed += 1
      }
    } catch (error) {
      const err = error as Error
      console.error('Search error:', err.message)
    }
    await delay(2000)
  }

  console.log(`\n✓ Completed discovery. Processed ${processed} candidates.`)
}

const isDirectRun = cliPath && filePath === cliPath

if (isDirectRun) {
  const limit = Number(process.argv[2]) || DEFAULT_LIMIT
  discoverSuccessStories(limit)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error)
      process.exit(1)
    })
}

