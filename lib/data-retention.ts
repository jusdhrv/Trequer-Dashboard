import fs from 'fs'
import path from 'path'
import { subHours } from 'date-fns'

const DATA_PATH = path.join(process.cwd(), 'data', 'sensor_readings.json')

export async function purgeOldData() {
    try {
        // Read the current data
        const data = await fs.promises.readFile(DATA_PATH, 'utf8')
        const jsonData = JSON.parse(data)

        // Get retention period
        const retentionPeriod = jsonData.retentionPeriod || '168h' // Default to 7 days
        const retentionHours = parseInt(retentionPeriod.replace('h', ''))

        // Calculate cutoff date
        const cutoffDate = subHours(new Date(), retentionHours)

        // Filter out old readings
        const filteredReadings = jsonData.readings.filter((reading: any) => {
            const readingDate = new Date(reading.timestamp)
            return readingDate >= cutoffDate
        })

        // Update the data with filtered readings
        jsonData.readings = filteredReadings

        // Write back to file
        await fs.promises.writeFile(DATA_PATH, JSON.stringify(jsonData, null, 2), 'utf8')

        console.log(`Data purge complete. Removed readings older than ${retentionHours} hours.`)
        return true
    } catch (error) {
        console.error('Error purging old data:', error)
        return false
    }
} 