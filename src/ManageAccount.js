import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StyleSheets/index.css";

const ManageAccount = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get userId from localStorage (stored during login/create account)
        const storedUserId = localStorage.getItem('currentUserId');
        
        if (!storedUserId) {
          setError("No user logged in. Please log in first.");
          setIsFetching(false);
          return;
        }

        setUserId(storedUserId);

        // Fetch user data from API
        const response = await fetch(`http://localhost:5000/users/${storedUserId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user data');
        }

        // Split name back into firstName and lastName
        const nameParts = data.user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          password: "",
          profilePicture: null,
          previewImage: null,
        });

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!userId) {
        throw new Error("No user ID found");
      }

      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`;

      // Update each field that has changed
      const fieldsToUpdate = [];
      
      if (fullName.trim()) {
        fieldsToUpdate.push({ fieldToChange: 'name', newValue: fullName });
      }
      if (formData.email) {
        fieldsToUpdate.push({ fieldToChange: 'email', newValue: formData.email });
      }
      if (formData.phoneNumber) {
        fieldsToUpdate.push({ fieldToChange: 'phoneNumber', newValue: formData.phoneNumber });
      }

      // Send update requests for each field
      for (const field of fieldsToUpdate) {
        const response = await fetch(`http://localhost:5000/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(field)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to update ${field.fieldToChange}`);
        }
      }

      console.log("Account updated successfully");
      alert("Changes saved successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.error("Error updating account:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="manage-account-container">
        <h1>Edit Account</h1>
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="manage-account-container">
      <h1>Edit Account</h1>
      
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

        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            placeholder="Leave blank to keep current password"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="save-changes-btn"
          disabled={isLoading}
        >
          {isLoading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ManageAccount;