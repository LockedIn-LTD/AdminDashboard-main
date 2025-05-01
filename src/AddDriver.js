import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StyleSheets/index.css";

const AddDriver = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    productId: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    profilePicture: null,
    previewImage: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDriver = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      status: "Idle",
      driving: "No",
      color: "gray",
      createdAt: new Date(),
      profilePic: formData.previewImage || "/images/profile.png",
      phoneNumber: formData.phoneNumber,
      productId: formData.productId,
      emergencyFirstName: formData.emergencyFirstName,
      emergencyLastName: formData.emergencyLastName,
      emergencyPhoneNumber: formData.emergencyPhoneNumber
    };

    navigate("/dashboard", { 
      state: { 
        newDriver 
      } 
    });
  };

  return (
    <div className="manage-account-container">
      <h1 className="edit-driver-title">Add New Driver</h1>
      
      <form onSubmit={handleSubmit} className="account-form">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            {formData.previewImage ? (
              <img 
                src={formData.previewImage} 
                alt="Driver preview" 
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

        <div className="edit-driver-fields">
          <div className="form-row">
            <div className="form-group name-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group name-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="productId">Product ID</label>
            <input
              type="text"
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              placeholder="Product ID"
            />
          </div>

          <h3 className="emergency-contact-title">Emergency Contact</h3>
          
          <div className="form-row">
            <div className="form-group name-group">
              <label htmlFor="emergencyFirstName">First Name</label>
              <input
                type="text"
                id="emergencyFirstName"
                name="emergencyFirstName"
                value={formData.emergencyFirstName}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>
            <div className="form-group name-group">
              <label htmlFor="emergencyLastName">Last Name</label>
              <input
                type="text"
                id="emergencyLastName"
                name="emergencyLastName"
                value={formData.emergencyLastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emergencyPhoneNumber">Phone Number</label>
            <input
              type="tel"
              id="emergencyPhoneNumber"
              name="emergencyPhoneNumber"
              value={formData.emergencyPhoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
        </div>

        <button type="submit" className="save-changes-btn edit-driver-save-btn">
          Add Driver
        </button>
      </form>
    </div>
  );
};

export default AddDriver;