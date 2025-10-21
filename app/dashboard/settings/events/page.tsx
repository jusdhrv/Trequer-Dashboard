"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { toast } from "../../../../components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";

export default function EventSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("event_settings").select("*");

      if (error) throw error;

      const settingsMap = data.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load event detection settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from("event_settings")
        .update({ value })
        .eq("key", key);

      if (error) throw error;

      setSettings((prev: any) => ({
        ...prev,
        [key]: value,
      }));

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Event Detection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Pro Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable advanced event detection settings
                </p>
              </div>
              <Switch
                checked={settings?.pro_mode_enabled?.enabled || false}
                onCheckedChange={(checked) =>
                  updateSetting("pro_mode_enabled", { enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Standard Deviation Threshold</Label>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={settings?.std_deviation_threshold?.value || 2}
                onChange={(e) =>
                  updateSetting("std_deviation_threshold", {
                    value: parseFloat(e.target.value),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Values outside this many standard deviations from the mean will
                be marked as events
              </p>
            </div>

            <div className="space-y-2">
              <Label>Scan Interval</Label>
              <Select
                value={`${settings?.scan_interval?.hours || 12}`}
                onValueChange={(value) =>
                  updateSetting("scan_interval", { hours: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scan interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every hour</SelectItem>
                  <SelectItem value="3">Every 3 hours</SelectItem>
                  <SelectItem value="6">Every 6 hours</SelectItem>
                  <SelectItem value="12">Every 12 hours</SelectItem>
                  <SelectItem value="24">Every 24 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How often to scan for events
              </p>
            </div>

            <div className="space-y-2">
              <Label>Detection Window</Label>
              <Select
                value={`${settings?.detection_window?.hours || 12}`}
                onValueChange={(value) =>
                  updateSetting("detection_window", { hours: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select detection window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">72 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Time window to analyze for events
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Event Duration</Label>
              <Select
                value={`${settings?.min_event_duration?.minutes || 4}`}
                onValueChange={(value) =>
                  updateSetting("min_event_duration", {
                    minutes: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="4">4 minutes</SelectItem>
                  <SelectItem value="8">8 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Minimum duration to consider as an event
              </p>
            </div>

            <div className="space-y-2">
              <Label>Maximum Event Duration</Label>
              <Select
                value={`${settings?.max_event_duration?.hours || 24}`}
                onValueChange={(value) =>
                  updateSetting("max_event_duration", {
                    hours: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">72 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Maximum duration to consider as a single event
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
