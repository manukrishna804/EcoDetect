import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BottomNavbar.css";

export default function BottomNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check if a path is active
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="eco-bottom-nav">
            <div
                className={`nav-item ${isActive('/home') ? 'active' : ''}`}
                onClick={() => navigate('/home')}
            >
                <span>🏠</span>
                <label>Home</label>
            </div>
            <div
                className={`nav-item ${isActive('/hotspots') ? 'active' : ''}`}
                onClick={() => navigate('/hotspots')}
            >
                <span>🗺️</span>
                <label>Map</label>
            </div>
            <div className="nav-fab-container">
                <button className="nav-fab" onClick={() => navigate('/detect')}>
                    📷
                </button>
            </div>
            <div
                className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}
                onClick={() => navigate('/alerts')}
            >
                <span>🔔</span>
                <label>Alerts</label>
            </div>
            <div
                className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
            >
                <span>👤</span>
                <label>Profile</label>
            </div>
        </nav>
    );
}
