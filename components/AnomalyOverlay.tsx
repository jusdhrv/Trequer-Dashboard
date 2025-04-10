import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface EventOverlayProps {
  sensorId: string;
  startTime: Date;
  endTime: Date;
  chartWidth: number;
  chartHeight: number;
}

export default function EventOverlay({
  sensorId,
  startTime,
  endTime,
  chartWidth,
  chartHeight,
}: EventOverlayProps) {
  const [events, setEvents] = useState<any[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("sensor_events")
        .select("*")
        .eq("sensor_id", sensorId)
        .gte("start_time", startTime.toISOString())
        .lte("end_time", endTime.toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      setEvents(data || []);
    };

    fetchEvents();
  }, [sensorId, startTime, endTime]);

  const getEventPosition = (event: any) => {
    const totalDuration = endTime.getTime() - startTime.getTime();
    const eventStart = new Date(event.start_time).getTime();
    const xPosition =
      ((eventStart - startTime.getTime()) / totalDuration) * chartWidth;

    return {
      x: Math.max(0, Math.min(xPosition, chartWidth)),
      y: 10, // Position at top of chart
    };
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <TooltipProvider>
        {events.map((event) => {
          const pos = getEventPosition(event);
          return (
            <Tooltip key={event.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    color:
                      event.event_type === "Auto"
                        ? "yellow"
                        : event.event_type === "Edited"
                        ? "orange"
                        : "red",
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">Event Detected</p>
                  <p className="text-sm">Type: {event.event_type}</p>
                  <p className="text-sm">
                    Category: {event.category || "Uncategorized"}
                  </p>
                  {event.notes && (
                    <p className="text-sm">Notes: {event.notes}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
