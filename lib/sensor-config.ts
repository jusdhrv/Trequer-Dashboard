import fs from 'fs'
import path from 'path'

export interface SensorConfig {
    id: string
    name: string
    unit: string
    pin: string
    signalType: 'analog' | 'digital'
    readingInterval: number
    isEnabled: boolean
    description: string
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'sensor_config.json')

export async function getSensorConfigs(): Promise<SensorConfig[]> {
    try {
        const data = await fs.promises.readFile(CONFIG_PATH, 'utf8')
        const config = JSON.parse(data)
        return config.sensors
    } catch (error) {
        console.error('Error reading sensor config:', error)
        return []
    }
}

export async function updateSensorConfig(updatedConfig: SensorConfig[]): Promise<boolean> {
    try {
        await fs.promises.writeFile(
            CONFIG_PATH,
            JSON.stringify({ sensors: updatedConfig }, null, 2),
            'utf8'
        )
        return true
    } catch (error) {
        console.error('Error updating sensor config:', error)
        return false
    }
}

export async function updateSingleSensor(updatedSensor: SensorConfig): Promise<boolean> {
    try {
        const configs = await getSensorConfigs()
        const index = configs.findIndex(s => s.id === updatedSensor.id)
        if (index === -1) return false

        configs[index] = updatedSensor
        return await updateSensorConfig(configs)
    } catch (error) {
        console.error('Error updating sensor:', error)
        return false
    }
}

export async function addSensor(newSensor: SensorConfig): Promise<boolean> {
    try {
        const configs = await getSensorConfigs()
        if (configs.some(s => s.id === newSensor.id)) return false

        configs.push(newSensor)
        return await updateSensorConfig(configs)
    } catch (error) {
        console.error('Error adding sensor:', error)
        return false
    }
}

export async function deleteSensor(sensorId: string): Promise<boolean> {
    try {
        const configs = await getSensorConfigs()
        const filteredConfigs = configs.filter(s => s.id !== sensorId)
        if (filteredConfigs.length === configs.length) return false

        return await updateSensorConfig(filteredConfigs)
    } catch (error) {
        console.error('Error deleting sensor:', error)
        return false
    }
} 