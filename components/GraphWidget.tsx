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
import { SensorConfig } from '../lib/supabase'
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
      console.log('Fetching sensor configurations...')
      const response = await fetch('/api/sensors/config')
      const data = await response.json()
      
      console.log('Received sensor configs:', data)
      
      if (data.configs) {
        // Filter enabled sensors and set state
        const enabledSensors = data.configs.filter((config: SensorConfig) => config.is_enabled)
        console.log('Enabled sensors:', enabledSensors)
        setSensors(enabledSensors)
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
      console.log(`Fetching data for sensor ${selectedSensor} with timeRange ${timeRange}`)
      setIsSettingsChanged(true)
      const response = await fetch(`/api/sensors?timeRange=${timeRange}`)
      const result = await response.json()

      console.log('Received sensor readings:', result)

      if (result.readings) {
        const processedData = processReadings(result.readings, selectedSensor, timeRange)
        console.log('Processed data:', processedData)
        if (processedData.length > 0) {
          setData(processedData)
        } else {
          console.log('No data available for the selected sensor and time range')
        }
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
    console.log('Changing time range to:', value)
    setTimeRange(value)
  }

  const handleSensorChange = (value: string) => {
    console.log('Changing selected sensor to:', value)
    setSelectedSensor(value)
  }

  const handlePollingChange = (value: string) => {
    console.log('Changing polling interval to:', value)
    setPollingInterval(value)
  }

  const handleRefresh = () => {
    console.log('Manually refreshing data')
    fetchData()
  }

  const getYAxisDomain = () => {
    if (data.length === 0) return [0, 100]
    const values = data.map(d => d.value)
    const max = Math.max(...values)
    return [0, Math.ceil(max)]
  }

  const formatYAxisTick = (value: number) => {
    return value.toFixed(2)
  }

  const formatXAxisTick = (index: number) => {
    if (index === 0) {
      switch (timeRange) {
        case '1min': return '1 min'
        case '5min': return '5 min'
        case '15min': return '15 min'
        case '30min': return '30 min'
        case '1h': return '1 hour'
        case '6h': return '6 hours'
        case '24h': return '24 hours'
        case '7d': return '7 days'
        case '14d': return '14 days'
        default: return timeRange
      }
    }
    return ''
  }

  const formatTooltipTime = (index: number) => {
    const item = data[index]
    if (!item || !item.timestamp) return ''
    const date = new Date(item.timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const formatTooltipValue = (value: number) => {
    return [value.toFixed(2), title]
  }

  const getSensorName = () => {
    const sensor = sensors.find(sensor => sensor.id === selectedSensor)
    return sensor ? sensor.name : title
  }

  return (
    <div className="relative h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{getSensorName()}</h3>
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
      <div className="h-[240px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, data.length - 1]}
                tickFormatter={formatXAxisTick}
                interval="preserveStart"
                stroke="hsl(var(--foreground))"
                ticks={[0]}
              />
              <YAxis
                domain={getYAxisDomain()}
                stroke="hsl(var(--foreground))"
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                labelFormatter={formatTooltipTime}
                formatter={formatTooltipValue}
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
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}