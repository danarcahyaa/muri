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
      ai_input_materials: {
        Row: {
          ai_pattern_id: string
          created_at: string | null
          fabric_notes: string | null
          id: string
          uploaded_waste_image_url: string
        }
        Insert: {
          ai_pattern_id: string
          created_at?: string | null
          fabric_notes?: string | null
          id?: string
          uploaded_waste_image_url: string
        }
        Update: {
          ai_pattern_id?: string
          created_at?: string | null
          fabric_notes?: string | null
          id?: string
          uploaded_waste_image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_input_materials_ai_pattern_id_fkey"
            columns: ["ai_pattern_id"]
            isOneToOne: false
            referencedRelation: "brand_ai_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_ai_patterns: {
        Row: {
          brand_id: string
          created_at: string | null
          generated_design_url: string
          id: string
          prompt_text: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          generated_design_url: string
          id?: string
          prompt_text: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          generated_design_url?: string
          id?: string
          prompt_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_ai_patterns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_productions: {
        Row: {
          brand_id: string
          created_at: string | null
          finished_at: string | null
          id: string
          production_name: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          production_name: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          production_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_productions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          active_number: string
          address: string | null
          brand_name: string
          created_at: string | null
          id: string
          short_story: string | null
          social_media_links: Json | null
          updated_at: string | null
          warehouse_address: string | null
          warehouse_maps_url: string | null
        }
        Insert: {
          active_number: string
          address?: string | null
          brand_name: string
          created_at?: string | null
          id: string
          short_story?: string | null
          social_media_links?: Json | null
          updated_at?: string | null
          warehouse_address?: string | null
          warehouse_maps_url?: string | null
        }
        Update: {
          active_number?: string
          address?: string | null
          brand_name?: string
          created_at?: string | null
          id?: string
          short_story?: string | null
          social_media_links?: Json | null
          updated_at?: string | null
          warehouse_address?: string | null
          warehouse_maps_url?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_environmental_impacts: {
        Row: {
          carbon_saved_kg: number
          entity_type: Database["public"]["Enums"]["entity_role"]
          id: string
          material_saved_grams: number
          updated_at: string
          user_id: string
          water_saved_liters: number
        }
        Insert: {
          carbon_saved_kg?: number
          entity_type: Database["public"]["Enums"]["entity_role"]
          id?: string
          material_saved_grams?: number
          updated_at?: string
          user_id: string
          water_saved_liters?: number
        }
        Update: {
          carbon_saved_kg?: number
          entity_type?: Database["public"]["Enums"]["entity_role"]
          id?: string
          material_saved_grams?: number
          updated_at?: string
          user_id?: string
          water_saved_liters?: number
        }
        Relationships: [
          {
            foreignKeyName: "entity_environmental_impacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fabric_categories: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          coins_redeemed_snapshot: number
          created_at: string | null
          id: string
          is_bonus_claimed: boolean
          order_id: string
          price_snapshot_idr: number
          product_id: string
          product_name_snapshot: string
          quantity: number
        }
        Insert: {
          coins_redeemed_snapshot?: number
          created_at?: string | null
          id?: string
          is_bonus_claimed?: boolean
          order_id: string
          price_snapshot_idr: number
          product_id: string
          product_name_snapshot: string
          quantity?: number
        }
        Update: {
          coins_redeemed_snapshot?: number
          created_at?: string | null
          id?: string
          is_bonus_claimed?: boolean
          order_id?: string
          price_snapshot_idr?: number
          product_id?: string
          product_name_snapshot?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_status: string
          phone_number: string | null
          points_earned: number
          receiver_name: string
          shipping_address: string
          total_coins_redeemed: number
          total_price_idr: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_status?: string
          phone_number?: string | null
          points_earned?: number
          receiver_name: string
          shipping_address: string
          total_coins_redeemed?: number
          total_price_idr?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_status?: string
          phone_number?: string | null
          points_earned?: number
          receiver_name?: string
          shipping_address?: string
          total_coins_redeemed?: number
          total_price_idr?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      point_ledger: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_name: string
          created_at: string | null
          id: number
        }
        Insert: {
          category_name: string
          created_at?: string | null
          id?: number
        }
        Update: {
          category_name?: string
          created_at?: string | null
          id?: number
        }
        Relationships: []
      }
      production_materials: {
        Row: {
          brand_id: string
          created_at: string | null
          id: string
          production_id: string
          purchase_trace_id: string
          weight_used_kg: number
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          id?: string
          production_id: string
          purchase_trace_id: string
          weight_used_kg: number
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          id?: string
          production_id?: string
          purchase_trace_id?: string
          weight_used_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_materials_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "brand_productions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_materials_purchase_trace_id_fkey"
            columns: ["purchase_trace_id"]
            isOneToOne: false
            referencedRelation: "purchase_traces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bonus_coin_cost: number | null
          bonus_product_id: string | null
          bonus_product_qty: number | null
          brand_id: string
          carbon_saved_kg: number
          created_at: string | null
          description: string | null
          detail: string
          id: string
          price_idr: number
          product_category_id: number
          product_name: string
          production_id: string
          qr_code_url: string | null
          sku: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          updated_at: string | null
          water_saved_liter: number
        }
        Insert: {
          bonus_coin_cost?: number | null
          bonus_product_id?: string | null
          bonus_product_qty?: number | null
          brand_id: string
          carbon_saved_kg?: number
          created_at?: string | null
          description?: string | null
          detail: string
          id?: string
          price_idr?: number
          product_category_id: number
          product_name: string
          production_id: string
          qr_code_url?: string | null
          sku: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string | null
          water_saved_liter?: number
        }
        Update: {
          bonus_coin_cost?: number | null
          bonus_product_id?: string | null
          bonus_product_qty?: number | null
          brand_id?: string
          carbon_saved_kg?: number
          created_at?: string | null
          description?: string | null
          detail?: string
          id?: string
          price_idr?: number
          product_category_id?: number
          product_name?: string
          production_id?: string
          qr_code_url?: string | null
          sku?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string | null
          water_saved_liter?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_bonus_product_id_fkey"
            columns: ["bonus_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "brand_productions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_traces: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          waste_purchase_id: string
          weight_bought_kg: number
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          waste_purchase_id: string
          weight_bought_kg: number
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          waste_purchase_id?: string
          weight_bought_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_traces_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "waste_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_traces_waste_purchase_id_fkey"
            columns: ["waste_purchase_id"]
            isOneToOne: false
            referencedRelation: "waste_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          shipping_address: string | null
          total_points: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          shipping_address?: string | null
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          shipping_address?: string | null
          total_points?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      waste_batches: {
        Row: {
          batch_code: string
          created_at: string | null
          current_available_weight_kg: number
          id: string
          initial_weight_kg: number
          origin_city: string
          waste_id: string
        }
        Insert: {
          batch_code: string
          created_at?: string | null
          current_available_weight_kg: number
          id?: string
          initial_weight_kg: number
          origin_city: string
          waste_id: string
        }
        Update: {
          batch_code?: string
          created_at?: string | null
          current_available_weight_kg?: number
          id?: string
          initial_weight_kg?: number
          origin_city?: string
          waste_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_batches_waste_id_fkey"
            columns: ["waste_id"]
            isOneToOne: false
            referencedRelation: "waste_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_post_media: {
        Row: {
          created_at: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          waste_post_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          waste_post_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          waste_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_post_media_waste_post_id_fkey"
            columns: ["waste_post_id"]
            isOneToOne: false
            referencedRelation: "waste_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_posts: {
        Row: {
          created_at: string | null
          custom_fabric_name: string | null
          details_and_conditions: string
          fabric_category_id: number
          id: string
          minimum_order_kg: number
          price_per_kg: number
          provider_id: string
          status: Database["public"]["Enums"]["waste_post_status"]
          updated_at: string | null
          weight_kg: number
        }
        Insert: {
          created_at?: string | null
          custom_fabric_name?: string | null
          details_and_conditions: string
          fabric_category_id: number
          id?: string
          minimum_order_kg?: number
          price_per_kg?: number
          provider_id: string
          status: Database["public"]["Enums"]["waste_post_status"]
          updated_at?: string | null
          weight_kg: number
        }
        Update: {
          created_at?: string | null
          custom_fabric_name?: string | null
          details_and_conditions?: string
          fabric_category_id?: number
          id?: string
          minimum_order_kg?: number
          price_per_kg?: number
          provider_id?: string
          status?: Database["public"]["Enums"]["waste_post_status"]
          updated_at?: string | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "waste_posts_fabric_category_id_fkey"
            columns: ["fabric_category_id"]
            isOneToOne: false
            referencedRelation: "fabric_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_posts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "waste_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_providers: {
        Row: {
          active_number: string
          address: Json | null
          company_name: string
          created_at: string | null
          id: string
          pickup_address: string | null
          pickup_maps_url: string | null
          total_distributed_waste: number
          total_income: number
          total_transaction: number
          updated_at: string | null
        }
        Insert: {
          active_number: string
          address?: Json | null
          company_name: string
          created_at?: string | null
          id: string
          pickup_address?: string | null
          pickup_maps_url?: string | null
          total_distributed_waste?: number
          total_income?: number
          total_transaction?: number
          updated_at?: string | null
        }
        Update: {
          active_number?: string
          address?: Json | null
          company_name?: string
          created_at?: string | null
          id?: string
          pickup_address?: string | null
          pickup_maps_url?: string | null
          total_distributed_waste?: number
          total_income?: number
          total_transaction?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      waste_purchases: {
        Row: {
          brand_id: string
          category_name_snapshot: string
          created_at: string | null
          fabric_name_snapshot: string
          final_price_idr: number
          id: string
          media_urls_snapshot: Json
          original_price_per_kg: number
          purchase_status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
          waste_post_id: string
          weight_bought_kg: number
        }
        Insert: {
          brand_id: string
          category_name_snapshot: string
          created_at?: string | null
          fabric_name_snapshot: string
          final_price_idr: number
          id?: string
          media_urls_snapshot: Json
          original_price_per_kg: number
          purchase_status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          waste_post_id: string
          weight_bought_kg: number
        }
        Update: {
          brand_id?: string
          category_name_snapshot?: string
          created_at?: string | null
          fabric_name_snapshot?: string
          final_price_idr?: number
          id?: string
          media_urls_snapshot?: Json
          original_price_per_kg?: number
          purchase_status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          waste_post_id?: string
          weight_bought_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "waste_purchases_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_purchases_waste_post_id_fkey"
            columns: ["waste_post_id"]
            isOneToOne: false
            referencedRelation: "waste_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_registrations: {
        Row: {
          created_at: string | null
          id: string
          points_redeemed: number
          status: string
          user_id: string
          workshop_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_redeemed?: number
          status?: string
          user_id: string
          workshop_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_redeemed?: number
          status?: string
          user_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          brand_id: string
          created_at: string | null
          description: string
          held_at: string
          id: string
          location: string
          maps_url: string | null
          point_cost: number
          quota: number
          speaker_name: string
          speaker_role: string
          title: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          description: string
          held_at: string
          id?: string
          location: string
          maps_url?: string | null
          point_cost?: number
          quota: number
          speaker_name: string
          speaker_role: string
          title: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          description?: string
          held_at?: string
          id?: string
          location?: string
          maps_url?: string | null
          point_cost?: number
          quota?: number
          speaker_name?: string
          speaker_role?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_waste_post_with_media_and_batch: {
        Args: {
          p_batch_code: string
          p_custom_fabric_name: string
          p_details_and_conditions: string
          p_fabric_category_id: number
          p_media_types: string[]
          p_media_urls: string[]
          p_minimum_order_kg: number
          p_origin_city: string
          p_price_per_kg: number
          p_provider_id: string
          p_status: Database["public"]["Enums"]["waste_post_status"]
          p_weight_kg: number
        }
        Returns: string
      }
      get_total_waste_weight: { Args: { provider_id: string }; Returns: number }
    }
    Enums: {
      entity_role: "consumer" | "brand" | "waste_provider"
      media_type: "image" | "video"
      order_status: "pending" | "complete" | "cancelled" | "rejected"
      product_status: "draft" | "published" | "archived"
      purchase_status:
        | "waiting_confirmation"
        | "paid"
        | "completed"
        | "cancelled"
      waste_post_status: "active" | "inactive" | "sold_out"
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
      entity_role: ["consumer", "brand", "waste_provider"],
      media_type: ["image", "video"],
      order_status: ["pending", "complete", "cancelled", "rejected"],
      product_status: ["draft", "published", "archived"],
      waste_post_status: ["active", "inactive", "sold_out"],
    },
  },
} as const
