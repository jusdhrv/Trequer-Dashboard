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
  { id: 'temp', name: 'Temperature' },
  { id: 'pressure', name: 'Pressure' },
  { id: 'radiation', name: 'Radiation' },
  { id: 'solarWind', name: 'Solar Wind Speed' },
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

  useEffect(() => {
    fetchData()
  }, [selectedSensor, dateTimeRange, timeScale])

  const fetchData = () => {
    // This is where you would typically fetch the raw data from your data source
    // For this example, we'll just generate some dummy data
    const newData = []
    let currentDate = new Date(dateTimeRange.from)
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

    const steps = Math.min(1000, Math.floor(totalSeconds / interval)) // Limit to 1000 data points max

    for (let i = 0; i <= steps; i++) {
      newData.push({
        timestamp: currentDate.toISOString(),
        [selectedSensor]: Math.random() * 100
      })
      currentDate = addSeconds(currentDate, interval)
    }
    setRawData(newData)
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
            <h1 className="text-2xl font-bold mb-4">Data Access</h1>
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
            <Button onClick={fetchData}>Fetch Data</Button>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="rawData">Raw Data</Label>
              <div className="h-[400px] overflow-auto border rounded-md p-2">
                <pre className="text-sm">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
            </div>
            <Button onClick={handleExport}>Export Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RawDataPage

