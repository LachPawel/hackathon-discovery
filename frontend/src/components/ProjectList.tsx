import { ExternalLink, Github, Globe, TrendingUp, Rocket, Users } from 'lucide-react'
import type { Project } from '../types'

interface ProjectListProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <p>No projects found</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider bg-white/5">
            <th className="py-5 px-6 font-medium w-16">#</th>
            <th className="py-5 px-6 font-medium">Project</th>
            <th className="py-5 px-6 font-medium">Hackathon</th>
            <th className="py-5 px-6 font-medium text-right">Score</th>
            <th className="py-5 px-6 font-medium text-right">Signals</th>
          </tr>
        </thead>
        <tbody className="text-white">
          {projects.map((project, index) => (
            <tr 
              key={project.id} 
              onClick={() => onProjectClick?.(project)}
              className="border-b border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <td className="py-5 px-6 text-white/30 font-mono text-sm">
                {(index + 1).toString().padStart(2, '0')}
              </td>
              <td className="py-5 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-inner">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <span className="text-xl font-bold text-white/30 group-hover:text-white/60 transition-colors">{project.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-lg text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </div>
                    <div className="text-sm text-white/40 line-clamp-1 max-w-md font-light">
                      {project.tagline || project.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-5 px-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-white/80 font-medium">{project.hackathon_name}</span>
                  {project.prize && (
                    <span className="text-xs text-yellow-500/90 bg-yellow-500/10 px-2 py-0.5 rounded-full w-fit border border-yellow-500/20">
                      {project.prize}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-5 px-6 text-right">
                {project.overall_score ? (
                  <div className="flex justify-end">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2
                      ${project.overall_score >= 80 
                        ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                        : project.overall_score >= 60 
                          ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' 
                          : 'border-white/10 text-white/40 bg-white/5'}
                    `}>
                      {project.overall_score}
                    </div>
                  </div>
                ) : (
                  <span className="text-white/20">-</span>
                )}
              </td>
              <td className="py-5 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  {project.got_funding && (
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20" title="Funded">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  )}
                  {project.became_startup && (
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Startup">
                      <Rocket className="w-4 h-4" />
                    </div>
                  )}
                  {project.has_real_users && (
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Has Users">
                      <Users className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className="w-px h-8 bg-white/10 mx-2" />

                  <div className="flex gap-1">
                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {(project.demo_url || project.startup_url) && (
                      <a 
                        href={project.demo_url || project.startup_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
