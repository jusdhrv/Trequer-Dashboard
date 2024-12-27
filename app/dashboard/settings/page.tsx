'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { RefreshCw } from 'lucide-react'
import { useToast } from "../../../hooks/use-toast"

export default function SettingsPage() {
  const [user, setUser] = useState({ username: '', email: '' })
  const [instruments, setInstruments] = useState([
    { id: 'temp', name: 'Temperature Sensor', calibration: '0' },
    { id: 'pressure', name: 'Pressure Sensor', calibration: '0' },
    { id: 'radiation', name: 'Radiation Detector', calibration: '0' },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser({ username: storedUser.username || '', email: '' })
  }, [])

  const handleUserUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "User Settings Updated",
        description: "Your user settings have been successfully updated.",
      })
    }, 2000)
  }

  const handleInstrumentUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Instrument Settings Updated",
        description: "Your instrument settings have been successfully updated.",
      })
    }, 2000)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user">User Settings</TabsTrigger>
          <TabsTrigger value="instruments">Instrument Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={isRefreshing}>
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update User Settings'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="instruments">
          <Card>
            <CardHeader>
              <CardTitle>Instrument Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInstrumentUpdate} className="space-y-4">
                {instruments.map((instrument) => (
                  <div key={instrument.id} className="space-y-2">
                    <Label htmlFor={instrument.id}>{instrument.name} Calibration</Label>
                    <Input
                      id={instrument.id}
                      type="number"
                      value={instrument.calibration}
                      onChange={(e) => {
                        const updatedInstruments = instruments.map(i =>
                          i.id === instrument.id ? { ...i, calibration: e.target.value } : i
                        )
                        setInstruments(updatedInstruments)
                      }}
                    />
                  </div>
                ))}
                <Button type="submit" disabled={isRefreshing}>
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Instrument Settings'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

