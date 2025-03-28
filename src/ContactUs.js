import React from "react";
import { Link } from 'react-router-dom';
import "./index.css";
import Navbar from './Navbar';

const ContactUs = () => {
    return (
        <div className="contact-us-container">
            <Navbar />
            <div className="contact-content">
                <h1>Contact Us</h1>
                
                <div className="contact-layout">
                    <div className="contact-form-section">
                        <div className="contact-form">
                            <div className="form-group">
                                <h2>First Name</h2>
                                <input type="text" />
                            </div>
                            
                            <div className="form-group">
                                <h2>Last Name</h2>
                                <input type="text" />
                            </div>
                            
                            <div className="form-group">
                                <h2>Email Address</h2>
                                <input type="email" />
                            </div>
                            
                            <div className="form-group">
                                <h2>Message (optional)</h2>
                                <textarea></textarea>
                            </div>
                            
                            <button className="send-button">Send Message</button>
                        </div>
                    </div>
                    
                    <div className="map-section">
                        <img src="/images/map.png" alt="Location Map" />
                    </div>
                </div>
                
                <div className="contact-info-bar">
                    <div className="contact-info-content">
                        <span>+1 (123) 456 7890</span>
                        <span>123 Apple St, Ottawa, ON, K1N 5N2</span>
                        <span>Lockedin@gmail.com</span>
                        <span>9:00 am - 5.00 pm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;