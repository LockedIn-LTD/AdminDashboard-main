import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // clears all login data
    navigate("/"); // back to login
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/images/DriveSense_Brand.png" alt="DriveSense Logo" />
      </div>

      <div className="menu">
        <Link to="/Dashboard">Dashboard</Link>
        <Link to="/ManageAccount">Manage Account</Link>
        <Link to="/ContactUs">Contact Us</Link>
        <button onClick={handleLogout} className="link-button">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
