import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    profilePicture: null,
    previewImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Account created:", formData);
    alert("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="manage-account-container">
      <h1>Create Account</h1>
      
      <form onSubmit={handleSubmit} className="account-form">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            {formData.previewImage ? (
              <img 
                src={formData.previewImage} 
                alt="Profile preview" 
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </div>
            )}
          </div>
          <input
            type="file"
            id="profile-picture"
            accept="image/*"
            onChange={handleImageChange}
            className="profile-picture-input"
          />
          <label htmlFor="profile-picture" className="change-photo-btn">
            Change Photo
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
        </div>

        <p className="create-account-signin-link" onClick={() => navigate("/")}>
          Already have an account? <span className="create-account-signin-text">Sign in</span>
        </p>

        <button type="submit" className="save-changes-btn">
          Create Account
        </button>

      </form>
    </div>
  );
};

export default CreateAccount;