"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEvents();
  }, [readFilter, categoryFilter]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("sensor_events")
        .select("*, sensor_configs(name)")
        .order("start_time", { ascending: false });

      if (readFilter === "unread") {
        query = query.eq("is_read", false);
      } else if (readFilter === "read") {
        query = query.eq("is_read", true);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("sensor_events")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;

      // Update local state
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? { ...event, is_read: true, read_at: new Date().toISOString() }
            : event
        )
      );
    } catch (error) {
      console.error("Error marking event as read:", error);
      toast({
        title: "Error",
        description: "Failed to update event status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateEventCategory = async (eventId: string, category: string) => {
    try {
      const { error } = await supabase
        .from("sensor_events")
        .update({
          category,
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;

      // Update local state
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                category,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : event
        )
      );

      toast({
        title: "Success",
        description: `Event marked as ${category.replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event category. Please try again.",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Event Inbox</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Threat">Threats</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="False_Alarm">False Alarms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No events found
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start space-x-4 p-4 rounded-lg border transition-colors",
                      !event.is_read && "bg-muted/50"
                    )}
                    onClick={() => !event.is_read && markAsRead(event.id)}
                  >
                    <div className="mt-1">{getEventIcon(event.category)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-none">
                          {event.sensor_configs.name}
                        </p>
                        {!event.is_read && (
                          <Badge variant="default" className="bg-primary">
                            New
                          </Badge>
                        )}
                        {getEventBadge(event.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_time), "PPp")}
                      </p>
                      <p className="text-sm">{event.description}</p>
                      {event.category === "Unclassified" && (
                        <div
                          className="flex items-center space-x-2 pt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateEventCategory(event.id, "Threat")
                            }
                          >
                            Mark as Threat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateEventCategory(event.id, "Scheduled")
                            }
                          >
                            Mark as Scheduled
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateEventCategory(event.id, "False_Alarm")
                            }
                          >
                            Mark as False Alarm
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
