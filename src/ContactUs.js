import React, { useState } from "react";
import "./index.css";
import emailjs from "@emailjs/browser";
import Navbar from './Navbar';

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
                alert("Message sent successfully!");
                //reset the form after submission
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
                                    placeholder="Enter first name"
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
                                    placeholder="Enter last name"
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
                                    placeholder="Enter email"   
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <h2>Message</h2>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Enter your message"
                                    required>
                                </textarea>
                            </div>
                            
                            <button className="send-button">Submit</button>
                        </form>
                    </div>
                    
                    <div className="map-section">
                        <img src="/images/map.png" alt="Location Map" />
                    </div>
                </div>
                
                <div className="contact-info-bar">
                    <div className="contact-info-content">
                        <span>+1 (123) 456 7890</span>
                        <span>123 Apple St, Ottawa, ON, K1N 5N2</span>
                        <span>contactdrivesense@gmail.com</span>
                        <span>9:00 am - 5.00 pm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;