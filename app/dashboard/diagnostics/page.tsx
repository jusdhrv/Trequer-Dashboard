"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "../../../components/ui/button";

const timeRanges = [
  { value: "1h", label: "Last Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "14d", label: "Last 14 Days" },
];

interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static: boolean;
}

// Default layout for the graphs
const defaultLayout: Layout[] = [
  { i: "uptime", x: 0, y: 0, w: 12, h: 2, static: false },
  { i: "cpu-usage", x: 0, y: 2, w: 6, h: 4, static: false },
  { i: "cpu-temp", x: 6, y: 2, w: 6, h: 4, static: false },
  { i: "memory", x: 0, y: 6, w: 6, h: 4, static: false },
  { i: "disk", x: 6, y: 6, w: 6, h: 4, static: false },
  { i: "network", x: 0, y: 10, w: 12, h: 4, static: false },
];

export default function DiagnosticsPage() {
  const [timeRange, setTimeRange] = useState("1h");
  const [layout, setLayout] = useState<Layout[]>(defaultLayout);
  const [diagnosticData, setDiagnosticData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth - 300 - 64 : 1200 // Subtract sidebar (300px) and padding (32px * 2)
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 300 - 64); // Subtract sidebar (300px) and padding (32px * 2)
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    fetchDiagnosticData();
    const interval = setInterval(fetchDiagnosticData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDiagnosticData = async () => {
    try {
      const response = await fetch(`/api/diagnostics?timeRange=${timeRange}`);
      const data = await response.json();
      setDiagnosticData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching diagnostic data:", error);
      setIsLoading(false);
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    if (isEditing) {
      setLayout(newLayout);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="timeRange">Time Range</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant={isEditing ? "destructive" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Done" : "Edit Layout"}
        </Button>
      </div>

      <div className="w-full">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={50}
          width={width}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditing}
          isResizable={false}
          margin={[16, 16]}
        >
          <div key="uptime">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>System Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {diagnosticData.length > 0
                    ? formatUptime(
                        diagnosticData[diagnosticData.length - 1].system_uptime
                      )
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div key="cpu-usage">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diagnosticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cpu_usage"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div key="cpu-temp">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>CPU Temperature</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diagnosticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cpu_temperature"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div key="memory">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diagnosticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="memory_usage"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div key="disk">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diagnosticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="disk_usage"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div key="network">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Network Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diagnosticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="network_usage"
                      stroke="#0088fe"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </GridLayout>
      </div>
    </div>
  );
}
