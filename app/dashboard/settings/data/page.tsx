"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { toast } from "../../../../components/ui/use-toast";

const retentionPeriods = [
  { value: "12h", label: "12 Hours", hours: 12 },
  { value: "24h", label: "1 Day", hours: 24 },
  { value: "48h", label: "2 Days", hours: 48 },
  { value: "72h", label: "3 Days", hours: 72 },
  { value: "168h", label: "7 Days", hours: 168 },
  { value: "336h", label: "14 Days", hours: 336 },
];

export default function DataSettingsPage() {
  // Current saved values
  const [sensorRetentionPeriod, setSensorRetentionPeriod] = useState<
    string | null
  >(null);
  const [diagnosticRetentionPeriod, setDiagnosticRetentionPeriod] = useState<
    string | null
  >(null);

  // Selected values (not yet saved)
  const [selectedSensorPeriod, setSelectedSensorPeriod] = useState<
    string | null
  >(null);
  const [selectedDiagnosticPeriod, setSelectedDiagnosticPeriod] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/data");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Convert hours to period format (e.g., 168 -> "168h")
      if (typeof data.sensorRetentionHours === "number") {
        const sensorPeriod = `${data.sensorRetentionHours}h`;
        setSensorRetentionPeriod(sensorPeriod);
        setSelectedSensorPeriod(sensorPeriod);
      }
      if (typeof data.diagnosticRetentionHours === "number") {
        const diagnosticPeriod = `${data.diagnosticRetentionHours}h`;
        setDiagnosticRetentionPeriod(diagnosticPeriod);
        setSelectedDiagnosticPeriod(diagnosticPeriod);
      }
    } catch (error) {
      console.error("Error fetching data settings:", error);
      toast({
        title: "Error",
        description: "Failed to load data settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: "sensor" | "diagnostic") => {
    try {
      const value =
        type === "sensor" ? selectedSensorPeriod : selectedDiagnosticPeriod;
      if (!value) return;

      // Convert period format to hours (e.g., "168h" -> 168)
      const hours = parseInt(value.replace("h", ""));

      console.log("Saving retention period:", { type, hours, value });

      const response = await fetch("/api/settings/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          hours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to update ${type} retention period`
        );
      }

      if (data.success) {
        if (type === "sensor") {
          setSensorRetentionPeriod(value);
        } else {
          setDiagnosticRetentionPeriod(value);
        }
        toast({
          title: "Success",
          description: `${
            type === "sensor" ? "Sensor" : "Diagnostic"
          } data retention period updated`,
        });
        console.log("Successfully saved retention period:", {
          type,
          hours,
          value,
        });
      } else {
        throw new Error(
          data.error || `Failed to update ${type} retention period`
        );
      }
    } catch (error) {
      console.error("Error updating retention period:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to update ${type} data retention period`,
        variant: "destructive",
      });
      // Reset selected value to saved value on error
      if (type === "sensor") {
        setSelectedSensorPeriod(sensorRetentionPeriod);
      } else {
        setSelectedDiagnosticPeriod(diagnosticRetentionPeriod);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sensorRetentionPeriod === null || diagnosticRetentionPeriod === null) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  const sensorHasChanges = selectedSensorPeriod !== sensorRetentionPeriod;
  const diagnosticHasChanges =
    selectedDiagnosticPeriod !== diagnosticRetentionPeriod;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="sensorRetentionPeriod">Retention Period</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedSensorPeriod ?? undefined}
                    onValueChange={setSelectedSensorPeriod}
                  >
                    <SelectTrigger id="sensorRetentionPeriod">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      {retentionPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleSave("sensor")}
                  disabled={!sensorHasChanges}
                >
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Sensor readings older than this period will be automatically
                deleted. This helps manage storage space and improve application
                performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Data Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosticRetentionPeriod">
                Retention Period
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedDiagnosticPeriod ?? undefined}
                    onValueChange={setSelectedDiagnosticPeriod}
                  >
                    <SelectTrigger id="diagnosticRetentionPeriod">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      {retentionPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleSave("diagnostic")}
                  disabled={!diagnosticHasChanges}
                >
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Diagnostic readings older than this period will be automatically
                deleted. This helps manage storage space and improve application
                performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
