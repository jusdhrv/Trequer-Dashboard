'use client'

import { useState, useEffect } from 'react'
import { useJsonZipExport } from '@/hooks/useJsonZipExport'
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

  const { compressAndDownload } = useJsonZipExport()

  useEffect(() => {
    fetchSensors()
  }, [])

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
    if (!dateRange?.from || !dateRange?.to || !selectedSensor) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/sensors?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&sensorId=${selectedSensor}`
      )
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

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

          // Calculate average value for the selected sensor in this interval
          if (intervalReadings.length > 0) {
            const sum = intervalReadings.reduce((acc: number, reading: any) => {
              return acc + (Number(reading.value) || 0)
            }, 0)

            processedData.push({
              timestamp: currentTime.toISOString(),
              value: Number((sum / intervalReadings.length).toFixed(2))
            })
          }

          currentTime = nextTime
        }

        setRawData(processedData)
      } else {
        setRawData([])
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        title: "Error",
        description: `Failed to fetch sensor data: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!dateRange?.from || !dateRange?.to || !selectedSensor) return

    const selectedSensorConfig = sensors.find(s => s.id === selectedSensor)
    if (!selectedSensorConfig) return

    setIsLoading(true)

    try {
      if (rawData.length === 0) {
        const emptyData = {
          message: "No valid data for the selected time range",
          timestamp: dateRange.from.toISOString(),
          selectedSensor: selectedSensorConfig.name
        }

        await compressAndDownload({
          jsonData: emptyData,
          filename: `${selectedSensorConfig.name}_no_data_${format(dateRange.from, 'yyyyMMdd_HHmmss')}`
        })
        return
      }

      const exportData = {
        metadata: {
          sensor: selectedSensorConfig,
          timeRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            duration: differenceInSeconds(dateRange.to, dateRange.from),
            timeScale: timeScale
          },
          exportConfig: {
            dataPoints: rawData.length,
            processedAt: new Date().toISOString()
          }
        },
        data: rawData
      }

      await compressAndDownload({
        jsonData: exportData,
        filename: `${selectedSensorConfig.name}_data_${format(dateRange.from, 'yyyyMMdd_HHmmss')}_${format(dateRange.to, 'yyyyMMdd_HHmmss')}`
      })

      toast({
        title: "Export Successful",
        description: `Data exported as ZIP (${rawData.length} data points)`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        title: "Export Failed",
        description: `Please try again: ${errorMessage}`,
        variant: "destructive",
      })

      const fallbackDataStr = JSON.stringify(rawData.length === 0
        ? { message: "No valid data for the selected time range" }
        : rawData, null, 2)

      const fallbackBlob = new Blob([fallbackDataStr], { type: 'application/json' })
      const fallbackUrl = URL.createObjectURL(fallbackBlob)
      const fallbackLink = document.createElement('a')
      fallbackLink.download = `${selectedSensorConfig?.name || 'data'}_fallback.json`
      fallbackLink.href = fallbackUrl
      fallbackLink.click()
      URL.revokeObjectURL(fallbackUrl)
    } finally {
      setIsLoading(false)
    }
  }

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
            <Button
              onClick={handleExport}
              disabled={isLoading || !dateRange || !selectedSensor}
              className={cn("w-full", isLoading && "animate-pulse")}
            >
              {isLoading ? "Compressing..." : "Export as ZIP"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RawDataPage