import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public operations (reading data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist auth state
  }
})

// Client with elevated privileges for admin operations
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey!, {
  auth: {
    persistSession: false // Don't persist auth state
  }
})

// Type definitions for our tables
export type SensorConfig = {
    id: string
    name: string
    unit: string
    pin: string
    signal_type: 'analog' | 'digital'
    reading_interval: number
    is_enabled: boolean
    description: string
    created_at?: string
    updated_at?: string
}

export type SensorReading = {
    id?: number
    sensor_id: string
    value: number
    timestamp: string
    created_at?: string
}

// Helper functions for sensor configs
export async function getSensorConfigs() {
    const { data, error } = await supabase
        .from('sensor_configs')
        .select('*')
        .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
}

export async function updateSensorConfig(updatedConfig: SensorConfig[]) {
    const { error } = await supabase
        .from('sensor_configs')
        .upsert(updatedConfig.map(config => ({
            ...config,
            updated_at: new Date().toISOString()
        })))
    
    return !error
}

export async function updateSingleSensor(updatedSensor: SensorConfig) {
    const { error } = await supabase
        .from('sensor_configs')
        .upsert({
            ...updatedSensor,
            updated_at: new Date().toISOString()
        })
    
    return !error
}

export async function addSensor(newSensor: SensorConfig) {
    const { error } = await supabase
        .from('sensor_configs')
        .insert({
            ...newSensor,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    
    return !error
}

export async function deleteSensor(sensorId: string) {
    const { error } = await supabase
        .from('sensor_configs')
        .delete()
        .eq('id', sensorId)
    
    return !error
}

// Helper functions for sensor readings
export async function addSensorReading(readings: SensorReading[]) {
    // console.log('Adding sensor readings to Supabase:', readings)
    
    const readingsToInsert = readings.map(reading => ({
        ...reading,
        created_at: new Date().toISOString()
    }))

    const { error } = await supabase // Use service client for inserting readings
        .from('sensor_readings')
        .insert(readingsToInsert)
    
    if (error) {
        console.error('Error adding sensor readings:', error)
        return false
    }
    
    return true
}

export async function getSensorReadings(timeRange: string = '1h', sensorId?: string) {
  const now = new Date();
  let cutoff: Date;

  // Parse timeRange to match GraphWidget options
  switch (timeRange) {
    case '1min':
      cutoff = new Date(now.getTime() - 1 * 60 * 1000);
      break;
    case '5min':
      cutoff = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case '15min':
      cutoff = new Date(now.getTime() - 15 * 60 * 1000);
      break;
    case '30min':
      cutoff = new Date(now.getTime() - 30 * 60 * 1000);
      break;
    case '1h':
      cutoff = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '14d':
      cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoff = new Date(now.getTime() - 60 * 60 * 1000); // Default to 1h
      console.warn(`Invalid timeRange: ${timeRange}, defaulting to 1h`);
  }

  // console.log(`Querying sensor_readings: timeRange=${timeRange}, sensorId=${sensorId || 'all'}, cutoff=${cutoff.toISOString()}`);

  let query = supabase
    .from('sensor_readings')
    .select('sensor_id, value, timestamp')
    .gte('timestamp', cutoff.toISOString())
    .lte('timestamp', now.toISOString())
    .order('timestamp', { ascending: true });

  if (sensorId) {
    query = query.eq('sensor_id', sensorId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase query error:', error);
    throw new Error(`Failed to fetch sensor readings: ${error.message}`);
  }

  // console.log('Raw readings:', data);
  return data || [];
} 