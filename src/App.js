import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ManageAccount from "./ManageAccount";
import ContactUs from "./ContactUs";
import Navbar from './Navbar';
import ForgotPassword from "./ForgotPassword";
import CreateAccount from "./CreateAccount";

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
