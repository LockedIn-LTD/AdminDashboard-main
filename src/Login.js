import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUserId", data.user.userId);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      console.log("Login successful:", data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img
          src="/images/DriveSenseLogo_noBackground.png"
          alt="DriveSenseLogo"
          className="main-icon"
        />
      </div>

      {error && (
        <div style={{
          color: '#ff4444',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '12px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '300px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Email or Username"
        className="login-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <input
        type="password"
        placeholder="Password"
        className="login-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      <Link to="/forgotpassword" className="forgot-password">
        Forgot Password?
      </Link>

      <button className="login-button" onClick={handleSignIn} disabled={isLoading}>
        {isLoading ? "Signing In..." : "Sign In"}
      </button>

      <p className="signup-text">
        Don't have an account? <Link to="/createaccount">Sign up now</Link>
      </p>
    </div>
  );
}

export default Login;