import { ProjectModel } from '../models/ProjectModel.js'
import type { Project, ProjectFilters, ProjectWithFounders } from '../types/index.js'

export class ProjectService {
  async getProjects(filters: ProjectFilters = {}): Promise<Project[]> {
    return ProjectModel.findAll(filters)
  }

  async getProjectById(id: string): Promise<ProjectWithFounders | null> {
    return ProjectModel.findById(id)
  }

  async getLeaderboard(limit: number = 50): Promise<Project[]> {
    return ProjectModel.findLeaderboard(limit)
  }

  async getSuccessStories(): Promise<Project[]> {
    return ProjectModel.findSuccessStories()
  }
}

