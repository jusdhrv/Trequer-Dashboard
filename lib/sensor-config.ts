import { supabase } from './supabase'

export interface SensorConfig {
    id: string
    name: string
    unit: string
    pin: string
    signal_type: 'analog' | 'digital'
    readingInterval: number
    is_enabled: boolean
    description: string
}

export async function getSensorConfigs(): Promise<SensorConfig[]> {
    try {
        const { data, error } = await supabase
            .from('sensor_configs')
            .select('*')
            .order('name')

        if (error) {
            throw error
        }

        return data.map(sensor => ({
            id: sensor.id,
            name: sensor.name,
            unit: sensor.unit,
            pin: sensor.pin,
            signal_type: sensor.signal_type,
            readingInterval: sensor.reading_interval,
            is_enabled: sensor.is_enabled,
            description: sensor.description,
        }))
    } catch (error) {
        console.error('Error fetching sensor configs:', error)
        return []
    }
}

export async function updateSensorConfig(config: SensorConfig): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('sensor_configs')
            .update({
                name: config.name,
                unit: config.unit,
                pin: config.pin,
                signal_type: config.signal_type,
                reading_interval: config.readingInterval,
                is_enabled: config.is_enabled,
                description: config.description,
            })
            .eq('id', config.id)

        if (error) {
            throw error
        }

        return true
    } catch (error) {
        console.error('Error updating sensor config:', error)
        return false
    }
}

export async function addSensorConfig(config: Omit<SensorConfig, 'id'>): Promise<string | null> {
    try {
        const newId = crypto.randomUUID()
        const { error } = await supabase
            .from('sensor_configs')
            .insert({
                id: newId,
                name: config.name,
                unit: config.unit,
                pin: config.pin,
                signal_type: config.signal_type,
                reading_interval: config.readingInterval,
                is_enabled: config.is_enabled,
                description: config.description,
            })

        if (error) {
            throw error
        }

        return newId
    } catch (error) {
        console.error('Error adding sensor config:', error)
        return null
    }
}

export async function deleteSensorConfig(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('sensor_configs')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return true
    } catch (error) {
        console.error('Error deleting sensor config:', error)
        return false
    }
} 