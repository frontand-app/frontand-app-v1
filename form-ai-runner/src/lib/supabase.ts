import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  credits_balance: number
  tier: 'free' | 'pro' | 'enterprise'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Flow {
  id: string
  name: string
  description: string
  category: string
  creator_id: string
  original_flow_id?: string
  fork_generation: number
  inputs: any[]
  outputs: any[]
  runtime: any
  version: string
  is_public: boolean
  is_featured: boolean
  execution_count: number
  fork_count: number
  popularity_score: number
  created_at: string
  updated_at: string
}

export interface Execution {
  id: string
  flow_id: string
  user_id: string
  inputs: any
  outputs?: any
  model_used: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  credits_used: number
  execution_time_ms?: number
  error_message?: string
  scheduled_execution_id?: string
  is_scheduled: boolean
  created_at: string
  completed_at?: string
} 