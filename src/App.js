import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ManageAccount from "./ManageAccount";
import ContactUs from "./ContactUs";
import Navbar from './Navbar';

function App() {
  

  return (
    <Router>
      <NavbarExclusion />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/manageaccount" element={<ManageAccount />} />
      </Routes>
    </Router>
  );
}

function NavbarExclusion(){
  const location = useLocation();
  const showNavbar = location.pathname !== "/";
  return (
    <>
      {showNavbar && <Navbar />}
    </>
  );
}

export default App;
