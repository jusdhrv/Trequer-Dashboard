import { NextResponse } from 'next/server'
import { adminSupabase as supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['sensor_readings_retention_hours', 'diagnostic_readings_retention_hours'])

        if (error) {
            console.error('Supabase error fetching settings:', error)
            throw error
        }

        // If no settings found, return default values
        const sensorRetentionHours = settings?.find(s => s.key === 'sensor_readings_retention_hours')?.value ?? 168; // Default 7 days
        const diagnosticRetentionHours = settings?.find(s => s.key === 'diagnostic_readings_retention_hours')?.value ?? 72; // Default 3 days

        return NextResponse.json({
            sensorRetentionHours,
            diagnosticRetentionHours,
        })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { type, hours } = await request.json()

        // Validate input
        if (!type || typeof hours !== 'number' || !['sensor', 'diagnostic'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid input: type must be "sensor" or "diagnostic" and hours must be a number' },
                { status: 400 }
            )
        }

        // Validate hours range (between 1 hour and 30 days)
        if (hours < 1 || hours > 720) {
            return NextResponse.json(
                { error: 'Hours must be between 1 and 720 (30 days)' },
                { status: 400 }
            )
        }

        const key = type === 'sensor' 
            ? 'sensor_readings_retention_hours' 
            : 'diagnostic_readings_retention_hours'

        console.log('Updating settings:', { key, value: hours })

        // First check if the setting exists
        const { data: existingSettings, error: fetchError } = await supabase
            .from('settings')
            .select('id')
            .eq('key', key)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing setting:', fetchError)
            throw fetchError
        }

        let updateError
        if (existingSettings) {
            // Update existing setting
            const { error } = await supabase
                .from('settings')
                .update({ value: hours, updated_at: new Date().toISOString() })
                .eq('key', key)
            updateError = error
        } else {
            // Insert new setting
            const { error } = await supabase
                .from('settings')
                .insert({
                    key,
                    value: hours,
                    description: `Data retention duration for ${type} readings in hours`
                })
            updateError = error
        }

        if (updateError) {
            console.error('Error updating setting:', updateError)
            throw updateError
        }

        console.log('Successfully updated setting:', { key, value: hours })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update settings' },
            { status: 500 }
        )
    }
}