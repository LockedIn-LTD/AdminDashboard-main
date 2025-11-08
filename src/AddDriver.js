import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StyleSheets/index.css";

// Helper function to generate unique IDs
const generateDriverId = (name) => {
  return `driver_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
};

const AddDriver = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    productId: "",
    profilePicture: null,
    previewImage: null,
  });

  // Emergency contacts as an array
  const [emergencyContacts, setEmergencyContacts] = useState([
    { firstName: "", lastName: "", phoneNumber: "" }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle change for emergency contacts
  const handleEmergencyChange = (index, e) => {
    const { name, value } = e.target;
    setEmergencyContacts(prevContacts => {
      const updated = [...prevContacts];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleAddEmergencyContact = () => {
    setEmergencyContacts(prev => [
      ...prev,
      { firstName: "", lastName: "", phoneNumber: "" }
    ]);
  };

  const handleRemoveEmergencyContact = (index) => {
    setEmergencyContacts(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const driverName = `${formData.firstName} ${formData.lastName}`.trim();
    const driverId = generateDriverId(driverName);
    
    // Format emergency contacts for API (only include filled ones)
    const formattedEmergencyContacts = emergencyContacts
      .filter(contact => contact.firstName || contact.lastName || contact.phoneNumber)
      .map(contact => ({
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        phone_number: contact.phoneNumber
      }));

    // Prepare API payload
    const apiPayload = {
      driverId: driverId,
      name: driverName,
      phoneNumber: formData.phoneNumber,
      emergencyContacts: formattedEmergencyContacts,
      events: [],
      timeStamp: "",
      date: "",
      heartRate: 0,
      vehicleSpeed: 0,
      videoLink: ""
    };

    try {
      const response = await fetch('http://localhost:5001/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create driver');
      }

      const result = await response.json();
      console.log('Driver created successfully:', result);

      // Create driver object for local state (to pass to dashboard)
      const newDriver = {
        driverId: driverId,
        name: driverName,
        status: "Idle",
        driving: "No",
        color: "gray",
        createdAt: new Date(),
        profilePic: formData.previewImage || "/images/profile.png",
        phoneNumber: formData.phoneNumber,
        productId: formData.productId,
        emergencyContacts
      };

      navigate("/dashboard", { 
        state: { 
          newDriver 
        } 
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      alert(`Failed to create driver: ${error.message}`);
    }
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

          {emergencyContacts.map((contact, index) => (
            <div key={index} className="emergency-contact-block">
              <div className="form-row">
                <div className="form-group name-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={contact.firstName}
                    onChange={(e) => handleEmergencyChange(index, e)}
                    placeholder="First Name"
                  />
                </div>
                <div className="form-group name-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={contact.lastName}
                    onChange={(e) => handleEmergencyChange(index, e)}
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={contact.phoneNumber}
                  onChange={(e) => handleEmergencyChange(index, e)}
                  placeholder="Phone Number"
                />
              </div>
              {emergencyContacts.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveEmergencyContact(index)}
                  aria-label="Remove contact"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="trash-icon"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" x2="10" y1="11" y2="17"></line>
                    <line x1="14" x2="14" y1="11" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Add Another Button */}
          <button
            type="button"
            className="save-changes-btn edit-driver-save-btn"
            onClick={handleAddEmergencyContact}
          >
            + Add Another
          </button>
        </div>

        <button type="submit" className="save-changes-btn edit-driver-save-btn">
          Add Driver
        </button>
      </form>
    </div>
  );
};

export default AddDriver;