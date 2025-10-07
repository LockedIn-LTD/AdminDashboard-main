from flask import Flask, request, jsonify
from Database import Database
from Event import Event
import json

app = Flask(__name__)

PROJECT_ID = "drivesense-c1d4c"
CREDENTIALS_FILE = r"C:\Users\Kevin\Documents\Cookies-n-cream\src\db\database_key.json"
EVENT_COLLECTION = "events"

db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE)

def create_new_event(event_id, status, time_stamp, date, video_link, heart_rate=0, vehicle_speed=0):
    """
    Creates a new event in the database.
    Uses the arguments to make an event object, map it to dictionary,
    and use the db handler to set/create that event.
    """
    try:
        event = Event(event_id, status, time_stamp, date, video_link, heart_rate, vehicle_speed)
        event_data = event.to_map()
        db_handler.set_document(EVENT_COLLECTION, event_id, event_data)
        
        return event_data
    except Exception as e:
        raise Exception(f"Failed to create event: {str(e)}")

def edit_event_field(field_to_change, new_value, event_id):
    """
    Edits a specific field of an event.
    Makes the dictionary with the new field,
    calls the update function with the new map and value dictionary.
    """
    try:
        update_fields = {field_to_change: new_value}        
        db_handler.update_document(EVENT_COLLECTION, event_id, update_fields)
        
        return update_fields
    except Exception as e:
        raise Exception(f"Failed to update event field: {str(e)}")

def remove_event(event_id):
    """
    Removes an event from the database.
    """
    try:
        existing_event = db_handler.get_document(EVENT_COLLECTION, event_id)
        
        if not existing_event:
            raise Exception("Event not found")
        
        db_handler._db.collection(EVENT_COLLECTION).document(event_id).delete()
        
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

# REST API Endpoints
@app.route('/events', methods=['POST'])
def create_event():
    """
    Creates a new event in the database.
    Expected JSON payload: {
        "eventId": "string",
        "status": "string",
        "timeStamp": "string",
        "date": "string",
        "videoLink": "string",
        "heartRate": 0,
        "vehicleSpeed": 0
    }
    """
    try:
        data = request.get_json()        
        required_fields = ['eventId', 'status', 'timeStamp', 'date', 'videoLink']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        event_data = create_new_event(
            data['eventId'],
            data['status'],
            data['timeStamp'],
            data['date'],
            data['videoLink'],
            data.get('heartRate', 0),
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
    Removes an event from the database.
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

if __name__ == '__main__':
    app.run(debug=True, port=5002)
