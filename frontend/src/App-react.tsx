import { useState, useEffect } from 'react'
import { Header as HeroHeader, HeroContent, PulsingCircle, ShaderBackground } from "@/components/ui/shaders-hero-section"
import HeroSection02 from "@/components/ui/ruixen-hero-section-02"
import { Stats } from './components/Stats'
import { Tabs } from './components/Tabs'
import { ProjectGrid } from './components/ProjectGrid'
import { ProjectPage } from './components/ProjectPage'
import { MatchProjectsPage } from './components/MatchProjectsPage'
import { ProjectsPage } from './components/ProjectsPage'
import { fetchProjects, fetchLeaderboard, fetchSuccessStories, fetchStats, fetchProject } from './services/api'
import type { Project, Stats as StatsType } from './types'

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'leaderboard' | 'success'>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [leaderboard, setLeaderboard] = useState<Project[]>([])
  const [successStories, setSuccessStories] = useState<Project[]>([])
  const [stats, setStats] = useState<StatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectPageOpen, setIsProjectPageOpen] = useState(false)
  const [isMatchPageOpen, setIsMatchPageOpen] = useState(false)
  const [isProjectsPageOpen, setIsProjectsPageOpen] = useState(false)
  const [preSelectedProject, setPreSelectedProject] = useState<Project | null>(null)

  // Load data when component mounts
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projectsData, leaderboardData, successData, statsData] = await Promise.all([
        fetchProjects(),
        fetchLeaderboard(),
        fetchSuccessStories(),
        fetchStats()
      ])
      
      setProjects(projectsData)
      setLeaderboard(leaderboardData)
      setSuccessStories(successData)
      setStats(statsData)
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

  // Load project when project page opens
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

  // Show project page or match page or projects page or main page
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

  if (isMatchPageOpen) {
    return (
      <MatchProjectsPage
        onClose={() => {
          setIsMatchPageOpen(false)
          setPreSelectedProject(null)
        }}
        preSelectedProject={preSelectedProject}
      />
    )
  }

  if (isProjectsPageOpen) {
    return (
      <ProjectsPage
        onClose={() => {
          setIsProjectsPageOpen(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Hero Section with Shader Background - Fullscreen */}
      <ShaderBackground>
        <HeroHeader />
        <HeroContent 
          onViewProjects={() => setIsProjectsPageOpen(true)}
          onMatchProjects={() => {
            setIsMatchPageOpen(true)
          }}
        />
        <PulsingCircle />
      </ShaderBackground>
    </div>
  )
}
