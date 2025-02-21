import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate(); // Hook for navigation

  const handleSignIn = () => {
    navigate("/dashboard"); // Redirect to Dashboard
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/images/DriveSense_Brand.png" alt="DriveSenseLogo" className="main-icon" />
      </div>

      <input type="text" placeholder="Email or Username" className="login-input" />
      <input type="password" placeholder="Password" className="login-input" />

      <a href="#" className="forgot-password">Forgot Password?</a>

      <button className="login-button" onClick={handleSignIn}>Sign In</button>

      <p className="signup-text">
        Don’t have an account? <a href="#">Sign up now</a>
      </p>
    </div>
  );
}

export default Login;
