import { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

interface SensorData {
  id: string;
  sensor_id: string;
  timestamp: string;
  value: number;
}

interface EventDetailsProps {
  event: {
    id: string;
    sensor_id: string;
    start_time: string;
    end_time: string;
    event_type: string;
    category: string;
    value: number;
    threshold: number;
    notes?: string;
  };
  onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setError(null);
        // Calculate padding based on event duration
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const eventDuration = endTime.getTime() - startTime.getTime();
        const paddingTime = eventDuration * 0.15; // 15% padding on each side to make event ~70% of view

        const paddedStartTime = new Date(startTime.getTime() - paddingTime);
        const paddedEndTime = new Date(endTime.getTime() + paddingTime);

        const { data: sensorData, error } = await supabase
          .from("sensor_data")
          .select("*")
          .eq("sensor_id", event.sensor_id)
          .gte("timestamp", paddedStartTime.toISOString())
          .lte("timestamp", paddedEndTime.toISOString())
          .order("timestamp", { ascending: true });

        if (error) throw error;

        if (isMounted) {
          setData(sensorData || []);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load sensor data"
          );
          toast({
            title: "Error",
            description: "Failed to load sensor data. Please try again later.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [event, supabase]);

  const getEventIcon = (category: string) => {
    switch (category) {
      case "Threat":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "Scheduled":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "False_Alarm":
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "Auto":
        return <Badge variant="secondary">Auto</Badge>;
      case "Edited":
        return <Badge variant="outline">Edited</Badge>;
      case "Manual":
        return <Badge>Manual</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load data</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="mt-1">{getEventIcon(event.category)}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Event Details</h3>
                {getEventBadge(event.event_type)}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_time), "PPp")}
              </p>
              {event.notes && <p className="text-sm mt-2">{event.notes}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="h-[300px] mt-4">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => format(new Date(time), "HH:mm:ss")}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  dot={false}
                  strokeWidth={1.5}
                />
                <ReferenceArea
                  x1={event.start_time}
                  x2={event.end_time}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeOpacity={1}
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
