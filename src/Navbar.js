import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="navbar">
          <div className="logo">
            <img src="/images/DriveSense_Brand.png" alt="DriveSense Logo" />
          </div>
          <div className="menu">
            <Link to="/Dashboard">Dashboard</Link>
            <Link to="/ManageAccount">Manage Account</Link>
            <Link to="/ContactUs">Contact Us</Link>
            <Link to="/Login">Sign Out</Link>
          </div>
        </nav>
    )

}