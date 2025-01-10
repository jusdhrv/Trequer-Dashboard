'use client'

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import GraphWidget from '../../../components/GraphWidget'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface GridLayout extends Layout {
  i: string
  x: number
  y: number
  w: number
  h: number
}

const initialLayouts: { [key: string]: GridLayout[] } = {
  lg: [
    { i: 'graph1', x: 0, y: 0, w: 6, h: 2 },
    { i: 'graph2', x: 6, y: 0, w: 6, h: 2 },
    { i: 'graph3', x: 0, y: 2, w: 6, h: 2 },
    { i: 'graph4', x: 6, y: 2, w: 6, h: 2 },
  ],
}

const GraphsPage = () => {
  const [mounted, setMounted] = useState(false)
  const [layouts, setLayouts] = useState<Layouts>(initialLayouts)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts)
  }

  if (!mounted) return null

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Graphs Dashboard</h1>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isResizable={true}
        isDraggable={true}
      >
        <div key="graph1">
          <GraphWidget title="Temperature Readings" sensorType="temperature" />
        </div>
        <div key="graph2">
          <GraphWidget title="Radiation Levels" sensorType="radiation" />
        </div>
        <div key="graph3">
          <GraphWidget title="Atmospheric Pressure" sensorType="atmosphericPressure" />
        </div>
        <div key="graph4">
          <GraphWidget title="Solar Wind Speed" sensorType="solarWind" />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

export default GraphsPage

