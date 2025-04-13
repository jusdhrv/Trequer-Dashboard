import { supabase } from './supabase'

export async function purgeOldData() {
    try {
        // Get both retention periods from settings
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['sensor_readings_retention_hours', 'diagnostic_readings_retention_hours'])

        if (settingsError) throw settingsError

        // Default to 7 days (168h) for sensor data and 3 days (72h) for diagnostic data if not found
        const sensorRetentionHours = settings?.find(s => s.key === 'sensor_readings_retention_hours')?.value ?? 168
        const diagnosticRetentionHours = settings?.find(s => s.key === 'diagnostic_readings_retention_hours')?.value ?? 72

        // Call the database function to purge old data
        const { error } = await supabase.rpc('purge_old_data', {
            sensor_retention_hours: sensorRetentionHours,
            diagnostic_retention_hours: diagnosticRetentionHours
        })

        if (error) throw error

        return true
    } catch (error) {
        console.error('Error purging old data:', error)
        return false
    }
} 