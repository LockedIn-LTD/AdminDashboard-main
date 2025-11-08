import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StyleSheets/index.css";

const EditDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverData = location.state?.driver || {};
  
  const [formData, setFormData] = useState({
    firstName: driverData.name ? driverData.name.split(" ")[0] : "",
    lastName: driverData.name ? driverData.name.split(" ").slice(1).join(" ") : "",
    phoneNumber: driverData.phoneNumber || "",
    productId: driverData.productId || "",
    profilePicture: null,
    previewImage: driverData.profilePic || null,
  });

  const [emergencyContacts, setEmergencyContacts] = useState(
    driverData.emergencyContacts?.length > 0
      ? driverData.emergencyContacts
      : [{ firstName: "", lastName: "", phoneNumber: "" }]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyChange = (index, e) => {
    const { name, value } = e.target;
    setEmergencyContacts((prevContacts) => {
      const updated = [...prevContacts];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleAddEmergencyContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      { firstName: "", lastName: "", phoneNumber: "" },
    ]);
  };

  const handleRemoveEmergencyContact = (index) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
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
    
    const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // Format emergency contacts for API
    const formattedEmergencyContacts = emergencyContacts
      .filter(contact => contact.firstName || contact.lastName || contact.phoneNumber)
      .map(contact => ({
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        phone_number: contact.phoneNumber
      }));

    try {
      // Update name if changed
      if (updatedName !== driverData.name) {
        const nameResponse = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldToChange: 'name',
            newValue: updatedName
          })
        });

        if (!nameResponse.ok) {
          const errorData = await nameResponse.json();
          throw new Error(errorData.error || 'Failed to update driver name');
        }
      }

      // Update phone number if changed
      if (formData.phoneNumber !== driverData.phoneNumber) {
        const phoneResponse = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldToChange: 'phone_number',
            newValue: formData.phoneNumber
          })
        });

        if (!phoneResponse.ok) {
          const errorData = await phoneResponse.json();
          throw new Error(errorData.error || 'Failed to update phone number');
        }
      }

      // Always update emergency contacts (simpler approach - just update them every time)
      const contactsResponse = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fieldToChange: 'emergency_contacts',
          newValue: formattedEmergencyContacts
        })
      });

      if (!contactsResponse.ok) {
        const errorData = await contactsResponse.json();
        throw new Error(errorData.error || 'Failed to update emergency contacts');
      }

      console.log('Driver updated successfully');

      // Create updated driver object for local state
      const updatedDriver = {
        ...driverData,
        name: updatedName,
        profilePic: formData.previewImage || driverData.profilePic,
        phoneNumber: formData.phoneNumber,
        productId: formData.productId,
        emergencyContacts,
      };

      navigate("/dashboard", {
        state: {
          updatedDriver,
          originalName: driverData.name,
        },
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      alert(`Failed to update driver: ${error.message}`);
    }
  };

  return (
    <div className="manage-account-container">
      <h1 className="edit-driver-title">Edit Driver</h1>

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
                {formData.firstName.charAt(0)}
                {formData.lastName.charAt(0)}
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

          <h3 className="emergency-contact-title">Emergency Contacts</h3>

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

          <button
            type="button"
            className="save-changes-btn edit-driver-save-btn"
            onClick={handleAddEmergencyContact}
          >
            + Add Another
          </button>
        </div>

        <button type="submit" className="save-changes-btn edit-driver-save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditDriver;