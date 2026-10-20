export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
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
      awards: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image_url: string;
          is_published: boolean;
          issuer: string;
          location: string | null;
          organization: string | null;
          recipient: string;
          sort_order: number;
          subtitle: string | null;
          title: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          featured?: boolean;
          id?: string;
          image_url: string;
          is_published?: boolean;
          issuer: string;
          location?: string | null;
          organization?: string | null;
          recipient: string;
          sort_order?: number;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image_url?: string;
          is_published?: boolean;
          issuer?: string;
          location?: string | null;
          organization?: string | null;
          recipient?: string;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author: string | null;
          body: string | null;
          cover_image: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          is_published: boolean;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author?: string | null;
          body?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author?: string | null;
          body?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      csr_activities: {
        Row: {
          id: string;
          title: string;
          category: string;
          year: number | null;
          date: string | null;
          location: string | null;
          short_description: string;
          description: string;
          image_url: string;
          impact: string | null;
          beneficiaries: string | null;
          featured: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          year?: number | null;
          date?: string | null;
          location?: string | null;
          short_description: string;
          description: string;
          image_url: string;
          impact?: string | null;
          beneficiaries?: string | null;
          featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          year?: number | null;
          date?: string | null;
          location?: string | null;
          short_description?: string;
          description?: string;
          image_url?: string;
          impact?: string | null;
          beneficiaries?: string | null;
          featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      buyers_guide: {
        Row: {
          body: string | null;
          category: string | null;
          created_at: string;
          id: string;
          is_published: boolean;
          slug: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          slug: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          slug?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          image_url: string;
          is_published: boolean;
          project_id: string | null;
          sort_order: number;
          title: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          image_url: string;
          is_published?: boolean;
          project_id?: string | null;
          sort_order?: number;
          title?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string;
          is_published?: boolean;
          project_id?: string | null;
          sort_order?: number;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      job_applications: {
        Row: {
          cover_note: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          job_id: string | null;
          phone: string | null;
          resume_url: string | null;
          status: string;
        };
        Insert: {
          cover_note?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          job_id?: string | null;
          phone?: string | null;
          resume_url?: string | null;
          status?: string;
        };
        Update: {
          cover_note?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          job_id?: string | null;
          phone?: string | null;
          resume_url?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_openings";
            referencedColumns: ["id"];
          },
        ];
      };
      job_openings: {
        Row: {
          created_at: string;
          department: string | null;
          description: string | null;
          employment_type: string | null;
          experience: string | null;
          id: string;
          is_open: boolean;
          location: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          department?: string | null;
          description?: string | null;
          employment_type?: string | null;
          experience?: string | null;
          id?: string;
          is_open?: boolean;
          location?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          department?: string | null;
          description?: string | null;
          employment_type?: string | null;
          experience?: string | null;
          id?: string;
          is_open?: boolean;
          location?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          notes: string | null;
          phone: string | null;
          project_id: string | null;
          source: Database["public"]["Enums"]["lead_source"];
          status: Database["public"]["Enums"]["lead_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          notes?: string | null;
          phone?: string | null;
          project_id?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          project_id?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          amenities: Json;
          bedrooms: string | null;
          brochure_url: string | null;
          category: string | null;
          city: string | null;
          cover_image: string | null;
          created_at: string;
          description: string | null;
          floor_plans: Json;
          gallery: Json;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          launch_date: string | null;
          location: string | null;
          map_embed: string | null;
          name: string;
          nearby: Json;
          price_from: number | null;
          rera_number: string | null;
          slug: string;
          sort_order: number;
          specifications: Json;
          sqft_from: number | null;
          sqft_to: number | null;
          area_unit?: string | null;
          status: Database["public"]["Enums"]["project_status"];
          tagline: string | null;
          updated_at: string;
        };
        Insert: {
          amenities?: Json;
          bedrooms?: string | null;
          brochure_url?: string | null;
          category?: string | null;
          city?: string | null;
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          floor_plans?: Json;
          gallery?: Json;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          launch_date?: string | null;
          location?: string | null;
          map_embed?: string | null;
          name: string;
          nearby?: Json;
          price_from?: number | null;
          rera_number?: string | null;
          slug: string;
          sort_order?: number;
          specifications?: Json;
          sqft_from?: number | null;
          sqft_to?: number | null;
          area_unit?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tagline?: string | null;
          updated_at?: string;
        };
        Update: {
          amenities?: Json;
          bedrooms?: string | null;
          brochure_url?: string | null;
          category?: string | null;
          city?: string | null;
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          floor_plans?: Json;
          gallery?: Json;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          launch_date?: string | null;
          location?: string | null;
          map_embed?: string | null;
          name?: string;
          nearby?: Json;
          price_from?: number | null;
          rera_number?: string | null;
          slug?: string;
          sort_order?: number;
          specifications?: Json;
          sqft_from?: number | null;
          sqft_to?: number | null;
          area_unit?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tagline?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      seo_metadata: {
        Row: {
          description: string | null;
          id: string;
          keywords: string | null;
          og_image: string | null;
          path: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          keywords?: string | null;
          og_image?: string | null;
          path: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          keywords?: string | null;
          og_image?: string | null;
          path?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          is_published: boolean;
          name: string;
          quote: string;
          rating: number;
          role: string | null;
          sort_order: number;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name: string;
          quote: string;
          rating?: number;
          role?: string | null;
          sort_order?: number;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name?: string;
          quote?: string;
          rating?: number;
          role?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      work_registrations: {
        Row: {
          applicant_name: string;
          created_at: string;
          document_paths: Json;
          email: string;
          form_data: Json;
          id: string;
          notes: string | null;
          phone: string;
          registration_type: string;
          status: string;
          updated_at: string;
          viewed: boolean;
        };
        Insert: {
          applicant_name: string;
          created_at?: string;
          document_paths?: Json;
          email: string;
          form_data?: Json;
          id?: string;
          notes?: string | null;
          phone: string;
          registration_type: string;
          status?: string;
          updated_at?: string;
          viewed?: boolean;
        };
        Update: {
          applicant_name?: string;
          created_at?: string;
          document_paths?: Json;
          email?: string;
          form_data?: Json;
          id?: string;
          notes?: string | null;
          phone?: string;
          registration_type?: string;
          status?: string;
          updated_at?: string;
          viewed?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "editor" | "viewer";
      lead_source: "hero" | "project_enquiry" | "brochure" | "contact" | "careers" | "site_visit";
      lead_status: "new" | "contacted" | "qualified" | "won" | "lost";
      project_status: "Ongoing" | "Completed" | "Upcoming";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor", "viewer"],
      lead_source: ["hero", "project_enquiry", "brochure", "contact", "careers", "site_visit"],
      lead_status: ["new", "contacted", "qualified", "won", "lost"],
      project_status: ["Ongoing", "Completed", "Upcoming"],
    },
  },
} as const;
