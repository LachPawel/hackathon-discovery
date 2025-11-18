import { StatsModel } from '../models/StatsModel.js'
import type { Stats } from '../types/index.js'

export class StatsService {
  async getStats(): Promise<Stats> {
    return StatsModel.getStats()
  }
}

