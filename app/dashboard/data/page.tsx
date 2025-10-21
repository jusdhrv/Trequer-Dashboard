'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { CustomDateRangePicker } from "../../../components/ui/custom-date-range-picker"
import { format, addSeconds, differenceInSeconds, subHours } from "date-fns"
import { RefreshCw } from 'lucide-react'
import { cn } from "../../../lib/utils"
import { SensorConfig } from '../../../lib/sensor-config'
import { toast } from '../../../components/ui/use-toast'

const timeScales = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
]

interface DateRange {
  from: Date
  to: Date
}

const getDefaultDateRange = (): DateRange => {
  const now = new Date()
  return {
    from: subHours(now, 1),
    to: now,
  }
}

const RawDataPage = () => {
  const [rawData, setRawData] = useState<any[]>([])
  const [sensors, setSensors] = useState<SensorConfig[]>([])
  const [selectedSensor, setSelectedSensor] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [timeScale, setTimeScale] = useState('minutes')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    fetchSensors()
  }, [])

  // Initialize state after component mounts to prevent hydration mismatch
  useEffect(() => {
    setDateRange(getDefaultDateRange())
    setIsClient(true)
  }, [])

  const fetchSensors = async () => {
    try {
      const response = await fetch('/api/sensors/config')
      const data = await response.json()
      if (data.configs) {
        setSensors(data.configs)
        if (data.configs.length > 0) {
          setSelectedSensor(data.configs[0].id)
        }
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

  const handleDateRangeConfirm = () => {
    fetchData()
  }

  const fetchData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sensors?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`)
      const data = await response.json()

      if (data.readings) {
        // Process the data based on the selected time scale
        const totalSeconds = differenceInSeconds(dateRange.to, dateRange.from)
        let interval: number

        switch (timeScale) {
          case 'seconds':
            interval = 1
            break
          case 'minutes':
            interval = 60
            break
          case 'hours':
            interval = 3600
            break
          default:
            interval = 60
        }

        // Group readings by time intervals
        const processedData = []
        let currentTime = new Date(dateRange.from)

        while (currentTime <= dateRange.to) {
          const nextTime = addSeconds(currentTime, interval)

          // Find readings in this interval
          const intervalReadings = data.readings.filter((reading: any) => {
            const readingTime = new Date(reading.timestamp)
            return readingTime >= currentTime && readingTime < nextTime
          })

          // Calculate average for the selected sensor in this interval
          if (intervalReadings.length > 0) {
            const sum = intervalReadings.reduce((acc: number, reading: any) => {
              return acc + (reading[selectedSensor] || 0)
            }, 0)

            processedData.push({
              timestamp: currentTime.toISOString(),
              [selectedSensor]: Number((sum / intervalReadings.length).toFixed(2))
            })
          }

          currentTime = nextTime
        }

        setRawData(processedData)
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sensor data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!dateRange?.from || !dateRange?.to) return

    const selectedSensorConfig = sensors.find(s => s.id === selectedSensor)
    if (!selectedSensorConfig) return

    if (rawData.length === 0) {
      // Export a message if no data is available
      const dataStr = JSON.stringify({ message: "No valid data for the selected time range" }, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.download = `${selectedSensorConfig.name}_no_data_${format(dateRange.from, 'yyyyMMdd_HHmmss')}_${format(dateRange.to, 'yyyyMMdd_HHmmss')}.json`
      link.href = url
      link.click()
      return
    }

    const dataStr = JSON.stringify(rawData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.download = `${selectedSensorConfig.name}_data_${format(dateRange.from, 'yyyyMMdd_HHmmss')}_${format(dateRange.to, 'yyyyMMdd_HHmmss')}.json`
    link.href = url
    link.click()
  }

  // Don't render until after client-side hydration
  if (!isClient) {
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Data Export</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4 sm:gap-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sensorSelect">Select Sensor</Label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger id="sensorSelect">
                  <SelectValue placeholder="Select a sensor" />
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
            <div className="flex flex-col space-y-1.5">
              <Label>Select Date and Time Range</Label>
              {dateRange && (
                <CustomDateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  onConfirm={handleDateRangeConfirm}
                  minDate={new Date(2020, 0, 1)}
                  maxDate={new Date()}
                />
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="timeScaleSelect">Select Time Scale</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={timeScale} onValueChange={setTimeScale}>
                  <SelectTrigger id="timeScaleSelect" className="flex-1">
                    <SelectValue placeholder="Select time scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeScales.map((scale) => (
                      <SelectItem key={scale.value} value={scale.value}>
                        {scale.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchData}
                  disabled={isLoading || !dateRange || !selectedSensor}
                  className="w-full sm:w-auto"
                  aria-label="Refresh data"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="rawData">Raw Data Preview</Label>
              <div className="h-[400px] overflow-auto border rounded-md p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : rawData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No valid data for the selected time range
                  </div>
                ) : (
                  <pre className="text-sm">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
            <Button onClick={handleExport} disabled={isLoading || !dateRange || !selectedSensor}>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RawDataPage

