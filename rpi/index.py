from models import *
from crud import *
from serial import Serial
import time
from datetime import date

def export_daily_data():
    current_date_string = date.today().strftime("%d-%m-%Y")
    


# Initialize the Home Module
home = Home("Gongster's Home")

# Initialize the Sensors Module
sensor_module = SensorModule(home.home_id)
temperature_sensor = Sensor('temperature')
humidity_sensor = Sensor('humidity')
sensor_module.add_sensors(temperature_sensor, humidity_sensor)


while True:

    # Open Serial
    # ser = Serial(port='/dev/ttyS0', baudrate=9600)  # open serial port
    # ser.write(str.encode('1'))

    time.sleep(1)

    # s = ser.readline()
    # data = s.decode('UTF-8')
    data = "humidity/48.00/temperature/22.50"
    data_list = data.split('/')
    
    data_dict = {}
    for index, value in enumerate(data_list):
        if index % 2 == 0:
            data_dict[data_list[index]] = float(data_list[index+1].replace('\\','').strip())
        
    
    """At a high level, we will all each sensor data be an object instance (stored as a python dict 
    but modeled as a class. It will be stored physically on a JSON file."""
     
    # Go over each of the sensor data and put it into the right JSON file
    for key in data_dict:
        # if sensor data
        if key in ['temperature', 'humidity']:
            for sensor_object in sensor_module.sensors:
                if sensor_object.name == key:
                    sensor = sensor_object
                    break

            sensor.load_data()

            sensor.check_data_and_notify() # TODO:If something is wrong, we will send a notification

            sensor.append_data(data_dict[key])
            sensor.update_json()


        # If intruder data
        if key in ['intruder']:
            print("This is intruder data, I don't know how to handle it yet")
            

    sensor_module.update_current_data()
    sensor_module.upload_data()
    #TODO: Create Daily Data export function to send to server
    #TODO: Separate Data Handling and Send to server
    
    
    # r = put_sensors_data(final_data)
    # print(r.text)
