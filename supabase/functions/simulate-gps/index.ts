import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mission_id } = await req.json();

    if (!mission_id) {
      throw new Error('mission_id is required');
    }

    console.log('Simulating GPS for mission:', mission_id);

    // Get mission details
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', mission_id)
      .single();

    if (missionError || !mission) {
      throw new Error('Mission not found');
    }

    if (mission.status !== 'in-progress') {
      throw new Error('Mission is not in progress');
    }

    // Get last GPS position
    const { data: lastPosition } = await supabase
      .from('gps_positions')
      .select('*')
      .eq('mission_id', mission_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Current position or start from origin
    const currentLat = lastPosition?.latitude || mission.origin_lat;
    const currentLng = lastPosition?.longitude || mission.origin_lng;

    // Calculate direction to destination
    const destLat = mission.destination_lat;
    const destLng = mission.destination_lng;

    // Calculate remaining distance
    const latDiff = destLat - currentLat;
    const lngDiff = destLng - currentLng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    // Check if arrived (within 0.01 degrees ≈ 1km)
    if (distance < 0.01) {
      console.log('Vehicle arrived at destination');
      return new Response(
        JSON.stringify({ message: 'Arrived at destination', arrived: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate next position (2% step towards destination)
    const stepPercent = 0.02;
    const newLat = currentLat + (latDiff * stepPercent) + (Math.random() - 0.5) * 0.001;
    const newLng = currentLng + (lngDiff * stepPercent) + (Math.random() - 0.5) * 0.001;

    // Random speed 60-100 km/h
    const speed = 60 + Math.random() * 40;

    // Calculate heading (direction in degrees)
    const heading = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
    const normalizedHeading = Math.round((heading + 360) % 360);

    // Insert new GPS position
    const { data: newPosition, error: insertError } = await supabase
      .from('gps_positions')
      .insert({
        mission_id,
        vehicle_id: mission.vehicle_id,
        latitude: newLat,
        longitude: newLng,
        speed: Math.round(speed),
        heading: normalizedHeading,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('New GPS position created:', newPosition);

    return new Response(
      JSON.stringify({ success: true, position: newPosition, distance_remaining: distance }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in simulate-gps:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
