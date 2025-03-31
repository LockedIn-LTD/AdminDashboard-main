import React from "react";
import { useNavigate, Link } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate(); // Hook for navigation

  const handleResetPassword = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/images/DriveSenseLogo_noBackground.png" alt="DriveSenseLogo" className="main-icon" />
      </div>

      <h2 className="forgot-password-title">Forgot Your Password?</h2>
      <p className="forgot-password-subtext">Enter your email to receive a password reset link</p>

      <input type="email" placeholder="Email" className="login-input" />

      <button className="login-button" onClick={handleResetPassword}>Reset Password</button>

      <p className="signup-text">
        <Link to="/" className="forgot-password">Return to Sign In</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;