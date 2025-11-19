import type { Request, Response } from 'express'
import { scrapeAndSave } from '../scraper/devpost.js'
import { researchProject } from '../research/exa-agent.js'
import { analyzeMatch } from '../services/matchAnalysis.js'
import { ProjectModel } from '../models/ProjectModel.js'
import { AppError } from '../middlewares/errorHandler.js'

export class ActionController {
  async scrapeHackathon(req: Request, res: Response): Promise<void> {
    const { url } = req.body

    res.json({ message: 'Scraping started', url })

    // Run async - don't await
    scrapeAndSave(url).catch((error) => {
      console.error('Scraping error:', error)
    })
  }

  async researchProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const project = await ProjectModel.findById(id)

    if (!project) {
      throw new AppError('Project not found', 404)
    }

    res.json({ message: 'Research started' })

    // Run async - don't await
    researchProject(project, true).catch((error) => {
      console.error('Research error:', error)
    })
  }

  async matchProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { vc } = req.body

    if (!vc) {
      throw new AppError('VC profile is required', 400)
    }

    const project = await ProjectModel.findById(id)

    if (!project) {
      throw new AppError('Project not found', 404)
    }

    try {
      const analysis = await analyzeMatch(project, vc)
      res.json(analysis)
    } catch (error) {
      console.error('Match analysis error:', error)
      throw new AppError('Failed to generate match analysis', 500)
    }
  }
}

