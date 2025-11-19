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
    return (
      <main className="project-grid-section">
        <div className="container">
          <div className="loading">
            <div className="loading-text">Loading projects...</div>
          </div>
        </div>
      </main>
    )
  }

  if (projects.length === 0) {
    return (
      <main className="project-grid-section">
        <div className="container">
          <div className="empty">
            <div className="empty-text">No projects found</div>
            {onRefresh && (
              <button onClick={onRefresh} className="refresh-btn">Refresh</button>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="project-grid-section">
      <div className="container">
        <div className="grid">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onProjectClick={onProjectClick}
              onMatchWithE2VC={onMatchWithE2VC}
            />
          ))}
        </div>
      </div>
    </main>
  )
}


