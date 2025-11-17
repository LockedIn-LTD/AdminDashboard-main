import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StyleSheets/index.css";
import Navbar from "./Components/Navbar";
import Popup from "./Components/Popup";

const initialDrivers = [
  { 
    driverId: "driver_david_brown_1",
    name: "David Brown", 
    status: "Severe", 
    driving: true, 
    color: "red", 
    createdAt: new Date().toISOString(),
    profilePic: `${process.env.PUBLIC_URL}/images/profile.png`,
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: ""
  },
  { 
    driverId: "driver_joe_smith_1",
    name: "Joe Smith", 
    status: "LockedIn", 
    driving: true, 
    color: "green", 
    createdAt: new Date().toISOString(),
    profilePic: `${process.env.PUBLIC_URL}/images/profile.png`,
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: ""
  },
  { 
    driverId: "driver_joe_rogan_1",
    name: "Joe Rogan", 
    status: "Unstable", 
    driving: true, 
    color: "yellow", 
    createdAt: new Date().toISOString(),
    profilePic: `${process.env.PUBLIC_URL}/images/profile.png`,
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: ""
  },
  { 
    driverId: "driver_john_adams_1",
    name: "John Adams", 
    status: "Idle", 
    driving: false, 
    color: "gray", 
    createdAt: new Date().toISOString(),
    profilePic: `${process.env.PUBLIC_URL}/images/profile.png`,
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: ""
  },
  { 
    driverId: "driver_alice_wills_1",
    name: "Alice Wills", 
    status: "Unstable", 
    driving: false, 
    color: "gray", 
    createdAt: new Date().toISOString(),
    profilePic: `${process.env.PUBLIC_URL}/images/profile.png`,
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: ""
  }  
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [drivers, setDrivers] = useState([]);
  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [removedDriverName, setRemovedDriverName] = useState("");
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  
  // Popup state management
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  // Fetch drivers from API on component mount and poll for updates
  useEffect(() => {
    const fetchDrivers = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setIsLoadingDrivers(true);
        }
        
        const response = await fetch('http://localhost:5001/drivers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        
        const data = await response.json();
        
        if (data.drivers && data.drivers.length > 0) {
          // Ensure each driver has a driverId field
          const driversWithIds = data.drivers.map(driver => {
            // If driver doesn't have driverId, try to extract it from the document
            if (!driver.driverId && driver.name) {
              // Generate a driverId if it doesn't exist
              console.warn('Driver missing driverId, generating one:', driver.name);
              return {
                ...driver,
                driverId: `driver_${driver.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
              };
            }
            return driver;
          });
          
          // Always update state with fresh data from API
          setDrivers(driversWithIds);
          localStorage.setItem('drivers', JSON.stringify(driversWithIds));
          
          if (isInitialLoad) {
            console.log('Loaded', driversWithIds.length, 'drivers from Firebase');
          }
        } else if (isInitialLoad) {
          // If no drivers in API, check localStorage first (only on initial load)
          const savedDrivers = localStorage.getItem('drivers');
          if (savedDrivers) {
            console.log('No drivers in database, using localStorage');
            setDrivers(JSON.parse(savedDrivers));
          } else {
            console.log('No drivers found, using initial drivers');
            setDrivers(initialDrivers);
            localStorage.setItem('drivers', JSON.stringify(initialDrivers));
          }
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        // If API fails on initial load, use localStorage/initialDrivers as fallback
        if (isInitialLoad) {
          const savedDrivers = localStorage.getItem('drivers');
          if (savedDrivers) {
            console.log('API failed, using localStorage fallback');
            setDrivers(JSON.parse(savedDrivers));
          } else {
            console.log('API failed, using initial drivers fallback');
            setDrivers(initialDrivers);
          }
        }
      } finally {
        if (isInitialLoad) {
          setIsLoadingDrivers(false);
        }
      }
    };

    // Initial fetch
    fetchDrivers(true);
    
    // Set up polling interval (every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchDrivers(false);
    }, 3000); // Poll every 3 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []); // Run once on mount

  // Remove the localStorage sync effect since we're now syncing in fetchDrivers
  // This prevents conflicts with the polling updates

  // Handle location state updates (from add/edit driver pages)
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
      // Clear the location state to prevent re-triggering
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
      // Clear the location state to prevent re-triggering
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
    try {
      const response = await fetch(`http://localhost:5001/drivers/${driverToDelete.driverId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete driver');
      }

      // Only update local state if API call was successful
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
          driverId: driver.driverId, // IMPORTANT: Include driverId
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
        // Status priority: Severe (3) > Unstable (2) > LockedIn (1) > Idle (0)
        const statusOrder = { 
          "Severe": 3,
          "Unstable": 2,
          "LockedIn": 1,
          "Idle": 0
        };
        const statusA = a.status || "Idle";
        const statusB = b.status || "Idle";
        const orderDiff = (statusOrder[statusB] || 0) - (statusOrder[statusA] || 0);
        // If same status, sort by name
        return orderDiff !== 0 ? orderDiff : (a.name || "").localeCompare(b.name || "");
      case "Activity":
        // Convert to boolean for proper comparison (true at top, false at bottom)
        const drivingA = a.driving === true || a.driving === "Yes";
        const drivingB = b.driving === true || b.driving === "Yes";
        // If drivingB is true and drivingA is false, return positive (B comes first)
        // If drivingA is true and drivingB is false, return negative (A comes first)
        if (drivingB && !drivingA) return 1;
        if (drivingA && !drivingB) return -1;
        // If same driving status, sort by name
        return (a.name || "").localeCompare(b.name || "");
      case "Newest":
        // Use timeStamp (ISO string) for proper datetime sorting
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
          Loading drivers from database...
        </div>
      ) : (
        <div className="drivers-grid">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => {
              // Determine card color based on status
              const getStatusColor = (status) => {
                switch(status) {
                  case "Severe":
                    return "red";
                  case "Unstable":
                    return "yellow";
                  case "LockedIn":
                    return "green";
                  case "Idle":
                  default:
                    return "gray";
                }
              };
              
              return (
              <div 
                key={driver.driverId} 
                className={`driver-card ${getStatusColor(driver.status)}`}
                onClick={() => navigate(`/event-log/${driver.name}`, {
                  state: {
                    driverId: driver.driverId,
                    profilePic: driver.profilePic
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
                <p>Driving: {driver.driving === true || driver.driving === "Yes" ? "Yes" : "No"}</p>
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

      {/* Toast notification for driver removal */}
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