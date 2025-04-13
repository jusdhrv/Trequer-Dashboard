# Update Data Purging

## Overview

This document outlines the enhancements made to the data purging functionality within the application. The changes ensure that both sensor readings and diagnostic data are purged according to their respective retention periods, improving data management and consistency.

## Changes Implemented

- **New Database Function**: A PostgreSQL function named `purge_old_data` was created to handle the purging of both sensor readings and diagnostic data. It accepts two parameters: `sensor_retention_hours` and `diagnostic_retention_hours`. It calculates cutoff dates for both sensor and diagnostic data and deletes old entries accordingly.

   ```sql
   CREATE OR REPLACE FUNCTION purge_old_data(sensor_retention_hours integer, diagnostic_retention_hours integer)
   RETURNS void AS $$
   BEGIN
       -- Calculate cutoff dates
       DECLARE
           sensor_cutoff_date timestamp := NOW() - (sensor_retention_hours * interval '1 hour');
           diagnostic_cutoff_date timestamp := NOW() - (diagnostic_retention_hours * interval '1 hour');
       BEGIN
           -- Start transaction to ensure data consistency
           START TRANSACTION;
           
           -- Delete old sensor readings and related events
           DELETE FROM sensor_readings
           WHERE timestamp < sensor_cutoff_date;
           
           DELETE FROM sensor_events
           WHERE start_time < sensor_cutoff_date;
           
           -- Delete old diagnostic readings
           DELETE FROM diagnostic_readings
           WHERE timestamp < diagnostic_cutoff_date;
           
           -- Commit transaction
           COMMIT;
       EXCEPTION WHEN OTHERS THEN
           -- Rollback on any error
           ROLLBACK;
           RAISE;
       END;
   END;
   $$ LANGUAGE plpgsql;
   ```

- **Updated `purgeOldData` Function**: The function now fetches both retention periods from the database settings and calls the new database function.

   ```javascript
   import { supabase } from './supabase'

   export async function purgeOldData() {
       try {
           // Get both retention periods from settings
           const { data: settings, error: settingsError } = await supabase
               .from('settings')
               .select('key, value')
               .in('key', ['sensor_readings_retention_hours', 'diagnostic_readings_retention_hours'])

           if (settingsError) throw settingsError

           // Default to 7 days (168h) for sensor data and 3 days (72h) for diagnostic data if not found
           const sensorRetentionHours = settings?.find(s => s.key === 'sensor_readings_retention_hours')?.value ?? 168
           const diagnosticRetentionHours = settings?.find(s => s.key === 'diagnostic_readings_retention_hours')?.value ?? 72

           // Call the database function to purge old data
           const { error } = await supabase.rpc('purge_old_data', {
               sensor_retention_hours: sensorRetentionHours,
               diagnostic_retention_hours: diagnosticRetentionHours
           })

           if (error) throw error

           return true
       } catch (error) {
           console.error('Error purging old data:', error)
           return false
       }
   }
   ```

## Future Considerations

- Implement logging for purging operations to track data removal over time.
- Evaluate the performance of the purging process and optimize as necessary.
