import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid reset link");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      console.log("Password reset successful");
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-logo">
          <img
            src="/images/DriveSenseLogo_noBackground.png"
            alt="DriveSenseLogo"
            className="main-icon"
          />
        </div>
        <h2 className="forgot-password-title">Password Reset Successful!</h2>
        <p className="forgot-password-subtext">
          Redirecting to login page...
        </p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img
          src="/images/DriveSenseLogo_noBackground.png"
          alt="DriveSenseLogo"
          className="main-icon"
        />
      </div>

      <h2 className="forgot-password-title">Reset Your Password</h2>
      <p className="forgot-password-subtext">
        Enter your new password below
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
          type="password"
          placeholder="New Password"
          className="login-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={isLoading || !token}
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading || !token}
          minLength={6}
        />

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading || !token}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;