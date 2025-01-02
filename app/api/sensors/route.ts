import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface SensorData {
    temperature?: number;
    humidity?: number;
    methane?: number;
    light?: number;
    atmosphericPressure?: number;
    timestamp?: string;
}

interface StorageData {
    readings: SensorData[];
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'sensor_readings.json')
const MAX_READINGS = 1209600 // 14 days * 24 hours * 60 minutes * 60 seconds = 2 weeks of 1Hz data

export async function POST(request: Request) {
    try {
        const data: SensorData = await request.json()

        // Validate the incoming data
        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            )
        }

        // Validate each sensor value if present
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'timestamp' && value !== undefined && typeof value !== 'number') {
                return NextResponse.json(
                    { error: `Invalid ${key} value. Must be a number.` },
                    { status: 400 }
                )
            }
        }

        // Add timestamp if not provided
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString()
        }

        // Read existing data
        let storageData: StorageData
        try {
            const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8')
            storageData = JSON.parse(fileContent)
        } catch (error) {
            storageData = { readings: [] }
        }

        // Add new reading
        storageData.readings.push(data)

        // Keep only last MAX_READINGS to maintain 2 weeks of history
        if (storageData.readings.length > MAX_READINGS) {
            storageData.readings = storageData.readings.slice(-MAX_READINGS)
        }

        // Save updated data
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storageData, null, 2))

        return NextResponse.json(
            {
                message: 'Sensor data received successfully',
                data: data
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error processing sensor data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '1h'

        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8')
        const data = JSON.parse(fileContent)

        // If no time range specified, return all data
        if (!timeRange) return NextResponse.json(data)

        // Filter data based on time range
        const now = new Date()
        const cutoff = new Date(now.getTime())

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

        const filteredReadings = data.readings.filter((reading: SensorData) =>
            new Date(reading.timestamp!) >= cutoff
        )

        return NextResponse.json({ readings: filteredReadings })
    } catch (error) {
        console.error('Error reading sensor data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 