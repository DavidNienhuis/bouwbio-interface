export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      knowledge_bank: {
        Row: {
          advies_kleur: string | null
          advies_label: string | null
          advies_niveau: string | null
          certificaten_score: number | null
          certification: string
          created_at: string | null
          ean_code: string
          emissie_score: number | null
          first_validated_at: string | null
          id: string
          last_validated_at: string | null
          latest_result: Json | null
          overall_score: number | null
          product_name: string | null
          product_type: Json | null
          source_files: Json | null
          toxicologie_score: number | null
          updated_at: string | null
          validation_count: number | null
        }
        Insert: {
          advies_kleur?: string | null
          advies_label?: string | null
          advies_niveau?: string | null
          certificaten_score?: number | null
          certification: string
          created_at?: string | null
          ean_code: string
          emissie_score?: number | null
          first_validated_at?: string | null
          id?: string
          last_validated_at?: string | null
          latest_result?: Json | null
          overall_score?: number | null
          product_name?: string | null
          product_type?: Json | null
          source_files?: Json | null
          toxicologie_score?: number | null
          updated_at?: string | null
          validation_count?: number | null
        }
        Update: {
          advies_kleur?: string | null
          advies_label?: string | null
          advies_niveau?: string | null
          certificaten_score?: number | null
          certification?: string
          created_at?: string | null
          ean_code?: string
          emissie_score?: number | null
          first_validated_at?: string | null
          id?: string
          last_validated_at?: string | null
          latest_result?: Json | null
          overall_score?: number | null
          product_name?: string | null
          product_type?: Json | null
          source_files?: Json | null
          toxicologie_score?: number | null
          updated_at?: string | null
          validation_count?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          ean_code: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ean_code?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ean_code?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          tour_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "Red list priority": {
        Row: {
          cas_rn: string | null
          date_modified: string | null
          ec_number: string | null
          red_list_chemical_group: string | null
          substance_name: string | null
          supabase_node: string
        }
        Insert: {
          cas_rn?: string | null
          date_modified?: string | null
          ec_number?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Update: {
          cas_rn?: string | null
          date_modified?: string | null
          ec_number?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Relationships: []
      }
      Redlist: {
        Row: {
          cas_rn: string | null
          date_added: string | null
          red_list_chemical_group: string | null
          substance_name: string | null
          supabase_node: string
        }
        Insert: {
          cas_rn?: string | null
          date_added?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Update: {
          cas_rn?: string | null
          date_added?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Relationships: []
      }
      "Redlist Watch": {
        Row: {
          cas_rn: string | null
          date_modified: string | null
          red_list_chemical_group: string | null
          substance_name: string | null
          supabase_node: string
        }
        Insert: {
          cas_rn?: string | null
          date_modified?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Update: {
          cas_rn?: string | null
          date_modified?: string | null
          red_list_chemical_group?: string | null
          substance_name?: string | null
          supabase_node?: string
        }
        Relationships: []
      }
      validations: {
        Row: {
          certification: string
          created_at: string | null
          file_names: string[] | null
          id: string
          product_id: string | null
          product_type: Json
          result: Json | null
          session_id: string
          source_files: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          certification: string
          created_at?: string | null
          file_names?: string[] | null
          id?: string
          product_id?: string | null
          product_type: Json
          result?: Json | null
          session_id: string
          source_files?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          certification?: string
          created_at?: string | null
          file_names?: string[] | null
          id?: string
          product_id?: string | null
          product_type?: Json
          result?: Json | null
          session_id?: string
          source_files?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      update_knowledge_bank: {
        Args: {
          p_certification: string
          p_ean_code: string
          p_product_name: string
          p_product_type: Json
          p_result: Json
          p_source_files?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
