import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_njinhl9",
        "template_n9gqlzn",
        { email: email },
        "W1Nw1OI7HAbLg7rgS"
      )
      .then(
        (response) => {
          console.log("Password reset email sent successfully", response);
          alert("A password reset link has been sent to your email.");
          setEmail("");
          navigate("/");
        },
        (error) => {
          console.error("Error sending password reset email:", error);
          alert("Failed to send password reset email. Please try again.");
        }
      );
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

      <h2 className="forgot-password-title">Forgot Your Password?</h2>
      <p className="forgot-password-subtext">
        Enter your email to receive a password reset link
      </p>

      {/* Form with display: contents to prevent layout shifts */}
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="login-button">
          Reset Password
        </button>
      </form>

      <p className="signup-text">
        <Link to="/" className="forgot-password">
          Return to Sign In
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;