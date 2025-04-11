import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEventData();
  }, [event.id]);

  const fetchEventData = async () => {
    try {
      // Fetch data for 5 minutes before and after the event
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);
      const queryStartTime = new Date(startTime.getTime() - 5 * 60000);
      const queryEndTime = new Date(endTime.getTime() + 5 * 60000);

      const { data: readings, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("sensor_id", event.sensor_id)
        .gte("timestamp", queryStartTime.toISOString())
        .lte("timestamp", queryEndTime.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;

      setData(readings || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast({
        title: "Error",
        description: "Failed to load event data",
        variant: "destructive",
      });
    }
  };

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

  const formatYAxisTick = (value: number) => {
    return value.toFixed(2);
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

        <div className="h-[200px] mt-4">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) =>
                    format(new Date(timestamp), "HH:mm:ss")
                  }
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  labelFormatter={(timestamp) =>
                    format(new Date(timestamp), "HH:mm:ss")
                  }
                  formatter={(value: number) => [value.toFixed(2), "Value"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  dot={false}
                  strokeWidth={2}
                />
                <ReferenceArea
                  x1={event.start_time}
                  x2={event.end_time}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeOpacity={0.5}
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
