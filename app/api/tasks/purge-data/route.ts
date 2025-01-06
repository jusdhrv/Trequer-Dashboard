import { NextResponse } from 'next/server'
import { purgeOldData } from '../../../../lib/data-retention'

export async function GET() {
    try {
        const success = await purgeOldData()
        if (success) {
            return NextResponse.json({ message: 'Data purge completed successfully' })
        } else {
            throw new Error('Data purge failed')
        }
    } catch (error) {
        console.error('Error in purge data task:', error)
        return NextResponse.json({ error: 'Failed to purge old data' }, { status: 500 })
    }
} 