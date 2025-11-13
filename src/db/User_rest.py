from flask import Flask, request, jsonify
from flask_cors import CORS
from Database import Database
from User import User
import json
import hashlib

app = Flask(__name__)
CORS(app) 

PROJECT_ID = "drivesense-c1d4c"
CREDENTIALS_FILE = "src/db/database_key.json"
USER_COLLECTION = "users"

db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE)

def hash_password(password):
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_new_user(user_id, name, email, phone_number, password):
    """
    Creates a new user in the database.
    Uses the arguments to make a user object, map it to a dictionary,
    and uses the database handler to persist it.
    """
    try:
        # Check if email already exists
        all_users = db_handler._db.collection(USER_COLLECTION).stream()
        for doc in all_users:
            user_data = doc.to_dict()
            if user_data.get('email') == email:
                raise Exception("Email already exists")
        
        user = User(user_id, name, email, phone_number)
        user_data = user.to_map()
        # Add hashed password to user data
        user_data['password'] = hash_password(password)
        db_handler.set_document(USER_COLLECTION, user_id, user_data)
        
        # Return user data without password
        return_data = user_data.copy()
        return_data.pop('password', None)
        return return_data
    except Exception as e:
        raise Exception(f"Failed to create user: {str(e)}")

def authenticate_user(email, password):
    """
    Authenticates a user by email and password.
    Returns user data if successful, None otherwise.
    """
    try:
        # Get all users and find by email
        all_users = db_handler._db.collection(USER_COLLECTION).stream()
        
        for doc in all_users:
            user_data = doc.to_dict()
            if user_data.get('email') == email:
                # Check password
                if user_data.get('password') == hash_password(password):
                    # Return user data without password
                    return_data = user_data.copy()
                    return_data.pop('password', None)
                    return return_data
                else:
                    raise Exception("Invalid password")
        
        raise Exception("User not found")
    except Exception as e:
        raise Exception(f"Authentication failed: {str(e)}")

def edit_user_field(field_to_change, new_value, user_id):
    """
    Edits a specific field of a user.
    Makes the dictionary with the new field,
    calls the update function with the new map and value dictionary.
    """
    try:
        # If updating password, hash it
        if field_to_change == 'password':
            new_value = hash_password(new_value)
        
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
        
        # Remove password from response
        user_data.pop('password', None)
        return user_data
    except Exception as e:
        raise Exception(f"Failed to retrieve user: {str(e)}")

@app.route('/auth/login', methods=['POST'])
def login():
    """
    Authenticates a user.
    Expected JSON payload: {
        "email": "string",
        "password": "string"
    }
    """
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user_data = authenticate_user(data['email'], data['password'])
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/users', methods=['POST'])
def create_user():
    """
    Creates a new user in the database.
    Expected JSON payload: {
        "userId": "string",
        "name": "string", 
        "email": "string",
        "phoneNumber": "string",
        "password": "string"
    }
    """
    try:
        data = request.get_json()
        required_fields = ['userId', 'name', 'email', 'phoneNumber', 'password']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_data = create_new_user(
            data['userId'],
            data['name'],
            data['email'],
            data['phoneNumber'],
            data['password']
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

@app.route('/auth/verify-email', methods=['POST'])
def verify_email():
    """
    Verifies if an email exists in the database.
    Expected JSON payload: {
        "email": "string"
    }
    """
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email']
        
        # Search for user by email
        all_users = db_handler._db.collection(USER_COLLECTION).stream()
        
        for doc in all_users:
            user_data = doc.to_dict()
            if user_data.get('email') == email:
                return jsonify({
                    'message': 'Email verified',
                    'userName': user_data.get('name', 'User')
                }), 200
        
        # Email not found
        return jsonify({'error': 'Email not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

import secrets
import time

# Store reset tokens temporarily (in production, use Redis or database)
reset_tokens = {}

@app.route('/auth/request-reset', methods=['POST'])
def request_reset():
    """
    Generates a password reset token.
    Expected JSON payload: {
        "email": "string"
    }
    """
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email']
        
        # Search for user by email
        all_users = db_handler._db.collection(USER_COLLECTION).stream()
        user_id = None
        user_name = None
        
        for doc in all_users:
            user_data = doc.to_dict()
            if user_data.get('email') == email:
                user_id = user_data.get('userId')
                user_name = user_data.get('name', 'User')
                break
        
        if not user_id:
            return jsonify({'error': 'Email not found'}), 404
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        
        # Store token with expiry (1 hour)
        reset_tokens[token] = {
            'userId': user_id,
            'email': email,
            'expiry': time.time() + 3600  # 1 hour from now
        }
        
        return jsonify({
            'message': 'Reset token generated',
            'token': token,
            'userName': user_name
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Resets password using a valid token.
    Expected JSON payload: {
        "token": "string",
        "newPassword": "string"
    }
    """
    try:
        data = request.get_json()
        
        if 'token' not in data or 'newPassword' not in data:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        token = data['token']
        new_password = data['newPassword']
        
        # Check if token exists and is valid
        if token not in reset_tokens:
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        token_data = reset_tokens[token]
        
        # Check if token has expired
        if time.time() > token_data['expiry']:
            del reset_tokens[token]
            return jsonify({'error': 'Token has expired'}), 400
        
        # Update password
        user_id = token_data['userId']
        edit_user_field('password', new_password, user_id)
        
        # Delete used token
        del reset_tokens[token]
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)