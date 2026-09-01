// Hand-written minimal Database type matching `supabase/schema.sql`.
// Keep in sync if the schema evolves. Avoids running `supabase gen types` per-build.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          started_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          id: number
          user_id: string
          lesson_id: string
          label: string | null
          completed_at: string
        }
        Insert: {
          user_id: string
          lesson_id: string
          label?: string | null
        }
        Update: {
          label?: string | null
        }
        Relationships: []
      }
      lab_progress: {
        Row: {
          id: number
          user_id: string
          lab_id: string
          label: string | null
          completed_at: string
        }
        Insert: {
          user_id: string
          lab_id: string
          label?: string | null
        }
        Update: {
          label?: string | null
        }
        Relationships: []
      }
      captured_flags: {
        Row: {
          id: number
          user_id: string
          lab_id: string
          flag: string
          points: number
          captured_at: string
        }
        Insert: {
          user_id: string
          lab_id: string
          flag: string
          points?: number
        }
        Update: {
          flag?: string
          points?: number
        }
        Relationships: []
      }
      tools_learned: {
        Row: {
          id: number
          user_id: string
          tool_id: string
          learned_at: string
        }
        Insert: {
          user_id: string
          tool_id: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      activity: {
        Row: {
          id: number
          user_id: string
          type: 'lesson' | 'lab' | 'flag' | 'module'
          label: string
          ref: string
          created_at: string
        }
        Insert: {
          user_id: string
          type: 'lesson' | 'lab' | 'flag' | 'module'
          label: string
          ref: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          display_name: string | null
          score: number
          flags_count: number
          lessons_count: number
          labs_count: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}