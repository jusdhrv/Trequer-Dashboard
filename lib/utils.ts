import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface SensorReading {
    id?: number;
    sensor_id: string;
    value: number;
    timestamp: string;
    created_at?: string;
}

interface ProcessedData {
    index: number;
    value: number;
    timestamp: string;
}

export function processReadings(readings: any[], sensorType: string, timeRange: string) {
    console.log('Processing readings for sensor:', sensorType)
    console.log('Raw readings:', readings)

    // Transform readings to match our expected format
    const sensorReadings = readings.map(reading => ({
        sensor_id: sensorType,
        value: reading[sensorType],
        timestamp: reading.timestamp
    })).filter(reading => reading.value !== undefined)
    
    console.log('Transformed readings:', sensorReadings)

    if (sensorReadings.length === 0) {
        console.log('No readings found for sensor:', sensorType)
        return []
    }

    // Calculate interval based on time range and data points
    const timeStart = new Date(sensorReadings[0].timestamp).getTime()
    const timeEnd = new Date(sensorReadings[sensorReadings.length - 1].timestamp).getTime()
    const timeSpan = timeEnd - timeStart
    let interval = Math.max(60000, Math.floor(timeSpan / 100)) // At least 1 minute, max 100 points

    switch (timeRange) {
        case '1min':
            interval = 1000 // 1 second
            break
        case '5min':
            interval = 5000 // 5 seconds
            break
        case '15min':
            interval = 15000 // 15 seconds
            break
        case '30min':
            interval = 30000 // 30 seconds
            break
        case '1h':
            interval = 60000 // 1 minute
            break
        case '6h':
            interval = 300000 // 5 minutes
            break
        case '24h':
            interval = 900000 // 15 minutes
            break
        case '7d':
            interval = 3600000 // 1 hour
            break
        case '14d':
            interval = 7200000 // 2 hours
            break
        default:
            // Keep the calculated interval
            break
    }

    console.log('Using interval:', interval, 'ms')

    // Group readings by interval
    const groupedReadings: { [key: number]: number[] } = {}
    sensorReadings.forEach(reading => {
        const timestamp = new Date(reading.timestamp).getTime()
        const intervalIndex = Math.floor((timestamp - timeStart) / interval)
        if (!groupedReadings[intervalIndex]) {
            groupedReadings[intervalIndex] = []
        }
        groupedReadings[intervalIndex].push(reading.value)
    })

    console.log('Grouped readings:', groupedReadings)

    // Calculate averages for each interval
    const processedData = Object.entries(groupedReadings).map(([intervalIndex, values]) => {
        const average = values.reduce((sum, value) => sum + value, 0) / values.length
        const timestamp = new Date(timeStart + parseInt(intervalIndex) * interval)
        return {
            index: parseInt(intervalIndex),
            timestamp: timestamp.toISOString(),
            value: average
        }
    }).sort((a, b) => a.index - b.index)

    console.log('Processed data:', processedData)
    return processedData
}

export function getLatestReading(readings: SensorReading[], sensorType: string): number {
    if (readings.length === 0) return 0

    const sensorReadings = readings.filter(reading => reading.sensor_id === sensorType)
    if (sensorReadings.length === 0) return 0

    const latestReading = sensorReadings[sensorReadings.length - 1]
    return Number(latestReading.value.toFixed(2))
} 