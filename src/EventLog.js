import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const mockEventsData = {
  "Joe Smith": [
    {
      id: 1,
      date: "January 29th, 2025",
      severity: "Mild",
      heartRate: "128 BPM",
      breathingRate: "54 BPM",
      vehicleSpeed: "140 Km/h",
      wheelHoldTime: "1 minute 30secs",
      videoUrl: "/videos/testvideo.mp4",
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
    heartRateStatus: "Good",
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
    const getStatus = (value, type) => {
      switch (type) {
        case 'heartRate':
          if (value < 80) return "Good";
          if (value < 100) return "Mild";
          return "High";
        case 'breathingRate':
          if (value < 40) return "Good";
          if (value < 50) return "Mild";
          return "High";
        case 'speed':
          if (value < 60) return "Good";
          if (value < 80) return "Mild";
          return "High";
        default:
          return "Good";
      }
    };

    const updateStats = () => {
      setCurrentStats((prevStats) => {
        const newHeartRate = parseFloat(Math.max(
          60,
          Math.min(
            120,
            prevStats.heartRate + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5
          )
        ).toFixed(0));
        
        const newBreathingRate = parseFloat(Math.max(
          30,
          Math.min(
            60,
            prevStats.breathingRate + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 3
          )
        ).toFixed(0));
        
        const newSpeed = parseFloat(Math.max(
          20,
          Math.min(
            100,
            prevStats.speed + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 10
          )
        ).toFixed(0));

        return {
          heartRate: newHeartRate,
          heartRateStatus: getStatus(newHeartRate, 'heartRate'),
          breathingRate: newBreathingRate,
          breathingRateStatus: getStatus(newBreathingRate, 'breathingRate'),
          speed: newSpeed,
          speedStatus: getStatus(newSpeed, 'speed')
        };
      });
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleEvent = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const addEvent = () => {
    const newEvent = {
      id: events.length + 1,
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
                <div className={`status-badge ${currentStats.heartRateStatus.toLowerCase()}`}>
                  {currentStats.heartRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Breathing Rate</h3>
                <p className="metric-value">{currentStats.breathingRate} BrPM</p>
                <div className={`status-badge ${currentStats.breathingRateStatus.toLowerCase()}`}>
                  {currentStats.breathingRateStatus}
                </div>
              </div>

              <div className="metric-card">
                <h3>Vehicle Speed</h3>
                <p className="metric-value">{currentStats.speed} km/h</p>
                <div className={`status-badge ${currentStats.speedStatus.toLowerCase()}`}>
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
                        <div className="video-container">
                          <video controls width="100%">
                            <source src={event.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
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