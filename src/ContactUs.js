import React, { useState } from "react";
import "./StyleSheets/index.css";
import emailjs from "@emailjs/browser";
import Navbar from './Components/Navbar';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]:value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const timestamp = new Date().toLocaleString();
        
        emailjs.send(
            "service_njinhl9",
            "template_1ukckea",
            {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                message: formData.message,
                submission_time: timestamp,
            },
            "W1Nw1OI7HAbLg7rgS"
        ).then(
            (response) => {
                console.log("Email sent successfully", response);
                //alert("Message sent successfully!");
                setFormData({firstName: "", lastName: "", email: "", message: "" });
            },
            (error) => {
                console.error("Error sending email:", error);
                alert("Failed to send message. Please try again.");
            }
        );
    };

    return (      
        <div className="contact-us-container">
            <Navbar />
            <div className="contact-content">
                <h1>Contact Us</h1>
                
                <div className="contact-layout">
                    <div className="contact-form-section">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <h2>First Name</h2>
                                <input 
                                    type="text" 
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <h2>Last Name</h2>
                                <input 
                                    type="text" 
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <h2>Email Address</h2>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"   
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <h2>Message</h2>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Enter Message"
                                    required>
                                </textarea>
                            </div>
                            
                            <button className="send-button">Send Message</button>
                        </form>
                    </div>
                    
                    <div className="map-section">
                        <img src="/images/map.png" alt="Location Map" />
                    </div>
                </div>
                
                <div className="contact-info-bar">
                    <div className="contact-info-content">
                        <span><i className="fas fa-phone"></i> +1 (613) 418 7290</span>
                        <span><i className="fas fa-location-dot"></i> 123 Apple St, Ottawa, ON, K1N 4N2</span>
                        <span><i className="fas fa-envelope"></i>drivesense306@gmail.com</span>
                        <span><i className="fas fa-clock"></i> 9:00 am - 5.00 pm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;