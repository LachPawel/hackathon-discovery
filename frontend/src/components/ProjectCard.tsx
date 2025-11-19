import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, TrendingUp, Rocket, Github, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CrownAnimation } from '@/components/ui/crown-animation'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  onProjectClick?: (project: Project) => void
  onMatchWithE2VC?: (project: Project) => void
}

export function ProjectCard({ project, onProjectClick, onMatchWithE2VC }: ProjectCardProps) {
  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick(project)
    }
  }

  const [showSources, setShowSources] = useState(false)

  const initials = useMemo(() => {
    const name = project?.name || ''
    const words = name.split(/\s+/).filter(Boolean)
    if (!words.length) return '??'
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
  }, [project.name])

  const formatSummary = (summary: string): string => {
    if (!summary) return ''
    return summary
      .split('\n\n')
      .map(para => {
        if (para.trim()) {
          return `<p>${para.trim().replace(/\n/g, '<br>')}</p>`
        }
        return ''
      })
      .join('')
  }

  const formatSourceLabel = (url: string): string => {
    try {
      const { hostname, pathname } = new URL(url)
      const domain = hostname.replace(/^www\./, '')
      const path = pathname.replace(/\/$/, '')
      return path ? `${domain}${path}` : domain
    } catch {
      return url
    }
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.div
        className={cn(
          "max-w-sm w-full font-sans rounded-2xl overflow-hidden shadow-lg bg-card border border-border",
          "bg-white/5 border-white/10 backdrop-blur-sm",
          "cursor-pointer transition-all",
          onProjectClick && "hover:scale-105 hover:border-white/20"
        )}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: onProjectClick ? 1.03 : 1, transition: { duration: 0.3 } }}
        onClick={handleClick}
      >
        {/* Project Image */}
        <div className="relative h-56 overflow-hidden">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/40 uppercase tracking-wider">
                {initials}
              </span>
            </div>
          )}
          {/* Animated Crown in top-right corner */}
          <div className="absolute top-2 right-2 z-10">
            <CrownAnimation />
          </div>
        </div>

        {/* Project Details Container */}
        <div className="p-6 pt-4">
          {/* Project Name and Tagline */}
          <motion.div variants={itemVariants} className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {project.name}
            </h3>
            <p className="text-sm text-white/60 line-clamp-2">
              {project.tagline || 'No description available'}
            </p>
          </motion.div>

          {/* Hackathon Info */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
            {project.hackathon_name && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                <Trophy className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/80">{project.hackathon_name}</span>
              </div>
            )}
            {project.prize && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                <Award className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/80">{project.prize}</span>
              </div>
            )}
          </motion.div>

          {/* Status Badges */}
          {(project.got_funding || project.became_startup) && (
            <motion.div variants={itemVariants} className="flex gap-2 mb-4">
              {project.got_funding && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Funded</span>
                </div>
              )}
              {project.became_startup && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <Rocket className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">Startup</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Score */}
          {project.overall_score !== null && project.overall_score !== undefined && (
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60 uppercase tracking-wide">Score</span>
                <span className="text-lg font-bold text-white">{project.overall_score}/100</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.overall_score}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-dashed border-white/10 my-4"
          />

          {/* Summary Preview */}
          {project.research_summary && (
            <motion.div variants={itemVariants} className="mb-4">
              <div
                className="text-xs text-white/60 line-clamp-3 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatSummary(project.research_summary) }}
              />
            </motion.div>
          )}

          {/* Sources */}
          {project.research_sources?.length && (
            <motion.div variants={itemVariants} className="mb-4">
              <button
                className="text-xs text-white/60 hover:text-white/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSources(!showSources)
                }}
              >
                {showSources ? 'Hide Sources' : `Show Sources (${project.research_sources.length})`}
              </button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (onProjectClick) {
                    onProjectClick(project)
                  }
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Project
              </button>
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/80 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
            {onMatchWithE2VC && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (onMatchWithE2VC) {
                    onMatchWithE2VC(project)
                  }
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-2xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Trophy className="h-4 w-4" />
                Match with e2.vc
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Sources Modal */}
      <AnimatePresence>
        {showSources && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSources(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8"
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border border-white/10 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-white font-medium">
                  Sources ({project.research_sources?.length || 0})
                </span>
                <button
                  className="text-white/60 hover:text-white text-xl"
                  onClick={() => setShowSources(false)}
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <ul className="space-y-2">
                  {project.research_sources?.map((source, idx) => (
                    <li key={idx}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white text-sm transition-colors block"
                      >
                        {formatSourceLabel(source)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
