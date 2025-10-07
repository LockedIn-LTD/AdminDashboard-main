from flask import Flask, request, jsonify
from Database import Database
from User import User
import json

app = Flask(__name__)

PROJECT_ID = "drivesense-c1d4c"
CREDENTIALS_FILE = r"C:\Users\Kevin\Documents\Cookies-n-cream\src\db\database_key.json"
USER_COLLECTION = "users"

db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE)

def create_new_user(user_id, name, email, phone_number):
    """
    Creates a new user in the database.
    Uses the arguments to make a user object, map it to a dictionary,
    and uses the database handler to persist it.
    """
    try:
        user = User(user_id, name, email, phone_number)
        user_data = user.to_map()
        db_handler.set_document(USER_COLLECTION, user_id, user_data)
        
        return user_data
    except Exception as e:
        raise Exception(f"Failed to create user: {str(e)}")

def edit_user_field(field_to_change, new_value, user_id):
    """
    Edits a specific field of a user.
    Makes the dictionary with the new field,
    calls the update function with the new map and value dictionary.
    """
    try:
        update_fields = {field_to_change: new_value}
        db_handler.update_document(USER_COLLECTION, user_id, update_fields)
        
        return update_fields
    except Exception as e:
        raise Exception(f"Failed to update user field: {str(e)}")

def remove_user(user_id):
    """
    Removes a user from the database.
    """
    try:
        existing_user = db_handler.get_document(USER_COLLECTION, user_id)
        if not existing_user:
            raise Exception("User not found")
        
        db_handler._db.collection(USER_COLLECTION).document(user_id).delete()
        
        return True
    except Exception as e:
        raise Exception(f"Failed to delete user: {str(e)}")

def get_user_by_id(user_id):
    """
    Retrieves a user from the database.
    """
    try:
        user_data = db_handler.get_document(USER_COLLECTION, user_id)
        
        if not user_data:
            raise Exception("User not found")
        
        return user_data
    except Exception as e:
        raise Exception(f"Failed to retrieve user: {str(e)}")

@app.route('/users', methods=['POST'])
def create_user():
    """
    Creates a new user in the database.
    Expected JSON payload: {
        "userId": "string",
        "name": "string", 
        "email": "string",
        "phoneNumber": "string"
    }
    """
    try:
        data = request.get_json()
        required_fields = ['userId', 'name', 'email', 'phoneNumber']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_data = create_new_user(
            data['userId'],
            data['name'],
            data['email'],
            data['phoneNumber']
        )
        
        return jsonify({
            'message': 'User created successfully',
            'user': user_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Updates specific fields of a user in the database.
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
        
        update_fields = edit_user_field(
            data['fieldToChange'],
            data['newValue'],
            user_id
        )
        
        return jsonify({
            'message': 'User updated successfully',
            'updatedFields': update_fields
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    Removes a user from the database.
    """
    try:
        remove_user(user_id)
        
        return jsonify({
            'message': 'User deleted successfully',
            'deletedUserId': user_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Retrieves a user from the database.
    """
    try:
        user_data = get_user_by_id(user_id)
        
        return jsonify({
            'message': 'User retrieved successfully',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)