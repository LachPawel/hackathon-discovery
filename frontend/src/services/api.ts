import axios from 'axios'
import type { Project, Stats } from '../types'

const API_URL = '/api'

export const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await axios.get<Project[]>(`${API_URL}/projects`)
  return data
}

export const fetchLeaderboard = async (): Promise<Project[]> => {
  const { data } = await axios.get<Project[]>(`${API_URL}/projects/leaderboard`)
  return data
}

export const fetchSuccessStories = async (): Promise<Project[]> => {
  const { data } = await axios.get<Project[]>(`${API_URL}/projects/success-stories`)
  return data
}

export const fetchStats = async (): Promise<Stats> => {
  const { data } = await axios.get<Stats>(`${API_URL}/stats`)
  return data
}

export const fetchProject = async (id: string): Promise<Project> => {
  const { data } = await axios.get<Project>(`${API_URL}/projects/${id}`)
  return data
}

