import React, { useState } from "react";
import "./index.css";

const Dashboard = () => {
  // Initialize drivers as state
  const [drivers, setDrivers] = useState([
    { name: "David Brown", status: "Severe", driving: "Yes", color: "red" },
    { name: "Joe Smith", status: "LockedIn", driving: "Yes", color: "green" },
    { name: "Joe Smith", status: "Unstable", driving: "Yes", color: "yellow" },
    { name: "Joe Smith", status: "Idle", driving: "No", color: "gray" },
    { name: "Alice Johnson", status: "Active", driving: "Yes", color: "green" },
    { name: "Bob Williams", status: "Inactive", driving: "No", color: "gray" },
  ]);
/** Code for sort function, unfinished
  const [sortOption, setSortOption] = useState("Newest");
  
  const handleSortChange = (e) => {
    setSortOption(e.targe.value);
  }

  const sortDrivers = (drivers, option) => {
  }*/
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

  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/images/DriveSense_Brand.png`} alt="DriveSense Logo" />
        </div>
        <div className="menu">
          <a href="#">Dashboard</a>
          <a href="#">Manage Account</a>
          <a href="#">Contact Us</a>
          <a href="#">Sign Out</a>
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
        <input type="text" placeholder="Search" className="search-bar" />
        <select className="sort-dropdown">
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
        {drivers.map((driver, index) => (
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
