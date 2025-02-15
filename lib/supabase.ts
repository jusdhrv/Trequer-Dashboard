import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for public operations (reading data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export async function getSensorReadings(timeRange: string = '1h') {
    const now = new Date()
    let cutoff = new Date(now)

    switch (timeRange) {
        case '1h':
            cutoff.setHours(now.getHours() - 1)
            break
        case '6h':
            cutoff.setHours(now.getHours() - 6)
            break
        case '24h':
            cutoff.setHours(now.getHours() - 24)
            break
        case '7d':
            cutoff.setDate(now.getDate() - 7)
            break
        case '14d':
            cutoff.setDate(now.getDate() - 14)
            break
        default:
            cutoff.setHours(now.getHours() - 1)
    }

    const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .gte('timestamp', cutoff.toISOString())
        .order('timestamp', { ascending: true })
    
    if (error) {
        console.error('Error fetching sensor readings:', error)
        throw error
    }
    
    return data
} 