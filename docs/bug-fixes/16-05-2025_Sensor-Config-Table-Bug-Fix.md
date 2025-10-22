# Sensor Configuration Table Bug Fix

## Overview

This change ensures that all sensor-related settings and configuration operations are consistently performed on the `sensor_configs` table, resolving issues where updates in the sensor settings page were not reflected in the dashboard or database due to table mismatches.

## Changes Implemented

### 1. Migrate All Sensor Config Operations to `sensor_configs` Table

#### Implementation

```typescript
// Example from lib/sensor-config.ts
export async function getSensorConfigs(): Promise<SensorConfig[]> {
    try {
        const { data, error } = await supabase
            .from('sensor_configs') // changed from 'sensors'
            .select('*')
            .order('name')
        // ...
    } catch (error) {
        // ...
    }
}

export async function updateSensorConfig(config: SensorConfig): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('sensor_configs') // changed from 'sensors'
            .update({
                name: config.name,
                unit: config.unit,
                pin: config.pin,
                signal_type: config.signal_type,
                reading_interval: config.readingInterval,
                is_enabled: config.is_enabled,
                description: config.description,
            })
            .eq('id', config.id)
        // ...
    } catch (error) {
        // ...
    }
}
// Similar changes for addSensorConfig and deleteSensorConfig
```

#### Purpose

- Ensures all sensor configuration CRUD operations are performed on the correct table (`sensor_configs`).
- Fixes the issue where changes made in the sensor settings page were not reflected in the dashboard or database.
- Prevents data inconsistency and confusion between different parts of the application.

## Testing Considerations

- Edit a sensor in the settings page and verify the change appears in the dashboard and database.
- Add a new sensor and confirm it is listed everywhere.
- Delete a sensor and ensure it is removed from all views.
- Check for edge cases such as duplicate IDs or missing fields.
- Validate that no operations are performed on the old `sensors` table.

## Future Considerations

1. Remove the old `sensors` table if it is no longer needed.
2. Add database constraints to prevent accidental use of deprecated tables.
3. Consider adding migration scripts for legacy data if required.
4. Ensure all documentation and API references use `sensor_configs`.

## Related Components

- `lib/sensor-config.ts`
- `app/api/sensors/config/route.ts`
- Any frontend components/pages that use sensor configuration APIs
- Database schema for `sensor_configs`

## Documentation Updates

- Update any developer or API documentation to reference only `sensor_configs` for sensor settings.
- Remove or update references to the old `sensors` table.
- Ensure onboarding and setup guides reflect the correct table usage.
