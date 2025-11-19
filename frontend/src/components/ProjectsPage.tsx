import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Tabs } from './Tabs'
import { ProjectGrid } from './ProjectGrid'
import { ProjectPage } from './ProjectPage'
import { fetchProjects, fetchLeaderboard, fetchSuccessStories, fetchProject } from '../services/api'
import type { Project } from '../types'

interface ProjectsPageProps {
  onClose: () => void
}

export function ProjectsPage({ onClose }: ProjectsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'leaderboard' | 'success'>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [leaderboard, setLeaderboard] = useState<Project[]>([])
  const [successStories, setSuccessStories] = useState<Project[]>([])
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
      const [projectsData, leaderboardData, successData] = await Promise.all([
        fetchProjects(),
        fetchLeaderboard(),
        fetchSuccessStories()
      ])
      
      setProjects(projectsData)
      setLeaderboard(leaderboardData)
      setSuccessStories(successData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayProjects = activeTab === 'leaderboard' 
    ? leaderboard 
    : activeTab === 'success' 
    ? successStories 
    : projects

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

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl md:text-6xl font-light text-white text-center mb-8">Winning Hackathon Projects</h1>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <ProjectGrid 
          projects={displayProjects} 
          loading={loading}
          onRefresh={loadData}
          onProjectClick={(project) => {
            setSelectedProjectId(project.id)
            setIsProjectPageOpen(true)
          }}
        />
      </div>
    </div>
  )
}
