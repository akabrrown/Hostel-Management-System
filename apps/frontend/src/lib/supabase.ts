import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { createClient }

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          index_number?: string
          role_id: number
          is_active: boolean
          email_verified: boolean
          last_login?: string
          password_reset_token?: string
          password_reset_expires?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          index_number?: string
          role_id: number
          is_active?: boolean
          email_verified?: boolean
          last_login?: string
          password_reset_token?: string
          password_reset_expires?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          index_number?: string
          role_id?: number
          is_active?: boolean
          email_verified?: boolean
          last_login?: string
          password_reset_token?: string
          password_reset_expires?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          phone_number?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          student_id?: string
          program?: string
          year_of_study?: number
          academic_year?: string
          profile_image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          phone_number?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          student_id?: string
          program?: string
          year_of_study?: number
          academic_year?: string
          profile_image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          phone_number?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          student_id?: string
          program?: string
          year_of_study?: number
          academic_year?: string
          profile_image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      },
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
