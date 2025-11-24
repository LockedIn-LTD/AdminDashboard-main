import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./StyleSheets/index.css";

// Helper function to generate unique event IDs
const generateEventId = (driverName) => {
  return `event_${driverName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
};

const formatDate = (dateStr) => {
  if (dateStr.match(/^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/)) {
    return dateStr;
  }
  
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  
  return dateStr; 
};

const formatTime = (timeStr) => {
  if (timeStr.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
    return timeStr;
  }
  
  if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
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
  }
  
  return timeStr; 
};

const getVideoUrl = (videoLink) => {
  if (!videoLink) return '';
  
  if (videoLink.startsWith('gs://')) {
    const gsPattern = /gs:\/\/([^\/]+)\/(.+)/;
    const match = videoLink.match(gsPattern);
    if (match) {
      const bucket = match[1];
      const path = encodeURIComponent(match[2]);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
  }
  
  return videoLink;
};

const EventLog = () => {
  const { driverName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  const [currentStats, setCurrentStats] = useState({
    heartRate: 0,
    heartRateStatus: "Good",
    bloodOxygenLevel: 0,
    bloodOxygenStatus: "Good",
    speed: 0,
    speedStatus: "Mild"
  });

  const defaultProfilePic = `${process.env.PUBLIC_URL}/images/profile.png`;
  const profilePic = (location.state?.profilePic && location.state.profilePic.trim() !== '') 
    ? location.state.profilePic 
    : defaultProfilePic;

  useEffect(() => {
    if (location.state?.driverId) {
      setDriverId(location.state.driverId);
    } else {
      const generatedId = `driver_${driverName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      setDriverId(generatedId);
      console.warn('No driverId provided, generated:', generatedId);
    }

    if (location.state?.userId) {
      setUserId(location.state.userId);
    } else {
      console.warn('No userId provided');
    }
  }, [driverName, location.state]);

  // Fetch driver data to get current stats with polling
  useEffect(() => {
    const fetchDriverData = async (isInitialLoad = false) => {
      if (!driverId || !userId) return;

      try {
        if (isInitialLoad) {
          setIsLoadingDriver(true);
        }
        
        const response = await fetch(`http://localhost:5001/drivers/${driverId}?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch driver data');
        }

        const data = await response.json();
        console.log('Fetched driver data:', data);
        
        const driverData = data.driver;
        
        // Helper function to determine status based on value and type
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

        // Set current stats from driver data
        setCurrentStats({
          heartRate: driverData.heartRate || 0,
          heartRateStatus: getStatus(driverData.heartRate || 0, 'heartRate'),
          bloodOxygenLevel: driverData.bloodOxygenLevel || 0,
          bloodOxygenStatus: getStatus(driverData.bloodOxygenLevel || 0, 'bloodOxygenLevel'),
          speed: driverData.vehicleSpeed || 0,
          speedStatus: getStatus(driverData.vehicleSpeed || 0, 'speed')
        });
      } catch (error) {
        console.error('Error fetching driver data:', error);
        // Only set defaults on initial load
        if (isInitialLoad) {
          setCurrentStats({
            heartRate: 0,
            heartRateStatus: "Good",
            bloodOxygenLevel: 0,
            bloodOxygenStatus: "Good",
            speed: 0,
            speedStatus: "Good"
          });
        }
      } finally {
        if (isInitialLoad) {
          setIsLoadingDriver(false);
        }
      }
    };

    // Initial fetch
    fetchDriverData(true);
    
    // Set up polling interval (every 2 seconds for real-time updates)
    const pollInterval = setInterval(() => {
      fetchDriverData(false);
    }, 2000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [driverId, userId]);

  // Fetch events from API when driverId is available with polling
  useEffect(() => {
    const fetchEvents = async (isInitialLoad = false) => {
      if (!driverId) return;

      try {
        if (isInitialLoad) {
          setIsLoadingEvents(true);
        }
        
        const response = await fetch(`http://localhost:5002/drivers/${driverId}/events`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        
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
        if (isInitialLoad) {
          setEvents([]);
        }
      } finally {
        if (isInitialLoad) {
          setIsLoadingEvents(false);
        }
      }
    };

    // Initial fetch
    fetchEvents(true);
    
    // Set up polling interval (every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchEvents(false);
    }, 3000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [driverId]);

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
      
      setEvents(events.filter(event => event.eventId !== eventId));
      
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

            {isLoadingDriver ? (
              <p>Loading driver stats...</p>
            ) : (
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
            )}
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