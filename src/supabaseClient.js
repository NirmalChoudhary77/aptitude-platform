// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtafkppvdiyedevtpllh.supabase.co' // Paste your URL here
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWZrcHB2ZGl5ZWRldnRwbGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTc1NjYsImV4cCI6MjA3Mzc3MzU2Nn0.0p_xGBzKI8AxmPlBWN9kRZBdgPR7QyIelDdEK3Hb8jw' // Paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseAnonKey)