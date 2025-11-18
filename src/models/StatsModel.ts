import { supabase } from '../db/supabase.js'
import type { Stats } from '../types/index.js'

export class StatsModel {
  static async getStats(): Promise<Stats> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('got_funding, became_startup, has_real_users')

    if (error) throw error

    return {
      total_projects: projects?.length || 0,
      got_funding: projects?.filter(p => p.got_funding).length || 0,
      became_startups: projects?.filter(p => p.became_startup).length || 0,
      has_users: projects?.filter(p => p.has_real_users).length || 0
    }
  }
}

