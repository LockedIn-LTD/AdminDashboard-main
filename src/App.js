import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ManageAccount from "./ManageAccount";
import ContactUs from "./ContactUs";
import Navbar from "./Components/Navbar";
import ForgotPassword from "./ForgotPassword";
import CreateAccount from "./CreateAccount";
import ResetPassword from "./ResetPassword";
import EventLog from "./EventLog";
import EditDriver from "./EditDriver";
import AddDriver from "./AddDriver";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <NavbarExclusion />
      <Routes>
        {/* Public routes (accessible before login) */}
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Protected routes (accessible only after login) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manageaccount"
          element={
            <ProtectedRoute>
              <ManageAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contactus"
          element={
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-log/:driverName"
          element={
            <ProtectedRoute>
              <EventLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-driver"
          element={
            <ProtectedRoute>
              <EditDriver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-driver"
          element={
            <ProtectedRoute>
              <AddDriver />
            </ProtectedRoute>
          }
        />

        {/* Optional: catch-all 404 */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

// Navbar only visible after login
function NavbarExclusion() {
  const { pathname } = useLocation();
  const hideNavbarPaths = ["/", "/forgotpassword", "/createaccount", "/resetpassword"];
  const showNavbar = !hideNavbarPaths.includes(pathname);

  return showNavbar && <Navbar />;
}

export default App;