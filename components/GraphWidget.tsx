'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { Settings, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { processReadings } from '../lib/utils'

interface GraphWidgetProps {
  title: string;
  sensorType: string;
}

export default function GraphWidget({ title, sensorType }: GraphWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('1h')
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)
  const [selectedSource, setSelectedSource] = useState('primary')
  const [pollingInterval, setPollingInterval] = useState('30s')

  const fetchData = async () => {
    try {
      setIsSettingsChanged(true)
      const response = await fetch(`/api/sensors?timeRange=${timeRange}&source=${selectedSource}`)
      const result = await response.json()

      if (result.readings) {
        setData(processReadings(result.readings, sensorType, timeRange))
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    } finally {
      setTimeout(() => setIsSettingsChanged(false), 1000)
    }
  }

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
  }, [timeRange, sensorType, selectedSource, pollingInterval])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  const handleSourceChange = (value: string) => {
    setSelectedSource(value)
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
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }

  const formatTooltipTime = (index: number) => {
    const item = data[index]
    if (!item || !item.timestamp) return ''
    const date = new Date(item.timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const formatXAxisTick = (index: number) => {
    switch (timeRange) {
      case '1min':
        return `${index}s`
      case '5min':
        return `${index * 5}s`
      case '15min':
        return `${index * 15}s`
      case '30min':
        return `${index * 30}s`
      case '1h':
        return `${index}min`
      case '6h':
        return `${index * 5}min`
      case '24h':
        return `${index * 15}min`
      case '7d':
        return `${index}h`
      case '14d':
        return `${index * 2}h`
      default:
        return index.toString()
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Graph Settings</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Input Source</Label>
                <Select value={selectedSource} onValueChange={handleSourceChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select input source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Sensor</SelectItem>
                    <SelectItem value="secondary">Secondary Sensor</SelectItem>
                    <SelectItem value="backup">Backup Sensor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Time Range</Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Refresh Every</Label>
                <Select value={pollingInterval} onValueChange={handlePollingChange}>
                  <SelectTrigger className="col-span-3">
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
      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="index"
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={formatXAxisTick}
              interval={timeRange === '1h' ? 4 : timeRange === '6h' ? 5 : timeRange === '24h' ? 7 : 13}
            />
            <YAxis domain={getYAxisDomain()} />
            <Tooltip
              labelFormatter={formatTooltipTime}
              formatter={(value: number) => [value.toFixed(2), title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              isAnimationActive={false}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {isSettingsChanged && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}

