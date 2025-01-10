import { NextResponse } from 'next/server'
import { getSensorConfigs, updateSensorConfig, addSensorConfig, deleteSensorConfig, type SensorConfig } from '../../../../lib/sensor-config'

export async function GET() {
    try {
        const configs = await getSensorConfigs()
        return NextResponse.json({ configs })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sensor configurations' }, { status: 500 })
    }
}

interface SensorRequest {
    action: 'update' | 'add' | 'delete'
    sensor: Partial<SensorConfig> & { id?: string }
}

export async function POST(req: Request) {
    try {
        const data = await req.json() as SensorRequest
        const { action, sensor } = data

        if (!sensor) {
            return NextResponse.json({ error: 'Missing sensor data' }, { status: 400 })
        }

        switch (action) {
            case 'update':
                if (!sensor.id) {
                    return NextResponse.json({ error: 'Missing sensor ID' }, { status: 400 })
                }
                const success = await updateSensorConfig(sensor as SensorConfig)
                return NextResponse.json({ success })
            case 'add': {
                const { id, ...sensorData } = sensor
                const newId = await addSensorConfig(sensorData as Omit<SensorConfig, 'id'>)
                return NextResponse.json({ success: !!newId, id: newId })
            }
            case 'delete':
                if (!sensor.id) {
                    return NextResponse.json({ error: 'Missing sensor ID' }, { status: 400 })
                }
                const deleteSuccess = await deleteSensorConfig(sensor.id)
                return NextResponse.json({ success: deleteSuccess })
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error processing sensor request:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
} 