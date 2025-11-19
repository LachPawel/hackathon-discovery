import type { Request, Response } from 'express'
import { ProjectService } from '../services/ProjectService.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { ProjectFilters } from '../types/index.js'

const projectService = new ProjectService()

export class ProjectController {
  async getProjects(req: Request, res: Response): Promise<void> {
    const filters: ProjectFilters = {
      got_funding: req.query.funding === 'true' ? true : undefined,
      became_startup: req.query.startup === 'true' ? true : undefined
    }

    const projects = await projectService.getProjects(filters)
    res.json(projects)
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const project = await projectService.getProjectById(id)

    if (!project) {
      throw new AppError('Project not found', 404)
    }

    res.json(project)
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400)
    }

    const projects = await projectService.getLeaderboard(limit)
    res.json(projects)
  }

  async getSuccessStories(_req: Request, res: Response): Promise<void> {
    const projects = await projectService.getSuccessStories()
    res.json(projects)
  }
}

