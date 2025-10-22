'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Switch } from "../../../../components/ui/switch"
import { Pencil, Trash2, Plus, Save } from 'lucide-react'
import { SensorConfig } from '../../../../lib/sensor-config'
import { toast } from '../../../../components/ui/use-toast'

export default function SensorSettingsPage() {
    const [sensors, setSensors] = useState<SensorConfig[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchSensors()
    }, [])

    const fetchSensors = async () => {
        try {
            const response = await fetch('/api/sensors/config')
            const data = await response.json()
            if (data.configs) {
                setSensors(data.configs)
            }
        } catch (error) {
            console.error('Error fetching sensors:', error)
            toast({
                title: "Error",
                description: "Failed to fetch sensor configurations",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (sensorId: string) => {
        setEditingId(sensorId)
    }

    const handleSave = async (sensor: SensorConfig) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/sensors/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    sensor
                })
            })

            const data = await response.json()
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Sensor configuration updated",
                })
                setEditingId(null)
                fetchSensors()
            } else {
                throw new Error('Failed to update sensor')
            }
        } catch (error) {
            console.error('Error updating sensor:', error)
            toast({
                title: "Error",
                description: "Failed to update sensor configuration",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (sensorId: string) => {
        if (!confirm('Are you sure you want to delete this sensor?')) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/sensors/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    sensor: { id: sensorId }
                })
            })

            const data = await response.json()
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Sensor deleted",
                })
                fetchSensors()
            } else {
                throw new Error('Failed to delete sensor')
            }
        } catch (error) {
            console.error('Error deleting sensor:', error)
            toast({
                title: "Error",
                description: "Failed to delete sensor",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = async () => {
        const newSensor: SensorConfig = {
            id: `sensor_${Date.now()}`,
            name: 'New Sensor',
            unit: '',
            pin: '',
            signal_type: 'analog',
            readingInterval: 5000,
            is_enabled: true,
            description: ''
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/sensors/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    sensor: newSensor
                })
            })

            const data = await response.json()
            if (data.success) {
                toast({
                    title: "Success",
                    description: "New sensor added",
                })
                fetchSensors()
                setEditingId(newSensor.id)
            } else {
                throw new Error('Failed to add sensor')
            }
        } catch (error) {
            console.error('Error adding sensor:', error)
            toast({
                title: "Error",
                description: "Failed to add new sensor",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateField = (sensorId: string, field: keyof SensorConfig, value: any) => {
        setSensors(prev => prev.map(sensor => {
            if (sensor.id === sensorId) {
                return { ...sensor, [field]: value }
            }
            return sensor
        }))
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl sm:text-2xl">Sensor Settings</CardTitle>
                        <Button onClick={handleAdd} disabled={isLoading} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sensor
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sensors.map(sensor => (
                            <Card key={sensor.id}>
                                <CardContent className="pt-6">
                                    <div className="grid gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 grid gap-2">
                                                {editingId === sensor.id ? (
                                                    <>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Name</Label>
                                                                <Input
                                                                    value={sensor.name}
                                                                    onChange={e => handleUpdateField(sensor.id, 'name', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Unit</Label>
                                                                <Input
                                                                    value={sensor.unit}
                                                                    onChange={e => handleUpdateField(sensor.id, 'unit', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Pin</Label>
                                                                <Input
                                                                    value={sensor.pin}
                                                                    onChange={e => handleUpdateField(sensor.id, 'pin', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Signal Type</Label>
                                                                <Select
                                                                    value={sensor.signal_type}
                                                                    onValueChange={value => handleUpdateField(sensor.id, 'signal_type', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="analog">Analog</SelectItem>
                                                                        <SelectItem value="digital">Digital</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Reading Interval (ms)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={sensor.readingInterval}
                                                                    onChange={e => handleUpdateField(sensor.id, 'readingInterval', parseInt(e.target.value))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Enabled</Label>
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={sensor.is_enabled}
                                                                        onCheckedChange={checked => handleUpdateField(sensor.id, 'is_enabled', checked)}
                                                                    />
                                                                    <span>{sensor.is_enabled ? 'Yes' : 'No'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Description</Label>
                                                            <Input
                                                                value={sensor.description}
                                                                onChange={e => handleUpdateField(sensor.id, 'description', e.target.value)}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="font-bold">{sensor.name}</Label>
                                                            <p className="text-sm text-muted-foreground">{sensor.description}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="font-medium">Unit:</span> {sensor.unit}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Pin:</span> {sensor.pin}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Type:</span> {sensor.signal_type}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Interval:</span> {sensor.readingInterval}ms
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                {editingId === sensor.id ? (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleSave(sensor)}
                                                        disabled={isLoading}
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleEdit(sensor.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(sensor.id)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 