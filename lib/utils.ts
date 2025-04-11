import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Reading {
  timestamp: string;
  value: number;
  sensor_id: string;
}

export function processReadings(
  readings: Reading[],
  selectedSensor: string,
  timeRange: string
) {
  // Filter readings for the selected sensor
  const sensorReadings = readings.filter(
    (reading) => reading.sensor_id === selectedSensor
  );

  // Sort readings by timestamp
  const sortedReadings = sensorReadings.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate time window based on timeRange
  const now = new Date();
  let startTime: Date;

  switch (timeRange) {
    case "1h":
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "6h":
      startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case "12h":
      startTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      break;
    case "1d":
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 60 * 60 * 1000); // Default to 1 hour
  }

  // Filter readings within the time window
  const filteredReadings = sortedReadings.filter(
    (reading) => new Date(reading.timestamp) >= startTime
  );

  // Format data for the chart
  return filteredReadings.map((reading) => ({
    timestamp: reading.timestamp,
    value: reading.value,
  }));
}
