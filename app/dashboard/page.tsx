'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import GraphWidget from "../../components/GraphWidget"
import VideoWidget from "../../components/VideoWidget"
import { Plus, Pencil, X } from 'lucide-react'
import { SensorConfig } from '../../lib/sensor-config'
import { toast } from '../../components/ui/use-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function DashboardPage() {
  const [sensorConfigs, setSensorConfigs] = useState<SensorConfig[]>([])
  const [graphs, setGraphs] = useState<Array<{ id: string; sensorType: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 })
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSensorConfigs()
    updateScreenDimensions()

    const handleResize = () => updateScreenDimensions()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateScreenDimensions = () => {
    if (dashboardRef.current) {
      const rect = dashboardRef.current.getBoundingClientRect()
      setScreenDimensions({
        width: rect.width,
        height: rect.height
      })
    }
  }

  const fetchSensorConfigs = async () => {
    try {
      const response = await fetch('/api/sensors/config')
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.configs) {
        setSensorConfigs(data.configs)

        const enabledGraphs = data.configs
          .filter((config: SensorConfig) => config.is_enabled)
          .map((config: SensorConfig) => ({
            id: `graph_${config.id}`,
            sensorType: config.id
          }))

        setGraphs(enabledGraphs)
      } else {
        toast({
          title: "Warning",
          description: "No sensor configurations found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching sensor configs:', error)
      toast({
        title: "Error",
        description: "Failed to load sensor configurations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGraph = () => {
    const enabledSensors = sensorConfigs.filter((config: SensorConfig) => config.is_enabled)
    if (enabledSensors.length === 0) {
      toast({
        title: "Error",
        description: "No enabled sensors available",
        variant: "destructive",
      })
      return
    }

    const newGraph = {
      id: `graph_${Date.now()}`,
      sensorType: enabledSensors[0].id
    }

    setGraphs(prev => [...prev, newGraph])
  }

  const handleDeleteGraph = (graphId: string) => {
    setGraphs(prev => prev.filter(graph => graph.id !== graphId))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(graphs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setGraphs(items)
  }

  // Calculate optimal card dimensions
  const calculateCardDimensions = () => {
    const { width, height } = screenDimensions
    const headerHeight = 120 // Approximate header height
    const padding = 32 // Total padding
    const gap = 24 // Gap between cards

    const availableHeight = height - headerHeight - padding
    const availableWidth = width - padding

    // Calculate grid layout
    const totalCards = graphs.length + 1 // +1 for video widget
    const cols = Math.ceil(Math.sqrt(totalCards))
    const rows = Math.ceil(totalCards / cols)

    // Calculate card dimensions
    const cardWidth = Math.floor((availableWidth - (gap * (cols - 1))) / cols)
    const cardHeight = Math.floor((availableHeight - (gap * (rows - 1))) / rows)

    return {
      // Give each card a minimum width and height in a 16x10 ratio
      cardWidth: Math.max(cardWidth, 320), // Minimum width
      cardHeight: Math.max(cardHeight, 200), // Minimum height
      cols,
      rows
    }
  }

  const { cardWidth, cardHeight, cols } = calculateCardDimensions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div
      ref={dashboardRef}
      className="h-screen w-full p-4 overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="w-full sm:w-auto"
            aria-label={isEditing ? 'Finish editing layout' : 'Edit dashboard layout'}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isEditing ? 'Done' : 'Edit Layout'}
          </Button>
          <Button
            onClick={handleAddGraph}
            className="w-full sm:w-auto"
            aria-label="Add new graph to dashboard"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Graph
          </Button>
        </div>
      </div>

      {/* Dynamic Grid */}
      <div
        className="grid gap-6 overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          height: `calc(100vh - 120px)`,
          gridAutoRows: 'minmax(200px, 1fr)'
        }}
      >
        {/* Video Card */}
        <div
          className="relative"
          style={{
            minHeight: cardHeight,
            minWidth: cardWidth
          }}
        >
          <Card className="h-full">
            <VideoWidget />
          </Card>
        </div>

        {/* Graph Cards */}
        {graphs.map((graph, index) => {
          const sensor = sensorConfigs.find(s => s.id === graph.sensorType)
          if (!sensor) {
            // console.log('Could not find sensor config for graph:', graph)
            return null
          }

          return (
            <div
              className="relative"
              style={{
                minHeight: cardHeight,
                minWidth: cardWidth
              }}
            >
              <Card key={graph.id} className="p-4 relative">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 z-10 bg-background/50 hover:bg-background/80"
                    onClick={() => handleDeleteGraph(graph.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div style={{ height: cardHeight - 32 }}>
                  <GraphWidget
                    title={`${sensor.name} (${sensor.unit})`}
                    sensorType={sensor.id}
                  />
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}