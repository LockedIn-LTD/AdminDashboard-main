import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "./StyleSheets/index.css";

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

const getImageUrl = (imageLink) => {
  if (!imageLink) return '';
  
  if (imageLink.startsWith('gs://')) {
    const gsPattern = /gs:\/\/([^\/]+)\/(.+)/;
    const match = imageLink.match(gsPattern);
    if (match) {
      const bucket = match[1];
      const path = encodeURIComponent(match[2]);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
  }
  
  return imageLink;
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

        const roundedHeartRate = Math.round(driverData.heartRate || 0);
        const roundedBloodOxygen = Math.round(driverData.bloodOxygenLevel || 0);
        const roundedSpeed = Math.round(driverData.vehicleSpeed || 0);

        setCurrentStats({
          heartRate: roundedHeartRate,
          heartRateStatus: getStatus(roundedHeartRate, 'heartRate'),
          bloodOxygenLevel: roundedBloodOxygen,
          bloodOxygenStatus: getStatus(roundedBloodOxygen, 'bloodOxygenLevel'),
          speed: roundedSpeed,
          speedStatus: getStatus(roundedSpeed, 'speed')
        });
      } catch (error) {
        console.error('Error fetching driver data:', error);
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

    fetchDriverData(true);
    
    const pollInterval = setInterval(() => {
      fetchDriverData(false);
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [driverId, userId]);

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
          heartRate: Math.round(event.heartRate),
          bloodOxygenLevel: Math.round(event.bloodOxygenLevel || 98),
          vehicleSpeed: Math.round(event.vehicleSpeed),
          imageUrl: getImageUrl(event.videoLink),
          hasImage: !!event.videoLink
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

    fetchEvents(true);
    
    const pollInterval = setInterval(() => {
      fetchEvents(false);
    }, 1000);
    
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
        imageUrl: getImageUrl(newEventData.videoLink),
        hasImage: false
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
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('DriveSense Event Report', 105, 20, { align: 'center' });
    doc.setFont(undefined, 'normal');
    
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Driver Information', 20, 38);
    doc.setFont(undefined, 'normal');
    
    doc.setFontSize(12);
    doc.text(`Driver: ${driverName}`, 20, 48);
    doc.text(`Driver ID: ${driverId}`, 20, 56);
    doc.text(`Event Number: ${eventNumber}`, 20, 64);
    doc.text(`Event ID: ${event.eventId}`, 20, 72);
    doc.text(`Date: ${event.date}`, 20, 80);
    doc.text(`Time: ${event.timeStamp || 'N/A'}`, 20, 88);
    
    doc.setLineWidth(0.3);
    doc.line(20, 95, 190, 95);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Event Details', 20, 105);
    doc.setFont(undefined, 'normal');
    
    doc.setFontSize(12);
    doc.text(`Severity: ${event.status}`, 20, 115);
    doc.text(`Heart Rate: ${event.heartRate} BPM`, 20, 125);
    doc.text(`Blood Oxygen Level: ${event.bloodOxygenLevel}%`, 20, 135);
    doc.text(`Vehicle Speed: ${event.vehicleSpeed} Km/h`, 20, 145);
    
    doc.setLineWidth(0.3);
    doc.line(20, 155, 190, 155);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 280);
    
    doc.save(`${driverName}_Event${eventNumber}_${event.date.replace(/\s/g, '_')}.pdf`);
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
                        {(event.hasImage || event.videoLink) && event.imageUrl && (
                          <div className="image-container" style={{ marginTop: '15px' }}>
                            <img 
                              src={event.imageUrl} 
                              alt={`Event ${eventNumber} capture`}
                              style={{ 
                                width: '100%', 
                                maxWidth: '600px',
                                height: 'auto',
                                borderRadius: '8px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error('Failed to load event image');
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="event-actions">
                          <button 
                            className="download-report-button" 
                            onClick={() => downloadEventReport(event, eventNumber)}
                          >
                            Download Event Report
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