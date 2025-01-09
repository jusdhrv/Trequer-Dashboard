import { supabase } from './supabase'

export interface SensorReading {
    temperature?: number
    humidity?: number
    methane?: number
    light?: number
    atmosphericPressure?: number
    timestamp: string
}

export async function getSensorReadings(
    from?: Date,
    to?: Date,
    sensorType?: string
): Promise<SensorReading[]> {
    try {
        let query = supabase
            .from('sensor_readings')
            .select('*')
            .order('timestamp', { ascending: true })

        if (from) {
            query = query.gte('timestamp', from.toISOString())
        }
        if (to) {
            query = query.lte('timestamp', to.toISOString())
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return data.map(reading => ({
            temperature: reading.temperature,
            humidity: reading.humidity,
            methane: reading.methane,
            light: reading.light,
            atmosphericPressure: reading.atmospheric_pressure,
            timestamp: reading.timestamp,
        }))
    } catch (error) {
        console.error('Error fetching sensor readings:', error)
        return []
    }
}

export async function addSensorReading(reading: SensorReading): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('sensor_readings')
            .insert({
                temperature: reading.temperature,
                humidity: reading.humidity,
                methane: reading.methane,
                light: reading.light,
                atmospheric_pressure: reading.atmosphericPressure,
                timestamp: reading.timestamp || new Date().toISOString(),
            })

        if (error) {
            throw error
        }

        return true
    } catch (error) {
        console.error('Error adding sensor reading:', error)
        return false
    }
}

export async function deleteOldReadings(retentionPeriod: string): Promise<boolean> {
    try {
        const hours = parseInt(retentionPeriod.replace('h', ''))
        const cutoffDate = new Date()
        cutoffDate.setHours(cutoffDate.getHours() - hours)

        const { error } = await supabase
            .from('sensor_readings')
            .delete()
            .lt('timestamp', cutoffDate.toISOString())

        if (error) {
            throw error
        }

        return true
    } catch (error) {
        console.error('Error deleting old readings:', error)
        return false
    }
} 