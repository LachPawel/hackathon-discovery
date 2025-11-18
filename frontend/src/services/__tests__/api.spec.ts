import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { fetchProjects, fetchStats } from '../api'
import type { Project, Stats } from '../../types'

vi.mock('axios')

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('fetches projects successfully', async () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Test Project',
        hackathon_name: 'Test Hackathon'
      }
    ]
    
    vi.mocked(axios.get).mockResolvedValue({ data: mockProjects })
    
    const result = await fetchProjects()
    
    expect(result).toEqual(mockProjects)
    expect(axios.get).toHaveBeenCalledWith('/api/projects')
  })
  
  it('fetches stats successfully', async () => {
    const mockStats: Stats = {
      total_projects: 100,
      got_funding: 20,
      became_startups: 15,
      has_users: 30
    }
    
    vi.mocked(axios.get).mockResolvedValue({ data: mockStats })
    
    const result = await fetchStats()
    
    expect(result).toEqual(mockStats)
    expect(axios.get).toHaveBeenCalledWith('/api/stats')
  })
})

