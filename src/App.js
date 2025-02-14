import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ManageAccount from "./ManageAccount";
import ContactUs from "./ContactUs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/manageaccount" element={<ManageAccount />} />
      </Routes>
    </Router>
  );
}

export default App;
