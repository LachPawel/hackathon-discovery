import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import type { Project, Founder } from '../types/index.js'

dotenv.config()

// IMPORTANT: In test mode (NODE_ENV=test), this will use a mock client
// The test setup (test/setup.ts) sets NODE_ENV=test and provides a mock
// This prevents tests from writing to your real Supabase database

// Check if we should use mock (test mode or test URL)
const useMock = process.env.NODE_ENV === 'test' || 
                process.env.SUPABASE_URL === 'http://localhost:54321' ||
                process.env.SUPABASE_KEY === 'test-key'

// Create a mutable object that can be replaced in tests
let supabaseClient: any

if (useMock) {
  // In test mode, create a simple mock that prevents real DB access
  // The actual mock implementation is loaded in test/setup.ts
  // For now, create a stub that will throw if accidentally used
  supabaseClient = {
    from: () => {
      throw new Error(
        'Mock Supabase not properly initialized. ' +
        'Make sure test/setup.ts is loaded before tests run.'
      )
    }
  }
} else {
  // Use real Supabase client
  supabaseClient = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || ''
  )
}

// Export a getter that allows the client to be swapped in tests
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return supabaseClient[prop]
  }
})

// Export a function to replace the client (used in tests)
export function setSupabaseClient(client: any) {
  supabaseClient = client
}

export async function saveProject(projectData: Partial<Project>): Promise<Project> {
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

export async function saveFounder(founderData: Partial<Founder>): Promise<Founder> {
  const { data, error } = await supabase
    .from('founders')
    .upsert([founderData], {
      onConflict: 'linkedin_url',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function linkProjectFounder(
  projectId: string,
  founderId: string,
  role?: string
): Promise<void> {
  const { error } = await supabase
    .from('project_founders')
    .upsert([{ project_id: projectId, founder_id: founderId, role }])

  if (error) throw error
}

export async function getProjects(filters: {
  got_funding?: boolean
  became_startup?: boolean
} = {}): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*, founders:project_founders(founder:founders(*))')
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

