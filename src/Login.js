import React from "react";
import { useNavigate, Link} from "react-router-dom";

function Login() {
  const navigate = useNavigate(); // Hook for navigation

  const handleSignIn = () => {
    navigate("/dashboard"); // Redirect to Dashboard
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/images/DriveSenseLogo_noBackground.png" alt="DriveSenseLogo" className="main-icon" />
      </div>

      <input type="text" placeholder="Email or Username" className="login-input" />
      <input type="password" placeholder="Password" className="login-input" />

      <Link to="/forgotpassword" className="forgot-password">Forgot Password?</Link>

      <button className="login-button" onClick={handleSignIn}>Sign In</button>

      <p className="signup-text">Don’t have an account? <Link to="/createaccount">Sign up now</Link></p>
    </div>
  );
}

export default Login;
