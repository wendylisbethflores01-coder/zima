export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      agent_invitations: {
        Row: {
          agent_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          status: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          status?: string;
          token: string;
          updated_at?: string;
        };
        Update: {
          agent_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_invitations_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };
      agents: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          invitation_status: string | null;
          is_active: boolean;
          name: string;
          phone: string | null;
          updated_at: string;
          user_id: string | null;
          whatsapp: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          invitation_status?: string | null;
          is_active?: boolean;
          name: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          invitation_status?: string | null;
          is_active?: boolean;
          name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      amenities: {
        Row: {
          category: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string | null;
          age: number | null;
          agent_id: string | null;
          area: number;
          bathrooms: number | null;
          bedrooms: number | null;
          built_area: number | null;
          city: string;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          description: string | null;
          district: string;
          full_location: string;
          id: string;
          is_active: boolean;
          is_approved: boolean;
          parking: number | null;
          price: number;
          property_code: string;
          property_type: string;
          province: string | null;
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          views_count: number;
        };
        Insert: {
          address?: string | null;
          age?: number | null;
          agent_id?: string | null;
          area: number;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city: string;
          created_at?: string;
          currency: Database["public"]["Enums"]["currency"];
          description?: string | null;
          district: string;
          full_location: string;
          id?: string;
          is_active?: boolean;
          is_approved?: boolean;
          parking?: number | null;
          price: number;
          property_code: string;
          property_type: string;
          province?: string | null;
          title: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          views_count?: number;
        };
        Update: {
          address?: string | null;
          age?: number | null;
          agent_id?: string | null;
          area?: number;
          bathrooms?: number | null;
          bedrooms?: number | null;
          built_area?: number | null;
          city?: string;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          description?: string | null;
          district?: string;
          full_location?: string;
          id?: string;
          is_active?: boolean;
          is_approved?: boolean;
          parking?: number | null;
          price?: number;
          property_code?: string;
          property_type?: string;
          province?: string | null;
          title?: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          views_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };
      property_amenities: {
        Row: {
          amenity_id: string;
          created_at: string;
          id: string;
          property_id: string;
        };
        Insert: {
          amenity_id: string;
          created_at?: string;
          id?: string;
          property_id: string;
        };
        Update: {
          amenity_id?: string;
          created_at?: string;
          id?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey";
            columns: ["amenity_id"];
            isOneToOne: false;
            referencedRelation: "amenities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      property_change_requests: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          id: string;
          original_snapshot: Json;
          other_changes: Json | null;
          property_id: string;
          proposed_age: number | null;
          proposed_amenities: Json | null;
          proposed_area: number | null;
          proposed_bathrooms: number | null;
          proposed_bedrooms: number | null;
          proposed_built_area: number | null;
          proposed_city: string | null;
          proposed_currency: Database["public"]["Enums"]["currency"] | null;
          proposed_description: string | null;
          proposed_district: string | null;
          proposed_images: Json | null;
          proposed_parking: number | null;
          proposed_price: number | null;
          proposed_property_type:
            | Database["public"]["Enums"]["property_type"]
            | null;
          proposed_province: string | null;
          proposed_title: string | null;
          proposed_transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          request_notes: string | null;
          requested_by_agent_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          id?: string;
          original_snapshot: Json;
          other_changes?: Json | null;
          property_id: string;
          proposed_age?: number | null;
          proposed_amenities?: Json | null;
          proposed_area?: number | null;
          proposed_bathrooms?: number | null;
          proposed_bedrooms?: number | null;
          proposed_built_area?: number | null;
          proposed_city?: string | null;
          proposed_currency?: Database["public"]["Enums"]["currency"] | null;
          proposed_description?: string | null;
          proposed_district?: string | null;
          proposed_images?: Json | null;
          proposed_parking?: number | null;
          proposed_price?: number | null;
          proposed_property_type?:
            | Database["public"]["Enums"]["property_type"]
            | null;
          proposed_province?: string | null;
          proposed_title?: string | null;
          proposed_transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          request_notes?: string | null;
          requested_by_agent_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          id?: string;
          original_snapshot?: Json;
          other_changes?: Json | null;
          property_id?: string;
          proposed_age?: number | null;
          proposed_amenities?: Json | null;
          proposed_area?: number | null;
          proposed_bathrooms?: number | null;
          proposed_bedrooms?: number | null;
          proposed_built_area?: number | null;
          proposed_city?: string | null;
          proposed_currency?: Database["public"]["Enums"]["currency"] | null;
          proposed_description?: string | null;
          proposed_district?: string | null;
          proposed_images?: Json | null;
          proposed_parking?: number | null;
          proposed_price?: number | null;
          proposed_property_type?:
            | Database["public"]["Enums"]["property_type"]
            | null;
          proposed_province?: string | null;
          proposed_title?: string | null;
          proposed_transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          request_notes?: string | null;
          requested_by_agent_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_change_requests_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_change_requests_requested_by_agent_id_fkey";
            columns: ["requested_by_agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };
      property_types: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rental_contracts: {
        Row: {
          agent_id: string;
          contract_end_date: string;
          contract_start_date: string;
          contract_status: Database["public"]["Enums"]["contract_status"];
          created_at: string;
          deposit_amount: number | null;
          deposit_currency: Database["public"]["Enums"]["currency"] | null;
          id: string;
          monthly_rent: number;
          notes: string | null;
          property_id: string;
          rent_currency: Database["public"]["Enums"]["currency"];
          tenant_email: string | null;
          tenant_name: string;
          tenant_phone: string | null;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          contract_end_date: string;
          contract_start_date: string;
          contract_status?: Database["public"]["Enums"]["contract_status"];
          created_at?: string;
          deposit_amount?: number | null;
          deposit_currency?: Database["public"]["Enums"]["currency"] | null;
          id?: string;
          monthly_rent: number;
          notes?: string | null;
          property_id: string;
          rent_currency: Database["public"]["Enums"]["currency"];
          tenant_email?: string | null;
          tenant_name: string;
          tenant_phone?: string | null;
          updated_at?: string;
        };
        Update: {
          agent_id?: string;
          contract_end_date?: string;
          contract_start_date?: string;
          contract_status?: Database["public"]["Enums"]["contract_status"];
          created_at?: string;
          deposit_amount?: number | null;
          deposit_currency?: Database["public"]["Enums"]["currency"] | null;
          id?: string;
          monthly_rent?: number;
          notes?: string | null;
          property_id?: string;
          rent_currency?: Database["public"]["Enums"]["currency"];
          tenant_email?: string | null;
          tenant_name?: string;
          tenant_phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rental_contracts_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_contracts_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      sales: {
        Row: {
          agent_id: string;
          buyer_email: string | null;
          buyer_name: string | null;
          buyer_phone: string | null;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          id: string;
          notes: string | null;
          property_id: string;
          sale_date: string;
          sale_price: number;
          updated_at: string;
        };
        Insert: {
          agent_id: string;
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone?: string | null;
          created_at?: string;
          currency: Database["public"]["Enums"]["currency"];
          id?: string;
          notes?: string | null;
          property_id: string;
          sale_date?: string;
          sale_price: number;
          updated_at?: string;
        };
        Update: {
          agent_id?: string;
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          id?: string;
          notes?: string | null;
          property_id?: string;
          sale_date?: string;
          sale_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      property_locations: {
        Row: {
          city: string | null;
          district: string | null;
          location_formatted: string | null;
          property_count: number | null;
          province: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      apply_approved_property_changes: {
        Args: { request_id: string };
        Returns: boolean;
      };
      assign_agent_role: {
        Args: { _agent_id: string; _user_id: string };
        Returns: boolean;
      };
      get_similar_properties: {
        Args: { p_property_code: string };
        Returns: {
          age: number;
          agent_id: string;
          area: number;
          bathrooms: number;
          bedrooms: number;
          built_area: number;
          city: string;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          description: string;
          district: string;
          full_location: string;
          id: string;
          is_active: boolean;
          parking: number;
          price: number;
          property_code: string;
          property_type: string;
          province: string;
          similarity_level: string;
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          views_count: number;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "agent" | "user";
      contract_status: "active" | "expired" | "terminated";
      currency: "PEN" | "USD";
      property_type: "Casa" | "Departamento" | "Terreno" | "Oficina" | "Local";
      transaction_type: "venta" | "alquiler" | "anticresis";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "agent", "user"],
      contract_status: ["active", "expired", "terminated"],
      currency: ["PEN", "USD"],
      property_type: ["Casa", "Departamento", "Terreno", "Oficina", "Local"],
      transaction_type: ["venta", "alquiler", "anticresis"],
    },
  },
} as const;
