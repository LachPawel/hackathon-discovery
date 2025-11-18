import type { Request, Response } from 'express'
import { scrapeAndSave } from '../scraper/devpost.js'
import { researchProject } from '../research/exa-agent.js'
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
}

