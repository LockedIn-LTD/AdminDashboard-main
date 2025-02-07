import React from "react";
import "./index.css";

const drivers = [
  { name: "Dan Ionescu", status: "Severe", driving: "Yes", color: "red" },
  { name: "Joe Smith", status: "LockedIn", driving: "Yes", color: "green" },
  { name: "Joe Smith", status: "Unstable", driving: "Yes", color: "yellow" },
  { name: "Joe Smith", status: "Idle", driving: "No", color: "gray" },
  { name: "Alice Johnson", status: "Active", driving: "Yes", color: "green" },
  { name: "Bob Williams", status: "Inactive", driving: "No", color: "gray" },
  // Add more driver objects as needed
];

const Dashboard = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="LockedIn Logo" />
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
        <button className="add-driver">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
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
          <option>Recently Added</option>
          <option>Severity</option>
          <option>Alphabetically</option>
        </select>
      </div>

      <div className="drivers-grid">
        {drivers.map((driver, index) => (
          <div key={index} className={`driver-card ${driver.color}`}>
            <p className="profile">Profile Picture</p>
            <h3>{driver.name}</h3>
            <p>Status: {driver.status}</p>
            <p>Driving: {driver.driving}</p>
            <div className="card-buttons">
              <button>Edit Driver</button>
              <button>Remove Driver</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
