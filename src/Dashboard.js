import React, { useState } from "react";
import "./index.css";
import Navbar from "./Navbar";

const Dashboard = () => {
  // Initialize drivers as state
  const [drivers, setDrivers] = useState([
    { name: "David Brown", status: "Severe", driving: "Yes", color: "red" },
    { name: "Joe Smith", status: "LockedIn", driving: "Yes", color: "green" },
    { name: "Joe Rogan", status: "Unstable", driving: "Yes", color: "yellow" },
    { name: "John Adams", status: "Idle", driving: "No", color: "gray" },
    { name: "Alice Johnson", status: "LockedIn", driving: "Yes", color: "green" },
    { name: "Bob Williams", status: "Idle", driving: "No", color: "gray" },
  ]);
  
  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handler to sort drivers
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
          sortedDrivers.reverse();
        break;
      case "Oldest":
        break;
      case "None":
          sortedDrivers = [...drivers];
        break;
      default:
        break;
    }

    setDrivers(sortedDrivers);
  };

  // Handler to update search Query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handler to add a new driver card
  const handleAddDriver = () => {
    const newDriver = {
      name: `New Driver ${drivers.length + 1}`,
      status: "Idle",
      driving: "No",
      color: "gray",
    };
    setDrivers([...drivers, newDriver]);
  };

  // Handler to remove a driver card by index
  const handleRemoveDriver = (index) => {
    setDrivers(drivers.filter((_, i) => i !== index));
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/images/DriveSense_Brand.png`} alt="DriveSense Logo" />
        </div>
        <div className="menu">
          <Navbar />
        </div>
      </nav>

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
        <option selected disabled hidden>Sort by</option> {/**default display */}
        <option>None</option> {/**none */}
          <option>Newest</option>
          <option>Oldest</option>
          <option>Status</option> {/*Sort by severity of condition*/}
          <option>Activity</option> {/*Sort by driving or not*/}
          <option>Name</option>
        </select>
      </div>

      <div className="drivers-grid">
        {filteredDrivers.map((driver, index) => (
          <div key={index} className={`driver-card ${driver.color}`}>
            {/* Default profile picture for each driver */}
            <img
              src="/images/profile.png"
              alt="Profile picture"
              className="profile"
            />
            <h3>{driver.name}</h3>
            <p>Status: {driver.status}</p>
            <p>Driving: {driver.driving}</p>
            <div className="card-buttons">
              <button>Edit Driver</button>
              <button onClick={() => handleRemoveDriver(index)}>
                Remove Driver
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
