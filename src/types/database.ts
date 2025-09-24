export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          is_active: boolean
          special_code: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          special_code?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          special_code?: string | null
        }
      }
      couple_members: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          name: string
          role: 'partner_1' | 'partner_2'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          name: string
          role: 'partner_1' | 'partner_2'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          user_id?: string
          name?: string
          role?: 'partner_1' | 'partner_2'
          avatar_url?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          couple_id: string | null
          display_name: string
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          couple_id?: string | null
          display_name?: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string | null
          display_name?: string
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}