import { NextResponse } from 'next/server'
import { 
    getSensorConfigs, 
    updateSensorConfig, 
    updateSingleSensor, 
    addSensor, 
    deleteSensor,
    type SensorConfig 
} from '../../../../lib/supabase'

export async function GET() {
    try {
        // console.log('Fetching sensor configs from Supabase...')
        const configs = await getSensorConfigs()
        // console.log('Received configs:', configs)
        
        if (!configs || configs.length === 0) {
            // console.log('No sensor configs found in database')
            return NextResponse.json({ configs: [] })
        }

        return NextResponse.json({ configs })
    } catch (error) {
        console.error('Error fetching sensor configs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sensor configurations', details: error }, 
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { action, sensor } = data
        // console.log(`Processing ${action} action for sensor:`, sensor)

        let success = false
        switch (action) {
            case 'update':
                if (Array.isArray(sensor)) {
                    // console.log('Updating multiple sensors:', sensor)
                    success = await updateSensorConfig(sensor)
                } else {
                    // console.log('Updating single sensor:', sensor)
                    success = await updateSingleSensor(sensor)
                }
                break
            case 'add':
                // console.log('Adding new sensor:', sensor)
                success = await addSensor(sensor)
                break
            case 'delete':
                // console.log('Deleting sensor:', sensor.id)
                success = await deleteSensor(sensor.id)
                break
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // console.log(`${action} operation ${success ? 'succeeded' : 'failed'}`)
        return NextResponse.json({ success })
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json(
            { error: 'Failed to process request', details: error }, 
            { status: 500 }
        )
    }
} 