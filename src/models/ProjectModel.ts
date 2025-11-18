import { supabase } from '../db/supabase.js'
import type { Project, ProjectWithFounders, ProjectFilters } from '../types/index.js'

export class ProjectModel {
  static async findAll(filters: ProjectFilters = {}): Promise<Project[]> {
    let query = supabase
      .from('projects')
      .select('*')
      .order('overall_score', { ascending: false })

    if (filters.got_funding) {
      query = query.eq('got_funding', true)
    }

    if (filters.became_startup) {
      query = query.eq('became_startup', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async findById(id: string): Promise<ProjectWithFounders | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*, founders:project_founders(founder:founders(*))')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  static async findLeaderboard(limit: number = 50): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .not('overall_score', 'is', null)
      .order('overall_score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async findSuccessStories(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or('got_funding.eq.true,became_startup.eq.true')
      .order('funding_amount', { ascending: false, nullsFirst: false })

    if (error) throw error
    return data || []
  }

  static async create(projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async upsert(projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .upsert([projectData], {
        onConflict: 'devpost_url',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

