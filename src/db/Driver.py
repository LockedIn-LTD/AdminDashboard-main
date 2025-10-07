from User import EmergencyContact, User 
from Event import Event
from typing import Dict, Any, List


class Driver:
    """Represents a driver, potentially including their safety data."""
    def __init__(self, name: str, phone_number: str, email: str):
        self._name = name
        self._phone_number = phone_number
        self._email = email
        self._emergency_contacts: List[EmergencyContact] = []
        self._events: List[Event] = []
        
        # Data fields
        self._time_stamp: str = ""
        self._date: str = ""
        self._heart_rate: int = 0
        self._vehicle_speed: int = 0
        self._video_link: str = ""


    # Getters
    def get_name(self) -> str:
        return self._name

    def get_phone_number(self) -> str:
        return self._phone_number

    def get_email(self) -> str:
        return self._email

    def get_emergency_contacts(self) -> List[EmergencyContact]:
        return self._emergency_contacts

    def get_events(self) -> List[Event]:
        return self._events
    
    def get_time_stamp(self) -> str:
        return self._time_stamp
    
    def get_date(self) -> str:
        return self._date
    
    def get_video_link(self) -> str:
        return self._video_link

    # Setters
    def set_name(self, n: str):
        self._name = n

    def set_phone_number(self, p: str):
        self._phone_number = p

    def set_email(self, e: str):
        self._email = e

    def add_emergency_contact(self, contact: EmergencyContact):
        self._emergency_contacts.append(contact)

    def add_event(self, event: Event):
        self._events.append(event)
        
    def set_time_stamp(self, time: str):
        self._time_stamp = time
        
    def set_date(self, dt: str):
        self._date = dt
        
    def set_video_link(self, vid: str):
        self._video_link = vid

    def to_map(self) -> Dict[str, Any]:
        """Converts the driver and their lists to a dictionary for Firestore storage."""
        return {
            "name": self._name,
            "phone_number": self._phone_number,
            "email": self._email,
            "emergency_contacts": [c.to_map() for c in self._emergency_contacts],
            "events": [e.to_map() for e in self._events],
            "timeStamp": self._time_stamp,
            "date": self._date,
            "heartRate": self._heart_rate,
            "vehicleSpeed": self._vehicle_speed,
            "videoLink": self._video_link
        }