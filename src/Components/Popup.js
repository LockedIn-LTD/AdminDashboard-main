import React from "react";
import "../StyleSheets/Popup.css"; // Create CSS file for styling

const Popup= ({ isOpen, onClose, onConfirm, message}) => {
    if (!isOpen) return null; // Don't render if not open

    return(
        <div className="popup-overlay">
            <div className="popup-content">
                <p>{message}</p>
                <div className="popup-buttons">
                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="confirm-btn">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

};

export default Popup;