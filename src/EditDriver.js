import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StyleSheets/index.css";

const EditDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverData = location.state?.driver || {};
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    productId: "",
    profilePicture: null,
    previewImage: null,
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { firstName: "", lastName: "", phoneNumber: "" }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch driver data from API on component mount
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!driverData.driverId) {
        setError("No driver ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch driver data');
        }

        const data = await response.json();
        const driver = data.driver;

        console.log('Fetched driver data:', driver);

        // Parse name
        const nameParts = (driver.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Set form data
        setFormData({
          firstName: firstName,
          lastName: lastName,
          phoneNumber: driver.phone_number || "",
          productId: driver.productId || "",
          profilePicture: null,
          previewImage: driver.profilePic || driverData.profilePic || null,
        });

        // Parse emergency contacts
        if (driver.emergency_contacts && driver.emergency_contacts.length > 0) {
          const contacts = driver.emergency_contacts.map(contact => {
            const contactNameParts = (contact.name || "").split(" ");
            return {
              firstName: contactNameParts[0] || "",
              lastName: contactNameParts.slice(1).join(" ") || "",
              phoneNumber: contact.phone_number || ""
            };
          });
          setEmergencyContacts(contacts);
        }

      } catch (err) {
        console.error('Error fetching driver:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, [driverData.driverId, driverData.profilePic]);

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
      // Validate file size (max 500KB)
      if (file.size > 500000) {
        alert('Image file is too large. Please select an image smaller than 500KB.');
        return;
      }

      // Convert image to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: file,
          previewImage: reader.result, // Base64 string
        }));
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    
    const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // Format emergency contacts for API (matching the field name in Driver.py)
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
        console.log('Name updated successfully');
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
        console.log('Phone number updated successfully');
      }

      // Update product ID if changed
      if (formData.productId !== driverData.productId) {
        const productResponse = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldToChange: 'productId',
            newValue: parseInt(formData.productId) || 0
          })
        });

        if (!productResponse.ok) {
          const errorData = await productResponse.json();
          throw new Error(errorData.error || 'Failed to update product ID');
        }
        console.log('Product ID updated successfully');
      }

      // Update profile picture if changed
      if (formData.previewImage !== driverData.profilePic) {
        console.log('Updating profile picture, length:', formData.previewImage?.length || 0);
        const picResponse = await fetch(`http://localhost:5001/drivers/${driverData.driverId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldToChange: 'profilePic',
            newValue: formData.previewImage || ""
          })
        });

        if (!picResponse.ok) {
          const errorData = await picResponse.json();
          throw new Error(errorData.error || 'Failed to update profile picture');
        }
        console.log('Profile picture updated successfully');
      }

      // Update emergency contacts
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
      console.log('Emergency contacts updated successfully');

      alert('Driver updated successfully!');

      // Navigate back to dashboard (it will fetch fresh data from Firebase)
      navigate("/dashboard");

    } catch (error) {
      console.error('Error updating driver:', error);
      setError(error.message);
      alert(`Failed to update driver: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-account-container">
        <h1 className="edit-driver-title">Edit Driver</h1>
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading driver data...</p>
      </div>
    );
  }

  if (error && !formData.firstName) {
    return (
      <div className="manage-account-container">
        <h1 className="edit-driver-title">Edit Driver</h1>
        <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</p>
        <button onClick={() => navigate("/dashboard")} className="save-changes-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="manage-account-container">
      <h1 className="edit-driver-title">Edit Driver</h1>

      {error && (
        <div style={{
          color: 'red',
          backgroundColor: '#ffe6e6',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

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
            disabled={isSaving}
          />
          <label htmlFor="profile-picture" className="change-photo-btn">
            Change Photo
          </label>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Max file size: 500KB
          </p>
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
                disabled={isSaving}
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
                disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="productId">Product ID</label>
            <input
              type="number"
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              placeholder="Product ID"
              disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
              {emergencyContacts.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveEmergencyContact(index)}
                  aria-label="Remove contact"
                  disabled={isSaving}
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
            disabled={isSaving}
          >
            + Add Another
          </button>
        </div>

        <button type="submit" className="save-changes-btn edit-driver-save-btn" disabled={isSaving}>
          {isSaving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditDriver;