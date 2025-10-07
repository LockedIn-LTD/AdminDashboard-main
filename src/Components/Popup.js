import React from "react";
import "../StyleSheets/Popup.css";

const Popup = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <p className="message">{message}</p>

                <div className="popup-buttons">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;