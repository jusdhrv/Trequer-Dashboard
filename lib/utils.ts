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

export function processReadings(
    readings: SensorReading[],
    sensorType: string,
    timeRange: string
): ProcessedData[] {
    // Sort readings by timestamp
    const sortedReadings = [...readings].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Calculate time intervals based on the range
    const now = new Date()
    const intervals: { start: Date; end: Date }[] = []
    let intervalCount: number
    let intervalSize: number // in milliseconds

    switch (timeRange) {
        case '1h':
            intervalCount = 60 // 1-minute intervals for 1 hour
            intervalSize = 60 * 1000 // 1 minute
            break
        case '6h':
            intervalCount = 72 // 5-minute intervals for 6 hours
            intervalSize = 5 * 60 * 1000 // 5 minutes
            break
        case '24h':
            intervalCount = 96 // 15-minute intervals for 24 hours
            intervalSize = 15 * 60 * 1000 // 15 minutes
            break
        case '7d':
            intervalCount = 168 // 1-hour intervals for 7 days
            intervalSize = 60 * 60 * 1000 // 1 hour
            break
        case '14d':
            intervalCount = 168 // 2-hour intervals for 14 days
            intervalSize = 2 * 60 * 60 * 1000 // 2 hours
            break
        default:
            intervalCount = 60
            intervalSize = 60 * 1000 // 1 minute default
    }

    // Create intervals
    for (let i = 0; i < intervalCount; i++) {
        const end = new Date(now.getTime() - i * intervalSize)
        const start = new Date(end.getTime() - intervalSize)
        intervals.unshift({ start, end })
    }

    // Calculate averages for each interval
    return intervals.map(({ start, end }, index) => {
        const intervalReadings = sortedReadings.filter(reading => {
            const timestamp = new Date(reading.timestamp)
            return timestamp >= start && timestamp < end
        })

        let sum = 0
        let count = 0

        intervalReadings.forEach(reading => {
            const value = reading[sensorType as keyof SensorReading]
            if (typeof value === 'number') {
                sum += value
                count++
            }
        })

        const average = count > 0 ? sum / count : 0

        return {
            index,
            value: Number(average.toFixed(2)),
            timestamp: start.toISOString()
        }
    })
}

export function getLatestReading(readings: SensorReading[], sensorType: string): number {
    if (readings.length === 0) return 0

    const latestReading = readings[readings.length - 1]
    const value = latestReading[sensorType as keyof SensorReading]
    return typeof value === 'number' ? Number(value.toFixed(2)) : 0
} 