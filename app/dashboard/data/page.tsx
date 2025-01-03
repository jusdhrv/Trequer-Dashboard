'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { DateTimeRangePicker } from "../../../components/ui/date-time-range-picker"
import { format, addSeconds, differenceInSeconds } from "date-fns"

const sensors = [
  { id: 'temperature', name: 'Temperature (°C)' },
  { id: 'humidity', name: 'Humidity (%)' },
  { id: 'methane', name: 'Methane (PPM)' },
  { id: 'light', name: 'Light (Lux)' },
  { id: 'atmosphericPressure', name: 'Atmospheric Pressure (hPa)' },
]

const timeScales = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
]

const RawDataPage = () => {
  const [rawData, setRawData] = useState<any[]>([])
  const [selectedSensor, setSelectedSensor] = useState(sensors[0].id)
  const [dateTimeRange, setDateTimeRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [timeScale, setTimeScale] = useState('minutes')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedSensor, dateTimeRange, timeScale])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sensors?from=${dateTimeRange.from.toISOString()}&to=${dateTimeRange.to.toISOString()}`)
      const data = await response.json()

      if (data.readings) {
        // Process the data based on the selected time scale
        const totalSeconds = differenceInSeconds(dateTimeRange.to, dateTimeRange.from)
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
        let currentTime = new Date(dateTimeRange.from)

        while (currentTime <= dateTimeRange.to) {
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(rawData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.download = `${selectedSensor}_data_${format(dateTimeRange.from, 'yyyyMMdd_HHmmss')}_${format(dateTimeRange.to, 'yyyyMMdd_HHmmss')}.json`
    link.href = url
    link.click()
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-bold mb-4">Data Export</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sensorSelect">Select Sensor</Label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger id="sensorSelect">
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Select Date and Time Range</Label>
              <DateTimeRangePicker dateTimeRange={dateTimeRange} setDateTimeRange={setDateTimeRange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="timeScaleSelect">Select Time Scale</Label>
              <Select value={timeScale} onValueChange={setTimeScale}>
                <SelectTrigger id="timeScaleSelect">
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
            </div>
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Fetch Data'}
            </Button>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="rawData">Raw Data Preview</Label>
              <div className="h-[400px] overflow-auto border rounded-md p-2">
                <pre className="text-sm">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
            </div>
            <Button onClick={handleExport} disabled={rawData.length === 0}>Export Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RawDataPage

