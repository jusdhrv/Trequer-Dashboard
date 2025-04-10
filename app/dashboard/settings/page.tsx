"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Settings, Database, Cpu, AlertTriangle } from "lucide-react";
import SensorSettings from "./sensors/page";
import DataSettings from "./data/page";
import EventSettings from "./events/page";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="sensors" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Sensors
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Events
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    General settings will be added here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sensors">
              <SensorSettings />
            </TabsContent>
            <TabsContent value="data">
              <DataSettings />
            </TabsContent>
            <TabsContent value="events">
              <EventSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
