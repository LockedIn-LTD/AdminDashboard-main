from Database import Database
from User import User
import firebase_admin
from firebase_admin import credentials, firestore


PROJECT_ID = "drivesense-c1d4c" 

CREDENTIALS_FILE = "database_key.json"

print("--- Running Database Class Example ---")
try:
    db_handler = Database(PROJECT_ID, credentials_path=CREDENTIALS_FILE) 

    if db_handler._db:
        USER_COLLECTION = "users_test"
        USER_ID = "user_456"

        new_user = User(
            user_id=USER_ID,
            name="Jane Doe",
            email="jane.doe@test.com",
            phone_number="123-456-7890"
        )

        print("\nAttempting to set new User document...")
        user_data_to_save = new_user.to_map()
        db_handler.set_document(USER_COLLECTION, USER_ID, user_data_to_save)

        print("\nAttempting to update User phone number...")
        update_fields = {"phoneNumber": "555-555-5555", "last_updated": firestore.SERVER_TIMESTAMP}
        db_handler.update_document(USER_COLLECTION, USER_ID, update_fields)
        
        print("\nAttempting to retrieve updated User document...")
        retrieved_data = db_handler.get_document(USER_COLLECTION, USER_ID)
        print(f"\nFinal Retrieved User Data: {retrieved_data}")
        
except Exception as e:
    print(f"\nExample usage failed: {e}")
print("--------------------------------------")