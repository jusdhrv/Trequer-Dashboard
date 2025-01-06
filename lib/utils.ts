import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface SensorReading {
    temperature?: number;
    humidity?: number;
    methane?: number;
    light?: number;
    atmosphericPressure?: number;
    timestamp: string;
}

interface ProcessedData {
    index: number;
    value: number;
    timestamp: string;
}

export function processReadings(readings: any[], sensorType: string, timeRange: string) {
    // Sort readings by timestamp
    const sortedReadings = readings
        .filter(reading => reading[sensorType] !== undefined)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Calculate interval based on time range
    let interval: number
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
            interval = 60000 // default to 1 minute
    }

    // Group readings by interval
    const groupedReadings: { [key: number]: number[] } = {}
    sortedReadings.forEach(reading => {
        const timestamp = new Date(reading.timestamp).getTime()
        const intervalIndex = Math.floor(timestamp / interval)
        if (!groupedReadings[intervalIndex]) {
            groupedReadings[intervalIndex] = []
        }
        groupedReadings[intervalIndex].push(reading[sensorType])
    })

    // Calculate averages for each interval
    const processedData = Object.entries(groupedReadings).map(([intervalIndex, values], index) => {
        const average = values.reduce((sum, value) => sum + value, 0) / values.length
        return {
            index,
            timestamp: new Date(parseInt(intervalIndex) * interval),
            value: average
        }
    })

    return processedData
}

export function getLatestReading(readings: SensorReading[], sensorType: string): number {
    if (readings.length === 0) return 0

    const latestReading = readings[readings.length - 1]
    const value = latestReading[sensorType as keyof SensorReading]
    return typeof value === 'number' ? Number(value.toFixed(2)) : 0
} 