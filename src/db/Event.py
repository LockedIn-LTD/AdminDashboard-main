from typing import Dict, Any
MapFieldValue = Dict[str, Any]

class Event:
    """Represents a logged event."""
    def __init__(self, event_id: str, status: str, time_stamp: str, date: str, video_link: str, heart_rate: int = 0, vehicle_speed: int = 0):
        self._event_id = event_id
        self._status = status
        self._time_stamp = time_stamp
        self._date = date
        # Private members
        self._heart_rate = heart_rate
        self._vehicle_speed = vehicle_speed
        self._video_link = video_link

    # Getters
    def get_event_id(self) -> str:
        return self._event_id

    def get_status(self) -> str:
        return self._status

    def get_time_stamp(self) -> str:
        return self._time_stamp

    def get_date(self) -> str:
        return self._date
    
    def get_heart_rate(self) -> int:
        return self._heart_rate
    
    def get_vehicle_speed(self) -> int:
        return self._vehicle_speed

    def get_video_link(self) -> str:
        return self._video_link

    # Setters
    def set_event_id(self, id: str):
        self._event_id = id

    def set_status(self, stat: str):
        self._status = stat

    def set_time_stamp(self, time: str):
        self._time_stamp = time

    def set_date(self, dt: str):
        self._date = dt
    
    def set_heart_rate(self, hr: int):
        self._heart_rate = hr
    
    def set_vehicle_speed(self, vs: int):
        self._vehicle_speed = vs

    def set_video_link(self, vid: str):
        self._video_link = vid
        
    def to_map(self) -> MapFieldValue:
        """Converts the event to a dictionary for Firestore storage."""
        return {
            "eventId": self._event_id,
            "status": self._status,
            "timeStamp": self._time_stamp,
            "date": self._date,
            "heartRate": self._heart_rate,
            "vehicleSpeed": self._vehicle_speed,
            "videoLink": self._video_link
        }