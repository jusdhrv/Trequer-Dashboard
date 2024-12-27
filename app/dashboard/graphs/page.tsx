'use client'

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import GraphWidget from '../../../components/GraphWidget'

const ResponsiveGridLayout = WidthProvider(Responsive)

const initialData = [
  [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 35 },
    { name: 'Mar', value: 40 },
    { name: 'Apr', value: 38 },
    { name: 'May', value: 42 },
    { name: 'Jun', value: 45 },
  ],
  [
    { name: 'Jan', value: 0.1 },
    { name: 'Feb', value: 0.12 },
    { name: 'Mar', value: 0.11 },
    { name: 'Apr', value: 0.13 },
    { name: 'May', value: 0.14 },
    { name: 'Jun', value: 0.12 },
  ],
  [
    { name: 'Jan', value: 1000 },
    { name: 'Feb', value: 1010 },
    { name: 'Mar', value: 1005 },
    { name: 'Apr', value: 1015 },
    { name: 'May', value: 1020 },
    { name: 'Jun', value: 1018 },
  ],
  [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 420 },
    { name: 'Mar', value: 410 },
    { name: 'Apr', value: 430 },
    { name: 'May', value: 425 },
    { name: 'Jun', value: 415 },
  ],
]

const GraphsPage = () => {
  const [mounted, setMounted] = useState(false)
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'graph1', x: 0, y: 0, w: 6, h: 2 },
      { i: 'graph2', x: 6, y: 0, w: 6, h: 2 },
      { i: 'graph3', x: 0, y: 2, w: 6, h: 2 },
      { i: 'graph4', x: 6, y: 2, w: 6, h: 2 },
    ],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts)
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
          <GraphWidget title="Temperature Readings" initialData={initialData[0]} />
        </div>
        <div key="graph2">
          <GraphWidget title="Radiation Levels" initialData={initialData[1]} />
        </div>
        <div key="graph3">
          <GraphWidget title="Atmospheric Pressure" initialData={initialData[2]} />
        </div>
        <div key="graph4">
          <GraphWidget title="Solar Wind Speed" initialData={initialData[3]} />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

export default GraphsPage

