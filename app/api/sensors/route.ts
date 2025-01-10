import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addSensorReading, getSensorReadings } from '@/lib/sensor-readings'

interface SensorData {
    temperature?: number;
    humidity?: number;
    methane?: number;
    light?: number;
    atmosphericPressure?: number;
    timestamp?: string;
}

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
        } else {
            // Validate timestamp format
            const timestamp = new Date(data.timestamp)
            if (isNaN(timestamp.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid timestamp format' },
                    { status: 400 }
                )
            }
            // Check if timestamp is not in the future
            if (timestamp > new Date()) {
                return NextResponse.json(
                    { error: 'Timestamp cannot be in the future' },
                    { status: 400 }
                )
            }
            // Check if timestamp is not too old (e.g., more than 24 hours)
            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)
            if (timestamp < oneDayAgo) {
                return NextResponse.json(
                    { error: 'Timestamp is too old' },
                    { status: 400 }
                )
            }
        }

        // Ensure at least one sensor value is provided
        const hasSensorValue = Object.entries(data).some(([key, value]) => 
            key !== 'timestamp' && value !== undefined && value !== null
        )
        if (!hasSensorValue) {
            return NextResponse.json(
                { error: 'At least one sensor value must be provided' },
                { status: 400 }
            )
        }

        const success = await addSensorReading(data)

        if (!success) {
            throw new Error('Failed to add sensor reading')
        }

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

        // Calculate the time range
        const now = new Date()
        const from = new Date(now)

        switch (timeRange) {
            case '1h':
                from.setHours(now.getHours() - 1)
                break
            case '6h':
                from.setHours(now.getHours() - 6)
                break
            case '24h':
                from.setHours(now.getHours() - 24)
                break
            case '7d':
                from.setDate(now.getDate() - 7)
                break
            case '14d':
                from.setDate(now.getDate() - 14)
                break
            default:
                from.setHours(now.getHours() - 1)
        }

        const readings = await getSensorReadings(from, now)

        return NextResponse.json({ readings })
    } catch (error) {
        console.error('Error reading sensor data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 