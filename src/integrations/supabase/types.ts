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
          added_by_user_id: string | null
          advies_kleur: string | null
          advies_label: string | null
          advies_niveau: string | null
          certificaten_score: number | null
          certification: string
          created_at: string | null
          data_quality_score: number | null
          ean_code: string
          ean_format_valid: boolean | null
          emissie_score: number | null
          first_validated_at: string | null
          has_source_files: boolean | null
          id: string
          last_validated_at: string | null
          last_verified_at: string | null
          latest_result: Json | null
          overall_score: number | null
          product_name: string | null
          product_type: Json | null
          reported_issues_count: number | null
          source_files: Json | null
          toxicologie_score: number | null
          updated_at: string | null
          validation_count: number | null
          validation_source: string | null
        }
        Insert: {
          added_by_user_id?: string | null
          advies_kleur?: string | null
          advies_label?: string | null
          advies_niveau?: string | null
          certificaten_score?: number | null
          certification: string
          created_at?: string | null
          data_quality_score?: number | null
          ean_code: string
          ean_format_valid?: boolean | null
          emissie_score?: number | null
          first_validated_at?: string | null
          has_source_files?: boolean | null
          id?: string
          last_validated_at?: string | null
          last_verified_at?: string | null
          latest_result?: Json | null
          overall_score?: number | null
          product_name?: string | null
          product_type?: Json | null
          reported_issues_count?: number | null
          source_files?: Json | null
          toxicologie_score?: number | null
          updated_at?: string | null
          validation_count?: number | null
          validation_source?: string | null
        }
        Update: {
          added_by_user_id?: string | null
          advies_kleur?: string | null
          advies_label?: string | null
          advies_niveau?: string | null
          certificaten_score?: number | null
          certification?: string
          created_at?: string | null
          data_quality_score?: number | null
          ean_code?: string
          ean_format_valid?: boolean | null
          emissie_score?: number | null
          first_validated_at?: string | null
          has_source_files?: boolean | null
          id?: string
          last_validated_at?: string | null
          last_verified_at?: string | null
          latest_result?: Json | null
          overall_score?: number | null
          product_name?: string | null
          product_type?: Json | null
          reported_issues_count?: number | null
          source_files?: Json | null
          toxicologie_score?: number | null
          updated_at?: string | null
          validation_count?: number | null
          validation_source?: string | null
        }
        Relationships: []
      }
      knowledge_bank_issues: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          issue_type: string
          knowledge_bank_id: string
          reported_by_user_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type: string
          knowledge_bank_id: string
          reported_by_user_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string
          knowledge_bank_id?: string
          reported_by_user_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bank_issues_knowledge_bank_id_fkey"
            columns: ["knowledge_bank_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bank"
            referencedColumns: ["id"]
          },
        ]
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
          credits: number
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          tour_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          credits?: number
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          credits?: number
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      calculate_kb_quality_score: {
        Args: {
          p_ean_code: string
          p_latest_result: Json
          p_product_name: string
          p_reported_issues_count: number
          p_source_files: Json
          p_validation_count: number
          p_validation_source: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      validate_ean_format: { Args: { ean_code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
