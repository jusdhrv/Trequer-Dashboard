import { NextResponse } from 'next/server'
import { addSensorReading, getSensorReadings } from '../../../lib/supabase'

interface SensorReading {
    sensor_id: string;
    value: number;
    timestamp: string;
}

interface SensorData {
    readings: SensorReading[];
}

export async function POST(request: Request) {
    try {
        const data: SensorData = await request.json()
        // console.log('Received sensor data:', data)

        // Validate the incoming data
        if (!data || !Array.isArray(data.readings)) {
            return NextResponse.json(
                { error: 'Invalid data format. Expected array of readings.' },
                { status: 400 }
            )
        }

        // Validate each reading
        for (const reading of data.readings) {
            if (!reading.sensor_id || typeof reading.value !== 'number' || !reading.timestamp) {
                return NextResponse.json(
                    { error: 'Invalid reading format. Each reading must have sensor_id, value, and timestamp.' },
                    { status: 400 }
                )
            }
        }

        // Add readings to Supabase
        const success = await addSensorReading(data.readings)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to store sensor data' },
                { status: 500 }
            )
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
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h';
    const sensorId = searchParams.get('sensorId'); // Optional

    console.log(`API GET: timeRange=${timeRange}, sensorId=${sensorId || 'all'}`);

    const readings = await getSensorReadings(timeRange, sensorId);

    // Transform to graph-ready format
    const transformedReadings = readings.map(reading => ({
      timestamp: reading.timestamp,
      value: reading.value,
    }));

    console.log('Transformed readings:', transformedReadings);

    return NextResponse.json({ readings: transformedReadings });
  } catch (error) {
    console.error('Error reading sensor data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}