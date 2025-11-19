import type { Request, Response } from 'express'
import { StatsService } from '../services/StatsService.js'

const statsService = new StatsService()

export class StatsController {
  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await statsService.getStats()
    res.json(stats)
  }
}

