import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({
            retentionPeriod: data?.retention_period || '168h' // Default to 7 days
        })
    } catch (error) {
        console.error('Error reading data settings:', error)
        return NextResponse.json({ error: 'Failed to read data settings' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { retentionPeriod } = await req.json()

        // Validate retention period format
        if (!retentionPeriod || typeof retentionPeriod !== 'string') {
            return NextResponse.json(
                { error: 'Retention period must be provided as a string' },
                { status: 400 }
            )
        }

        // Validate retention period format (e.g., "168h")
        const match = retentionPeriod.match(/^(\d+)h$/)
        if (!match) {
            return NextResponse.json(
                { error: 'Retention period must be in the format "Xh" where X is a number' },
                { status: 400 }
            )
        }

        // Validate retention period range (e.g., between 1 hour and 30 days)
        const hours = parseInt(match[1])
        if (hours < 1 || hours > 720) {
            return NextResponse.json(
                { error: 'Retention period must be between 1 hour and 30 days' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('settings')
            .upsert({
                id: 'data_settings',
                retention_period: retentionPeriod
            })

        if (error) {
            throw error
        }

        return NextResponse.json({ 
            success: true,
            message: `Retention period updated to ${retentionPeriod}`
        })
    } catch (error) {
        console.error('Error updating data settings:', error)
        return NextResponse.json(
            { error: 'Failed to update data settings' },
            { status: 500 }
        )
    }
}