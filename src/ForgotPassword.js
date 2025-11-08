import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Request reset token from backend
      console.log("Requesting reset token for:", email);
      const resetResponse = await fetch('http://localhost:5000/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      const resetData = await resetResponse.json();
      console.log("Reset response:", resetData);

      if (!resetResponse.ok) {
        throw new Error(resetData.error || 'Email not found');
      }

      // Generate reset link with token
      const resetLink = `${window.location.origin}/reset-password?token=${resetData.token}`;
      console.log("Reset link:", resetLink);

      // Send email with reset link
      console.log("Sending email via EmailJS...");
      const emailResponse = await emailjs.send(
        "service_njinhl9",
        "template_n9gqlzn",
        { 
          email: email,
          userName: resetData.userName || "User",
          resetLink: resetLink
        },
        "W1Nw1OI7HAbLg7rgS"
      );

      console.log("EmailJS response:", emailResponse);
      console.log("Password reset email sent successfully");
      alert("A password reset link has been sent to your email.");
      setEmail("");
      navigate("/");

    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error message:", err.message);
      
      if (err.message === 'Email not found') {
        setError("No account found with this email address.");
      } else if (err.text) {
        setError(`EmailJS Error: ${err.text}`);
      } else {
        setError(`Failed to send password reset email: ${err.message || 'Please try again.'}`);
      }
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

      <h2 className="forgot-password-title">Forgot Your Password?</h2>
      <p className="forgot-password-subtext">
        Enter your email to receive a password reset link
      </p>

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

      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Reset Password"}
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