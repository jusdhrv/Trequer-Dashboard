'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { toast } from "../../../../components/ui/use-toast"

const retentionPeriods = [
    { value: '12h', label: '12 Hours', hours: 12 },
    { value: '24h', label: '1 Day', hours: 24 },
    { value: '48h', label: '2 Days', hours: 48 },
    { value: '72h', label: '3 Days', hours: 72 },
    { value: '168h', label: '7 Days', hours: 168 },
    { value: '336h', label: '14 Days', hours: 336 }
]

export default function DataSettingsPage() {
    const [retentionPeriod, setRetentionPeriod] = useState<string>('168h')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/data')
            const data = await response.json()
            if (data.retentionPeriod) {
                setRetentionPeriod(data.retentionPeriod)
            }
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching data settings:', error)
            toast({
                title: "Error",
                description: "Failed to load data settings",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }

    const handleRetentionChange = async (value: string) => {
        try {
            const response = await fetch('/api/settings/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ retentionPeriod: value })
            })

            const data = await response.json()
            if (data.success) {
                setRetentionPeriod(value)
                toast({
                    title: "Success",
                    description: "Data retention period updated",
                })
            } else {
                throw new Error('Failed to update retention period')
            }
        } catch (error) {
            console.error('Error updating retention period:', error)
            toast({
                title: "Error",
                description: "Failed to update data retention period",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Data Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="retentionPeriod">Data Retention Period</Label>
                            <Select value={retentionPeriod} onValueChange={handleRetentionChange}>
                                <SelectTrigger id="retentionPeriod">
                                    <SelectValue placeholder="Select retention period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {retentionPeriods.map((period) => (
                                        <SelectItem key={period.value} value={period.value}>
                                            {period.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Sensor readings older than this period will be automatically deleted.
                                This helps manage storage space and improve application performance.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 