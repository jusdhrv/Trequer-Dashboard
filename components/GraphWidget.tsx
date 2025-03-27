"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Settings2, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SensorConfig } from "../lib/supabase";
import { toast } from "./ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { processReadings } from "../lib/utils";

interface GraphWidgetProps {
  title: string;
  sensorType: string;
}

export default function GraphWidget({ title, sensorType }: GraphWidgetProps) {
  const [selectedSensor, setSelectedSensor] = useState(sensorType);
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("1h");
  const [isSettingsChanged, setIsSettingsChanged] = useState(false);
  const [pollingInterval, setPollingInterval] = useState("30s");

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    fetchData();

    // Set up polling based on selected interval
    const intervalMs =
      pollingInterval === "10s"
        ? 10000
        : pollingInterval === "30s"
        ? 30000
        : pollingInterval === "1m"
        ? 60000
        : pollingInterval === "5m"
        ? 300000
        : 30000; // default to 30s

    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [timeRange, selectedSensor, pollingInterval]);

  const fetchSensors = async () => {
    try {
      // console.log('Fetching sensor configurations...')
      const response = await fetch("/api/sensors/config");
      const data = await response.json();

      // console.log('Received sensor configs:', data)

      if (data.configs) {
        // Filter enabled sensors and set state
        const enabledSensors = data.configs.filter(
          (config: SensorConfig) => config.is_enabled
        );
        // console.log('Enabled sensors:', enabledSensors)
        setSensors(enabledSensors);
      }
    } catch (error) {
      console.error("Error fetching sensors:", error);
      toast({
        title: "Error",
        description: "Failed to load sensor configurations",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    try {
      // console.log(`Fetching data for sensor ${selectedSensor} with timeRange ${timeRange}`)
      setIsSettingsChanged(true);
      const response = await fetch(`/api/sensors?timeRange=${timeRange}`);
      const result = await response.json();

      // console.log('Received sensor readings:', result)

      if (result.readings) {
        const processedData = processReadings(
          result.readings,
          selectedSensor,
          timeRange
        );
        // console.log('Processed data:', processedData)
        if (processedData.length > 0) {
          setData(processedData);
        } else {
          // console.log('No data available for the selected sensor and time range')
        }
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sensor data",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsSettingsChanged(false), 1000);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    // console.log('Changing time range to:', value)
    setTimeRange(value);
  };

  const handleSensorChange = (value: string) => {
    // console.log('Changing selected sensor to:', value)
    setSelectedSensor(value);
  };

  const handlePollingChange = (value: string) => {
    // console.log('Changing polling interval to:', value)
    setPollingInterval(value);
  };

  const handleRefresh = () => {
    // console.log('Manually refreshing data')
    fetchData();
  };

  const getYAxisDomain = () => {
    if (data.length === 0) return [0, 100];
    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    // Set min to 0 and max to next integer after current max
    return [0, Math.ceil(maxValue)];
  };

  const formatYAxisTick = (value: number) => {
    return value.toFixed(2);
  };

  const formatTooltipTime = (index: number) => {
    const item = data[index];
    if (!item || !item.timestamp) return "";
    // Show relative time from start
    const startTime = new Date(data[0].timestamp).getTime();
    const currentTime = new Date(item.timestamp).getTime();
    const diffMinutes = Math.floor((currentTime - startTime) / 60000);
    return `${diffMinutes} min`;
  };

  const formatXAxisTick = (index: number) => {
    if (index >= data.length || index !== 0) return "";
    // Only show time range at origin
    return timeRange
      .replace("min", " min")
      .replace("h", " hour")
      .replace("d", " days");
  };

  const getSensorName = () => {
    const sensor = sensors.find((sensor) => sensor.id === selectedSensor);
    return sensor ? sensor.name : title;
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{getSensorName()}</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute middle-1 right-1 bg-background/50 hover:bg-background/80"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Graph Settings</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inputSource">Input Source</Label>
                <Select
                  value={selectedSensor}
                  onValueChange={handleSensorChange}
                >
                  <SelectTrigger id="inputSource">
                    <SelectValue placeholder="Select input source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name} ({sensor.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger id="timeRange">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1min">1 minute</SelectItem>
                    <SelectItem value="5min">5 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="14d">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pollingInterval">Refresh Every</Label>
                <Select
                  value={pollingInterval}
                  onValueChange={handlePollingChange}
                >
                  <SelectTrigger id="pollingInterval">
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10 seconds</SelectItem>
                    <SelectItem value="30s">30 seconds</SelectItem>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetClose asChild>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-[400px] relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground))"
              />
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, data.length - 1]}
                tickFormatter={formatXAxisTick}
                interval={0}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                domain={getYAxisDomain()}
                tickFormatter={formatYAxisTick}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip
                labelFormatter={formatTooltipTime}
                formatter={(value: number) => [value.toFixed(2), title]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                isAnimationActive={false}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
