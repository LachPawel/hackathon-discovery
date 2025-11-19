import { ProjectCard } from './ProjectCard'
import type { Project } from '../types'

interface ProjectGridProps {
  projects: Project[]
  loading: boolean
  onRefresh?: () => void
  onProjectClick?: (project: Project) => void
  onMatchWithE2VC?: (project: Project) => void
}

export function ProjectGrid({ projects, loading, onRefresh, onProjectClick, onMatchWithE2VC }: ProjectGridProps) {
  if (loading) {
    return null // Handled by parent
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <p>No projects found</p>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            Refresh
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onProjectClick={onProjectClick}
          onMatchWithE2VC={onMatchWithE2VC}
        />
      ))}
    </div>
  )
}


