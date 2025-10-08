import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
	throw new Error('VITE_SUPABASE_URL y VITE_SUPABASE_KEY deben estar definidas en .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
