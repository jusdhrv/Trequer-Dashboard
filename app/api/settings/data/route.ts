import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'sensor_readings.json')

export async function GET() {
    try {
        const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8')
        const jsonData = JSON.parse(data)
        return NextResponse.json({
            retentionPeriod: jsonData.retentionPeriod || '168h' // Default to 7 days
        })
    } catch (error) {
        console.error('Error reading data settings:', error)
        return NextResponse.json({ error: 'Failed to read data settings' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { retentionPeriod } = await req.json()

        // Read current data
        const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8')
        const jsonData = JSON.parse(data)

        // Update retention period
        jsonData.retentionPeriod = retentionPeriod

        // Write back to file
        await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(jsonData, null, 2), 'utf8')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating data settings:', error)
        return NextResponse.json({ error: 'Failed to update data settings' }, { status: 500 })
    }
} 