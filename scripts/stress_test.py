import requests
import time
import random
import math
import threading
from datetime import datetime
import argparse

class SensorSimulator:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.api_endpoint = f"{base_url}/api/sensors"
        
        # Base values for each sensor
        self.base_values = {
            "temperature": 22.0,      # Celsius
            "humidity": 45.0,         # Percentage
            "methane": 2.0,           # PPM
            "light": 800.0,           # Lux
            "atmosphericPressure": 1013.25  # hPa
        }
        
        # Noise and drift parameters
        self.noise_amplitude = {
            "temperature": 0.5,
            "humidity": 2.0,
            "methane": 0.2,
            "light": 50.0,
            "atmosphericPressure": 1.0
        }
        
        # Periodic variation parameters (simulating day/night cycles)
        self.periodic_amplitude = {
            "temperature": 5.0,
            "humidity": 15.0,
            "methane": 1.0,
            "light": 500.0,
            "atmosphericPressure": 5.0
        }
        
        self.start_time = time.time()

    def generate_reading(self):
        """Generate a realistic sensor reading with noise and periodic variations"""
        current_time = time.time() - self.start_time
        reading = {}
        
        for sensor, base_value in self.base_values.items():
            # Add periodic variation (24-hour cycle)
            periodic = math.sin(2 * math.pi * current_time / (24 * 3600))
            periodic_component = self.periodic_amplitude[sensor] * periodic
            
            # Add random noise
            noise = random.gauss(0, self.noise_amplitude[sensor] * 0.1)
            
            # Combine components
            value = base_value + periodic_component + noise
            
            # Ensure values stay within realistic ranges
            if sensor == "humidity":
                value = max(0, min(100, value))
            elif sensor == "methane":
                value = max(0, value)
            elif sensor == "light":
                value = max(0, value)
            
            reading[sensor] = round(value, 2)
        
        return reading

    def send_reading(self):
        """Send a single reading to the API"""
        reading = self.generate_reading()
        try:
            response = requests.post(self.api_endpoint, json=reading)
            if response.status_code != 200:
                print(f"Error sending data: {response.status_code} - {response.text}")
            return response.status_code == 200
        except Exception as e:
            print(f"Exception while sending data: {e}")
            return False

def run_stress_test(duration, delay=1.0, infinite=False):
    """Run the stress test for a specified duration or indefinitely"""
    simulator = SensorSimulator()
    start_time = time.time()
    successful_requests = 0
    failed_requests = 0
    
    print(f"Starting stress test{' indefinitely' if infinite else f' for {duration} seconds'} with {delay}s delay between requests")
    print("Press Ctrl+C to stop the test")
    
    try:
        while infinite or time.time() - start_time < duration:
            if simulator.send_reading():
                successful_requests += 1
            else:
                failed_requests += 1
            
            # Calculate and display statistics
            elapsed_time = time.time() - start_time
            requests_per_second = (successful_requests + failed_requests) / elapsed_time
            success_rate = (successful_requests / (successful_requests + failed_requests)) * 100
            
            # Clear line and update statistics
            print(f"\rElapsed: {elapsed_time:.1f}s | "
                  f"Successful: {successful_requests} | "
                  f"Failed: {failed_requests} | "
                  f"Req/s: {requests_per_second:.1f} | "
                  f"Success Rate: {success_rate:.1f}%", end="")
            
            time.sleep(delay)
    
    except KeyboardInterrupt:
        print("\nTest stopped by user")
    
    # Final statistics
    total_time = time.time() - start_time
    print("\n\nFinal Statistics:")
    print(f"Total Time: {total_time:.1f} seconds")
    print(f"Successful Requests: {successful_requests}")
    print(f"Failed Requests: {failed_requests}")
    print(f"Average Requests/Second: {(successful_requests + failed_requests) / total_time:.1f}")
    print(f"Overall Success Rate: {(successful_requests / (successful_requests + failed_requests)) * 100:.1f}%")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='API Stress Test Tool for Sensor Data')
    parser.add_argument('--duration', type=int, default=3600,
                      help='Duration of the test in seconds (default: 3600, ignored if --infinite is set)')
    parser.add_argument('--delay', type=float, default=1.0,
                      help='Delay between requests in seconds (default: 1.0)')
    parser.add_argument('--infinite', action='store_true',
                      help='Run the test indefinitely until Ctrl+C is pressed')
    
    args = parser.parse_args()
    
    run_stress_test(args.duration, args.delay, args.infinite) 