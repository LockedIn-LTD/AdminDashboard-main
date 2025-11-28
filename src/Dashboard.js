import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StyleSheets/index.css";
import Navbar from "./Components/Navbar";
import Popup from "./Components/Popup";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [drivers, setDrivers] = useState([]);
  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [removedDriverName, setRemovedDriverName] = useState("");
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Popup state management
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
      alert('Please log in to view your drivers.');
      navigate('/login');
      return;
    }
    
    setCurrentUserId(userId);
  }, [navigate]);

  // Fetch drivers from API on component mount and poll for updates
  useEffect(() => {
    // Don't fetch if no user is logged in
    if (!currentUserId) {
      return;
    }

    const fetchDrivers = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setIsLoadingDrivers(true);
        }

        const response = await fetch(`http://localhost:5001/drivers/user/${currentUserId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        
        const data = await response.json();
        
        if (data.drivers && data.drivers.length > 0) {
          const driversWithIds = data.drivers.map(driver => {
            if (!driver.driverId && driver.name) {
              console.warn('Driver missing driverId, generating one:', driver.name);
              return {
                ...driver,
                driverId: `driver_${driver.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
              };
            }
            return driver;
          });
          
          const processedDrivers = await Promise.all(
            driversWithIds.map(async (driver) => {
              const shouldBeDriving = driver.status !== "Idle";
              const currentlyDriving = driver.driving === true || driver.driving === "Yes";
              
              if (shouldBeDriving && !currentlyDriving) {
                try {
                  await fetch(`http://localhost:5001/drivers/${driver.driverId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: currentUserId,
                      fieldToChange: 'driving',
                      newValue: true
                    })
                  });
                  return { ...driver, driving: true };
                } catch (error) {
                  console.error('Error updating driving status:', error);
                  return driver;
                }
              }
              
              if (!shouldBeDriving && currentlyDriving) {
                try {
                  await fetch(`http://localhost:5001/drivers/${driver.driverId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: currentUserId,
                      fieldToChange: 'driving',
                      newValue: false
                    })
                  });
                  // Update local state
                  return { ...driver, driving: false };
                } catch (error) {
                  console.error('Error updating driving status:', error);
                  return driver;
                }
              }
              
              return driver;
            })
          );
          
          setDrivers(processedDrivers);
          
          if (isInitialLoad) {
            console.log('Loaded', processedDrivers.length, 'drivers for user:', currentUserId);
          }
        } else {
          setDrivers([]);
          if (isInitialLoad) {
            console.log('No drivers found for user:', currentUserId);
          }
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        if (isInitialLoad) {
          setDrivers([]);
        }
      } finally {
        if (isInitialLoad) {
          setIsLoadingDrivers(false);
        }
      }
    };

    fetchDrivers(true);
    
    // Set up polling interval (every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchDrivers(false);
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [currentUserId]); 

  useEffect(() => {
    if (location.state?.updatedDriver) {
      setDrivers(prevDrivers => {
        return prevDrivers.map(driver => 
          driver.driverId === location.state.updatedDriver.driverId ||
          driver.name === location.state.originalName ||
          driver.name === location.state.updatedDriver.name
            ? { ...driver, ...location.state.updatedDriver }
            : driver
        );
      });
      window.history.replaceState({}, document.title);
    }
    
    if (location.state?.newDriver) {
      setDrivers(prevDrivers => {
        const newDriver = location.state.newDriver;
        const exists = prevDrivers.some(driver => 
          driver.driverId === newDriver.driverId
        );
        if (!exists) {
          return [...prevDrivers, newDriver];
        }
        return prevDrivers;
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddDriver = () => {
    navigate('/add-driver');
  };

  const openDeletePopup = (driver) => {
    setDriverToDelete(driver);
    setIsPopupOpen(true);
  };
  
  const closeDeletePopup = () => {
    setDriverToDelete(null);
    setIsPopupOpen(false);
  };

  const confirmDelete = async () => {
    if (!currentUserId) {
      alert('Error: No user is currently logged in.');
      closeDeletePopup();
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/drivers/${driverToDelete.driverId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete driver');
      }

      setDrivers(drivers.filter(driver => driver.driverId !== driverToDelete.driverId));
      setRemovedDriverName(driverToDelete.name);
      setShowToast(true);
      closeDeletePopup();
      
      console.log('Driver deleted successfully:', driverToDelete.driverId);
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert(`Failed to delete driver: ${error.message}`);
      closeDeletePopup();
    }
  };

  const handleRemoveDriver = (driver) => {
    openDeletePopup(driver);
  };

  const handleEditDriver = (driver) => {
    navigate('/edit-driver', { 
      state: { 
        driver: {
          driverId: driver.driverId,
          name: driver.name,
          profilePic: driver.profilePic,
          phoneNumber: driver.phone_number || driver.phoneNumber || "",
          productId: driver.productId || "",
          emergencyContacts: driver.emergency_contacts || driver.emergencyContacts || []
        }
      } 
    });
  };

  const filteredDrivers = drivers
  .filter(driver => driver.name && driver.name.toLowerCase().includes(searchQuery.toLowerCase()))
  .sort((a, b) => {
    switch(sortOption) {
      case "Name":
        return (a.name || "").localeCompare(b.name || "");
      case "Status":
        const statusOrder = { 
          "Critical": 3,
          "Mild": 2,
          "Stable": 1,
          "Idle": 0
        };
        const statusA = a.status || "Idle";
        const statusB = b.status || "Idle";
        const orderDiff = (statusOrder[statusB] || 0) - (statusOrder[statusA] || 0);
        return orderDiff !== 0 ? orderDiff : (a.name || "").localeCompare(b.name || "");
      case "Activity":
        const drivingA = a.driving === true || a.driving === "Yes";
        const drivingB = b.driving === true || b.driving === "Yes";
        if (drivingB && !drivingA) return 1;
        if (drivingA && !drivingB) return -1;
        return (a.name || "").localeCompare(b.name || "");
      case "Newest":
        const dateA = new Date(a.timeStamp || a.createdAt || 0);
        const dateB = new Date(b.timeStamp || b.createdAt || 0);
        return dateB - dateA;
      case "Oldest":
        const dateOldestA = new Date(a.timeStamp || a.createdAt || 0);
        const dateOldestB = new Date(b.timeStamp || b.createdAt || 0);
        return dateOldestA - dateOldestB;
      case "None":
      default:
        return 0;
    }
  });

  if (!currentUserId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="main-content">
      <nav className="navbar">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/images/DriveSense_Brand.png`} alt="DriveSense Logo" />
        </div>
        <div className="menu">
          <Navbar />
        </div>
      </nav>

      <h2 className="title">Connected Drivers</h2>
      
      <Popup 
        isOpen={isPopupOpen}
        onClose={closeDeletePopup}
        onConfirm={confirmDelete}
        message={
          <>Do you wish to delete driver <br />
          {driverToDelete?.name}?</>
        }
      />

      <div className="controls">
        <button className="add-driver" onClick={handleAddDriver}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="black"
            className="icon"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
          Add Driver
        </button>
        
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Search by name" 
            className="search-bar" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <select 
          className="sort-dropdown"
          value={sortOption}
          onChange={handleSortChange}
        >
          <option value="None" disabled hidden>Sort by</option>
          <option value="None">None</option>
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
          <option value="Status">Status</option>
          <option value="Activity">Activity</option>
          <option value="Name">Name</option>
        </select>
      </div>

      {isLoadingDrivers ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          Loading your drivers...
        </div>
      ) : (
        <div className="drivers-grid">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => {
              const getStatusColor = (status) => {
                switch(status) {
                  case "Critical":
                    return "red";
                  case "CRITICAL":
                    return "red";
                  case "Mild":
                    return "yellow";
                  case "MILD":
                    return "yellow";
                  case "Stable":
                    return "green";
                  case "STABLE":
                    return "green";
                  case "Idle":
                  default:
                    return "gray";
                }
              };
              
              // Determine driving status based on status field
              const isDriving = driver.status !== "Idle";
              
              return (
              <div 
                key={driver.driverId} 
                className={`driver-card ${getStatusColor(driver.status)}`}
                onClick={() => navigate(`/event-log/${driver.name}`, {
                  state: {
                    driverId: driver.driverId,
                    profilePic: driver.profilePic,
                    userId: currentUserId 
                  }
                })}
              >
                <img
                  src={driver.profilePic || `${process.env.PUBLIC_URL}/images/profile.png`}
                  alt="Profile picture"
                  className="profile"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `${process.env.PUBLIC_URL}/images/profile.png`;
                  }}
                />
                <h3>{driver.name}</h3>
                <p>Status: {driver.status || 'Unknown'}</p>
                <p>Driving: {isDriving ? "Yes" : "No"}</p>
                <div className="card-buttons" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEditDriver(driver)}>
                    Edit Driver
                  </button>
                  <button onClick={() => handleRemoveDriver(driver)}>
                    Remove Driver
                  </button>
                </div>
              </div>
            );
            })
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              fontSize: '18px', 
              color: '#666' 
            }}>
              {searchQuery ? 'No drivers match your search.' : 'No drivers found. Click "Add Driver" to get started!'}
            </div>
          )}
        </div>
      )}

      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-icon"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Driver "{removedDriverName}" successfully removed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;