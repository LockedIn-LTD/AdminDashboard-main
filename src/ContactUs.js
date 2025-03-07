import React from "react";
import { Link } from "react-router-dom";
import "./index.css";
import Navbar from "./Navbar";

const ContactUs = () => {
  return (
    <div className="contact-container">
  <h2 className="contact-title">Contact Us</h2>
  
  <div className="contact-content">
    <div className="contact-form">
      <label>First Name</label>
      <input type="text" placeholder="First Name" />
      
      <label>Last Name</label>
      <input type="text" placeholder="Last Name" />
      
      <label>Email Address</label>
      <input type="email" placeholder="Email Address" />
      
      <label>Message (optional)</label>
      <textarea placeholder="Enter Message"></textarea>
      
      <button className="send-button">Send Message</button>
    </div>
    
    <div className="contact-map">
      <img src="path-to-your-map-image.jpg" alt="Map" />
    </div>
  </div>
</div>
  );
};

export default ContactUs;
