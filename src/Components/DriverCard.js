import React from "react";
import { useNavigate } from "react-router-dom";

const DriverCard = ({driver, index, onRemove, onEdit}) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate (`/event-log/${driver.name}`, {
            state: {
                profilePic: driver.profilePic,
            },
        });
    };

    return(
        <div 
            className={`driver-card ${driver.color}`}
            onClick={handleCardClick}
        >
            <img
                src={driver.profilePic}
                alt="Profile Picture"
                className="profile"
            />
            <h3>{driver.name}</h3>
            <p>Status: {driver.status}</p>
            <p>Driving: {driver.driving}</p>
            <div className="card-buttons" onClick={(e) => e.stopPropagation()}>
                <button onClick={onEdit}>Edit Driver</button>
                <button onClick={() => onRemove(index)}>Remove Driver</button>
            </div>
        </div>
    );
};

export default DriverCard;