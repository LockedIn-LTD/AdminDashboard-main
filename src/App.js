import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ManageAccount from "./ManageAccount";
import ContactUs from "./ContactUs";
import Navbar from './Navbar';
import ForgotPassword from "./ForgotPassword";
import CreateAccount from "./CreateAccount";
import EventLog from "./EventLog";
import EditDriver from "./EditDriver";
import AddDriver from "./AddDriver";

function App() {
  return (
    <Router>
      <NavbarExclusion />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/manageaccount" element={<ManageAccount />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/event-log/:driverName" element={<EventLog />} />
        <Route path="/edit-driver" element={<EditDriver />} />
        <Route path="/add-driver" element={<AddDriver />} />
      </Routes>
    </Router>
  );
}

function NavbarExclusion() {
  const location = useLocation();
  const hideNavbarPaths = ["/", "/forgotpassword", "/createaccount"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
    </>
  );
}

export default App;