from flask import Flask, request, jsonify
from Database import Database
from Driver import Driver
from User import EmergencyContact
from Event import Event
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

PROJECT_ID = "drivesense-c1d4c"
CREDENTIALS_FILE = r"C:\Users\Kevin\Documents\Cookies-n-cream\src\db\database_key.json"
DRIVER_COLLECTION = "drivers"
EVENT_COLLECTION = "events"

db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE)

def create_new_driver(driver_id, name, phone_number, emergency_contacts=None, events=None, time_stamp="", date="", heart_rate=0, blood_oxygen_level=0, vehicle_speed=0, video_link=""):
    """
    Creates a new driver in the database with all driver fields.
    Uses the arguments to make a driver object, map it to dictionary,
    and use the db handler to set/create that driver.
    """
    try:
        driver = Driver(name, phone_number)
        
        driver.set_time_stamp(time_stamp)
        driver.set_date(date)
        driver.set_heart_rate(heart_rate)
        driver.set_blood_oxygen_level(blood_oxygen_level)
        driver.set_vehicle_speed(vehicle_speed)
        driver.set_video_link(video_link)
        
        if emergency_contacts:
            for contact_data in emergency_contacts:
                contact = EmergencyContact(
                    contact_data.get('name', ''),
                    contact_data.get('phone_number', ''),
                )
                driver.add_emergency_contact(contact)
        
        if events:
            for event_data in events:
                event = Event(
                    event_data.get('eventId', ''),
                    event_data.get('status', ''),
                    event_data.get('timeStamp', ''),
                    event_data.get('date', ''),
                    event_data.get('videoLink', ''),
                    event_data.get('heartRate', 0),
                    event_data.get('bloodOxygenLevel', 0),
                    event_data.get('vehicleSpeed', 0)
                )
                driver.add_event(event)
                
                # Also create event in events collection with driver link
                event_dict = event.to_map()
                event_dict['driverId'] = driver_id
                db_handler.set_document(EVENT_COLLECTION, event_data.get('eventId'), event_dict)
        
        driver_data = driver.to_map()
        
        db_handler.set_document(DRIVER_COLLECTION, driver_id, driver_data)
        
        return driver_data
    except Exception as e:
        raise Exception(f"Failed to create driver: {str(e)}")

def edit_driver_field(field_to_change, new_value, driver_id):
    """
    Edits a specific field of a driver.
    Makes the dictionary with the new field,
    calls the update function with the new map and value dictionary.
    """
    try:
        update_fields = {field_to_change: new_value}        
        db_handler.update_document(DRIVER_COLLECTION, driver_id, update_fields)
        
        return update_fields
    except Exception as e:
        raise Exception(f"Failed to update driver field: {str(e)}")

def remove_driver(driver_id):
    """
    Removes a driver from the database AND all their associated events.
    """
    try:
        existing_driver = db_handler.get_document(DRIVER_COLLECTION, driver_id)
        
        if not existing_driver:
            raise Exception("Driver not found")
        
        # Delete all events associated with this driver
        events = existing_driver.get('events', [])
        for event in events:
            event_id = event.get('eventId')
            if event_id:
                try:
                    db_handler._db.collection(EVENT_COLLECTION).document(event_id).delete()
                except:
                    pass  # Continue even if event doesn't exist
        
        # Delete the driver
        db_handler._db.collection(DRIVER_COLLECTION).document(driver_id).delete()
        
        return True
    except Exception as e:
        raise Exception(f"Failed to delete driver: {str(e)}")

def get_driver_by_id(driver_id):
    """
    Retrieves a driver from the database.
    """
    try:
        driver_data = db_handler.get_document(DRIVER_COLLECTION, driver_id)
        
        if not driver_data:
            raise Exception("Driver not found")
        
        return driver_data
    except Exception as e:
        raise Exception(f"Failed to retrieve driver: {str(e)}")

def add_emergency_contact_to_driver(driver_id, contact_name, contact_phone):
    """
    Adds an emergency contact to a driver.
    """
    try:
        driver_data = get_driver_by_id(driver_id)
        
        new_contact = {
            "name": contact_name,
            "phone_number": contact_phone
        }
        
        if "emergency_contacts" not in driver_data:
            driver_data["emergency_contacts"] = []
        
        driver_data["emergency_contacts"].append(new_contact)
        
        db_handler.set_document(DRIVER_COLLECTION, driver_id, driver_data)
        
        return new_contact
    except Exception as e:
        raise Exception(f"Failed to add emergency contact: {str(e)}")

def add_event_to_driver(driver_id, event_id, status, time_stamp, date, video_link, heart_rate=0, blood_oxygen_level=0, vehicle_speed=0):
    """
    Adds an event to a driver AND creates it in the events collection.
    """
    try:
        driver_data = get_driver_by_id(driver_id)
        
        new_event = {
            "eventId": event_id,
            "status": status,
            "timeStamp": time_stamp,
            "date": date,
            "videoLink": video_link,
            "heartRate": heart_rate,
            "bloodOxygenLevel": blood_oxygen_level,
            "vehicleSpeed": vehicle_speed
        }
        
        if "events" not in driver_data:
            driver_data["events"] = []
        
        driver_data["events"].append(new_event)        
        db_handler.set_document(DRIVER_COLLECTION, driver_id, driver_data)
        
        # Also create event in events collection
        event_data = new_event.copy()
        event_data['driverId'] = driver_id
        db_handler.set_document(EVENT_COLLECTION, event_id, event_data)
        
        return new_event
    except Exception as e:
        raise Exception(f"Failed to add event: {str(e)}")

# REST API Endpoints
@app.route('/drivers', methods=['POST'])
def create_driver():
    """
    Creates a new driver in the database.
    Expected JSON payload: {
        "driverId": "string",
        "name": "string", 
        "phoneNumber": "string",
        "emergencyContacts": [{"name": "string", "phone_number": "string"}],
        "events": [{"eventId": "string", "status": "string", "timeStamp": "string", "date": "string", "videoLink": "string", "heartRate": 0, "bloodOxygenLevel": 0, "vehicleSpeed": 0}],
        "timeStamp": "string",
        "date": "string",
        "heartRate": 0,
        "bloodOxygenLevel": 0,
        "vehicleSpeed": 0,
        "videoLink": "string"
    }
    """
    try:
        data = request.get_json()        
        required_fields = ['driverId', 'name', 'phoneNumber']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        driver_data = create_new_driver(
            data['driverId'],
            data['name'],
            data['phoneNumber'],
            data.get('emergencyContacts'),
            data.get('events'),
            data.get('timeStamp', ''),
            data.get('date', ''),
            data.get('heartRate', 0),
            data.get('bloodOxygenLevel', 0),
            data.get('vehicleSpeed', 0),
            data.get('videoLink', '')
        )
        
        return jsonify({
            'message': 'Driver created successfully',
            'driver': driver_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>', methods=['PUT'])
def update_driver(driver_id):
    """
    Updates specific fields of a driver in the database.
    Expected JSON payload: {
        "fieldToChange": "string",
        "newValue": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No update data provided'}), 400
        
        if 'fieldToChange' not in data or 'newValue' not in data:
            return jsonify({'error': 'Missing required fields: fieldToChange and newValue'}), 400
        
        update_fields = edit_driver_field(
            data['fieldToChange'],
            data['newValue'],
            driver_id
        )
        
        return jsonify({
            'message': 'Driver updated successfully',
            'updatedFields': update_fields
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    """
    Removes a driver from the database and all their events.
    """
    try:
        remove_driver(driver_id)
        
        return jsonify({
            'message': 'Driver deleted successfully',
            'deletedDriverId': driver_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>', methods=['GET'])
def get_driver(driver_id):
    """
    Retrieves a driver from the database.
    """
    try:
        driver_data = get_driver_by_id(driver_id)
        
        return jsonify({
            'message': 'Driver retrieved successfully',
            'driver': driver_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>/emergency-contacts', methods=['POST'])
def add_emergency_contact(driver_id):
    """
    Adds an emergency contact to a driver.
    Expected JSON payload: {
        "name": "string",
        "phoneNumber": "string",
    }
    """
    try:
        data = request.get_json()        
        required_fields = ['name', 'phoneNumber']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        new_contact = add_emergency_contact_to_driver(
            driver_id,
            data['name'],
            data['phoneNumber'],
        )
        
        return jsonify({
            'message': 'Emergency contact added successfully',
            'contact': new_contact
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>/events', methods=['POST'])
def add_event(driver_id):
    """
    Adds an event to a driver and creates it in events collection.
    Expected JSON payload: {
        "eventId": "string",
        "status": "string",
        "timeStamp": "string",
        "date": "string",
        "videoLink": "string",
        "heartRate": 0,
        "bloodOxygenLevel": 0,
        "vehicleSpeed": 0
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['eventId', 'status', 'timeStamp', 'date', 'videoLink']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        new_event = add_event_to_driver(
            driver_id,
            data['eventId'],
            data['status'],
            data['timeStamp'],
            data['date'],
            data['videoLink'],
            data.get('heartRate', 0),
            data.get('bloodOxygenLevel', 0),
            data.get('vehicleSpeed', 0)
        )
        
        return jsonify({
            'message': 'Event added successfully',
            'event': new_event
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)