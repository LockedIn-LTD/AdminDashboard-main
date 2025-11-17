from User import EmergencyContact, User 
from Event import Event
from typing import Dict, Any, List


class Driver:
    """Represents a driver, potentially including their safety data."""
    def __init__(self, name: str, phone_number: str, profile_pic: str = "", product_id: int = 0):
        self._name = name
        self._phone_number = phone_number
        self._profile_pic = profile_pic
        self._product_id = product_id
        self._emergency_contacts: List[EmergencyContact] = []
        self._events: List[Event] = []
        
        # Data fields
        self._time_stamp: str = ""
        self._date: str = ""
        self._heart_rate: int = 0
        self._blood_oxygen_level: int = 0
        self._vehicle_speed: int = 0
        self._video_link: str = ""
        
        # New attributes
        self._driving: bool = False
        self._status: str = "Idle"  # Options: Unstable, Severe, LockedIn, Idle

    # Getters
    def get_name(self) -> str:
        return self._name

    def get_phone_number(self) -> str:
        return self._phone_number
    
    def get_profile_pic(self) -> str:
        return self._profile_pic
    
    def get_product_id(self) -> int:
        return self._product_id

    def get_emergency_contacts(self) -> List[EmergencyContact]:
        return self._emergency_contacts

    def get_events(self) -> List[Event]:
        return self._events
    
    def get_time_stamp(self) -> str:
        return self._time_stamp
    
    def get_date(self) -> str:
        return self._date
    
    def get_heart_rate(self) -> int:
        return self._heart_rate
    
    def get_blood_oxygen_level(self) -> int:
        return self._blood_oxygen_level
    
    def get_vehicle_speed(self) -> int:
        return self._vehicle_speed
    
    def get_video_link(self) -> str:
        return self._video_link
    
    def get_driving(self) -> bool:
        return self._driving
    
    def get_status(self) -> str:
        return self._status

    # Setters
    def set_name(self, n: str):
        self._name = n

    def set_phone_number(self, p: str):
        self._phone_number = p
    
    def set_profile_pic(self, pic: str):
        self._profile_pic = pic
    
    def set_product_id(self, pid: int):
        self._product_id = pid

    def add_emergency_contact(self, contact: EmergencyContact):
        self._emergency_contacts.append(contact)

    def add_event(self, event: Event):
        self._events.append(event)
        
    def set_time_stamp(self, time: str):
        self._time_stamp = time
        
    def set_date(self, dt: str):
        self._date = dt
        
    def set_heart_rate(self, hr: int):
        self._heart_rate = hr
        
    def set_blood_oxygen_level(self, bol: int):
        self._blood_oxygen_level = bol
        
    def set_vehicle_speed(self, vs: int):
        self._vehicle_speed = vs
        
    def set_video_link(self, vid: str):
        self._video_link = vid
    
    def set_driving(self, driving: bool):
        self._driving = driving
    
    def set_status(self, status: str):
        """
        Sets the driver's status.
        Valid options: Unstable, Severe, LockedIn, Idle
        """
        valid_statuses = ["Unstable", "Severe", "LockedIn", "Idle"]
        if status in valid_statuses:
            self._status = status
        else:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    def to_map(self) -> Dict[str, Any]:
        """Converts the driver and their lists to a dictionary for Firestore storage."""
        return {
            "name": self._name,
            "phone_number": self._phone_number,
            "profilePic": self._profile_pic,
            "productId": self._product_id,
            "emergency_contacts": [c.to_map() for c in self._emergency_contacts],
            "events": [e.to_map() for e in self._events],
            "timeStamp": self._time_stamp,
            "date": self._date,
            "heartRate": self._heart_rate,
            "bloodOxygenLevel": self._blood_oxygen_level,
            "vehicleSpeed": self._vehicle_speed,
            "videoLink": self._video_link,
            "driving": self._driving,
            "status": self._status
        }