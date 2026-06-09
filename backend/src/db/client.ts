import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

export const supabase = createClient(config.supabaseUrl || '', config.supabaseServiceRoleKey || '')

export async function initializeDatabase() {
  try {
    // Test connection
    const { error } = await supabase.from('users').select('count')
    if (error) throw error
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
