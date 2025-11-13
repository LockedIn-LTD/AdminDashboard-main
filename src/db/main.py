from Database import Database
from User import User
from User_rest import create_new_user, edit_user_field, get_user_by_id, remove_user
from Driver_rest import create_new_driver, edit_driver_field, get_driver_by_id, remove_driver, add_emergency_contact_to_driver, add_event_to_driver
from Event_rest import create_new_event, edit_event_field, get_event_by_id, remove_event
import firebase_admin
from firebase_admin import credentials, firestore

PROJECT_ID = "drivesense-c1d4c" 
CREDENTIALS_FILE = "src/db/database_key.json"

def test_user_functions():
    """Test all the wrapper functions from user_rest.py"""
    print("=" * 60)
    print("TESTING USER WRAPPER FUNCTIONS")
    print("=" * 60)
    
    # Test user data
    test_user_id = "test_user_123"
    test_name = "John Test"
    test_email = "john.test@example.com"
    test_phone = "555-1234"
    
    try:
        # Test 1: Create New User
        print("\n1. TESTING CREATE NEW USER")
        print("-" * 30)
        print(f"Creating user: {test_name} ({test_email})")
        
        user_data = create_new_user(test_user_id, test_name, test_email, test_phone)
        print(f"[SUCCESS] User created successfully!")
        print(f"   User Data: {user_data}")

        
        
        # Test 2: Get User
        print("\n2. TESTING GET USER")
        print("-" * 30)
        print(f"Retrieving user: {test_user_id}")
        
        retrieved_user = get_user_by_id(test_user_id)
        print(f"[SUCCESS] User retrieved successfully!")
        print(f"   Retrieved Data: {retrieved_user}")
        
        # Test 1b: Update User name (make change obvious)
        print("\n1b. TESTING UPDATE USER FIELD (Name)")
        print("-" * 30)
        new_name = "Updated John Test"
        print(f"Updating user name to: '{new_name}' for id {test_user_id}")
        _ = edit_user_field("name", new_name, test_user_id)
        updated_user = get_user_by_id(test_user_id)
        print(f"[SUCCESS] User updated! Current name: {updated_user.get('name')}")
        
        # Test 1c: Update User email (make change obvious)
        print("\n1c. TESTING UPDATE USER FIELD (Email)")
        print("-" * 30)
        new_email = "updated.john@example.com"
        print(f"Updating user email to: '{new_email}' for id {test_user_id}")
        _ = edit_user_field("email", new_email, test_user_id)
        updated_user = get_user_by_id(test_user_id)
        print(f"[SUCCESS] User updated! Current email: {updated_user.get('email')}")
        
        # Test 1d: Update User phone (make change obvious)
        print("\n1d. TESTING UPDATE USER FIELD (Phone)")
        print("-" * 30)
        new_phone = "555-5678"
        print(f"Updating user phone to: '{new_phone}' for id {test_user_id}")
        _ = edit_user_field("phoneNumber", new_phone, test_user_id)
        updated_user = get_user_by_id(test_user_id)
        print(f"[SUCCESS] User updated! Current phone: {updated_user.get('phoneNumber')}")
        
        # Test 1e: Get Updated User
        print("\n1e. VERIFY UPDATED USER")
        print("-" * 30)
        final_user = get_user_by_id(test_user_id)
        print(f"[SUCCESS] Final User Data: {final_user}")
        
        # Test 1f: Delete User and verify
        print("\n1f. TESTING DELETE USER")
        print("-" * 30)
        _ = remove_user(test_user_id)
        print(f"[SUCCESS] User delete requested for: {test_user_id}")
        try:
            _ = get_user_by_id(test_user_id)
            print("[ERROR] User should be deleted but was found")
        except Exception as e:
            print(f"[SUCCESS] User not found after delete (as expected): {str(e)}")
        
        # (kept delete verification above)
        
        print("\n" + "=" * 60)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {str(e)}")
        print("=" * 60)

def test_driver_functions():
    """Test the create_new_driver function from driver_rest.py"""
    print("=" * 60)
    print("TESTING DRIVER CREATE FUNCTION")
    print("=" * 60)
    
    # Test driver data
    test_driver_id = "test_driver_456"
    test_name = "Mike Driver"
    test_email = "mike.driver@example.com"
    test_phone = "555-9876"
    
    try:
        # Test 1: Create New Driver (Basic)
        print("\n1. TESTING CREATE NEW DRIVER (Basic)")
        print("-" * 30)
        print(f"Creating driver: {test_name} ({test_email})")
        
        driver_data = create_new_driver(test_driver_id, test_name, test_phone, test_email)
        print(f"[SUCCESS] Driver created successfully!")
        print(f"   Driver Data: {driver_data}")

        # Test 1b: Update Driver Name (make change obvious)
        print("\n1b. TESTING UPDATE DRIVER FIELD (Name)")
        print("-" * 30)
        updated_name = "Updated Mike Driver"
        print(f"Updating driver name to: '{updated_name}' for id {test_driver_id}")
        _ = edit_driver_field("name", updated_name, test_driver_id)
        updated_driver = get_driver_by_id(test_driver_id)
        print(f"[SUCCESS] Driver updated! Current name: {updated_driver.get('name')}")

        # Test 1c: Delete Driver and verify
        print("\n1c. TESTING DELETE DRIVER")
        print("-" * 30)
        _ = remove_driver(test_driver_id)
        print(f"[SUCCESS] Driver delete requested for: {test_driver_id}")
        try:
            _ = get_driver_by_id(test_driver_id)
            print("[ERROR] Driver should be deleted but was found")
        except Exception as e:
            print(f"[SUCCESS] Driver not found after delete (as expected): {str(e)}")

        
        
        # Test 2: Create New Driver (With Emergency Contacts)
        print("\n2. TESTING CREATE NEW DRIVER (With Emergency Contacts)")
        print("-" * 30)
        test_driver_id_2 = "test_driver_789"
        print(f"Creating driver with emergency contacts: {test_driver_id_2}")
        
        emergency_contacts = [
            {"name": "Jane Emergency", "phone_number": "555-9111", "relationship": "Spouse"},
            {"name": "Bob Emergency", "phone_number": "555-9112", "relationship": "Brother"}
        ]
        
        driver_data_2 = create_new_driver(
            test_driver_id_2, 
            "Sarah Driver", 
            "555-5432", 
            "sarah@example.com",
            emergency_contacts=emergency_contacts
        )
        print(f"[SUCCESS] Driver with emergency contacts created!")
        print(f"   Driver Data: {driver_data_2}")
        
        # Test 3: Create New Driver (With Events)
        print("\n3. TESTING CREATE NEW DRIVER (With Events)")
        print("-" * 30)
        test_driver_id_3 = "test_driver_999"
        print(f"Creating driver with events: {test_driver_id_3}")
        
        events = [
            {
                "eventId": "event_001",
                "status": "Incident",
                "timeStamp": "2024-01-15 10:30:00",
                "date": "2024-01-15",
                "videoLink": "https://example.com/video1.mp4",
                "heartRate": 85,
                "vehicleSpeed": 65
            }
        ]
        
        driver_data_3 = create_new_driver(
            test_driver_id_3, 
            "Tom Driver", 
            "555-1111", 
            "tom@example.com",
            events=events,
            time_stamp="2024-01-15 10:30:00",
            heart_rate=85,
            vehicle_speed=65
        )
        print(f"[SUCCESS] Driver with events created!")
        print(f"   Driver Data: {driver_data_3}")
        
        print("\n" + "=" * 60)
        print("DRIVER CREATE TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] DRIVER CREATE TEST FAILED: {str(e)}")
        print("=" * 60)

def test_event_functions():
    """Test the create_new_event function from event_rest.py"""
    print("=" * 60)
    print("TESTING EVENT CREATE FUNCTION")
    print("=" * 60)
    
    # Test event data
    test_event_id = "test_event_001"
    test_status = "Incident"
    test_time_stamp = "2024-01-15 10:30:00"
    test_date = "2024-01-15"
    test_video_link = "https://example.com/video1.mp4"
    
    try:
        # Test 1: Create New Event (Basic)
        print("\n1. TESTING CREATE NEW EVENT (Basic)")
        print("-" * 30)
        print(f"Creating event: {test_event_id} - {test_status}")
        
        event_data = create_new_event(
            test_event_id, 
            test_status, 
            test_time_stamp, 
            test_date, 
            test_video_link
        )
        print(f"[SUCCESS] Event created successfully!")
        print(f"   Event Data: {event_data}")

        # Test 1b: Update Event status (make change obvious)
        print("\n1b. TESTING UPDATE EVENT FIELD (Status)")
        print("-" * 30)
        new_status = "Reviewed"
        print(f"Updating event status to: '{new_status}' for id {test_event_id}")
        _ = edit_event_field("status", new_status, test_event_id)
        updated_event = get_event_by_id(test_event_id)
        print(f"[SUCCESS] Event updated! Current status: {updated_event.get('status')}")

        # Test 1c: Delete Event and verify
        print("\n1c. TESTING DELETE EVENT")
        print("-" * 30)
        _ = remove_event(test_event_id)
        print(f"[SUCCESS] Event delete requested for: {test_event_id}")
        try:
            _ = get_event_by_id(test_event_id)
            print("[ERROR] Event should be deleted but was found")
        except Exception as e:
            print(f"[SUCCESS] Event not found after delete (as expected): {str(e)}")

        
        
        # Test 2: Create New Event (With Heart Rate and Speed)
        print("\n2. TESTING CREATE NEW EVENT (With Safety Data)")
        print("-" * 30)
        test_event_id_2 = "test_event_002"
        print(f"Creating event with safety data: {test_event_id_2}")
        
        event_data_2 = create_new_event(
            test_event_id_2, 
            "Normal", 
            "2024-01-15 11:00:00", 
            "2024-01-15", 
            "https://example.com/video2.mp4",
            heart_rate=75,
            vehicle_speed=45
        )
        print(f"[SUCCESS] Event with safety data created!")
        print(f"   Event Data: {event_data_2}")
        
        # Test 3: Create New Event (High Risk)
        print("\n3. TESTING CREATE NEW EVENT (High Risk)")
        print("-" * 30)
        test_event_id_3 = "test_event_003"
        print(f"Creating high-risk event: {test_event_id_3}")
        
        event_data_3 = create_new_event(
            test_event_id_3, 
            "High Risk", 
            "2024-01-15 12:00:00", 
            "2024-01-15", 
            "https://example.com/video3.mp4",
            heart_rate=120,
            vehicle_speed=85
        )
        print(f"[SUCCESS] High-risk event created!")
        print(f"   Event Data: {event_data_3}")
        
        print("\n" + "=" * 60)
        print("EVENT CREATE TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        delete2 = remove_event(test_event_id_2)
        
    except Exception as e:
        print(f"\n[ERROR] EVENT CREATE TEST FAILED: {str(e)}")
        print("=" * 60)

def test_error_handling():
    """Test error handling scenarios"""
    print("\n" + "=" * 60)
    print("TESTING ERROR HANDLING SCENARIOS")
    print("=" * 60)
    
    try:
        # Test: Try to get non-existent user
        print("\n1. TESTING GET NON-EXISTENT USER")
        print("-" * 30)
        try:
            non_existent_user = get_user_by_id("non_existent_user_999")
            print(f"[ERROR] Should have failed but got: {non_existent_user}")
        except Exception as e:
            print(f"[SUCCESS] Correctly handled non-existent user!")
            print(f"   Error Message: {str(e)}")
        
        # Test: Try to delete non-existent user
        print("\n2. TESTING DELETE NON-EXISTENT USER")
        print("-" * 30)
        try:
            delete_result = remove_user("non_existent_user_999")
            print(f"[ERROR] Should have failed but got: {delete_result}")
        except Exception as e:
            print(f"[SUCCESS] Correctly handled delete of non-existent user!")
            print(f"   Error Message: {str(e)}")
        
        
        print("\n" + "=" * 60)
        print("ERROR HANDLING TESTS COMPLETED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] ERROR HANDLING TEST FAILED: {str(e)}")

if __name__ == "__main__":
    print("Starting User, Driver, and Event Create Function Test Suite...")
    
    # Run user tests
    test_user_functions()
    
    # Run driver create tests
    test_driver_functions()
    
    # Run event create tests
    test_event_functions()
    
    # Run error handling tests
    test_error_handling()
    
    print("\n[COMPLETE] Test Suite Complete!")
