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
          is_hide: boolean | null
          production_name: string
          started_at: string | null
          status: string
          target_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          is_hide?: boolean | null
          production_name: string
          started_at?: string | null
          status?: string
          target_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          is_hide?: boolean | null
          production_name?: string
          started_at?: string | null
          status?: string
          target_quantity?: number | null
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
      order_payments: {
        Row: {
          amount_coin: number
          amount_idr: number
          created_at: string
          expired_at: string | null
          expires_at: string | null
          failed_at: string | null
          id: string
          order_id: string
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["order_payment_method"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          proof_url: string | null
          provider: string | null
          provider_reference: string | null
          refunded_at: string | null
          submitted_at: string | null
          updated_at: string
          verification_note: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_coin?: number
          amount_idr?: number
          created_at?: string
          expired_at?: string | null
          expires_at?: string | null
          failed_at?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["order_payment_method"]
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          proof_url?: string | null
          provider?: string | null
          provider_reference?: string | null
          refunded_at?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_coin?: number
          amount_idr?: number
          created_at?: string
          expired_at?: string | null
          expires_at?: string | null
          failed_at?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["order_payment_method"]
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          proof_url?: string | null
          provider?: string | null
          provider_reference?: string | null
          refunded_at?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          checkout_fingerprint: string | null
          checkout_token: string | null
          coin_refunded_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          impact_carbon_saved_kg: number
          impact_material_saved_grams: number
          impact_water_saved_liters: number
          impacts_awarded_at: string | null
          order_status: Database["public"]["Enums"]["order_status"]
          phone_number: string | null
          points_awarded_at: string | null
          points_earned: number
          processing_at: string | null
          processing_by: string | null
          receiver_name: string
          shipped_at: string | null
          shipped_by: string | null
          shipping_address: string
          shipping_note: string | null
          stock_released_at: string | null
          total_coins_redeemed: number
          total_price_idr: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checkout_fingerprint?: string | null
          checkout_token?: string | null
          coin_refunded_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          impact_carbon_saved_kg?: number
          impact_material_saved_grams?: number
          impact_water_saved_liters?: number
          impacts_awarded_at?: string | null
          order_status?: Database["public"]["Enums"]["order_status"]
          phone_number?: string | null
          points_awarded_at?: string | null
          points_earned?: number
          processing_at?: string | null
          processing_by?: string | null
          receiver_name: string
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address: string
          shipping_note?: string | null
          stock_released_at?: string | null
          total_coins_redeemed?: number
          total_price_idr?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checkout_fingerprint?: string | null
          checkout_token?: string | null
          coin_refunded_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          impact_carbon_saved_kg?: number
          impact_material_saved_grams?: number
          impact_water_saved_liters?: number
          impacts_awarded_at?: string | null
          order_status?: Database["public"]["Enums"]["order_status"]
          phone_number?: string | null
          points_awarded_at?: string | null
          points_earned?: number
          processing_at?: string | null
          processing_by?: string | null
          receiver_name?: string
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address?: string
          shipping_note?: string | null
          stock_released_at?: string | null
          total_coins_redeemed?: number
          total_price_idr?: number
          tracking_number?: string | null
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
          created_at: string | null
          id: string
          material_id: string
          production_id: string
          weight_used_kg: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string
          production_id: string
          weight_used_kg: number
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          production_id?: string
          weight_used_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "waste_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_materials_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "brand_productions"
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
          image_url: string | null
          payment_option: Database["public"]["Enums"]["product_payment_option"]
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
          image_url?: string | null
          payment_option?: Database["public"]["Enums"]["product_payment_option"]
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
          image_url?: string | null
          payment_option?: Database["public"]["Enums"]["product_payment_option"]
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
      saved_waste_posts: {
        Row: {
          brand_id: string
          created_at: string | null
          id: string
          waste_post_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          id?: string
          waste_post_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          id?: string
          waste_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_waste_posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_waste_posts_waste_post_id_fkey"
            columns: ["waste_post_id"]
            isOneToOne: false
            referencedRelation: "waste_posts"
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
          fabric_category_snapshot: string
          fabric_name_snapshot: string
          id: string
          initial_weight_kg: number
          media_urls_snapshot: Json
          origin_city: string
          waste_id: string
        }
        Insert: {
          batch_code: string
          created_at?: string | null
          fabric_category_snapshot: string
          fabric_name_snapshot: string
          id?: string
          initial_weight_kg: number
          media_urls_snapshot: Json
          origin_city: string
          waste_id: string
        }
        Update: {
          batch_code?: string
          created_at?: string | null
          fabric_category_snapshot?: string
          fabric_name_snapshot?: string
          id?: string
          initial_weight_kg?: number
          media_urls_snapshot?: Json
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
          deleted_at: string | null
          fabric_name_snapshot: string
          final_price_idr: number
          id: string
          media_urls_snapshot: Json
          original_price_per_kg: number
          pickup_address: Json | null
          purchase_id: string
          purchase_status: Database["public"]["Enums"]["order_status"] | null
          recipient_snapshot: Json
          updated_at: string | null
          waste_post_id: string
          weight_bought_kg: number
        }
        Insert: {
          brand_id: string
          category_name_snapshot: string
          created_at?: string | null
          deleted_at?: string | null
          fabric_name_snapshot: string
          final_price_idr: number
          id?: string
          media_urls_snapshot: Json
          original_price_per_kg: number
          pickup_address?: Json | null
          purchase_id: string
          purchase_status?: Database["public"]["Enums"]["order_status"] | null
          recipient_snapshot: Json
          updated_at?: string | null
          waste_post_id: string
          weight_bought_kg: number
        }
        Update: {
          brand_id?: string
          category_name_snapshot?: string
          created_at?: string | null
          deleted_at?: string | null
          fabric_name_snapshot?: string
          final_price_idr?: number
          id?: string
          media_urls_snapshot?: Json
          original_price_per_kg?: number
          pickup_address?: Json | null
          purchase_id?: string
          purchase_status?: Database["public"]["Enums"]["order_status"] | null
          recipient_snapshot?: Json
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
          attended_at: string | null
          cancelled_at: string | null
          created_at: string | null
          id: string
          points_redeemed: number
          status: Database["public"]["Enums"]["workshop_registration_status"]
          updated_at: string
          user_id: string
          workshop_id: string
        }
        Insert: {
          attended_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          id?: string
          points_redeemed?: number
          status?: Database["public"]["Enums"]["workshop_registration_status"]
          updated_at?: string
          user_id: string
          workshop_id: string
        }
        Update: {
          attended_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          id?: string
          points_redeemed?: number
          status?: Database["public"]["Enums"]["workshop_registration_status"]
          updated_at?: string
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
          banner_url: string | null
          brand_id: string
          created_at: string | null
          description: string
          detail: string | null
          held_at: string
          id: string
          is_published: boolean
          location: string
          point_cost: number
          quota: number
          speaker_name: string
          speaker_role: string
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          brand_id: string
          created_at?: string | null
          description: string
          detail?: string | null
          held_at: string
          id?: string
          is_published?: boolean
          location: string
          point_cost?: number
          quota: number
          speaker_name: string
          speaker_role: string
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          brand_id?: string
          created_at?: string | null
          description?: string
          detail?: string | null
          held_at?: string
          id?: string
          is_published?: boolean
          location?: string
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
      add_entity_environmental_impact_internal: {
        Args: {
          p_carbon_saved_kg: number
          p_entity_type: Database["public"]["Enums"]["entity_role"]
          p_material_saved_grams: number
          p_now?: string
          p_user_id: string
          p_water_saved_liters: number
        }
        Returns: undefined
      }
      advance_brand_order_fulfillment: {
        Args: {
          p_action: Database["public"]["Enums"]["order_fulfillment_action"]
          p_order_id: string
          p_shipping_note?: string
          p_tracking_number?: string
        }
        Returns: {
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          processing_at: string
          processing_by: string
          shipped_at: string
          shipped_by: string
          shipping_note: string
          tracking_number: string
          updated_at: string
        }[]
      }
      apply_order_environmental_impacts_internal: {
        Args: { p_now?: string; p_order_id: string }
        Returns: {
          carbon_saved_kg: number
          impacts_awarded_at: string
          material_saved_grams: number
          was_already_awarded: boolean
          water_saved_liters: number
        }[]
      }
      brand_can_access_payment_proof_path: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      brand_can_manage_order: { Args: { p_order_id: string }; Returns: boolean }
      brand_owns_order: { Args: { p_order_id: string }; Returns: boolean }
      brand_owns_product: { Args: { p_product_id: string }; Returns: boolean }
      cancel_and_refund_brand_order: {
        Args: { p_order_id: string; p_reason: string }
        Returns: {
          cancellation_reason: string
          cancelled_at: string
          coin_refunded_at: string
          coins_refunded: number
          customer_total_points: number
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          stock_released_at: string
        }[]
      }
      cancel_brand_production: {
        Args: { p_production_id: string }
        Returns: Json
      }
      cancel_customer_unpaid_qris_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: {
          cancellation_reason: string
          cancelled_at: string
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          stock_released_at: string
        }[]
      }
      complete_brand_order: {
        Args: { p_order_id: string }
        Returns: {
          completed_at: string
          completed_by: string
          customer_total_points: number
          impact_carbon_saved_kg: number
          impact_material_saved_grams: number
          impact_water_saved_liters: number
          impacts_awarded_at: string
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          points_awarded_at: string
          points_earned: number
        }[]
      }
      create_brand_production: {
        Args: {
          p_allocations: Json
          p_brand_id: string
          p_production_name: string
          p_target_quantity: number
        }
        Returns: Json
      }
      create_customer_checkout_order: {
        Args: {
          p_checkout_token: string
          p_confirmation_accepted?: boolean
          p_payment_method: Database["public"]["Enums"]["order_payment_method"]
          p_phone_number: string
          p_product_id: string
          p_quantity: number
          p_receiver_name: string
          p_shipping_address: string
        }
        Returns: {
          amount_coin: number
          amount_idr: number
          checkout_token: string
          created_at: string
          expires_at: string
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: Database["public"]["Enums"]["order_payment_method"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          points_earned: number
          remaining_points: number
          total_coins_redeemed: number
        }[]
      }
      create_waste_post_with_media_and_batch: {
        Args: {
          p_batch_code: string
          p_custom_fabric_name: string
          p_details_and_conditions: string
          p_fabric_category_id: number
          p_fabric_category_snapshot: string
          p_fabric_name_snapshot: string
          p_media_types: string[]
          p_media_urls: string[]
          p_media_urls_snapshot: Json
          p_minimum_order_kg: number
          p_origin_city?: string
          p_price_per_kg: number
          p_provider_id: string
          p_status: Database["public"]["Enums"]["waste_post_status"]
          p_weight_kg: number
        }
        Returns: string
      }
      customer_owns_order: { Args: { p_order_id: string }; Returns: boolean }
      customer_owns_payment_proof_path: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      expire_customer_qris_order: {
        Args: { p_order_id: string }
        Returns: {
          expired_at: string
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          stock_released_at: string
          was_already_released: boolean
        }[]
      }
      expire_due_qris_orders: { Args: { p_limit?: number }; Returns: number }
      expire_qris_order_internal: {
        Args: { p_now?: string; p_order_id: string }
        Returns: {
          expired_at: string
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          stock_released_at: string
          was_already_released: boolean
        }[]
      }
      get_brand_fulfillment_orders: {
        Args: { p_limit?: number }
        Returns: {
          amount_coin: number
          amount_idr: number
          cancellation_reason: string
          cancelled_at: string
          completed_at: string
          impact_carbon_saved_kg: number
          impact_material_saved_grams: number
          impact_water_saved_liters: number
          impacts_awarded_at: string
          items: Json
          order_created_at: string
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          paid_at: string
          payment_method: Database["public"]["Enums"]["order_payment_method"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          phone_number: string
          points_awarded_at: string
          points_earned: number
          processing_at: string
          receiver_name: string
          refunded_at: string
          shipped_at: string
          shipping_address: string
          shipping_note: string
          total_coins_redeemed: number
          total_price_idr: number
          tracking_number: string
        }[]
      }
      get_brand_incoming_orders_count: {
        Args: { p_brand_id: string }
        Returns: number
      }
      get_brand_qris_verification_queue: {
        Args: { p_limit?: number }
        Returns: {
          amount_idr: number
          expires_at: string
          items: Json
          order_created_at: string
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_id: string
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          phone_number: string
          points_earned: number
          proof_path: string
          receiver_name: string
          shipping_address: string
          submitted_at: string
          total_coins_redeemed: number
          total_price_idr: number
          verification_note: string
          verified_at: string
        }[]
      }
      get_brand_total_waste_saved: {
        Args: { p_brand_id: string }
        Returns: number
      }
      get_total_waste_weight: { Args: { provider_id: string }; Returns: number }
      get_waste_purchases_rpc: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_provider_id: string
          p_search_query?: string
          p_status_filter?: string[]
        }
        Returns: {
          result_row: Json
        }[]
      }
      get_workshop_availability: {
        Args: { p_workshop_id?: string }
        Returns: {
          is_full: boolean
          registered_count: number
          remaining_slots: number
          workshop_id: string
        }[]
      }
      purchase_customer_product: {
        Args: {
          p_claim_bonus?: boolean
          p_phone_number: string
          p_product_id: string
          p_quantity: number
          p_receiver_name: string
          p_shipping_address: string
        }
        Returns: {
          created_at: string
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          points_earned: number
          remaining_points: number
          total_coins_redeemed: number
          total_price_idr: number
        }[]
      }
      register_customer_workshop: {
        Args: { p_workshop_id: string }
        Returns: {
          points_spent: number
          registered_at: string
          registration_id: string
          registration_status: Database["public"]["Enums"]["workshop_registration_status"]
          remaining_points: number
          workshop_id: string
        }[]
      }
      restore_order_stock_internal: {
        Args: { p_now?: string; p_order_id: string }
        Returns: {
          stock_released_at: string
          was_already_released: boolean
        }[]
      }
      run_qris_expiry_cron: { Args: { p_limit?: number }; Returns: number }
      submit_customer_qris_payment: {
        Args: { p_order_id: string; p_proof_url: string }
        Returns: {
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
        }[]
      }
      verify_brand_qris_payment: {
        Args: {
          p_decision: Database["public"]["Enums"]["payment_verification_decision"]
          p_note?: string
          p_order_id: string
        }
        Returns: {
          is_existing: boolean
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          stock_released_at: string
          verified_at: string
          verified_by: string
        }[]
      }
    }
    Enums: {
      entity_role: "consumer" | "brand" | "waste_provider"
      media_type: "image" | "video"
      order_fulfillment_action: "start_processing" | "mark_shipped"
      order_payment_method: "qris" | "coin"
      order_payment_status:
        | "waiting_payment"
        | "waiting_verification"
        | "paid"
        | "expired"
        | "failed"
        | "refunded"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "complete"
        | "cancelled"
        | "rejected"
      payment_verification_decision: "approve" | "reject"
      product_payment_option: "idr" | "coin" | "idr_or_coin"
      product_status: "draft" | "published" | "archived"
      purchase_status:
        | "waiting_confirmation"
        | "paid"
        | "completed"
        | "cancelled"
      waste_post_status: "active" | "inactive" | "sold_out"
      workshop_registration_status: "registered" | "attended" | "cancelled"
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
      order_fulfillment_action: ["start_processing", "mark_shipped"],
      order_payment_method: ["qris", "coin"],
      order_payment_status: [
        "waiting_payment",
        "waiting_verification",
        "paid",
        "expired",
        "failed",
        "refunded",
      ],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "complete",
        "cancelled",
        "rejected",
      ],
      payment_verification_decision: ["approve", "reject"],
      product_payment_option: ["idr", "coin", "idr_or_coin"],
      product_status: ["draft", "published", "archived"],
      purchase_status: [
        "waiting_confirmation",
        "paid",
        "completed",
        "cancelled",
      ],
      waste_post_status: ["active", "inactive", "sold_out"],
      workshop_registration_status: ["registered", "attended", "cancelled"],
    },
  },
} as const
