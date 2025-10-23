'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchSensorConfigs()
  }, [])

  const fetchSensorConfigs = async () => {
    try {
      // console.log('Fetching sensor configurations...')
      const response = await fetch('/api/sensors/config')
      const data = await response.json()

      // console.log('API Response:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.configs) {
        // console.log('Received sensor configs:', data.configs)
        setSensorConfigs(data.configs)

        // Initialize graphs for each enabled sensor
        const enabledGraphs = data.configs
          .filter((config: SensorConfig) => config.is_enabled)
          .map((config: SensorConfig) => ({
            id: `graph_${config.id}`,
            sensorType: config.id
          }))

        // console.log('Setting up graphs for enabled sensors:', enabledGraphs)
        setGraphs(enabledGraphs)
      } else {
        // console.log('No sensor configs found in response:', data)
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

    // console.log('Adding new graph:', newGraph)
    setGraphs(prev => [...prev, newGraph])
  }

  const handleDeleteGraph = (graphId: string) => {
    // console.log('Deleting graph:', graphId)
    setGraphs(prev => prev.filter(graph => graph.id !== graphId))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(graphs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // console.log('Reordering graphs:', items)
    setGraphs(items)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Video Card */}
        <VideoWidget />

        {/* Graph Cards */}
        {graphs.map((graph, index) => {
          const sensor = sensorConfigs.find(s => s.id === graph.sensorType)
          if (!sensor) {
            // console.log('Could not find sensor config for graph:', graph)
            return null
          }

          return (
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
              <GraphWidget
                title={`${sensor.name} (${sensor.unit})`}
                sensorType={sensor.id}
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}