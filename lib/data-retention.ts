import { supabase } from './supabase'
import { subHours } from 'date-fns'

export async function purgeOldData(retentionPeriod: string = '168h') {
    try {
        // Validate retention period
        const match = retentionPeriod.match(/^(\d+)h$/)
        if (!match) {
            console.error('Invalid retention period format')
            return false
        }

        const hours = parseInt(match[1])
        if (isNaN(hours) || hours <= 0) {
            console.error('Invalid retention period value')
            return false
        }

        // Calculate cutoff date
        const cutoffDate = subHours(new Date(), hours)

        // Delete old readings from Supabase
        const { error } = await supabase
            .from('sensor_readings')
            .delete()
            .lt('timestamp', cutoffDate.toISOString())

        if (error) {
            throw error
        }

        console.log(`Data purge complete. Removed readings older than ${hours} hours.`)
        return true
    } catch (error) {
        console.error('Error purging old data:', error)
        return false
    }
} 