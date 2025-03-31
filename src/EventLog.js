import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const mockEventsData = {
  "Joe Smith": [
    {
      id: 1,
      date: "January 29th, 2025",
      severity: "Mild",
      heartRate: "99999 BPM",
      breathingRate: "54 BPM",
      vehicleSpeed: "140 Km/h",
      wheelHoldTime: "1 minute 30secs",
      hasClip: true
    },
    {
      id: 2,
      date: "January 30th, 2025",
      severity: "High",
      heartRate: "99 BPM",
      breathingRate: "54 BPM",
      vehicleSpeed: "140 Km/h",
      wheelHoldTime: "2 minutes",
      hasClip: false
    },
    {
      id: 3,
      date: "January 31st, 2025",
      severity: "Mild",
      heartRate: "70 BPM",
      breathingRate: "42 BPM",
      vehicleSpeed: "30 Km/h",
      wheelHoldTime: "1 minute",
      hasClip: false
    },
    {
      id: 4,
      date: "February 1st, 2025",
      severity: "Severe",
      heartRate: "120 BPM",
      breathingRate: "60 BPM",
      vehicleSpeed: "90 Km/h",
      wheelHoldTime: "3 minutes",
      hasClip: true
    }
  ]
};

const EventLog = () => {
  const { driverName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [currentStats, setCurrentStats] = useState({
    heartRate: 70,
    heartRateStatus: "Normal",
    breathingRate: 42,
    breathingRateStatus: "High",
    speed: 30,
    speedStatus: "Mild"
  });

  const profilePic = location.state?.profilePic || "/images/profile.png";

  useEffect(() => {
    const driverEvents = mockEventsData[driverName] || [];
    setEvents(driverEvents);
  }, [driverName]);

  useEffect(() => {
    const updateStats = () => {
      setCurrentStats((prevStats) => ({
        heartRate: parseFloat(Math.max(60, //max ensures number does not drop below 60
          Math.min(120, //min ensures number does not exceed 120
            prevStats.heartRate + (Math.random() > 0.5 ? 1 : -1) * Math.random()*5)).toFixed(0)),
        breathingRate: parseFloat(Math.max(30,
          Math.min(60,
            prevStats.breathingRate + (Math.random() > 0.5 ? 1 : -1)*Math.random() * 3)).toFixed(0)),
        speed: parseFloat(Math.max(20,
          Math.min(100,
            prevStats.speed + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 10)).toFixed(0)),
        heartRateStatus: "Normal",
        breathingRateStatus: "High",
        speedStatus: "Mild"
      }));
    };

    const interval = setInterval(updateStats, 1000); //update every 1s

    return () => clearInterval(interval);//clear when component unmounts
  }, []);

  const toggleEvent = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const addEvent = () => {
    //create new event object
    const newEvent = {
      id: events.length + 1, //generate unique ID
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",  
      }),
      severity: "Mild",
      heartRate: "80 BPM",
      breathingRate: "50 BrPM",
      vehicleSpeed: "60 Km/h",
      wheelHoldTime: "1 minute",
      hasClip: true,
    };
    //adds new event to end of list of events
    setEvents([...events, newEvent]);
  };

  return (
    <div className="main-content">
      <div className="event-log-container">
        <div className="event-log-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </button>

          <div className="driver-profile-section">
            <div className="profile-container">
              <img
                src={profilePic}
                alt="Profile picture"
                className="profile-large"
              />
              <h1 className="driver-name">{driverName}</h1>
            </div>

            <div className="metrics-container">
              <div className="metric-card">
                <h3>Heart Rate</h3>
                <p className="metric-value">{currentStats.heartRate} BPM</p>
                <div className="status-badge good">
                  {currentStats.heartRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Breathing Rate</h3>
                <p className="metric-value">{currentStats.breathingRate} BrPM</p>
                <div className="status-badge high">
                  {currentStats.breathingRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Vehicle Speed</h3>
                <p className="metric-value">{currentStats.speed} km/h</p>
                <div className="status-badge mild">
                  {currentStats.speedStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="events-section">
            <h2>Events</h2>
            <button className="add-event-test-button" onClick={addEvent}>
              Add Event
            </button>
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="event-accordion">
                  <div 
                    className="event-header"
                    onClick={() => toggleEvent(event.id)}
                  >
                    <h3>Event {event.id}: {event.date}</h3>
                    <span className="toggle-icon">
                      {expandedEvent === event.id ? '−' : '+'}
                    </span>
                  </div>
                  
                  {expandedEvent === event.id && (
                    <div className="event-details">
                      <div className="detail-row">
                        <span>Severity:</span>
                        <span>{event.severity}</span>
                      </div>
                      <div className="detail-row">
                        <span>Heart Rate:</span>
                        <span>{event.heartRate}</span>
                      </div>
                      <div className="detail-row">
                        <span>Breathing Rate:</span>
                        <span>{event.breathingRate}</span>
                      </div>
                      <div className="detail-row">
                        <span>Vehicle Speed:</span>
                        <span>{event.vehicleSpeed}</span>
                      </div>
                      <div className="detail-row">
                        <span>Wheel Hold Time:</span>
                        <span>{event.wheelHoldTime}</span>
                      </div>
                      {event.hasClip && (
                        <div className="video-placeholder">
                          <p>Video clip will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No events recorded for this driver</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLog;