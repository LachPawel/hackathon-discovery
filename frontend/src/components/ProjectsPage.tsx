import { useState, useEffect } from 'react'
import { ArrowLeft, LayoutGrid, List } from 'lucide-react'
import { ProjectGrid } from './ProjectGrid'
import { ProjectList } from './ProjectList'
import { ProjectPage } from './ProjectPage'
import { fetchProjects, fetchProject } from '../services/api'
import type { Project } from '../types'

interface ProjectsPageProps {
  onClose?: () => void
  isMainPage?: boolean
}

export function ProjectsPage({ onClose, isMainPage = false }: ProjectsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectPageOpen, setIsProjectPageOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedProjectId && isProjectPageOpen) {
      fetchProject(selectedProjectId)
        .then(project => {
          setSelectedProject(project)
        })
        .catch(error => {
          console.error('Error loading project:', error)
        })
    }
  }, [selectedProjectId, isProjectPageOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const projectsData = await fetchProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isProjectPageOpen && selectedProject) {
    return (
      <ProjectPage
        project={selectedProject}
        onClose={() => {
          setIsProjectPageOpen(false)
          setSelectedProjectId(null)
          setSelectedProject(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto selection:bg-white/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {!isMainPage && onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <div className="w-24" /> // Spacer
          )}
          
          <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="text-black font-bold text-lg tracking-tighter">e2</span>
            </div>
            <span className="text-xl font-light tracking-wide text-white/90">ventures</span>
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white relative z-10">
            Hackathon <span className="text-white/40 font-extralight">Discovery</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed relative z-10">
            Curated list of winning projects from top global hackathons.
            <br />
            Analyzed for investment potential by AI.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-white/40 text-sm font-mono">
            {projects.length} projects discovered
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : viewMode === 'list' ? (
          <ProjectList 
            projects={projects}
            onProjectClick={(project) => {
              setSelectedProjectId(project.id)
              setIsProjectPageOpen(true)
            }}
          />
        ) : (
          <ProjectGrid 
            projects={projects} 
            loading={loading}
            onRefresh={loadData}
            onProjectClick={(project) => {
              setSelectedProjectId(project.id)
              setIsProjectPageOpen(true)
            }}
          />
        )}
      </div>
    </div>
  )
}
