'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Settings2, RefreshCw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { SensorConfig } from '../lib/sensor-config'
import { toast } from './ui/use-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { processReadings } from '../lib/utils'

interface GraphWidgetProps {
  title: string
  sensorType: string
}

export default function GraphWidget({ title, sensorType }: GraphWidgetProps) {
  const [selectedSensor, setSelectedSensor] = useState(sensorType)
  const [sensors, setSensors] = useState<SensorConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('1h')
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)
  const [pollingInterval, setPollingInterval] = useState('30s')

  useEffect(() => {
    fetchSensors()
  }, [])

  useEffect(() => {
    fetchData()

    // Set up polling based on selected interval
    const intervalMs = pollingInterval === '10s' ? 10000
      : pollingInterval === '30s' ? 30000
        : pollingInterval === '1m' ? 60000
          : pollingInterval === '5m' ? 300000
            : 30000 // default to 30s

    const interval = setInterval(fetchData, intervalMs)
    return () => clearInterval(interval)
  }, [timeRange, selectedSensor, pollingInterval])

  const fetchSensors = async () => {
    try {
      const response = await fetch('/api/sensors/config')
      const data = await response.json()
      if (data.configs) {
        setSensors(data.configs.filter((config: SensorConfig) => config.isEnabled))
      }
    } catch (error) {
      console.error('Error fetching sensors:', error)
      toast({
        title: "Error",
        description: "Failed to load sensor configurations",
        variant: "destructive",
      })
    }
  }

  const fetchData = async () => {
    try {
      setIsSettingsChanged(true)
      const response = await fetch(`/api/sensors?timeRange=${timeRange}&sensorType=${selectedSensor}`)
      const result = await response.json()

      if (result.readings) {
        setData(processReadings(result.readings, selectedSensor, timeRange))
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sensor data",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsSettingsChanged(false), 1000)
    }
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  const handleSensorChange = (value: string) => {
    setSelectedSensor(value)
  }

  const handlePollingChange = (value: string) => {
    setPollingInterval(value)
  }

  const handleRefresh = () => {
    fetchData()
  }
  const getYAxisDomain = () => {
    if (data.length === 0) return [0, 100]
    const values = data.map(d => d.value)
    const min = Math.round(Math.min(...values))
    const max = Math.round(Math.max(...values))
    const padding = Math.round((max - min) * 0.1)
    return [Math.round(Math.max(0, min - padding)), Math.round(max + padding)]
  }

  const formatTooltipTime = (index: number) => {
    const item = data[index]
    if (!item || !item.timestamp) return ''
    const date = new Date(item.timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const formatXAxisTick = (index: number) => {
    // switch (timeRange) {
    //   case '1min':
    //     return `${index}s`
    //   case '5min':
    //     return `${index * 5}s`
    //   case '15min':
    //     return `${index * 15}s`
    //   case '30min':
    //     return `${index * 30}s`
    //   case '1h':
    //     return `${index}min`
    //   case '6h':
    //     return `${index * 5}min`
    //   case '24h':
    //     return `${index * 15}min`
    //   case '7d':
    //     return `${index}h`
    //   case '14d':
    //     return `${index * 2}h`
    //   default:
    //     return index.toString()
    // }
    return `${0}`
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute middle-1 right-1 bg-background/50 hover:bg-background/80"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Graph Settings</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inputSource">Input Source</Label>
                <Select
                  value={selectedSensor}
                  onValueChange={handleSensorChange}
                >
                  <SelectTrigger id="inputSource">
                    <SelectValue placeholder="Select input source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name} ({sensor.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger id="timeRange">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1min">1 minute</SelectItem>
                    <SelectItem value="5min">5 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="14d">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pollingInterval">Refresh Every</Label>
                <Select value={pollingInterval} onValueChange={handlePollingChange}>
                  <SelectTrigger id="pollingInterval">
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10 seconds</SelectItem>
                    <SelectItem value="30s">30 seconds</SelectItem>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetClose asChild>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-[300px] relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={formatXAxisTick}
                // tickFormatter='0'
                interval={timeRange === '1h' ? 4 : timeRange === '6h' ? 5 : timeRange === '24h' ? 7 : 13}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                domain={getYAxisDomain()}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip
                labelFormatter={formatTooltipTime}
                formatter={(value: number) => [value.toFixed(2), title]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                isAnimationActive={false}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">No data available</span>
          </div>
        )}
        {isSettingsChanged && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}

