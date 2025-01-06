'use client'

import { useState, useEffect } from 'react'
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import GraphWidget from "../../components/GraphWidget"
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
      const response = await fetch('/api/sensors/config')
      const data = await response.json()
      if (data.configs) {
        setSensorConfigs(data.configs)
        // Initialize graphs for each enabled sensor
        setGraphs(data.configs
          .filter(config => config.isEnabled)
          .map(config => ({
            id: `graph_${config.id}`,
            sensorType: config.id
          }))
        )
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching sensor configs:', error)
      toast({
        title: "Error",
        description: "Failed to load sensor configurations",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAddGraph = () => {
    const enabledSensors = sensorConfigs.filter(config => config.isEnabled)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            {isEditing ? 'Done' : 'Edit Layout'}
          </Button>
          <Button onClick={handleAddGraph}>
            <Plus className="mr-2 h-4 w-4" />
            New Graph
          </Button>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Video Card */}
              <Card className="p-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Video Feed</span>
                </div>
              </Card>
              {/* Graph Cards */}
              {graphs.map((graph, index) => {
                const sensor = sensorConfigs.find(s => s.id === graph.sensorType)
                if (!sensor) return null

                return (
                  <Draggable
                    key={graph.id}
                    draggableId={graph.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card className="p-4 relative">
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-6 right-6 z-10 bg-background/50 hover:bg-background/80"
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
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

