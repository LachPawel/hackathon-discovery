import dotenv from 'dotenv'
import { createMockSupabaseClient } from './mocks/supabase.js'
import { setSupabaseClient } from '../src/db/supabase.js'

dotenv.config()

// ⚠️ IMPORTANT: Force test mode - prevent writing to real database
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_KEY = 'test-key'

// Create mock Supabase client that stores data in memory
// Tests will NOT write to your real database
const mockSupabase = createMockSupabaseClient()

// Replace the supabase client with our mock
// This ensures all tests use the mock instead of real Supabase
setSupabaseClient(mockSupabase)

// Add some test data to the mock
mockSupabase._mockData.projects = [
  {
    id: 'test-project-1',
    name: 'Test Project 1',
    hackathon_name: 'Test Hackathon',
    got_funding: true,
    became_startup: true,
    overall_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-project-2',
    name: 'Test Project 2',
    hackathon_name: 'Test Hackathon',
    got_funding: false,
    became_startup: false,
    overall_score: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export { mockSupabase }

