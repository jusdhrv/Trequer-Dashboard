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

export function processReadings(readings: any[], sensorId: string, timeRange: string) {
  console.log('Processing readings for sensor:', sensorId, 'with data:', readings);
  const processed = readings
    .filter(reading => reading[sensorId] !== undefined)
    .map((reading, index) => ({
      timestamp: reading.timestamp,
      value: Number(reading[sensorId]),
      index,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  console.log('Processed readings:', processed);
  return processed;
}
