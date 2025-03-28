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
  const [currentStats] = useState({
    heartRate: "70 BPM",
    heartRateStatus: "Good",
    breathingRate: "42 BrPM",
    breathingRateStatus: "High",
    speed: "30 Km/h",
    speedStatus: "Mild"
  });

  const profilePic = location.state?.profilePic || "/images/profile.png";

  useEffect(() => {
    const driverEvents = mockEventsData[driverName] || [];
    setEvents(driverEvents);
  }, [driverName]);

  const toggleEvent = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
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
                <p className="metric-value">{currentStats.heartRate}</p>
                <div className="status-badge good">
                  {currentStats.heartRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Breathing Rate</h3>
                <p className="metric-value">{currentStats.breathingRate}</p>
                <div className="status-badge high">
                  {currentStats.breathingRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Vehicle Speed</h3>
                <p className="metric-value">{currentStats.speed}</p>
                <div className="status-badge mild">
                  {currentStats.speedStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="events-section">
            <h2>Events</h2>
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