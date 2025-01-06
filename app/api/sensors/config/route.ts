import { NextResponse } from 'next/server'
import { getSensorConfigs, updateSensorConfig, updateSingleSensor, addSensor, deleteSensor } from '../../../../lib/sensor-config'

export async function GET() {
    try {
        const configs = await getSensorConfigs()
        return NextResponse.json({ configs })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sensor configurations' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { action, sensor } = data

        switch (action) {
            case 'update':
                if (Array.isArray(sensor)) {
                    const success = await updateSensorConfig(sensor)
                    return NextResponse.json({ success })
                } else {
                    const success = await updateSingleSensor(sensor)
                    return NextResponse.json({ success })
                }
            case 'add':
                const addSuccess = await addSensor(sensor)
                return NextResponse.json({ success: addSuccess })
            case 'delete':
                const deleteSuccess = await deleteSensor(sensor.id)
                return NextResponse.json({ success: deleteSuccess })
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
} 