'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Settings, RefreshCw } from 'lucide-react'
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "./ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { JsonEditor } from './JsonEditor'
import { useToast } from "../hooks/use-toast"

interface GraphWidgetProps {
  title: string
  initialData: any[]
}

export default function GraphWidget({ title, initialData }: GraphWidgetProps) {
  const [data, setData] = useState(initialData)
  const [timeRange, setTimeRange] = useState('1h')
  const [sourcePin, setSourcePin] = useState('A0')
  const [dataType, setDataType] = useState('analog')
  const [scanFrequency, setScanFrequency] = useState('1')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleDataUpdate = (newData: any[]) => {
    setData(newData)
    showUpdateNotification()
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // Here you would typically fetch new data based on the selected time range
    // For this example, we'll just update the x-axis labels
    const newData = data.map((item, index) => ({
      ...item,
      name: `${index * parseInt(value)}${value.slice(-1)}`,
    }))
    setData(newData)
    showUpdateNotification()
  }

  const handleSettingChange = () => {
    showUpdateNotification()
  }

  const showUpdateNotification = () => {
    toast({
      title: "Graph Updated",
      description: "The graph settings have been updated.",
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data fetching
    setTimeout(() => {
      const newData = data.map(item => ({
        ...item,
        value: Math.random() * 100
      }))
      setData(newData)
      setIsRefreshing(false)
    }, 2000)
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
                <Label htmlFor="timeRange" className="text-right">
                  Time Range
                </Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                    <SelectItem value="10m">10 minutes</SelectItem>
                    <SelectItem value="15m">15 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="12h">12 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sourcePin" className="text-right">
                  Source Pin
                </Label>
                <Input
                  id="sourcePin"
                  value={sourcePin}
                  onChange={(e) => {
                    setSourcePin(e.target.value)
                    handleSettingChange()
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataType" className="text-right">
                  Data Type
                </Label>
                <Select 
                  value={dataType} 
                  onValueChange={(value) => {
                    setDataType(value)
                    handleSettingChange()
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analog">Analog</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <JsonEditor initialData={data} onUpdate={handleDataUpdate} /> */}
            <SheetClose asChild>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
        {isRefreshing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  )
}

