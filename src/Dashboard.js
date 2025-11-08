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
    driving: "Yes", 
    color: "red", 
    createdAt: new Date(),
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
    driving: "Yes", 
    color: "green", 
    createdAt: new Date(),
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
    driving: "Yes", 
    color: "yellow", 
    createdAt: new Date(),
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
    driving: "No", 
    color: "gray", 
    createdAt: new Date(),
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
    driving: "No", 
    color: "gray", 
    createdAt: new Date(),
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
  
  const [drivers, setDrivers] = useState(() => {
    const savedDrivers = localStorage.getItem('drivers');
    return savedDrivers ? JSON.parse(savedDrivers) : initialDrivers;
  });

  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [removedDriverName, setRemovedDriverName] = useState("");
  
  // Popup state management
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    if (location.state?.updatedDriver) {
      setDrivers(prevDrivers => {
        return prevDrivers.map(driver => 
          driver.name === location.state.originalName ||
          driver.name === location.state.updatedDriver.name
            ? { ...driver, ...location.state.updatedDriver }
            : driver
        );
      });
    }
    
    if (location.state?.newDriver) {
      setDrivers(prevDrivers => {
        const newDriver = location.state.newDriver;
        const exists = prevDrivers.some(driver => 
          driver.driverId === newDriver.driverId
        );
        return exists ? prevDrivers : [...prevDrivers, newDriver];
      });
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
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert(`Failed to delete driver: ${error.message}`);
      closeDeletePopup();
    }
  };

  const handleRemoveDriver = (index) => {
    const driver = filteredDrivers[index];
    openDeletePopup(driver);
  };

  const handleEditDriver = (driver) => {
    navigate('/edit-driver', { 
      state: { 
        driver: {
          ...driver,
          phoneNumber: driver.phoneNumber || "",
          productId: driver.productId || "",
          emergencyFirstName: driver.emergencyFirstName || "",
          emergencyLastName: driver.emergencyLastName || "",
          emergencyPhoneNumber: driver.emergencyPhoneNumber || ""
        }
      } 
    });
  };

  const filteredDrivers = drivers
    .filter(driver => driver.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch(sortOption) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Status":
          const statusOrder = { 
            "Severe": 3,
            "Unstable": 2,
            "LockedIn": 1,
            "Idle": 0
          };
          return statusOrder[b.status] - statusOrder[a.status] || a.name.localeCompare(b.name);
        case "Activity":
          return b.driving.localeCompare(a.driving) || a.name.localeCompare(b.name);
        case "Newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "Oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
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

      <div className="drivers-grid">
        {filteredDrivers.map((driver, index) => (
          <div 
            key={driver.driverId} 
            className={`driver-card ${driver.color}`}
            onClick={() => navigate(`/event-log/${driver.name}`, {
              state: {
                driverId: driver.driverId,  // FIXED: Changed from driver.id to driver.driverId
                profilePic: driver.profilePic
              }
            })}
          >
            <img
              src={driver.profilePic}
              alt="Profile picture"
              className="profile"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = `${process.env.PUBLIC_URL}/images/profile.png`;
              }}
            />
            <h3>{driver.name}</h3>
            <p>Status: {driver.status}</p>
            <p>Driving: {driver.driving}</p>
            <div className="card-buttons" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleEditDriver(driver)}>
                Edit Driver
              </button>
              <button onClick={() => handleRemoveDriver(index)}>
                Remove Driver
              </button>
            </div>
          </div>
        ))}
      </div>

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