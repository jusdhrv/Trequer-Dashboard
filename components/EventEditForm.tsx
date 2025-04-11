import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface EventEditFormProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: any) => void;
}

export default function EventEditForm({
  event,
  isOpen,
  onClose,
  onSave,
}: EventEditFormProps) {
  const [formData, setFormData] = useState({
    sensor_id: event.sensor_id,
    start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
    event_type: event.event_type,
    category: event.category,
    notes: event.notes || "",
  });
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const { data, error } = await supabase
        .from("sensor_configs")
        .select("*")
        .order("name");

      if (error) throw error;
      setSensors(data || []);
    } catch (error) {
      console.error("Error fetching sensors:", error);
      toast({
        title: "Error",
        description: "Failed to load sensors",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if time period was modified
      const timeChanged =
        formData.start_time !==
          format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm") ||
        formData.end_time !==
          format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm");

      // If time changed, force event_type to 'Edited'
      const updatedEvent = {
        ...formData,
        event_type: timeChanged ? "Edited" : formData.event_type,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("sensor_events")
        .update(updatedEvent)
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      onSave(updatedEvent);
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sensor">Sensor</Label>
            <Select
              value={formData.sensor_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, sensor_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sensor" />
              </SelectTrigger>
              <SelectContent>
                {sensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id}>
                    {sensor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Threat">Threat</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="False_Alarm">False Alarm</SelectItem>
                <SelectItem value="Unclassified">Unclassified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
