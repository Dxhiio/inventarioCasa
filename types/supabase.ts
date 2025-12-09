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
      profiles: {
        Row: {
          id: string
          email: string | null
          username: string | null
          avatar_url: string | null
          family_group_id: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          family_group_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          family_group_id?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: number
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string | null
          quantity: number
          unit: string | null
          category_id: number | null
          location_id: number | null
          expiry_date: string | null
          is_consumed: boolean
          is_private: boolean
          image_url: string | null
          embedding: string | number[] | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          description?: string | null
          quantity?: number
          unit?: string | null
          category_id?: number | null
          location_id?: number | null
          expiry_date?: string | null
          is_consumed?: boolean
          is_private?: boolean
          image_url?: string | null
          embedding?: string | number[] | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          description?: string | null
          quantity?: number
          unit?: string | null
          category_id?: number | null
          location_id?: number | null
          expiry_date?: string | null
          is_consumed?: boolean
          is_private?: boolean
          image_url?: string | null
          embedding?: string | number[] | null
          created_at?: string
        }
      }
      communal_tasks: {
        Row: {
          id: number
          created_by: string
          title: string
          status: 'pending' | 'done'
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: number
          created_by: string
          title: string
          status?: 'pending' | 'done'
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          created_by?: string
          title?: string
          status?: 'pending' | 'done'
          is_public?: boolean
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: number
          user_id: string
          generated_for_date: string | null
          items: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          generated_for_date?: string | null
          items?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          generated_for_date?: string | null
          items?: Json | null
          created_at?: string
        }
      }
    }
    Functions: {
      match_inventory: {
        Args: {
          query_embedding: number[] | string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          name: string
          description: string
          similarity: number
        }[]
      }
    }
  }
}
