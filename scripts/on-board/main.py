import serial, time, math, random, requests

# Data Output Format:
# 0 - ultrasonic distance
# 1 - ir distance
# 2 - light intensity
# 3 - humidity
# 4 - temperature
# 5 - gas

def modulate_value(base, start_time):
    current_time = time.time() - start_time
    periodic = math.sin(2 * math.pi * current_time / (24 * 3600))
    periodic_component = 5 * periodic
    
    # Add random noise
    noise = random.gauss(0, 0.5)
    
    # Combine components
    value = base + periodic_component + noise
    
    return round(value, 2)

def send_reading(values):
        reading = values
        try:
            response = requests.post('http://localhost:3000/api/sensors', json=reading)
            if response.status_code != 200:
                print(f"Error sending data: {response.status_code} - {response.text}")
            return response.status_code == 200
        except Exception as e:
            print(f"Exception while sending data: {e}")
            return False

def readserial(comport, baudrate, start_time):

    ser = serial.Serial(comport, baudrate, timeout=0.1)         # 1/timeout is the frequency at which the port is read

    while True:
        data = ser.readline().decode().strip()
        if data:
            values = {}
            data_out_list = data.split('|')
            values['temperature'] = float(data_out_list[4])
            values['humidity'] = float(data_out_list[3])
            values['methane'] = float(data_out_list[5])
            values['light'] = int(data_out_list[2])
            values['atmosphericPressure'] = modulate_value(1013, start_time)
            print("Sent : ", values)
            send_reading(values)


if __name__ == '__main__':

    start_time = time.time()
    readserial('/dev/ttyACM0', 9600, start_time)