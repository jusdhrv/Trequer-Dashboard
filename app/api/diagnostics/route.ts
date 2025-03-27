import { NextResponse } from 'next/server'
import { adminSupabase as supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '1h'

        // Calculate the cutoff time based on the time range
        const now = new Date()
        let cutoff = new Date(now)

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

        const { data, error } = await supabase
            .from('diagnostic_readings')
            .select('*')
            .gte('timestamp', cutoff.toISOString())
            .order('timestamp', { ascending: true })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch diagnostic data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        
        // Validate required fields
        const requiredFields = [
            'cpu_usage',
            'cpu_temperature',
            'memory_usage',
            'disk_usage',
            'network_usage',
            'system_uptime',
            'timestamp'
        ]

        for (const field of requiredFields) {
            if (!(field in data)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Insert the diagnostic reading
        const { error } = await supabase
            .from('diagnostic_readings')
            .insert([data])

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving diagnostic data:', error)
        return NextResponse.json(
            { error: 'Failed to save diagnostic data' },
            { status: 500 }
        )
    }
} 