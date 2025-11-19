import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink, Github, Play, Calendar, Trophy, Award, TrendingUp, Users, Rocket, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import type { Project, VC, MatchAnalysis } from '../types'
import { generateMatchAnalysis } from '../services/matchAnalysis'

// e2vc VC definition with detailed info
const e2vcVC: VC = {
  id: 'e2vc',
  name: 'e2.vc',
  description: 'Early-stage venture capital focused on Emerging Europe',
  focus_geography: ['Emerging Europe', 'Poland', 'Bulgaria', 'Estonia', 'Turkey'],
  focus_sectors: ['AI', 'Dev Tools', 'SaaS', 'Gaming', 'Healthtech'],
  investment_stages: ['Pre-seed', 'Seed'],
  typical_check_size: '$1M',
  philosophy: 'Founder-first approach, global-first mindset, deep expertise in Emerging Europe',
  website: 'https://e2.vc'
}

interface ProjectPageProps {
  project: Project
  onClose: () => void
}

export function ProjectPage({ project, onClose }: ProjectPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'matching'>('story')
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)

  useEffect(() => {
    // Don't hide body overflow - allow scrolling
    return () => {
      // Cleanup if needed
    }
  }, [])

  // Load match analysis when tab changes to matching
  useEffect(() => {
    if (activeTab === 'matching') {
      setLoadingMatch(true)
      generateMatchAnalysis(project, e2vcVC)
        .then(analysis => {
          setMatchAnalysis(analysis)
          setLoadingMatch(false)
        })
        .catch(error => {
          console.error('Error generating match analysis:', error)
          setLoadingMatch(false)
        })
    }
  }, [activeTab, project])

  // Parse research_summary to extract sections
  const parseContent = (summary: string | undefined) => {
    if (!summary) return {}
    
    const sections: Record<string, string> = {}
    const lines = summary.split('\n\n')
    
    let currentSection = 'description'
    let currentContent: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      const headerMatch = trimmed.match(/^(Inspiration|What it does|How we built it|Challenges|Accomplishments|What we learned|What's next):/i)
      if (headerMatch) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n\n')
        }
        currentSection = headerMatch[1].toLowerCase().replace(/\s+/g, '_')
        currentContent = [trimmed.replace(/^[^:]+:\s*/i, '')]
      } else {
        currentContent.push(trimmed)
      }
    }
    
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n\n')
    }
    
    return sections
  }

  const content = parseContent(project.research_summary || project.description)
  
  // Get images - use image_url as main
  const images = project.image_url ? [project.image_url] : []

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center justify-center flex-1">
            <img
              src="/logo.svg"
              alt="e2.vc"
              className="h-6 w-auto"
            />
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content - Two Column Layout */}
      <div className="container mx-auto max-w-7xl px-4 py-8 flex gap-8">
        {/* Left Column - Image Gallery (30-40%) */}
        {images.length > 0 && (
          <div className="w-full md:w-[35%] flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={images[activeImageIndex]}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activeImageIndex ? 'bg-white w-8' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                        idx === activeImageIndex ? 'border-white' : 'border-white/20 hover:border-white/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${project.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column - Project Details (60-70%) */}
        <div className={`flex-1 ${images.length > 0 ? '' : 'max-w-4xl mx-auto'}`}>
          {/* Title and Tagline */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-light text-white mb-3">{project.name}</h1>
            <p className="text-xl text-white/60">{project.tagline || 'No description available'}</p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-8 pb-8 border-b border-white/10">
            {project.hackathon_name && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>{project.hackathon_name}</span>
              </div>
            )}
            {project.hackathon_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.hackathon_date)}</span>
              </div>
            )}
            {project.prize && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{project.prize}</span>
              </div>
            )}
            {project.got_funding && (
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>Funded</span>
              </div>
            )}
            {project.became_startup && (
              <div className="flex items-center gap-2 text-blue-400">
                <Rocket className="w-4 h-4" />
                <span>Startup</span>
              </div>
            )}
            {project.has_real_users && project.user_count && (
              <div className="flex items-center gap-2 text-purple-400">
                <Users className="w-4 h-4" />
                <span>{project.user_count.toLocaleString()} users</span>
              </div>
            )}
          </div>

          {/* Scores */}
          {project.overall_score !== null && project.overall_score !== undefined && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-sm shadow-lg">
              <div>
                <div className="text-xs text-white/60 mb-1">Overall</div>
                <div className="text-2xl font-light text-white">{project.overall_score}/100</div>
              </div>
              {project.market_score !== null && (
                <div>
                  <div className="text-xs text-white/60 mb-1">Market</div>
                  <div className="text-2xl font-light text-white">{project.market_score}/100</div>
                </div>
              )}
              {project.innovation_score !== null && (
                <div>
                  <div className="text-xs text-white/60 mb-1">Innovation</div>
                  <div className="text-2xl font-light text-white">{project.innovation_score}/100</div>
                </div>
              )}
              {project.execution_score !== null && (
                <div>
                  <div className="text-xs text-white/60 mb-1">Execution</div>
                  <div className="text-2xl font-light text-white">{project.execution_score}/100</div>
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-white/10 flex mb-8">
            <button
              onClick={() => setActiveTab('story')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'story'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'updates'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Updates
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'matching'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              e2.vc Matching
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Story Tab */}
            {activeTab === 'story' && (
              <div className="space-y-8">
                {content.inspiration && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">Inspiration</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content.inspiration}
                    </div>
                  </section>
                )}

                {content['what_it_does'] && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">What it does</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content['what_it_does']}
                    </div>
                  </section>
                )}

                {content['how_we_built_it'] && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">How we built it</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content['how_we_built_it']}
                    </div>
                  </section>
                )}

                {content.challenges && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">Challenges we ran into</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content.challenges}
                    </div>
                  </section>
                )}

                {content.accomplishments && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">Accomplishments that we're proud of</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content.accomplishments}
                    </div>
                  </section>
                )}

                {content['what_we_learned'] && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">What we learned</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content['what_we_learned']}
                    </div>
                  </section>
                )}

                {content["what's_next"] && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">What's next</h2>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {content["what's_next"]}
                    </div>
                  </section>
                )}

                {(Object.keys(content).length === 0 || (!content.inspiration && !content['what_it_does'])) && (
                  <section>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                      {project.research_summary || project.description || 'No description available.'}
                    </div>
                  </section>
                )}

                {/* Built With */}
                {project.technologies && project.technologies.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">Built With</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white/80 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Try it out */}
                <section>
                  <h2 className="text-2xl font-light text-white mb-4">Try it out</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.devpost_url && (
                      <a
                        href={project.devpost_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Devpost</span>
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        <span>Demo</span>
                      </a>
                    )}
                    {project.video_url && (
                      <a
                        href={project.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        <span>Video</span>
                      </a>
                    )}
                    {project.startup_url && (
                      <a
                        href={project.startup_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>Startup Website</span>
                      </a>
                    )}
                  </div>
                </section>

                {/* Sources */}
                {project.research_sources && project.research_sources.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-light text-white mb-4">Sources</h2>
                    <div className="space-y-2">
                      {project.research_sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-white/60 hover:text-white transition-colors text-sm"
                        >
                          {source}
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Updates Tab */}
            {activeTab === 'updates' && (
              <div className="space-y-4">
                {project.researched_at && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-white/60 mb-2">
                      {formatDate(project.researched_at)}
                    </div>
                    <div className="text-white/80">
                      Project researched and analyzed
                    </div>
                  </div>
                )}
                {!project.researched_at && (
                  <div className="text-white/60 text-center py-8">
                    No updates yet
                  </div>
                )}
              </div>
            )}

            {/* Matching Tab */}
            {activeTab === 'matching' && (
              <div className="space-y-8">
                {loadingMatch ? (
                  <div className="text-white/60 text-center py-8">
                    Analyzing match with e2.vc...
                  </div>
                ) : matchAnalysis ? (
                  <>
                    {/* Match Score */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-light text-white">Match Score</h2>
                        <div className={`text-4xl font-light ${
                          matchAnalysis.match_score >= 80 ? 'text-green-400' :
                          matchAnalysis.match_score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {matchAnalysis.match_score}/100
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            matchAnalysis.match_score >= 80 ? 'bg-green-400' :
                            matchAnalysis.match_score >= 60 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${matchAnalysis.match_score}%` }}
                        />
                      </div>
                    </section>

                    {/* Overall Assessment */}
                    {matchAnalysis.overall_assessment && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Overall Assessment</h2>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-white/80 leading-relaxed">
                          {matchAnalysis.overall_assessment}
                        </div>
                      </section>
                    )}

                    {/* Fit Scores */}
                    <section>
                      <h2 className="text-2xl font-light text-white mb-4">Fit Analysis</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2">Sector Fit</div>
                          <div className="text-2xl font-light text-white mb-2">{matchAnalysis.sector_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.sector_fit.analysis}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2">Geography Fit</div>
                          <div className="text-2xl font-light text-white mb-2">{matchAnalysis.geography_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.geography_fit.analysis}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2">Stage Fit</div>
                          <div className="text-2xl font-light text-white mb-2">{matchAnalysis.stage_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.stage_fit.analysis}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2">Team Fit</div>
                          <div className="text-2xl font-light text-white mb-2">{matchAnalysis.team_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.team_fit.analysis}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 md:col-span-2">
                          <div className="text-xs text-white/60 mb-2">Market Fit</div>
                          <div className="text-2xl font-light text-white mb-2">{matchAnalysis.market_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.market_fit.analysis}</div>
                        </div>
                      </div>
                    </section>

                    {/* Strengths */}
                    {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Strengths</h2>
                        <div className="space-y-3">
                          {matchAnalysis.strengths.map((strength, idx) => (
                            <div key={idx} className="p-6 bg-green-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm shadow-lg">
                              <div className="text-white font-medium mb-1">{strength.title}</div>
                              <div className="text-white/70 text-sm">{strength.description}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Concerns */}
                    {matchAnalysis.concerns && matchAnalysis.concerns.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Considerations</h2>
                        <div className="space-y-3">
                          {matchAnalysis.concerns.map((concern, idx) => (
                            <div key={idx} className="p-6 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 backdrop-blur-sm shadow-lg">
                              <div className="text-white font-medium mb-1">{concern.title}</div>
                              <div className="text-white/70 text-sm">{concern.description}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Recommendation */}
                    {matchAnalysis.recommendation && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Recommendation</h2>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-white/80 leading-relaxed">
                          {matchAnalysis.recommendation}
                        </div>
                      </section>
                    )}

                    {/* Next Steps */}
                    {matchAnalysis.next_steps && matchAnalysis.next_steps.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Next Steps</h2>
                        <ul className="space-y-2">
                          {matchAnalysis.next_steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80">
                              <span className="text-white/40 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="text-white/60 text-center py-8">
                    Unable to generate match analysis
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

