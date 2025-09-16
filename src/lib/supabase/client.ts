import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de TypeScript
export interface User {
  id: string
  username: string
  display_name: string
  public_key: string
  qr_code: string
  avatar_url?: string
  status: 'online' | 'offline' | 'away'
  last_seen: Date
  created_at: Date
}

export interface Contact {
  id: string
  user_id: string
  contact_id: string
  nickname?: string
  blocked: boolean
  added_at: Date
  contact?: User // Joined data
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  encrypted_content: string
  iv: string
  message_type: 'text' | 'image' | 'file'
  file_url?: string
  created_at: Date
  delivered_at?: Date
  read_at?: Date
  self_destruct: boolean
  destruct_after?: number
  destruct_at?: Date
}