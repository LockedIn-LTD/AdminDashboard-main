from flask import Flask, request, jsonify
from Database import Database
from Event import Event
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

PROJECT_ID = "drivesense-c1d4c"
CREDENTIALS_FILE = "src/db/database_key.json"
EVENT_COLLECTION = "events"
DRIVER_COLLECTION = "drivers"

db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE)

def create_new_event(event_id, driver_id, status, time_stamp, date, video_link, heart_rate=0, blood_oxygen_level=0, vehicle_speed=0):
    """
    Creates a new event in the database AND links it to the driver.
    """
    try:
        # Create event object
        event = Event(event_id, status, time_stamp, date, video_link, heart_rate, blood_oxygen_level, vehicle_speed)
        event_data = event.to_map()
        
        # Add driver_id to event data
        event_data['driverId'] = driver_id
        
        # Save event to events collection
        db_handler.set_document(EVENT_COLLECTION, event_id, event_data)
        
        # Link event to driver's events array
        driver_data = db_handler.get_document(DRIVER_COLLECTION, driver_id)
        if driver_data:
            # Get current events array or create empty list
            current_events = driver_data.get('events', [])
            
            # Add new event object to array
            event_summary = {
                "eventId": event_id,
                "status": status,
                "timeStamp": time_stamp,
                "date": date,
                "videoLink": video_link,
                "heartRate": heart_rate,
                "bloodOxygenLevel": blood_oxygen_level,
                "vehicleSpeed": vehicle_speed
            }
            current_events.append(event_summary)
            
            # Update driver document with new events array
            db_handler.update_document(DRIVER_COLLECTION, driver_id, {
                'events': current_events
            })
        else:
            raise Exception(f"Driver {driver_id} not found")
        
        return event_data
    except Exception as e:
        raise Exception(f"Failed to create event: {str(e)}")

def edit_event_field(field_to_change, new_value, event_id):
    """
    Edits a specific field of an event.
    Also updates the event in the driver's events array if needed.
    """
    try:
        # Get the event to find driver_id
        event_data = db_handler.get_document(EVENT_COLLECTION, event_id)
        if not event_data:
            raise Exception("Event not found")
        
        driver_id = event_data.get('driverId')
        
        # Update event in events collection
        update_fields = {field_to_change: new_value}        
        db_handler.update_document(EVENT_COLLECTION, event_id, update_fields)
        
        # Update event in driver's events array
        if driver_id:
            driver_data = db_handler.get_document(DRIVER_COLLECTION, driver_id)
            if driver_data and 'events' in driver_data:
                events = driver_data['events']
                for i, event in enumerate(events):
                    if event.get('eventId') == event_id:
                        events[i][field_to_change] = new_value
                        break
                
                db_handler.update_document(DRIVER_COLLECTION, driver_id, {
                    'events': events
                })
        
        return update_fields
    except Exception as e:
        raise Exception(f"Failed to update event field: {str(e)}")

def remove_event(event_id):
    """
    Removes an event from the database AND from the driver's events array.
    """
    try:
        # Get event to find driver_id
        existing_event = db_handler.get_document(EVENT_COLLECTION, event_id)
        
        if not existing_event:
            raise Exception("Event not found")
        
        driver_id = existing_event.get('driverId')
        
        # Delete event from events collection
        db_handler._db.collection(EVENT_COLLECTION).document(event_id).delete()
        
        # Remove event from driver's events array
        if driver_id:
            driver_data = db_handler.get_document(DRIVER_COLLECTION, driver_id)
            if driver_data and 'events' in driver_data:
                events = driver_data['events']
                # Filter out the deleted event
                updated_events = [e for e in events if e.get('eventId') != event_id]
                
                db_handler.update_document(DRIVER_COLLECTION, driver_id, {
                    'events': updated_events
                })
        
        return True
    except Exception as e:
        raise Exception(f"Failed to delete event: {str(e)}")

def get_event_by_id(event_id):
    """
    Retrieves an event from the database.
    """
    try:
        event_data = db_handler.get_document(EVENT_COLLECTION, event_id)
        
        if not event_data:
            raise Exception("Event not found")
        
        return event_data
    except Exception as e:
        raise Exception(f"Failed to retrieve event: {str(e)}")

def get_events_by_driver(driver_id):
    """
    Retrieves all events for a specific driver.
    """
    try:
        # Get all events from events collection
        all_events = db_handler._db.collection(EVENT_COLLECTION).where('driverId', '==', driver_id).stream()
        
        events_list = []
        for doc in all_events:
            event_data = doc.to_dict()
            events_list.append(event_data)
        
        return events_list
    except Exception as e:
        raise Exception(f"Failed to retrieve driver events: {str(e)}")

# REST API Endpoints
@app.route('/events', methods=['POST'])
def create_event():
    """
    Creates a new event in the database and links it to a driver.
    Expected JSON payload: {
        "eventId": "string",
        "driverId": "string",
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
        required_fields = ['eventId', 'driverId', 'status', 'timeStamp', 'date', 'videoLink']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        event_data = create_new_event(
            data['eventId'],
            data['driverId'],
            data['status'],
            data['timeStamp'],
            data['date'],
            data['videoLink'],
            data.get('heartRate', 0),
            data.get('bloodOxygenLevel', 0),
            data.get('vehicleSpeed', 0)
        )
        
        return jsonify({
            'message': 'Event created successfully',
            'event': event_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    """
    Updates specific fields of an event in the database.
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
        
        update_fields = edit_event_field(
            data['fieldToChange'],
            data['newValue'],
            event_id
        )
        
        return jsonify({
            'message': 'Event updated successfully',
            'updatedFields': update_fields
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    """
    Removes an event from the database and from the driver's events array.
    """
    try:
        remove_event(event_id)
        
        return jsonify({
            'message': 'Event deleted successfully',
            'deletedEventId': event_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<event_id>', methods=['GET'])
def get_event(event_id):
    """
    Retrieves an event from the database.
    """
    try:
        event_data = get_event_by_id(event_id)
        
        return jsonify({
            'message': 'Event retrieved successfully',
            'event': event_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drivers/<driver_id>/events', methods=['GET'])
def get_driver_events(driver_id):
    """
    Retrieves all events for a specific driver.
    """
    try:
        events = get_events_by_driver(driver_id)
        
        return jsonify({
            'message': 'Events retrieved successfully',
            'events': events,
            'count': len(events)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)