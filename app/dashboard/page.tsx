'use client'

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import GraphWidget from '../../components/GraphWidget'
import VideoWidget from '../../components/VideoWidget'
import { Button } from '../../components/ui/button'
import { GripHorizontal, Moon, Sun } from 'lucide-react'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DashboardProps {
  theme: string;
  toggleTheme: () => void;
}

const Dashboard = ({ theme, toggleTheme }: DashboardProps) => {
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'video', x: 0, y: 0, w: 12, h: 4, minH: 4 },
      { i: 'temperature', x: 0, y: 4, w: 6, h: 3, minH: 3 },
      { i: 'humidity', x: 6, y: 4, w: 6, h: 3, minH: 3 },
      { i: 'methane', x: 0, y: 7, w: 6, h: 3, minH: 3 },
      { i: 'atmosphericPressure', x: 6, y: 7, w: 6, h: 3, minH: 3 },
      { i: 'light', x: 0, y: 10, w: 6, h: 3, minH: 3 },
    ],
    md: [
      { i: 'video', x: 0, y: 0, w: 10, h: 4, minH: 4 },
      { i: 'temperature', x: 0, y: 4, w: 5, h: 3, minH: 3 },
      { i: 'humidity', x: 5, y: 4, w: 5, h: 3, minH: 3 },
      { i: 'methane', x: 0, y: 7, w: 5, h: 3, minH: 3 },
      { i: 'atmosphericPressure', x: 5, y: 7, w: 5, h: 3, minH: 3 },
      { i: 'light', x: 0, y: 10, w: 5, h: 3, minH: 3 },
    ]
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Processed Data</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'bg-primary text-primary-foreground' : ''}
          >
            <GripHorizontal className="mr-2 h-4 w-4" />
            {isEditing ? 'Save Layout' : 'Edit Layout'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'light' ?
              <Moon className="h-[1.2rem] w-[1.2rem]" /> :
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            }
          </Button>
        </div>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isResizable={isEditing}
        isDraggable={isEditing}
        useCSSTransforms={true}
      >
        <div key="video" className={`rounded-lg shadow-lg overflow-hidden ${isEditing ? 'cursor-move' : ''}`}>
          <VideoWidget />
        </div>
        <div key="temperature" className={`rounded-lg shadow-lg overflow-hidden p-4 ${isEditing ? 'cursor-move' : ''}`}>
          <GraphWidget title="Temperature Readings" sensorType="temperature" />
        </div>
        <div key="humidity" className={`rounded-lg shadow-lg overflow-hidden p-4 ${isEditing ? 'cursor-move' : ''}`}>
          <GraphWidget title="Humidity Readings" sensorType="humidity" />
        </div>
        <div key="methane" className={`rounded-lg shadow-lg overflow-hidden p-4 ${isEditing ? 'cursor-move' : ''}`}>
          <GraphWidget title="Methane Levels" sensorType="methane" />
        </div>
        <div key="atmosphericPressure" className={`rounded-lg shadow-lg overflow-hidden p-4 ${isEditing ? 'cursor-move' : ''}`}>
          <GraphWidget title="Atmospheric Pressure" sensorType="atmosphericPressure" />
        </div>
        <div key="light" className={`rounded-lg shadow-lg overflow-hidden p-4 ${isEditing ? 'cursor-move' : ''}`}>
          <GraphWidget title="Light Levels" sensorType="light" />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

export default Dashboard

