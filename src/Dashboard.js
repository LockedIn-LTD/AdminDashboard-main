import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Navbar from "./Navbar";
import DriverCard from "./Components/DriverCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([
    { 
      name: "David Brown", 
      status: "Severe", 
      driving: "Yes", 
      color: "red", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
    { 
      name: "Joe Smith", 
      status: "LockedIn", 
      driving: "Yes", 
      color: "green", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
    { 
      name: "Joe Rogan", 
      status: "Unstable", 
      driving: "Yes", 
      color: "yellow", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
    { 
      name: "John Adams", 
      status: "Idle", 
      driving: "No", 
      color: "gray", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
    { 
      name: "Alice Johnson", 
      status: "LockedIn", 
      driving: "Yes", 
      color: "green", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
    { 
      name: "Bob Williams", 
      status: "Idle", 
      driving: "No", 
      color: "gray", 
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    },
  ]);
  
  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);

    let sortedDrivers = [...drivers];
    switch(newSortOption){
      case "Name":
        sortedDrivers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Status":
        const statusOrder = { 
          "Severe": 3,
          "Unstable": 2,
          "LockedIn": 1,
          "Idle": 0
        };
        sortedDrivers.sort((a, b) =>
          statusOrder[b.status] - statusOrder[a.status] || a.name.localeCompare(b.name)
        );
        break;
      case "Activity":
          sortedDrivers.sort((a, b) =>
            b.driving.localeCompare(a.driving) || a.name.localeCompare(b.name)
          );
        break;
      case "Newest":
          sortedDrivers.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "Oldest":
          sortedDrivers.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "None":
          sortedDrivers = [...drivers];
        break;
      default:
        break;
    }
    setDrivers(sortedDrivers);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddDriver = () => {
    const newDriver = {
      name: `New Driver ${drivers.length + 1}`,
      status: "Idle",
      driving: "No",
      color: "gray",
      createdAt: new Date(),
      profilePic: "/images/profile.png"
    };
    setDrivers([...drivers, newDriver]);
  };

  const handleRemoveDriver = (index) => {
    setDrivers(drivers.filter((_, i) => i !== index));
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="dashboard-container">
        <h2 className="title">Connected Drivers</h2>

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
          <input 
            type="text" 
            placeholder="Search by name" 
            className="search-bar" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <select 
            className="sort-dropdown"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option selected default>Sort by</option>
            <option>None</option>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Status</option>
            <option>Activity</option>
            <option>Name</option>
          </select>
        </div>
      </div>
      <div className="drivers-grid">
        {filteredDrivers.map((driver, index) => (
          <DriverCard
            key={index}
            driver={driver}
            index={index}
            onRemove={handleRemoveDriver}
            onEdit={()=> console.log('Edit Driver: $driver.name}')}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;