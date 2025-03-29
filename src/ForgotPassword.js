import "./index.css";
import React, {useState} from "react";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]:value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        emailjs.send(
            "service_njinhl9", //email service ID
            "template_n9gqlzn", //template ID
            {
                email: formData.email,
            },
            "W1Nw1OI7HAbLg7rgS"//public key
        ).then(
            (response) => {
                console.log("Password reset email sent successfully", response);
                alert("A password reset form has been sent to your email.");
                //reset the form after submission
                setFormData({email: ""});
            },
            (error) => {
                console.error("Error sending password reset email:", error);
                alert("Failed to send password reset to your email. Please try again.");
            }
        );
    };

    return(
        <div classname="forgot-password-container">
            <h6 className="title">Reset Password</h6>
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                        required 
                    />
                </div>

                <button className="send-button">Reset Password</button>
            </form>
        </div>
    );
};

export default ForgotPassword;