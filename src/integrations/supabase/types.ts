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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          profile_id: string | null
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          profile_id?: string | null
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          profile_id?: string | null
          role_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          recommendation_data: Json
          recommendation_type: string
          status: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          recommendation_data: Json
          recommendation_type: string
          status?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          recommendation_data?: Json
          recommendation_type?: string
          status?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip: unknown
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip?: unknown
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip?: unknown
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      bookings: {
        Row: {
          advance_amount: number | null
          booking_date: string
          booking_reference: string
          booking_time: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          payment_deadline: string | null
          payment_status: string
          price: number
          refund_status: string | null
          salon_id: string
          service_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advance_amount?: number | null
          booking_date: string
          booking_reference: string
          booking_time: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          payment_deadline?: string | null
          payment_status?: string
          price?: number
          refund_status?: string | null
          salon_id: string
          service_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advance_amount?: number | null
          booking_date?: string
          booking_reference?: string
          booking_time?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          payment_deadline?: string | null
          payment_status?: string
          price?: number
          refund_status?: string | null
          salon_id?: string
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_distributor_connections: {
        Row: {
          brand_id: string
          created_at: string
          distributor_id: string
          id: string
          initiated_by: string
          message: string | null
          responded_at: string | null
          status: string
          territory_notes: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          distributor_id: string
          id?: string
          initiated_by: string
          message?: string | null
          responded_at?: string | null
          status?: string
          territory_notes?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          distributor_id?: string
          id?: string
          initiated_by?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          territory_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_distributor_connections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_distributor_connections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_distributor_connections_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_distributor_connections_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_products: {
        Row: {
          brand_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          mrp: number | null
          name: string
          price: number | null
          sku: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name: string
          price?: number | null
          sku?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          mrp?: number | null
          name?: string
          price?: number | null
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands_public"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          address: string | null
          business_type: string | null
          category: string | null
          company_name: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          document_urls: string[] | null
          email: string | null
          founded_year: number | null
          gallery_urls: string[] | null
          gst_number: string | null
          hq_city: string | null
          hq_state: string | null
          id: string
          is_featured: boolean
          is_sponsored: boolean
          logo_url: string | null
          name: string
          owner_name: string | null
          pan_number: string | null
          phone: string | null
          pincode: string | null
          slug: string
          social_facebook: string | null
          social_instagram: string | null
          social_youtube: string | null
          status: string
          tagline: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          category?: string | null
          company_name?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          email?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          gst_number?: string | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string
          is_featured?: boolean
          is_sponsored?: boolean
          logo_url?: string | null
          name: string
          owner_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          slug: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_type?: string | null
          category?: string | null
          company_name?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          email?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          gst_number?: string | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string
          is_featured?: boolean
          is_sponsored?: boolean
          logo_url?: string | null
          name?: string
          owner_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          slug?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          area_locality: string | null
          business_category: string | null
          business_name: string
          city: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          owner_id: string
          phone: string | null
          salon_id: string | null
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          area_locality?: string | null
          business_category?: string | null
          business_name: string
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          owner_id: string
          phone?: string | null
          salon_id?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          area_locality?: string | null
          business_category?: string | null
          business_name?: string
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string
          phone?: string | null
          salon_id?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string[]
          city: string | null
          created_at: string
          education: Json
          email: string | null
          experience: Json
          full_name: string | null
          id: string
          is_submitted: boolean
          phone: string | null
          portfolio_urls: string[]
          preferences: Json
          resume_url: string | null
          skills: string[]
          submitted_at: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[]
          city?: string | null
          created_at?: string
          education?: Json
          email?: string | null
          experience?: Json
          full_name?: string | null
          id?: string
          is_submitted?: boolean
          phone?: string | null
          portfolio_urls?: string[]
          preferences?: Json
          resume_url?: string | null
          skills?: string[]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[]
          city?: string | null
          created_at?: string
          education?: Json
          email?: string | null
          experience?: Json
          full_name?: string | null
          id?: string
          is_submitted?: boolean
          phone?: string | null
          portfolio_urls?: string[]
          preferences?: Json
          resume_url?: string | null
          skills?: string[]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      customer_insights: {
        Row: {
          avg_booking_frequency: number | null
          churn_risk_score: number | null
          created_at: string
          customer_id: string
          id: string
          last_booking_date: string | null
          lifetime_value: number | null
          loyalty_score: number | null
          preferred_areas: string[] | null
          preferred_price_range: Json | null
          preferred_services: string[] | null
          updated_at: string
        }
        Insert: {
          avg_booking_frequency?: number | null
          churn_risk_score?: number | null
          created_at?: string
          customer_id: string
          id?: string
          last_booking_date?: string | null
          lifetime_value?: number | null
          loyalty_score?: number | null
          preferred_areas?: string[] | null
          preferred_price_range?: Json | null
          preferred_services?: string[] | null
          updated_at?: string
        }
        Update: {
          avg_booking_frequency?: number | null
          churn_risk_score?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          last_booking_date?: string | null
          lifetime_value?: number | null
          loyalty_score?: number | null
          preferred_areas?: string[] | null
          preferred_price_range?: Json | null
          preferred_services?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      distributors: {
        Row: {
          address: string | null
          brands_handled: string[] | null
          business_type: string | null
          categories: string[] | null
          city: string | null
          company_name: string
          contact_person: string | null
          cover_url: string | null
          coverage_districts: string[]
          coverage_states: string[] | null
          created_at: string
          description: string | null
          district: string | null
          document_urls: string[] | null
          email: string | null
          gallery_urls: string[] | null
          gst_number: string | null
          id: string
          is_featured: boolean
          is_sponsored: boolean
          logo_url: string | null
          owner_name: string | null
          pan_number: string | null
          phone: string | null
          pincode: string | null
          slug: string
          state: string | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          address?: string | null
          brands_handled?: string[] | null
          business_type?: string | null
          categories?: string[] | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          cover_url?: string | null
          coverage_districts?: string[]
          coverage_states?: string[] | null
          created_at?: string
          description?: string | null
          district?: string | null
          document_urls?: string[] | null
          email?: string | null
          gallery_urls?: string[] | null
          gst_number?: string | null
          id?: string
          is_featured?: boolean
          is_sponsored?: boolean
          logo_url?: string | null
          owner_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          slug: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          address?: string | null
          brands_handled?: string[] | null
          business_type?: string | null
          categories?: string[] | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          cover_url?: string | null
          coverage_districts?: string[]
          coverage_states?: string[] | null
          created_at?: string
          description?: string | null
          district?: string | null
          document_urls?: string[] | null
          email?: string | null
          gallery_urls?: string[] | null
          gst_number?: string | null
          id?: string
          is_featured?: boolean
          is_sponsored?: boolean
          logo_url?: string | null
          owner_name?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          slug?: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      district_business_partners: {
        Row: {
          created_at: string
          district: string
          email: string | null
          full_name: string
          hall_of_fame: boolean
          hall_of_fame_rank: number | null
          id: string
          metadata: Json
          mobile: string | null
          photo_url: string | null
          pincode: string | null
          rejection_reason: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["dbp_status"]
          success_story: string | null
          tagline: string | null
          tier: Database["public"]["Enums"]["dbp_tier"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          district: string
          email?: string | null
          full_name: string
          hall_of_fame?: boolean
          hall_of_fame_rank?: number | null
          id?: string
          metadata?: Json
          mobile?: string | null
          photo_url?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["dbp_status"]
          success_story?: string | null
          tagline?: string | null
          tier?: Database["public"]["Enums"]["dbp_tier"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          district?: string
          email?: string | null
          full_name?: string
          hall_of_fame?: boolean
          hall_of_fame_rank?: number | null
          id?: string
          metadata?: Json
          mobile?: string | null
          photo_url?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["dbp_status"]
          success_story?: string | null
          tagline?: string | null
          tier?: Database["public"]["Enums"]["dbp_tier"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          business_name: string
          business_type: string
          city: string
          created_at: string
          id: string
          phone: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          business_type: string
          city: string
          created_at?: string
          id?: string
          phone: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          business_type?: string
          city?: string
          created_at?: string
          id?: string
          phone?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          salon_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          salon_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          applicants_count: number
          area: string | null
          benefits: string[] | null
          category: string
          city: string
          contact_mobile: string | null
          contact_person: string | null
          created_at: string
          description: string
          employer_id: string
          experience_level: string | null
          id: string
          interview_mode: string | null
          job_role: string | null
          job_type: string
          openings: number
          posted_by: string
          published_at: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          salary_period: string | null
          schedule: string | null
          shop_id: string | null
          skills: string[] | null
          status: string
          title: string
          updated_at: string
          whatsapp_number: string | null
          work_location: string | null
        }
        Insert: {
          address?: string | null
          applicants_count?: number
          area?: string | null
          benefits?: string[] | null
          category: string
          city: string
          contact_mobile?: string | null
          contact_person?: string | null
          created_at?: string
          description: string
          employer_id: string
          experience_level?: string | null
          id?: string
          interview_mode?: string | null
          job_role?: string | null
          job_type: string
          openings?: number
          posted_by: string
          published_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          schedule?: string | null
          shop_id?: string | null
          skills?: string[] | null
          status?: string
          title: string
          updated_at?: string
          whatsapp_number?: string | null
          work_location?: string | null
        }
        Update: {
          address?: string | null
          applicants_count?: number
          area?: string | null
          benefits?: string[] | null
          category?: string
          city?: string
          contact_mobile?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string
          employer_id?: string
          experience_level?: string | null
          id?: string
          interview_mode?: string | null
          job_role?: string | null
          job_type?: string
          openings?: number
          posted_by?: string
          published_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          schedule?: string | null
          shop_id?: string | null
          skills?: string[] | null
          status?: string
          title?: string
          updated_at?: string
          whatsapp_number?: string | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      location_history: {
        Row: {
          accuracy_meters: number | null
          area: string | null
          city: string | null
          detected_at: string
          id: string
          latitude: number
          longitude: number
          user_id: string
        }
        Insert: {
          accuracy_meters?: number | null
          area?: string | null
          city?: string | null
          detected_at?: string
          id?: string
          latitude: number
          longitude: number
          user_id: string
        }
        Update: {
          accuracy_meters?: number | null
          area?: string | null
          city?: string | null
          detected_at?: string
          id?: string
          latitude?: number
          longitude?: number
          user_id?: string
        }
        Relationships: []
      }
      login_events: {
        Row: {
          created_at: string
          device_label: string | null
          id: string
          ip_address: unknown
          is_active: boolean
          location: Json | null
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_label?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          location?: Json | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_label?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          location?: Json | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          id: string
          message: string | null
          response_count: number
          salon_id: string
          sent_count: number
          status: string
          target_segment: string | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          id?: string
          message?: string | null
          response_count?: number
          salon_id: string
          sent_count?: number
          status?: string
          target_segment?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          id?: string
          message?: string | null
          response_count?: number
          salon_id?: string
          sent_count?: number
          status?: string
          target_segment?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          saved_amount: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          saved_amount?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          saved_amount?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          id: string
          last_error: string | null
          payload: Json
          scheduled_at: string
          sent_at: string | null
          status: string
          template_key: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          channel: string
          created_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          template_key: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          template_key?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          image_url: string | null
          is_active: boolean
          salon_id: string | null
          title: string
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          salon_id?: string | null
          title: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          salon_id?: string | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_requests: {
        Row: {
          area_locality: string | null
          business_category: string | null
          business_id: string | null
          business_name: string
          city: string | null
          created_at: string
          email: string
          id: string
          owner_full_name: string
          phone: string
          status: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          area_locality?: string | null
          business_category?: string | null
          business_id?: string | null
          business_name: string
          city?: string | null
          created_at?: string
          email: string
          id?: string
          owner_full_name: string
          phone: string
          status?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          area_locality?: string | null
          business_category?: string | null
          business_id?: string | null
          business_name?: string
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          owner_full_name?: string
          phone?: string
          status?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          partner_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          partner_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_activity_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_dashboard_metrics: {
        Row: {
          active_shops: number
          current_month_payout: number
          current_week_payout: number
          district_rank: number | null
          hall_of_fame_rank: number | null
          lifetime_earnings: number
          nexora_earnings: number
          next_milestone: string | null
          next_milestone_shops: number | null
          partner_earnings: number
          partner_id: string
          pending_earnings: number
          revenue_generated: number
          total_shops: number
          updated_at: string
        }
        Insert: {
          active_shops?: number
          current_month_payout?: number
          current_week_payout?: number
          district_rank?: number | null
          hall_of_fame_rank?: number | null
          lifetime_earnings?: number
          nexora_earnings?: number
          next_milestone?: string | null
          next_milestone_shops?: number | null
          partner_earnings?: number
          partner_id: string
          pending_earnings?: number
          revenue_generated?: number
          total_shops?: number
          updated_at?: string
        }
        Update: {
          active_shops?: number
          current_month_payout?: number
          current_week_payout?: number
          district_rank?: number | null
          hall_of_fame_rank?: number | null
          lifetime_earnings?: number
          nexora_earnings?: number
          next_milestone?: string | null
          next_milestone_shops?: number | null
          partner_earnings?: number
          partner_id?: string
          pending_earnings?: number
          revenue_generated?: number
          total_shops?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_dashboard_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          partner_id: string
          payout_id: string | null
          period_end: string | null
          period_start: string | null
          share_rate: number | null
          shop_id: string | null
          source_revenue: number | null
          status: Database["public"]["Enums"]["dbp_earning_status"]
          type: Database["public"]["Enums"]["dbp_earning_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id: string
          payout_id?: string | null
          period_end?: string | null
          period_start?: string | null
          share_rate?: number | null
          shop_id?: string | null
          source_revenue?: number | null
          status?: Database["public"]["Enums"]["dbp_earning_status"]
          type: Database["public"]["Enums"]["dbp_earning_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id?: string
          payout_id?: string | null
          period_end?: string | null
          period_start?: string | null
          share_rate?: number | null
          shop_id?: string | null
          source_revenue?: number | null
          status?: Database["public"]["Enums"]["dbp_earning_status"]
          type?: Database["public"]["Enums"]["dbp_earning_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_earnings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_earnings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "partner_shop_mapping"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_hall_of_fame: {
        Row: {
          achievements: Json
          active_shops: number
          badge: string | null
          category: string
          created_at: string
          featured_from: string
          featured_to: string | null
          id: string
          partner_id: string
          rank: number
          revenue_generated: number
          success_story: string | null
          updated_at: string
        }
        Insert: {
          achievements?: Json
          active_shops?: number
          badge?: string | null
          category?: string
          created_at?: string
          featured_from?: string
          featured_to?: string | null
          id?: string
          partner_id: string
          rank: number
          revenue_generated?: number
          success_story?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: Json
          active_shops?: number
          badge?: string | null
          category?: string
          created_at?: string
          featured_from?: string
          featured_to?: string | null
          id?: string
          partner_id?: string
          rank?: number
          revenue_generated?: number
          success_story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_hall_of_fame_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_leaderboard: {
        Row: {
          active_shops: number
          computed_at: string
          created_at: string
          district: string | null
          id: string
          partner_earnings: number
          partner_id: string
          period: Database["public"]["Enums"]["dbp_leaderboard_period"]
          period_end: string | null
          period_start: string | null
          rank: number
          revenue_generated: number
          scope: string
          score: number
          state: string | null
        }
        Insert: {
          active_shops?: number
          computed_at?: string
          created_at?: string
          district?: string | null
          id?: string
          partner_earnings?: number
          partner_id: string
          period: Database["public"]["Enums"]["dbp_leaderboard_period"]
          period_end?: string | null
          period_start?: string | null
          rank: number
          revenue_generated?: number
          scope?: string
          score?: number
          state?: string | null
        }
        Update: {
          active_shops?: number
          computed_at?: string
          created_at?: string
          district?: string | null
          id?: string
          partner_earnings?: number
          partner_id?: string
          period?: Database["public"]["Enums"]["dbp_leaderboard_period"]
          period_end?: string | null
          period_start?: string | null
          rank?: number
          revenue_generated?: number
          scope?: string
          score?: number
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_leaderboard_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_milestones: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          milestone_code: string
          partner_id: string
          reward_id: string | null
          shops_required: number
          tier: Database["public"]["Enums"]["dbp_tier"] | null
          unlocked: boolean
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          milestone_code: string
          partner_id: string
          reward_id?: string | null
          shops_required: number
          tier?: Database["public"]["Enums"]["dbp_tier"] | null
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          milestone_code?: string
          partner_id?: string
          reward_id?: string | null
          shops_required?: number
          tier?: Database["public"]["Enums"]["dbp_tier"] | null
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_milestones_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_milestones_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "partner_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          amount: number
          bank_account: Json | null
          created_at: string
          cycle_end: string
          cycle_start: string
          earnings_count: number
          failure_reason: string | null
          id: string
          metadata: Json
          partner_id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["dbp_payout_status"]
          updated_at: string
          utr: string | null
        }
        Insert: {
          amount: number
          bank_account?: Json | null
          created_at?: string
          cycle_end: string
          cycle_start: string
          earnings_count?: number
          failure_reason?: string | null
          id?: string
          metadata?: Json
          partner_id: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["dbp_payout_status"]
          updated_at?: string
          utr?: string | null
        }
        Update: {
          amount?: number
          bank_account?: Json | null
          created_at?: string
          cycle_end?: string
          cycle_start?: string
          earnings_count?: number
          failure_reason?: string | null
          id?: string
          metadata?: Json
          partner_id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["dbp_payout_status"]
          updated_at?: string
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referred_mobile: string | null
          referred_name: string | null
          referred_partner_id: string | null
          referred_user_id: string | null
          referrer_partner_id: string
          reward_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_mobile?: string | null
          referred_name?: string | null
          referred_partner_id?: string | null
          referred_user_id?: string | null
          referrer_partner_id: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_mobile?: string | null
          referred_name?: string | null
          referred_partner_id?: string | null
          referred_user_id?: string | null
          referrer_partner_id?: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_referrals_referred_partner_id_fkey"
            columns: ["referred_partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_referrals_referrer_partner_id_fkey"
            columns: ["referrer_partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_rewards: {
        Row: {
          created_at: string
          delivered_at: string | null
          dispatched_at: string | null
          id: string
          metadata: Json
          notes: string | null
          partner_id: string
          reward_code: string
          reward_name: string
          shops_required: number | null
          status: Database["public"]["Enums"]["dbp_reward_status"]
          tier: Database["public"]["Enums"]["dbp_tier"] | null
          tracking_id: string | null
          unlocked_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id: string
          reward_code: string
          reward_name: string
          shops_required?: number | null
          status?: Database["public"]["Enums"]["dbp_reward_status"]
          tier?: Database["public"]["Enums"]["dbp_tier"] | null
          tracking_id?: string | null
          unlocked_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id?: string
          reward_code?: string
          reward_name?: string
          shops_required?: number | null
          status?: Database["public"]["Enums"]["dbp_reward_status"]
          tier?: Database["public"]["Enums"]["dbp_tier"] | null
          tracking_id?: string | null
          unlocked_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_rewards_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_shop_mapping: {
        Row: {
          activated_at: string | null
          area: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          mobile: string | null
          owner_name: string | null
          partner_id: string
          revenue_generated: number
          salon_id: string | null
          shop_name: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          area?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          mobile?: string | null
          owner_name?: string | null
          partner_id: string
          revenue_generated?: number
          salon_id?: string | null
          shop_name: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          area?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          mobile?: string | null
          owner_name?: string | null
          partner_id?: string
          revenue_generated?: number
          salon_id?: string | null
          shop_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_shop_mapping_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_shop_mapping_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_shop_mapping_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          escrow_release_at: string | null
          failure_reason: string | null
          gateway_response: Json | null
          id: string
          payment_method: string | null
          payment_type: string | null
          processed_at: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          released_to_wallet: boolean | null
          salon_id: string | null
          status: string | null
          transaction_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          escrow_release_at?: string | null
          failure_reason?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          payment_type?: string | null
          processed_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          released_to_wallet?: boolean | null
          salon_id?: string | null
          status?: string | null
          transaction_id?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          escrow_release_at?: string | null
          failure_reason?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          payment_type?: string | null
          processed_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          released_to_wallet?: boolean | null
          salon_id?: string | null
          status?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payments: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          screenshot_url: string | null
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_leads: {
        Row: {
          brand_id: string | null
          city: string | null
          created_at: string
          distributor_id: string | null
          email: string | null
          from_user_id: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          target_type: string
        }
        Insert: {
          brand_id?: string | null
          city?: string | null
          created_at?: string
          distributor_id?: string | null
          email?: string | null
          from_user_id?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          target_type: string
        }
        Update: {
          brand_id?: string | null
          city?: string | null
          created_at?: string
          distributor_id?: string | null
          email?: string | null
          from_user_id?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_leads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          block: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          latitude: number | null
          location_captured_at: string | null
          longitude: number | null
          mobile: string | null
          nexora_id: string | null
          pincode: string | null
          referral_code: string | null
          referred_by: string | null
          referred_by_user_id: string | null
          state: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          block?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean
          is_verified?: boolean
          latitude?: number | null
          location_captured_at?: string | null
          longitude?: number | null
          mobile?: string | null
          nexora_id?: string | null
          pincode?: string | null
          referral_code?: string | null
          referred_by?: string | null
          referred_by_user_id?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          block?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          latitude?: number | null
          location_captured_at?: string | null
          longitude?: number | null
          mobile?: string | null
          nexora_id?: string | null
          pincode?: string | null
          referral_code?: string | null
          referred_by?: string | null
          referred_by_user_id?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          banner_url: string | null
          brand_id: string
          budget: number | null
          clicks: number
          created_at: string
          description: string | null
          end_date: string
          id: string
          impressions: number
          product_id: string | null
          start_date: string
          status: string
          target_category: string | null
          target_district: string | null
          target_state: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          brand_id: string
          budget?: number | null
          clicks?: number
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          impressions?: number
          product_id?: string | null
          start_date?: string
          status?: string
          target_category?: string | null
          target_district?: string | null
          target_state?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          brand_id?: string
          budget?: number | null
          clicks?: number
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          impressions?: number
          product_id?: string | null
          start_date?: string
          status?: string
          target_category?: string | null
          target_district?: string | null
          target_state?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          qr_code: string
          salon_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          qr_code: string
          salon_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          qr_code?: string
          salon_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_payments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_payments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          reward_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          salon_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          salon_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          salon_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          points: number | null
          reward_type: Database["public"]["Enums"]["reward_type"] | null
          shop_id: string | null
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          points?: number | null
          reward_type?: Database["public"]["Enums"]["reward_type"] | null
          shop_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          points?: number | null
          reward_type?: Database["public"]["Enums"]["reward_type"] | null
          shop_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_ledger: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          percentage: number | null
          reward_type: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          percentage?: number | null
          reward_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          percentage?: number | null
          reward_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_owners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          is_approved: boolean
          role: string
          salon_id: string
          selected_template_id: string | null
          selected_template_key: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          role?: string
          salon_id: string
          selected_template_id?: string | null
          selected_template_key?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          role?: string
          salon_id?: string
          selected_template_id?: string | null
          selected_template_key?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_owners_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_owners_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_owners_selected_template_id_fkey"
            columns: ["selected_template_id"]
            isOneToOne: false
            referencedRelation: "website_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_rankings: {
        Row: {
          activity_component: number | null
          booking_component: number | null
          calculated_at: string
          category: string | null
          city: string
          id: string
          nexora_score: number
          previous_ranking: number | null
          ranking: number
          rating_component: number | null
          retention_component: number | null
          salon_id: string
        }
        Insert: {
          activity_component?: number | null
          booking_component?: number | null
          calculated_at?: string
          category?: string | null
          city: string
          id?: string
          nexora_score: number
          previous_ranking?: number | null
          ranking: number
          rating_component?: number | null
          retention_component?: number | null
          salon_id: string
        }
        Update: {
          activity_component?: number | null
          booking_component?: number | null
          calculated_at?: string
          category?: string | null
          city?: string
          id?: string
          nexora_score?: number
          previous_ranking?: number | null
          ranking?: number
          rating_component?: number | null
          retention_component?: number | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_rankings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_rankings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_wallets: {
        Row: {
          available_balance: number
          commission_rate: number | null
          created_at: string
          deleted_at: string | null
          id: string
          last_settlement_at: string | null
          last_withdrawal_at: string | null
          pending_balance: number
          salon_id: string
          total_earnings: number
          total_withdrawals: number | null
          updated_at: string
        }
        Insert: {
          available_balance?: number
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_settlement_at?: string | null
          last_withdrawal_at?: string | null
          pending_balance?: number
          salon_id: string
          total_earnings?: number
          total_withdrawals?: number | null
          updated_at?: string
        }
        Update: {
          available_balance?: number
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_settlement_at?: string | null
          last_withdrawal_at?: string | null
          pending_balance?: number
          salon_id?: string
          total_earnings?: number
          total_withdrawals?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_wallets_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_wallets_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          address: string | null
          amenities: string[] | null
          brand_primary: string | null
          brand_secondary: string | null
          business_public_phone: string | null
          business_public_whatsapp: string | null
          category: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          custom_css: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          discount: string | null
          distance: number | null
          district: string | null
          email: string | null
          gallery_images: string[] | null
          hours: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          is_home_service: boolean
          is_verified: boolean
          latitude: number | null
          location: string | null
          logo_url: string | null
          longitude: number | null
          name: string
          nexora_score: number
          owner_name: string | null
          phone: string | null
          pincode: string | null
          price_range: string | null
          rank_in_city: number | null
          rating: number
          reviews_count: number
          selected_template_id: string | null
          selected_template_key: string | null
          seo_description: string | null
          seo_title: string | null
          setup_completed_at: string | null
          show_public_contact: boolean
          slug: string
          tagline: string | null
          theme: string | null
          updated_at: string
          upi_id: string | null
          website_created: boolean
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          brand_primary?: string | null
          brand_secondary?: string | null
          business_public_phone?: string | null
          business_public_whatsapp?: string | null
          category?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_css?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          discount?: string | null
          distance?: number | null
          district?: string | null
          email?: string | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_home_service?: boolean
          is_verified?: boolean
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          nexora_score?: number
          owner_name?: string | null
          phone?: string | null
          pincode?: string | null
          price_range?: string | null
          rank_in_city?: number | null
          rating?: number
          reviews_count?: number
          selected_template_id?: string | null
          selected_template_key?: string | null
          seo_description?: string | null
          seo_title?: string | null
          setup_completed_at?: string | null
          show_public_contact?: boolean
          slug: string
          tagline?: string | null
          theme?: string | null
          updated_at?: string
          upi_id?: string | null
          website_created?: boolean
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          brand_primary?: string | null
          brand_secondary?: string | null
          business_public_phone?: string | null
          business_public_whatsapp?: string | null
          category?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_css?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          discount?: string | null
          distance?: number | null
          district?: string | null
          email?: string | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_home_service?: boolean
          is_verified?: boolean
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          nexora_score?: number
          owner_name?: string | null
          phone?: string | null
          pincode?: string | null
          price_range?: string | null
          rank_in_city?: number | null
          rating?: number
          reviews_count?: number
          selected_template_id?: string | null
          selected_template_key?: string | null
          seo_description?: string | null
          seo_title?: string | null
          setup_completed_at?: string | null
          show_public_contact?: boolean
          slug?: string
          tagline?: string | null
          theme?: string | null
          updated_at?: string
          upi_id?: string | null
          website_created?: boolean
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_selected_template_id_fkey"
            columns: ["selected_template_id"]
            isOneToOne: false
            referencedRelation: "website_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          clicked_results: Json | null
          created_at: string
          id: string
          processed_intent: Json | null
          results_count: number | null
          search_query: string
          session_id: string | null
          user_id: string | null
          user_location: Json | null
        }
        Insert: {
          clicked_results?: Json | null
          created_at?: string
          id?: string
          processed_intent?: Json | null
          results_count?: number | null
          search_query: string
          session_id?: string | null
          user_id?: string | null
          user_location?: Json | null
        }
        Update: {
          clicked_results?: Json | null
          created_at?: string
          id?: string
          processed_intent?: Json | null
          results_count?: number | null
          search_query?: string
          session_id?: string | null
          user_id?: string | null
          user_location?: Json | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          clicked_salon_id: string | null
          created_at: string
          filters: Json
          id: string
          query: string | null
          results_count: number
          user_id: string
        }
        Insert: {
          clicked_salon_id?: string | null
          created_at?: string
          filters?: Json
          id?: string
          query?: string | null
          results_count?: number
          user_id: string
        }
        Update: {
          clicked_salon_id?: string | null
          created_at?: string
          filters?: Json
          id?: string
          query?: string | null
          results_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_clicked_salon_id_fkey"
            columns: ["clicked_salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_history_clicked_salon_id_fkey"
            columns: ["clicked_salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          event_details: Json
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean
          is_home_service: boolean
          name: string
          price: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_home_service?: boolean
          name: string
          price?: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_home_service?: boolean
          name?: string
          price?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_staff: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          job_title: string | null
          phone: string | null
          photo_url: string | null
          profile_id: string | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_staff_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          area: string | null
          category: string
          city: string
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean
          name: string
          price_level: number
          rating: number
          review_count: number
          search_vector: unknown
          slug: string
          tagline: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          category: string
          city: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          name: string
          price_level?: number
          rating?: number
          review_count?: number
          search_vector?: unknown
          slug: string
          tagline?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          category?: string
          city?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          price_level?: number
          rating?: number
          review_count?: number
          search_vector?: unknown
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          rating: number
          role: string | null
          salon_id: string
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          rating?: number
          role?: string | null
          salon_id: string
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          rating?: number
          role?: string | null
          salon_id?: string
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_key: string
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_key: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_key?: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string | null
          customer_id: string | null
          gateway_reference: string | null
          id: string
          metadata: Json | null
          net_amount: number | null
          notes: string | null
          platform_fee: number | null
          shop_id: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          wallet_id: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          notes?: string | null
          platform_fee?: number | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          notes?: string | null
          platform_fee?: number | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_searches: {
        Row: {
          audio_duration_seconds: number | null
          confidence_score: number | null
          created_at: string
          id: string
          results_returned: number | null
          search_intent: Json | null
          transcribed_text: string | null
          user_id: string | null
        }
        Insert: {
          audio_duration_seconds?: number | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          results_returned?: number | null
          search_intent?: Json | null
          transcribed_text?: string | null
          user_id?: string | null
        }
        Update: {
          audio_duration_seconds?: number | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          results_returned?: number | null
          search_intent?: Json | null
          transcribed_text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          deleted_at: string | null
          id: string
          reason: string | null
          reference_id: string | null
          salon_id: string | null
          type: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          reason?: string | null
          reference_id?: string | null
          salon_id?: string | null
          type: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          reason?: string | null
          reference_id?: string | null
          salon_id?: string | null
          type?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "salon_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          lifetime_earned: number | null
          pending_balance: number | null
          reserve_amount: number | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          lifetime_earned?: number | null
          pending_balance?: number | null
          reserve_amount?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          lifetime_earned?: number | null
          pending_balance?: number | null
          reserve_amount?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      website_templates: {
        Row: {
          background_color: string | null
          card_color: string | null
          category: string
          created_at: string
          description: string | null
          hero_type: string | null
          id: string
          is_active: boolean
          preview_image: string | null
          primary_color: string | null
          secondary_color: string | null
          sort_order: number
          template_config_json: Json
          template_key: string
          template_name: string
          template_slug: string
          text_color: string | null
          theme_type: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          card_color?: string | null
          category: string
          created_at?: string
          description?: string | null
          hero_type?: string | null
          id?: string
          is_active?: boolean
          preview_image?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sort_order?: number
          template_config_json?: Json
          template_key: string
          template_name: string
          template_slug: string
          text_color?: string | null
          theme_type?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          card_color?: string | null
          category?: string
          created_at?: string
          description?: string | null
          hero_type?: string | null
          id?: string
          is_active?: boolean
          preview_image?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sort_order?: number
          template_config_json?: Json
          template_key?: string
          template_name?: string
          template_slug?: string
          text_color?: string | null
          theme_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          bank_account_details: Json | null
          created_at: string
          id: string
          processed_at: string | null
          salon_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_details?: Json | null
          created_at?: string
          id?: string
          processed_at?: string | null
          salon_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_details?: Json | null
          created_at?: string
          id?: string
          processed_at?: string | null
          salon_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "public_salon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      brands_public: {
        Row: {
          category: string | null
          company_name: string | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          gallery_urls: string[] | null
          hq_city: string | null
          hq_state: string | null
          id: string | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          logo_url: string | null
          name: string | null
          slug: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_youtube: string | null
          status: string | null
          tagline: string | null
          website: string | null
        }
        Insert: {
          category?: string | null
          company_name?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          status?: string | null
          tagline?: string | null
          website?: string | null
        }
        Update: {
          category?: string | null
          company_name?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          status?: string | null
          tagline?: string | null
          website?: string | null
        }
        Relationships: []
      }
      distributors_public: {
        Row: {
          brands_handled: string[] | null
          categories: string[] | null
          city: string | null
          company_name: string | null
          cover_url: string | null
          coverage_districts: string[] | null
          coverage_states: string[] | null
          created_at: string | null
          description: string | null
          district: string | null
          gallery_urls: string[] | null
          id: string | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          logo_url: string | null
          slug: string | null
          state: string | null
          status: string | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          brands_handled?: string[] | null
          categories?: string[] | null
          city?: string | null
          company_name?: string | null
          cover_url?: string | null
          coverage_districts?: string[] | null
          coverage_states?: string[] | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          gallery_urls?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          brands_handled?: string[] | null
          categories?: string[] | null
          city?: string | null
          company_name?: string | null
          cover_url?: string | null
          coverage_districts?: string[] | null
          coverage_states?: string[] | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          gallery_urls?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          logo_url?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      partner_hall_of_fame_public: {
        Row: {
          achievements: Json | null
          active_shops: number | null
          badge: string | null
          category: string | null
          created_at: string | null
          featured_from: string | null
          featured_to: string | null
          id: string | null
          partner_id: string | null
          rank: number | null
          success_story: string | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          active_shops?: number | null
          badge?: string | null
          category?: string | null
          created_at?: string | null
          featured_from?: string | null
          featured_to?: string | null
          id?: string | null
          partner_id?: string | null
          rank?: number | null
          success_story?: string | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          active_shops?: number | null
          badge?: string | null
          category?: string | null
          created_at?: string | null
          featured_from?: string | null
          featured_to?: string | null
          id?: string | null
          partner_id?: string | null
          rank?: number | null
          success_story?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_hall_of_fame_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_leaderboard_public: {
        Row: {
          active_shops: number | null
          computed_at: string | null
          created_at: string | null
          district: string | null
          id: string | null
          partner_id: string | null
          period: Database["public"]["Enums"]["dbp_leaderboard_period"] | null
          period_end: string | null
          period_start: string | null
          rank: number | null
          scope: string | null
          score: number | null
          state: string | null
        }
        Insert: {
          active_shops?: number | null
          computed_at?: string | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          partner_id?: string | null
          period?: Database["public"]["Enums"]["dbp_leaderboard_period"] | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          scope?: string | null
          score?: number | null
          state?: string | null
        }
        Update: {
          active_shops?: number | null
          computed_at?: string | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          partner_id?: string | null
          period?: Database["public"]["Enums"]["dbp_leaderboard_period"] | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          scope?: string | null
          score?: number | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_leaderboard_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "district_business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      public_salon_cards: {
        Row: {
          address: string | null
          amenities: string[] | null
          brand_primary: string | null
          brand_secondary: string | null
          category: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          discount: string | null
          gallery_images: string[] | null
          hours: Json | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_home_service: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          nexora_score: number | null
          phone: string | null
          pincode: string | null
          price_range: string | null
          rank_in_city: number | null
          rating: number | null
          reviews_count: number | null
          selected_template_id: string | null
          selected_template_key: string | null
          slug: string | null
          tagline: string | null
          theme: string | null
          website_created: boolean | null
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: never
          amenities?: string[] | null
          brand_primary?: string | null
          brand_secondary?: string | null
          category?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_home_service?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          nexora_score?: number | null
          phone?: never
          pincode?: string | null
          price_range?: string | null
          rank_in_city?: number | null
          rating?: number | null
          reviews_count?: number | null
          selected_template_id?: string | null
          selected_template_key?: string | null
          slug?: string | null
          tagline?: string | null
          theme?: string | null
          website_created?: boolean | null
          website_url?: string | null
          whatsapp?: never
        }
        Update: {
          address?: never
          amenities?: string[] | null
          brand_primary?: string | null
          brand_secondary?: string | null
          category?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_home_service?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          nexora_score?: number | null
          phone?: never
          pincode?: string | null
          price_range?: string | null
          rank_in_city?: number | null
          rating?: number | null
          reviews_count?: number | null
          selected_template_id?: string | null
          selected_template_key?: string | null
          slug?: string | null
          tagline?: string | null
          theme?: string | null
          website_created?: boolean | null
          website_url?: string | null
          whatsapp?: never
        }
        Relationships: [
          {
            foreignKeyName: "salons_selected_template_id_fkey"
            columns: ["selected_template_id"]
            isOneToOne: false
            referencedRelation: "website_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_release_escrow: { Args: never; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_booking_reference: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_at_risk_customers: {
        Args: { _limit?: number; _salon_id: string }
        Returns: {
          churn_risk_score: number
          customer_id: string
          full_name: string
          last_booking_date: string
          lifetime_value: number
          mobile: string
          preferred_services: string[]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_district_partner: {
        Args: { _partner_id: string; _user_id: string }
        Returns: boolean
      }
      is_salon_owner: {
        Args: { _salon_id: string; _user_id: string }
        Returns: boolean
      }
      is_shop_member: {
        Args: { _salon_id: string; _user_id: string }
        Returns: boolean
      }
      is_shop_member_biz: { Args: { _business_id: string }; Returns: boolean }
      is_shop_owner_biz: { Args: { _business_id: string }; Returns: boolean }
      is_super_admin:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      list_salon_staff: {
        Args: { _salon_id: string }
        Returns: {
          avatar_url: string
          bio: string
          id: string
          name: string
          rating: number
          role: string
          salon_id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      nearby_salons: {
        Args: {
          _lat: number
          _limit?: number
          _lng: number
          _radius_km?: number
        }
        Returns: {
          category: string
          discount: string
          distance_km: number
          id: string
          image_url: string
          latitude: number
          location: string
          longitude: number
          name: string
          price_range: string
          rating: number
          reviews_count: number
        }[]
      }
      process_pending_settlements: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recommended_salons: {
        Args: { _limit?: number }
        Returns: {
          category: string
          discount: string
          id: string
          image_url: string
          location: string
          name: string
          price_range: string
          rating: number
          reviews_count: number
        }[]
      }
      recompute_customer_insights: { Args: never; Returns: number }
      recompute_nexora_scores: { Args: never; Returns: number }
      recompute_partner_dashboard_metrics: {
        Args: { _partner_id: string }
        Returns: undefined
      }
      recompute_partner_leaderboard: {
        Args: { _period: Database["public"]["Enums"]["dbp_leaderboard_period"] }
        Returns: number
      }
      refresh_salon_stats: { Args: never; Returns: undefined }
      register_owner_business: {
        Args: {
          _address?: string
          _category?: string
          _district: string
          _email?: string
          _mobile: string
          _owner_name: string
          _shop_name: string
          _whatsapp?: string
        }
        Returns: string
      }
      release_expired_bookings: { Args: never; Returns: number }
      release_payment_to_wallet: {
        Args: { _payment_id: string }
        Returns: Json
      }
      request_withdrawal: {
        Args: { _amount: number; _bank: Json; _salon_id: string }
        Returns: string
      }
      shops_search: {
        Args: { _category?: string; _limit?: number; _q?: string }
        Returns: {
          area: string
          category: string
          city: string
          cover_image: string
          id: string
          is_verified: boolean
          name: string
          price_level: string
          rank: number
          rating: number
          review_count: number
          slug: string
          tagline: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "customer"
        | "owner"
        | "admin"
        | "growth_partner"
        | "district_partner"
        | "distributor"
        | "super_admin"
        | "shop_owner"
        | "shop_manager"
        | "staff"
        | "brand"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      business_status:
        | "draft"
        | "pending_verification"
        | "verified"
        | "active"
        | "inactive"
        | "suspended"
        | "rejected"
        | "archived"
      dbp_earning_status: "pending" | "approved" | "paid" | "rejected"
      dbp_earning_type:
        | "activation_reward"
        | "growth_share"
        | "bonus"
        | "milestone_bonus"
      dbp_leaderboard_period: "weekly" | "monthly" | "all_time"
      dbp_payout_status: "pending" | "processing" | "paid" | "failed"
      dbp_reward_status: "pending" | "dispatched" | "delivered" | "cancelled"
      dbp_status: "pending" | "verified" | "suspended" | "rejected"
      dbp_tier:
        | "welcome"
        | "recognition"
        | "growth_builder"
        | "platinum"
        | "leadership_circle"
      reward_type:
        | "points"
        | "cashback"
        | "referral"
        | "membership"
        | "admin_bonus"
      transaction_status: "pending" | "success" | "failed" | "refunded"
      transaction_type:
        | "qr_payment"
        | "booking_payment"
        | "platform_commission"
        | "owner_payout"
        | "refund"
        | "reward_credit"
        | "referral_bonus"
      user_role:
        | "super_admin"
        | "shop_owner"
        | "shop_manager"
        | "staff"
        | "customer"
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
      app_role: [
        "customer",
        "owner",
        "admin",
        "growth_partner",
        "district_partner",
        "distributor",
        "super_admin",
        "shop_owner",
        "shop_manager",
        "staff",
        "brand",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      business_status: [
        "draft",
        "pending_verification",
        "verified",
        "active",
        "inactive",
        "suspended",
        "rejected",
        "archived",
      ],
      dbp_earning_status: ["pending", "approved", "paid", "rejected"],
      dbp_earning_type: [
        "activation_reward",
        "growth_share",
        "bonus",
        "milestone_bonus",
      ],
      dbp_leaderboard_period: ["weekly", "monthly", "all_time"],
      dbp_payout_status: ["pending", "processing", "paid", "failed"],
      dbp_reward_status: ["pending", "dispatched", "delivered", "cancelled"],
      dbp_status: ["pending", "verified", "suspended", "rejected"],
      dbp_tier: [
        "welcome",
        "recognition",
        "growth_builder",
        "platinum",
        "leadership_circle",
      ],
      reward_type: [
        "points",
        "cashback",
        "referral",
        "membership",
        "admin_bonus",
      ],
      transaction_status: ["pending", "success", "failed", "refunded"],
      transaction_type: [
        "qr_payment",
        "booking_payment",
        "platform_commission",
        "owner_payout",
        "refund",
        "reward_credit",
        "referral_bonus",
      ],
      user_role: [
        "super_admin",
        "shop_owner",
        "shop_manager",
        "staff",
        "customer",
      ],
    },
  },
} as const
