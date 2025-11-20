import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./StyleSheets/index.css";

// Helper function to generate unique event IDs
const generateEventId = (driverName) => {
  return `event_${driverName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
};

// Helper function to convert date format
const formatDate = (dateStr) => {
  // If already in "Month Day, Year" format, return as is
  if (dateStr.match(/^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/)) {
    return dateStr;
  }
  
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  
  // Try parsing as a general date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  
  return dateStr; // Return original if can't parse
};

// Helper function to convert time format
const formatTime = (timeStr) => {
  // If already in 12-hour format, return as is
  if (timeStr.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
    return timeStr;
  }
  
  // Handle HH:MM:SS format (24-hour)
  if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // Try parsing as a general time
  try {
    const date = new Date(`1970-01-01T${timeStr}`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch (e) {
    // Continue to return original
  }
  
  return timeStr; // Return original if can't parse
};

// Helper function to convert Firebase Storage URLs
const getVideoUrl = (videoLink) => {
  if (!videoLink) return '';
  
  // If it's a gs:// URL, convert to Firebase Storage download URL
  if (videoLink.startsWith('gs://')) {
    // Extract bucket and path
    const gsPattern = /gs:\/\/([^\/]+)\/(.+)/;
    const match = videoLink.match(gsPattern);
    if (match) {
      const bucket = match[1];
      const path = encodeURIComponent(match[2]);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
  }
  
  // Return as-is if it's already an HTTP(S) URL
  return videoLink;
};

const EventLog = () => {
  const { driverName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentStats, setCurrentStats] = useState({
    heartRate: 70,
    heartRateStatus: "Good",
    bloodOxygenLevel: 98,
    bloodOxygenStatus: "Good",
    speed: 30,
    speedStatus: "Mild"
  });

  const defaultProfilePic = `${process.env.PUBLIC_URL}/images/profile.png`;
  const profilePic = (location.state?.profilePic && location.state.profilePic.trim() !== '') 
    ? location.state.profilePic 
    : defaultProfilePic;

  // Get driverId from location state or generate from driverName
  useEffect(() => {
    if (location.state?.driverId) {
      setDriverId(location.state.driverId);
    } else {
      // Generate driverId if not passed (fallback)
      const generatedId = `driver_${driverName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      setDriverId(generatedId);
      console.warn('No driverId provided, generated:', generatedId);
    }
  }, [driverName, location.state]);

  // Fetch events from API when driverId is available
  useEffect(() => {
    const fetchEvents = async () => {
      if (!driverId) return;

      try {
        setIsLoadingEvents(true);
        const response = await fetch(`http://localhost:5002/drivers/${driverId}/events`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        console.log('Fetched events:', data);
        
        // Transform events to include UI-friendly fields with formatted dates/times
        const transformedEvents = data.events.map(event => ({
          ...event,
          date: formatDate(event.date),
          timeStamp: formatTime(event.timeStamp),
          bloodOxygenLevel: event.bloodOxygenLevel || 98,
          videoUrl: getVideoUrl(event.videoLink),
          hasClip: !!event.videoLink
        }));
        
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // If fetch fails, show empty array
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [driverId]);

  useEffect(() => {
    const getStatus = (value, type) => {
      switch (type) {
        case 'heartRate':
          if (value < 80) return "Good";
          if (value < 100) return "Mild";
          return "High";
        case 'bloodOxygenLevel':
          if (value >= 95) return "Good";
          if (value >= 90) return "Mild";
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
        
        const newBloodOxygenLevel = parseFloat(Math.max(
          85,
          Math.min(
            100,
            prevStats.bloodOxygenLevel + (Math.random() > 0.5 ? 0.5 : -0.5) * Math.random()
          )
        ).toFixed(1));
        
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
          bloodOxygenLevel: newBloodOxygenLevel,
          bloodOxygenStatus: getStatus(newBloodOxygenLevel, 'bloodOxygenLevel'),
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

  const addEvent = async () => {
    if (!driverId) {
      alert('Driver ID not available. Please navigate from the dashboard.');
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",  
    });
    
    const eventId = generateEventId(driverName);
    const timeStamp = currentDate.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const newEventData = {
      eventId: eventId,
      driverId: driverId,
      status: "Mild",
      timeStamp: timeStamp,
      date: formattedDate,
      videoLink: "",
      heartRate: currentStats.heartRate,
      bloodOxygenLevel: currentStats.bloodOxygenLevel,
      vehicleSpeed: currentStats.speed
    };

    try {
      const response = await fetch('http://localhost:5002/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const result = await response.json();
      console.log('Event created successfully:', result);

      const newEvent = {
        ...newEventData,
        videoUrl: getVideoUrl(newEventData.videoLink),
        hasClip: false
      };

      setEvents([...events, newEvent]);
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5002/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      console.log('Event deleted successfully');
      
      // Update local state
      setEvents(events.filter(event => event.eventId !== eventId));
      
      // Close expanded view if it was open
      if (expandedEvent === eventId) {
        setExpandedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.message}`);
    }
  };

  const downloadEventReport = (event, eventNumber) => {
    const reportContent = `
EVENT REPORT
============================================

Driver: ${driverName}
Driver ID: ${driverId}
Event Number: ${eventNumber}
Event ID: ${event.eventId}
Date: ${event.date}
Time: ${event.timeStamp || 'N/A'}

EVENT DETAILS
============================================
Severity: ${event.status}
Heart Rate: ${event.heartRate} BPM
Blood Oxygen Level: ${event.bloodOxygenLevel}%
Vehicle Speed: ${event.vehicleSpeed} Km/h
Video Clip Available: ${event.hasClip || event.videoLink ? 'Yes' : 'No'}

============================================
Report Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${driverName}_Event${eventNumber}_${event.date.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
                alt={`${driverName} profile picture`}
                className="profile-large"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfilePic;
                }}
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
                <h3>Blood Oxygen Level</h3>
                <p className="metric-value">{currentStats.bloodOxygenLevel}%</p>
                <div className={`status-badge ${currentStats.bloodOxygenStatus.toLowerCase()}`}>
                  {currentStats.bloodOxygenStatus}
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
            
            {isLoadingEvents ? (
              <p>Loading events...</p>
            ) : events.length > 0 ? (
              events.map((event, index) => {
                const eventNumber = index + 1;
                
                return (
                  <div key={event.eventId} className="event-accordion">
                    <div 
                      className="event-header"
                      onClick={() => toggleEvent(event.eventId)}
                    >
                      <h3>Event {eventNumber}: {event.date}</h3>
                      <span className="toggle-icon">
                        {expandedEvent === event.eventId ? '−' : '+'}
                      </span>
                    </div>
                    
                    {expandedEvent === event.eventId && (
                      <div className="event-details">
                        <div className="detail-row">
                          <span>Severity:</span>
                          <span>{event.status}</span>
                        </div>
                        <div className="detail-row">
                          <span>Heart Rate:</span>
                          <span>{event.heartRate} BPM</span>
                        </div>
                        <div className="detail-row">
                          <span>Blood Oxygen Level:</span>
                          <span>{event.bloodOxygenLevel}%</span>
                        </div>
                        <div className="detail-row">
                          <span>Vehicle Speed:</span>
                          <span>{event.vehicleSpeed} Km/h</span>
                        </div>
                        <div className="detail-row">
                          <span>Time:</span>
                          <span>{event.timeStamp || 'N/A'}</span>
                        </div>
                        {(event.hasClip || event.videoLink) && event.videoUrl && (
                          <div className="video-container">
                            <video controls width="100%">
                              <source src={event.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        <div className="event-actions">
                          <button 
                            className="download-report-button" 
                            onClick={() => downloadEventReport(event, eventNumber)}
                          >
                            Download Event Report
                          </button>
                          <button 
                            className="delete-event-button" 
                            onClick={() => deleteEvent(event.eventId)}
                            style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}
                          >
                            Delete Event
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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