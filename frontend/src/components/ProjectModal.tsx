import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Play, Calendar, Trophy, Award, TrendingUp, Users, Rocket, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { Project, VC, MatchAnalysis } from '../types'
import { generateMatchAnalysis } from '../services/matchAnalysis'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

// e2vc VC definition
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

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'matching'>('story')
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Load match analysis when project changes
  useEffect(() => {
    if (project && isOpen) {
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
  }, [project, isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!project) return null

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
      
      // Check if it's a section header
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
  
  // Get images - use image_url as main, could be extended to support multiple images
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-black border border-white/10 rounded-lg z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-light text-white">Project Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Scrollable Content - Two Column Layout */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              {/* Left Column - Image Gallery */}
              {images.length > 0 && (
                <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 bg-white/5">
                  <div className="relative w-full h-64 md:h-full min-h-[400px] bg-white/5">
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
                    <div className="grid grid-cols-4 gap-2 p-4 border-t border-white/10">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative aspect-square overflow-hidden rounded border-2 transition-all ${
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
              )}

              {/* Right Column - Project Details */}
              <div className="w-full md:w-1/2 flex flex-col">
                {/* Header with Title */}
                <div className="p-6 border-b border-white/10">
                  <h1 className="text-3xl md:text-4xl font-light text-white mb-2">{project.name}</h1>
                  <p className="text-white/60 text-lg">{project.tagline || 'No description available'}</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 flex">
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

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
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

                {/* Story Tab Content */}
                {activeTab === 'story' && (
                  <div className="space-y-8">
                    {/* Inspiration */}
                    {content.inspiration && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Inspiration</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content.inspiration}
                        </div>
                      </section>
                    )}

                    {/* What it does */}
                    {content['what_it_does'] && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">What it does</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content['what_it_does']}
                        </div>
                      </section>
                    )}

                    {/* How we built it */}
                    {content['how_we_built_it'] && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">How we built it</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content['how_we_built_it']}
                        </div>
                      </section>
                    )}

                    {/* Challenges */}
                    {content.challenges && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Challenges we ran into</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content.challenges}
                        </div>
                      </section>
                    )}

                    {/* Accomplishments */}
                    {content.accomplishments && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">Accomplishments that we're proud of</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content.accomplishments}
                        </div>
                      </section>
                    )}

                    {/* What we learned */}
                    {content['what_we_learned'] && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">What we learned</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content['what_we_learned']}
                        </div>
                      </section>
                    )}

                    {/* What's next */}
                    {content["what's_next"] && (
                      <section>
                        <h2 className="text-2xl font-light text-white mb-4">What's next</h2>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {content["what's_next"]}
                        </div>
                      </section>
                    )}

                    {/* Fallback to description if no sections */}
                    {Object.keys(content).length === 0 && project.description && (
                      <section>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {project.description}
                        </div>
                      </section>
                    )}

                    {/* Research Summary fallback */}
                    {Object.keys(content).length === 0 && project.research_summary && (
                      <section>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {project.research_summary}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* Updates Tab Content */}
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

                {/* Matching Tab Content */}
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
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="text-xs text-white/60 mb-2">Sector Fit</div>
                              <div className="text-2xl font-light text-white mb-2">{matchAnalysis.sector_fit.score}/100</div>
                              <div className="text-sm text-white/60">{matchAnalysis.sector_fit.analysis}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="text-xs text-white/60 mb-2">Geography Fit</div>
                              <div className="text-2xl font-light text-white mb-2">{matchAnalysis.geography_fit.score}/100</div>
                              <div className="text-sm text-white/60">{matchAnalysis.geography_fit.analysis}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="text-xs text-white/60 mb-2">Stage Fit</div>
                              <div className="text-2xl font-light text-white mb-2">{matchAnalysis.stage_fit.score}/100</div>
                              <div className="text-sm text-white/60">{matchAnalysis.stage_fit.analysis}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
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
                                <div key={idx} className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
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
                                <div key={idx} className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
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

                        {/* e2.vc Info */}
                        <section className="pt-8 border-t border-white/10">
                          <h2 className="text-2xl font-light text-white mb-4">About e2.vc</h2>
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                            <div className="text-white/80">{e2vcVC.description}</div>
                            <div>
                              <div className="text-xs text-white/60 mb-1">Focus Sectors</div>
                              <div className="flex flex-wrap gap-2">
                                {e2vcVC.focus_sectors.map((sector, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-white/10 rounded text-sm text-white/80">
                                    {sector}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-white/60 mb-1">Investment Stage</div>
                              <div className="text-white/80">{e2vcVC.investment_stages.join(', ')} • {e2vcVC.typical_check_size}</div>
                            </div>
                            {e2vcVC.website && (
                              <a
                                href={e2vcVC.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Visit e2.vc
                              </a>
                            )}
                          </div>
                        </section>
                      </>
                    ) : (
                      <div className="text-white/60 text-center py-8">
                        Unable to generate match analysis
                      </div>
                    )}
                  </div>
                )}

                {/* Built With */}
                {project.technologies && project.technologies.length > 0 && (
                  <section className="pt-8 border-t border-white/10">
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
                <section className="pt-8 border-t border-white/10">
                  <h2 className="text-2xl font-light text-white mb-4">Try it out</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.devpost_url && (
                      <a
                        href={project.devpost_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>Startup Website</span>
                      </a>
                    )}
                  </div>
                </section>

                {/* Submitted to */}
                {project.hackathon_name && (
                  <section className="pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-light text-white mb-4">Submitted to</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white/60" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{project.hackathon_name}</div>
                        {project.hackathon_date && (
                          <div className="text-white/60 text-sm">{formatDate(project.hackathon_date)}</div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Sources */}
                {project.research_sources && project.research_sources.length > 0 && (
                  <section className="pt-8 border-t border-white/10">
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

