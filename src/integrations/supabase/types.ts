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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          id: string
          nome: string
          status: string
          email: string | null
          telefone: string | null
          cnpj: string | null
          cpf: string | null
          endereco: string | null
          instagram: string | null
          observacoes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          status?: string
          email?: string | null
          telefone?: string | null
          cnpj?: string | null
          cpf?: string | null
          endereco?: string | null
          instagram?: string | null
          observacoes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          status?: string
          email?: string | null
          telefone?: string | null
          cnpj?: string | null
          cpf?: string | null
          endereco?: string | null
          instagram?: string | null
          observacoes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_client_roles: {
        Row: {
          id: string
          user_id: string
          cliente_id: string
          role: Database['public']['Enums']['user_role']
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          cliente_id: string
          role: Database['public']['Enums']['user_role']
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          cliente_id?: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_client_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_client_roles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      contratos: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          status: string
          valor_total: number | null
          data_inicio: string | null
          data_fim: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          status?: string
          valor_total?: number | null
          data_inicio?: string | null
          data_fim?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          status?: string
          valor_total?: number | null
          data_inicio?: string | null
          data_fim?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      alunos: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          email: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          email?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          email?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      produtos: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          descricao: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          descricao?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          descricao?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      ofertas: {
        Row: {
          id: string
          cliente_id: string
          produto_id: string
          nome: string
          descricao: string | null
          preco: number | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          produto_id: string
          nome: string
          descricao?: string | null
          preco?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          produto_id?: string
          nome?: string
          descricao?: string | null
          preco?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          }
        ]
      }
      jornadas: {
        Row: {
          id: string
          cliente_id: string
          produto_id: string
          nome: string
          descricao: string | null
          ordem: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          produto_id: string
          nome: string
          descricao?: string | null
          ordem?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          produto_id?: string
          nome?: string
          descricao?: string | null
          ordem?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornadas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          }
        ]
      }
      passos: {
        Row: {
          id: string
          cliente_id: string
          jornada_id: string
          nome: string
          descricao: string | null
          tipo: string
          conteudo: Json | null
          ordem: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          jornada_id: string
          nome: string
          descricao?: string | null
          tipo: string
          conteudo?: Json | null
          ordem?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          jornada_id?: string
          nome?: string
          descricao?: string | null
          tipo?: string
          conteudo?: Json | null
          ordem?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passos_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          }
        ]
      }
      jornadas_instancia: {
        Row: {
          id: string
          cliente_id: string
          contrato_id: string
          jornada_id: string
          status: string
          data_inicio: string | null
          data_fim: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          contrato_id: string
          jornada_id: string
          status?: string
          data_inicio?: string | null
          data_fim?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          contrato_id?: string
          jornada_id?: string
          status?: string
          data_inicio?: string | null
          data_fim?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_instancia_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornadas_instancia_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornadas_instancia_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          }
        ]
      }
      passos_instancia: {
        Row: {
          id: string
          cliente_id: string
          jornada_instancia_id: string
          passo_id: string
          status: string
          data_execucao: string | null
          data_conclusao: string | null
          resultado: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          jornada_instancia_id: string
          passo_id: string
          status?: string
          data_execucao?: string | null
          data_conclusao?: string | null
          resultado?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          jornada_instancia_id?: string
          passo_id?: string
          status?: string
          data_execucao?: string | null
          data_conclusao?: string | null
          resultado?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passos_instancia_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passos_instancia_jornada_instancia_id_fkey"
            columns: ["jornada_instancia_id"]
            isOneToOne: false
            referencedRelation: "jornadas_instancia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passos_instancia_passo_id_fkey"
            columns: ["passo_id"]
            isOneToOne: false
            referencedRelation: "passos"
            referencedColumns: ["id"]
          }
        ]
      }
      parcelas: {
        Row: {
          id: string
          cliente_id: string
          contrato_id: string
          valor: number
          data_vencimento: string
          status: string
          data_pagamento: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          contrato_id: string
          valor: number
          data_vencimento: string
          status?: string
          data_pagamento?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          contrato_id?: string
          valor?: number
          data_vencimento?: string
          status?: string
          data_pagamento?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          }
        ]
      }
      contrato_alunos: {
        Row: {
          id: string
          cliente_id: string
          contrato_id: string
          aluno_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          cliente_id: string
          contrato_id: string
          aluno_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          cliente_id?: string
          contrato_id?: string
          aluno_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_alunos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_alunos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'cliente' | 'aluno'
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
