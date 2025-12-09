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
      ai_recommendations: {
        Row: {
          created_at: string
          id: string
          impact: string | null
          message: string
          mission_id: string
          priority: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact?: string | null
          message: string
          mission_id: string
          priority?: string
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          impact?: string | null
          message?: string
          mission_id?: string
          priority?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "current_fleet_status"
            referencedColumns: ["mission_id"]
          },
          {
            foreignKeyName: "ai_recommendations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      gps_positions: {
        Row: {
          heading: number | null
          id: string
          latitude: number
          longitude: number
          mission_id: string
          speed: number | null
          timestamp: string
          vehicle_id: string
        }
        Insert: {
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          mission_id: string
          speed?: number | null
          timestamp?: string
          vehicle_id: string
        }
        Update: {
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          mission_id?: string
          speed?: number | null
          timestamp?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gps_positions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "current_fleet_status"
            referencedColumns: ["mission_id"]
          },
          {
            foreignKeyName: "gps_positions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_positions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_positions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "current_fleet_status"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "gps_positions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          delay_minutes: number | null
          destination: string
          destination_lat: number
          destination_lng: number
          distance_km: number
          driver_id: string
          id: string
          origin: string
          origin_lat: number
          origin_lng: number
          scheduled_end: string
          scheduled_start: string
          status: Database["public"]["Enums"]["mission_status"]
          vehicle_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          delay_minutes?: number | null
          destination: string
          destination_lat: number
          destination_lng: number
          distance_km: number
          driver_id: string
          id?: string
          origin: string
          origin_lat: number
          origin_lng: number
          scheduled_end: string
          scheduled_start: string
          status?: Database["public"]["Enums"]["mission_status"]
          vehicle_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          delay_minutes?: number | null
          destination?: string
          destination_lat?: number
          destination_lng?: number
          distance_km?: number
          driver_id?: string
          id?: string
          origin?: string
          origin_lat?: number
          origin_lng?: number
          scheduled_end?: string
          scheduled_start?: string
          status?: Database["public"]["Enums"]["mission_status"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "current_fleet_status"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      statistics: {
        Row: {
          co2_saved: number | null
          created_at: string
          date: string
          id: string
          incidents_resolved: number | null
          missions_completed: number | null
          missions_total: number | null
          total_delays_minutes: number | null
          total_km: number | null
        }
        Insert: {
          co2_saved?: number | null
          created_at?: string
          date: string
          id?: string
          incidents_resolved?: number | null
          missions_completed?: number | null
          missions_total?: number | null
          total_delays_minutes?: number | null
          total_km?: number | null
        }
        Update: {
          co2_saved?: number | null
          created_at?: string
          date?: string
          id?: string
          incidents_resolved?: number | null
          missions_completed?: number | null
          missions_total?: number | null
          total_delays_minutes?: number | null
          total_km?: number | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          current_driver_id: string | null
          id: string
          plate_number: string
          status: Database["public"]["Enums"]["vehicle_status"]
          type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string
          current_driver_id?: string | null
          id?: string
          plate_number: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string
          current_driver_id?: string | null
          id?: string
          plate_number?: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_current_driver_id_fkey"
            columns: ["current_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_fleet_status: {
        Row: {
          delay_minutes: number | null
          destination: string | null
          destination_lat: number | null
          destination_lng: number | null
          driver_name: string | null
          last_update: string | null
          latitude: number | null
          longitude: number | null
          mission_id: string | null
          mission_status: Database["public"]["Enums"]["mission_status"] | null
          origin: string | null
          origin_lat: number | null
          origin_lng: number | null
          plate_number: string | null
          speed: number | null
          type: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_id: string | null
        }
        Relationships: []
      }
      mission_enriched: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string | null
          delay_minutes: number | null
          destination: string | null
          destination_lat: number | null
          destination_lng: number | null
          distance_km: number | null
          driver_id: string | null
          driver_name: string | null
          id: string | null
          origin: string | null
          origin_lat: number | null
          origin_lng: number | null
          plate_number: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          vehicle_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "current_fleet_status"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_status: "planned" | "in-progress" | "completed" | "cancelled"
      vehicle_status: "active" | "maintenance" | "inactive"
      vehicle_type: "truck" | "van" | "car"
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
      mission_status: ["planned", "in-progress", "completed", "cancelled"],
      vehicle_status: ["active", "maintenance", "inactive"],
      vehicle_type: ["truck", "van", "car"],
    },
  },
} as const
