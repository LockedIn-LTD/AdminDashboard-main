from typing import Dict, Any
MapFieldValue = Dict[str, Any]

class User:
    """Represents a user with basic identifying information."""
    def __init__(self, user_id: str, name: str, email: str, phone_number: str):
        self._user_id = user_id
        self._name = name
        self._email = email
        self._phone_number = phone_number

    # Getters
    def get_user_id(self) -> str:
        return self._user_id

    def get_name(self) -> str:
        return self._name

    def get_email(self) -> str:
        return self._email

    def get_phone_number(self) -> str:
        return self._phone_number

    # Setters
    def set_user_id(self, id: str):
        self._user_id = id

    def set_name(self, n: str):
        self._name = n

    def set_email(self, e: str):
        self._email = e

    def set_phone_number(self, p: str):
        self._phone_number = p

    # Mapping function
    def to_map(self) -> MapFieldValue:
        """Converts the user object to a dictionary for Firestore storage."""
        return {
            "userId": self._user_id,
            "name": self._name,
            "email": self._email,
            "phoneNumber": self._phone_number
        }


class EmergencyContact:
    """Represents an emergency contact."""
    def __init__(self, name: str, phone_number: str):
        self._name = name
        self._phone_number = phone_number

    # Getters
    def get_name(self) -> str:
        return self._name

    def get_phone_number(self) -> str:
        return self._phone_number

    # Setters
    def set_name(self, n: str):
        self._name = n

    def set_phone_number(self, p: str):
        self._phone_number = p
        
    def to_map(self) -> MapFieldValue:
        """Converts the contact to a dictionary for Firestore storage."""
        return {
            "name": self._name,
            "phone_number": self._phone_number,
        }
