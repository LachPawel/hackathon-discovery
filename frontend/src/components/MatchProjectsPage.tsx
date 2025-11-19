import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink, Sparkles, TrendingUp, Trophy, Users, Rocket, Building2 } from 'lucide-react'
import type { Project, VC, MatchAnalysis } from '../types'
import { generateMatchAnalysis } from '../services/matchAnalysis'
import { fetchProjects } from '../services/api'

// e2vc VC definition with comprehensive information for AI comparison context
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

// Detailed e2.vc information for comparison context
const e2vcDetailedInfo = {
  whoTheyAre: {
    title: "Who They Are",
    content: "**e2.vc** (formerly **500 Emerging Europe**, previously **500 Istanbul**) is a venture capital fund based in Amsterdam, founded in 2015/2016, specializing in early-stage investments (pre-seed and seed) in startups from Emerging Europe."
  },
  founders: {
    title: "Founders & Key Team",
    items: [
      "**Enis Hulli** - Managing Partner / General Partner",
      "**Arın Özkula** - General Partner",
      "**Dilan Sisu** - Investment Analyst"
    ],
    offices: ["Istanbul", "San Francisco", "Amsterdam", "New York", "London"]
  },
  history: {
    fund1: {
      period: "2016-2020: Fund I",
      details: [
        "Partnership with **500 Global** (formerly 500 Startups)",
        "Capital: **€10 million**",
        "Portfolio: **28 portfolio companies**",
        "Results: **3 unicorns** (companies valued above $1B)",
        "Total employment in portfolio companies: **over 4,000 people**"
      ]
    },
    fund2: {
      period: "2021: Fund II",
      details: [
        "Capital: **€70 million**",
        "Several companies approached unicorn status",
        "Portfolio raised a total of **$3 billion** in subsequent funding rounds from top investors like Sequoia and Andreessen Horowitz"
      ]
    },
    rebranding: {
      period: "November 2024: Rebranding to e2.vc",
      details: [
        "Full independence from 500 Global",
        "New identity emphasizing focus on globally-minded founders from Emerging Europe",
        "\"Business as usual\" - continuation of the same mission and strategy"
      ]
    }
  },
  investmentStrategy: {
    geographicFocus: {
      title: "Geographic Focus",
      regions: [
        "**Eastern Europe** (Poland, Bulgaria, Estonia, etc.)",
        "**Baltic Countries**",
        "**Turkey**",
        "Plus emigrants from these regions in key markets: **SF, NYC, London, Berlin**"
      ]
    },
    sectorFocus: {
      title: "Sector Focus",
      sectors: [
        "**Gaming** (particularly strong in Turkey)",
        "**Dev Tools & Infrastructure**",
        "**AI & Machine Learning**",
        "**Healthtech**",
        "**B2B SaaS**"
      ]
    },
    investmentSize: {
      title: "Investment Size",
      details: [
        "Typically: **$1 million** at pre-seed/idea stage",
        "Stages: **pre-seed to seed**"
      ]
    }
  },
  philosophy: {
    title: "Investment Philosophy",
    content: "**\"Founder-first approach\"** - they first evaluate the team, then the product, competition, metrics, and traction. They focus on:",
    points: [
      "Founders with **\"global-first mindset\"**",
      "Technical talent from regions with small local markets (forcing global thinking from day one)",
      "Model similar to **Israel** - exporting technology from day zero with strong US presence"
    ]
  },
  biggestSuccesses: {
    title: "Biggest Successes (3 Unicorns from Fund I)",
    note: "While e2.vc doesn't publicly disclose their full list of unicorns, based on Turkish ecosystem context, they likely invested in:",
    unicorns: [
      {
        name: "**Peak Games**",
        details: [
          "**Exit**: Acquisition by Zynga for **$1.8B** (2020)",
          "First Turkish unicorn",
          "Games: Toy Blast, Toon Blast",
          "Multiplier effect: 108 former employees founded 82 startups, including 37 gaming ones"
        ]
      },
      {
        name: "**Dream Games**",
        details: [
          "Fastest Turkish unicorn (achieved in **~2 years**)",
          "Valuation: **$2.75B** (2021), later strategic CVC investment",
          "Flagship game: **Royal Match** (top-grossing puzzle game worldwide)",
          "Founders: Veterans from Peak Games",
          "Total funding: **$207.5M+**"
        ]
      },
      {
        name: "Potentially **Getir** or **Trendyol**",
        details: [
          "**Getir**: Quick commerce, peak valuation **$11.8B** (2022), currently **$2.5B**",
          "**Trendyol**: E-commerce, valuation **~$15-16.5B**, Turkey's second decacorn"
        ]
      }
    ]
  },
  performance: {
    title: "Performance & Results",
    stats: [
      "**102 investments** (according to PitchBook)",
      "**19 exits**",
      "**242 co-investors**",
      "Portfolio raised **$3B** in follow-on funding",
      "**3 unicorns** from first fund (returns better than most VC funds)",
      "Average round size: **$4.67M** (Seed), **$18M** (Series A)"
    ],
    coInvestors: [
      "EBRD (European Bank for Reconstruction and Development)",
      "500 Global",
      "Balderton Capital",
      "Index Ventures",
      "Makers Fund",
      "Play Ventures",
      "Sequoia Capital",
      "Andreessen Horowitz"
    ]
  },
  macroThesis: {
    title: "Macro Thesis",
    content: "**\"Emerging Europe is the only emerging market where you can replicate the Israeli model\"** - 26 countries (Poland, Bulgaria, Estonia, etc.) want to be like Israel:",
    points: [
      "Technology export from day zero",
      "Strong US presence",
      "High technical talent",
      "Small local markets forcing global thinking",
      "Globally-minded people"
    ]
  },
  uniqueness: {
    title: "Uniqueness",
    content: "Unlike many regions, **Emerging Europe consistently produces startups designed for international scale from day one**. These are \"away game champions\" - teams accustomed to competing on foreign ground."
  }
}

interface MatchProjectsPageProps {
  onClose: () => void
  preSelectedProject?: Project | null
}

export function MatchProjectsPage({ onClose, preSelectedProject }: MatchProjectsPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(preSelectedProject || null)
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    // Don't hide body overflow - allow scrolling
    loadProjects()
    // If preSelectedProject is provided, set it as selected
    if (preSelectedProject) {
      setSelectedProject(preSelectedProject)
    }
    return () => {
      // Cleanup if needed
    }
  }, [preSelectedProject])

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (selectedProject) {
      setLoadingMatch(true)
      generateMatchAnalysis(selectedProject, e2vcVC)
        .then(analysis => {
          setMatchAnalysis(analysis)
          setLoadingMatch(false)
        })
        .catch(error => {
          console.error('Error generating match analysis:', error)
          setLoadingMatch(false)
        })
    } else {
      setMatchAnalysis(null)
    }
  }, [selectedProject])

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

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
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-xl md:text-2xl font-light">Match Projects with e2.vc</h1>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      {/* Content - Two Column Layout: 30% left (sticky e2.vc info), 70% right (matching) */}
      <div className="container mx-auto max-w-7xl px-4 py-8 flex gap-8">
        {/* Left Column - e2.vc Info (30%, sticky) */}
        <div className="w-full md:w-[30%] flex-shrink-0">
          <div className="sticky top-20 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
            {/* About */}
            <section>
              <h2 className="text-2xl font-light text-white mb-4">About e2.vc</h2>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="text-white/80 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: e2vcDetailedInfo.whoTheyAre.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </section>

            {/* Founders */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">Founders & Team</h2>
              <div className="space-y-2 mb-3">
                {e2vcDetailedInfo.founders.items.map((item, idx) => (
                  <div key={idx} className="text-white/70 text-sm" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {e2vcDetailedInfo.founders.offices.map((office, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80 border border-white/20">
                    {office}
                  </span>
                ))}
              </div>
            </section>

            {/* History */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">History</h2>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.history.fund1.period}</div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.history.fund1.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.history.fund2.period}</div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.history.fund2.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.history.rebranding.period}</div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.history.rebranding.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Investment Strategy */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">Investment Strategy</h2>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.investmentStrategy.geographicFocus.title}</div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.investmentStrategy.geographicFocus.regions.map((region, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: region.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.investmentStrategy.sectorFocus.title}</div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {e2vcVC.focus_sectors.map((sector, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80 border border-white/20">
                        {sector}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.investmentStrategy.sectorFocus.sectors.map((sector, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: sector.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                  <div className="text-white font-medium text-sm mb-2">{e2vcDetailedInfo.investmentStrategy.investmentSize.title}</div>
                  <ul className="space-y-1 text-white/70 text-xs">
                    {e2vcDetailedInfo.investmentStrategy.investmentSize.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/40 mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Philosophy */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">{e2vcDetailedInfo.philosophy.title}</h2>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="text-white/80 text-sm mb-2" dangerouslySetInnerHTML={{ __html: e2vcDetailedInfo.philosophy.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <ul className="space-y-1 text-white/70 text-xs">
                  {e2vcDetailedInfo.philosophy.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white/40 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Successes */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">{e2vcDetailedInfo.biggestSuccesses.title}</h2>
              <div className="text-white/60 text-xs mb-3">{e2vcDetailedInfo.biggestSuccesses.note}</div>
              <div className="space-y-3">
                {e2vcDetailedInfo.biggestSuccesses.unicorns.map((unicorn, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                    <div className="text-white font-medium text-sm mb-2" dangerouslySetInnerHTML={{ __html: unicorn.name.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    <ul className="space-y-1 text-white/70 text-xs">
                      {unicorn.details.map((detail, idx2) => (
                        <li key={idx2} className="flex items-start gap-2">
                          <span className="text-white/40 mt-1">•</span>
                          <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Performance */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">{e2vcDetailedInfo.performance.title}</h2>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg space-y-3">
                <ul className="space-y-1 text-white/70 text-xs">
                  {e2vcDetailedInfo.performance.stats.map((stat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white/40 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: stat.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
                <div>
                  <div className="text-white/60 text-xs mb-2 uppercase tracking-wide">Top Co-Investors</div>
                  <div className="flex flex-wrap gap-1.5">
                    {e2vcDetailedInfo.performance.coInvestors.map((investor, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80 border border-white/20">
                        {investor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Macro Thesis */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">{e2vcDetailedInfo.macroThesis.title}</h2>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="text-white/80 text-sm mb-2" dangerouslySetInnerHTML={{ __html: e2vcDetailedInfo.macroThesis.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <ul className="space-y-1 text-white/70 text-xs">
                  {e2vcDetailedInfo.macroThesis.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white/40 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Uniqueness */}
            <section>
              <h2 className="text-xl font-light text-white mb-3">{e2vcDetailedInfo.uniqueness.title}</h2>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="text-white/80 text-sm" dangerouslySetInnerHTML={{ __html: e2vcDetailedInfo.uniqueness.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </section>

            {/* Website */}
            {e2vcVC.website && (
              <section>
                <a
                  href={e2vcVC.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors border border-white/20 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit e2.vc Website
                </a>
              </section>
            )}
          </div>
        </div>

        {/* Right Column - Matching (70%) */}
        <div className="flex-1 min-w-0">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-light text-white mb-4">Select a Project</h2>
              {loadingProjects ? (
                <div className="text-white/60 text-center py-8">Loading projects...</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium mb-1">{project.name}</div>
                      {project.tagline && (
                        <div className="text-sm text-white/50">{project.tagline}</div>
                      )}
                      {project.hackathon_name && (
                        <div className="text-xs text-white/40 mt-1">{project.hackathon_name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {selectedProject && (
              <div className="pt-6 border-t border-white/10">
                <div className="mb-6">
                  <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Selected Project</div>
                  <div className="text-2xl font-medium text-white mb-1">{selectedProject.name}</div>
                  {selectedProject.tagline && (
                    <div className="text-white/60">{selectedProject.tagline}</div>
                  )}
                </div>

                {loadingMatch ? (
                  <div className="text-white/60 text-center py-12">Analyzing match with e2.vc...</div>
                ) : matchAnalysis ? (
                  <div className="space-y-8">
                    {/* Match Score */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-light text-white">Match Score</h3>
                        <div className={`text-4xl font-light ${
                          matchAnalysis.match_score >= 80 ? 'text-green-400' :
                          matchAnalysis.match_score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {matchAnalysis.match_score}/100
                        </div>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
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
                        <h3 className="text-xl font-light text-white mb-3">Overall Assessment</h3>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg text-white/80 leading-relaxed">
                          {matchAnalysis.overall_assessment}
                        </div>
                      </section>
                    )}

                    {/* Fit Scores */}
                    <section>
                      <h3 className="text-xl font-light text-white mb-4">Fit Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Sector Fit</div>
                          <div className="text-3xl font-light text-white mb-2">{matchAnalysis.sector_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.sector_fit.analysis}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Geography Fit</div>
                          <div className="text-3xl font-light text-white mb-2">{matchAnalysis.geography_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.geography_fit.analysis}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Stage Fit</div>
                          <div className="text-3xl font-light text-white mb-2">{matchAnalysis.stage_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.stage_fit.analysis}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                          <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Team Fit</div>
                          <div className="text-3xl font-light text-white mb-2">{matchAnalysis.team_fit.score}/100</div>
                          <div className="text-sm text-white/60">{matchAnalysis.team_fit.analysis}</div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg mt-4">
                        <div className="text-xs text-white/60 mb-2 uppercase tracking-wide">Market Fit</div>
                        <div className="text-3xl font-light text-white mb-2">{matchAnalysis.market_fit.score}/100</div>
                        <div className="text-sm text-white/60">{matchAnalysis.market_fit.analysis}</div>
                      </div>
                    </section>

                    {/* Strengths */}
                    {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
                      <section>
                        <h3 className="text-xl font-light text-white mb-4">Strengths</h3>
                        <div className="space-y-3">
                          {matchAnalysis.strengths.map((strength, idx) => (
                            <div key={idx} className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                              <div className="text-white font-medium mb-2">{strength.title}</div>
                              <div className="text-white/70 text-sm">{strength.description}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Concerns */}
                    {matchAnalysis.concerns && matchAnalysis.concerns.length > 0 && (
                      <section>
                        <h3 className="text-xl font-light text-white mb-4">Considerations</h3>
                        <div className="space-y-3">
                          {matchAnalysis.concerns.map((concern, idx) => (
                            <div key={idx} className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                              <div className="text-white font-medium mb-2">{concern.title}</div>
                              <div className="text-white/70 text-sm">{concern.description}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Recommendation */}
                    {matchAnalysis.recommendation && (
                      <section>
                        <h3 className="text-xl font-light text-white mb-4">Recommendation</h3>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg text-white/80 leading-relaxed">
                          {matchAnalysis.recommendation}
                        </div>
                      </section>
                    )}

                    {/* Next Steps */}
                    {matchAnalysis.next_steps && matchAnalysis.next_steps.length > 0 && (
                      <section>
                        <h3 className="text-xl font-light text-white mb-4">Next Steps</h3>
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
                  </div>
                ) : (
                  <div className="text-white/60 text-center py-12">
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
