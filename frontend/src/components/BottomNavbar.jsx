import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BottomNavbar.css";

export default function BottomNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMapOptions, setShowMapOptions] = useState(false);
    const popupRef = useRef(null);

    // Helper to check if a path is active
    const isActive = (path) => location.pathname === path;

    // Handle clicks outside to close popup
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowMapOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMapClick = () => {
        setShowMapOptions(!showMapOptions);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setShowMapOptions(false);
    };

    return (
        <nav className="eco-bottom-nav">
            <div
                className={`nav-item ${isActive('/home') ? 'active' : ''}`}
                onClick={() => handleNavigation('/home')}
            >
                <span>🏠</span>
                <label>Home</label>
            </div>

            <div className="nav-item-wrapper" ref={popupRef}>
                <div
                    className={`nav-item ${(isActive('/hotspots') || isActive('/hospitals')) ? 'active' : ''}`}
                    onClick={handleMapClick}
                >
                    <span>🗺️</span>
                    <label>Map</label>
                </div>

                {showMapOptions && (
                    <div className="map-options-popup">
                        <div className="popup-item" onClick={() => handleNavigation('/hotspots')}>
                            <span className="popup-icon">🔥</span>
                            <div className="popup-text">
                                <strong>Hotspot Map</strong>
                                <small>Dengue & Snake alerts</small>
                            </div>
                        </div>
                        <div className="popup-item" onClick={() => handleNavigation('/hospitals')}>
                            <span className="popup-icon">🏥</span>
                            <div className="popup-text">
                                <strong>Hospital Map</strong>
                                <small>Nearby medical facilities</small>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="nav-fab-container">
                <button className="nav-fab" onClick={() => handleNavigation('/detect')}>
                    📷
                </button>
            </div>
            <div
                className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}
                onClick={() => handleNavigation('/alerts')}
            >
                <span>🔔</span>
                <label>Alerts</label>
            </div>
            <div
                className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => handleNavigation('/profile')}
            >
                <span>👤</span>
                <label>Profile</label>
            </div>
        </nav>
    );
}

