
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./HomeDashboard.css";

// Updated features list to match the 3x2 grid in the mockup
const features = [
  { icon: "📷", title: "Detect", sub: "Scanner", path: "/detect", color: "blue" },
  { icon: "🐍", title: "Snake", sub: "First Aid", path: "/snake", color: "orange" },
  { icon: "🦟", title: "Mosquito", sub: "Safety", path: "/mosquito-safety", color: "purple" },
  { icon: "🗺️", title: "Hotspots", sub: "Map View", path: "/hotspots", color: "green" },
  { icon: "📢", title: "Alerts", sub: "Community", path: "/alerts", color: "yellow" },
  { icon: "🎓", title: "Learn", sub: "Library", path: "/plan-awareness", color: "teal" }
];

function Sighting({ name, time, location, img, badge }) {
  return (
    <div className="eco-sighting-card">
      <div className="sighting-image-container">
        <img src={img} alt={name} />
        {badge && <span className="danger-badge">{badge}</span>}
      </div>
      <div className="sighting-info">
        <div className="sighting-header">
          <strong>{name}</strong>
          <span className="time">{time}</span>
        </div>
        <p className="location">📍 {location}</p>
      </div>
    </div>
  );
}

export default function HomeDashboard() {
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  // SOS Modal State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setUserName(user.displayName);
      } else if (user && user.email) {
        // Fallback to email username if no display name
        setUserName(user.email.split('@')[0]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // SOS Handlers
  const handleSOSClick = () => {
    setShowSOSModal(true);
    setSelectedService(null);
    setCopySuccess("");
  };

  const handleCloseModal = () => {
    setShowSOSModal(false);
    setSelectedService(null);
    setCopySuccess("");
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCopySuccess("");
  };

  const handleCopyNumber = async () => {
    if (selectedService) {
      try {
        await navigator.clipboard.writeText(selectedService.number);
        setCopySuccess("Emergency number copied successfully.");

        // Auto-clear success message after 3 seconds
        setTimeout(() => setCopySuccess(""), 3000);
      } catch (err) {
        setCopySuccess("Failed to copy. Please type manually.");
      }
    }
  };

  return (
    <div className="eco-container">
      {/* HEADER */}
      <header className="eco-header">
        <div className="logo-section">
          <div className="logo-icon">🛡️</div>
          <h1>EcoGuard AI</h1>
        </div>
        <div className="user-profile">
          <span>Hello, {userName}</span>
          <div className="profile-avatar">👤</div>
        </div>
      </header>

      {/* FEATURE GRID */}
      <section className="eco-grid">
        {features.map((item, index) => (
          <div
            className="eco-card"
            key={index}
            onClick={() => item.path && navigate(item.path)}
          >
            <div className={`icon-box ${item.color}`}>
              {item.icon}
            </div>
            <strong>{item.title}</strong>
            <p>{item.sub}</p>
          </div>
        ))}
      </section>

      {/* EMERGENCY */}
      <section className="eco-emergency">
        <div className="emergency-content">
          <span className="sos-tag">SOS EMERGENCY</span>
          <h2>Need Immediate Help?</h2>
          <p>Connect to local wildlife control or ambulance immediately.</p>
        </div>
        <button className="call-btn" onClick={handleSOSClick}>📞</button>
      </section>

      {/* SOS MODAL */}
      {showSOSModal && (
        <div className="sos-overlay">
          <div className="sos-modal">
            <button className="sos-close-btn" onClick={handleCloseModal}>✕</button>

            <div className="sos-header">
              <h3>🚨 Emergency Assistance Required</h3>
              <p className="sos-warning">Use this feature only in real emergencies.</p>
            </div>

            {!selectedService ? (
              <div className="sos-options">
                <button
                  className="sos-service-btn ambulance"
                  onClick={() => handleServiceSelect({ name: "Ambulance", number: "112" })}
                >
                  🚑 Call Ambulance (112)
                </button>
                <button
                  className="sos-service-btn forest"
                  onClick={() => handleServiceSelect({ name: "Forest Dept", number: "1800 425 4733" })}
                >
                  🌲 Call Forest Dept (1800 425 4733)
                </button>
              </div>
            ) : (
              <div className="sos-details">
                <h4>{selectedService.name}</h4>
                <div className="sos-number-display">
                  {selectedService.number}
                </div>

                <p className="sos-instruction">
                  Please call this number immediately from your mobile phone.
                </p>

                <button className="sos-action-btn" onClick={handleCopyNumber}>
                  📋 Copy Number
                </button>

                {copySuccess && <p className="sos-success-msg">✅ {copySuccess}</p>}

                <button className="sos-back-btn" onClick={() => setSelectedService(null)}>
                  ← Back to options
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT SIGHTINGS */}
      <section className="eco-section-header">
        <h2>Recent Sightings</h2>
        <span className="view-all" onClick={() => navigate('/alerts')}>View all</span>
      </section>

      <section className="eco-sightings-scroller">
        <Sighting
          name="King Cobra"
          time="2h ago"
          location="North Reserve, Sector 4"
          img="https://images.unsplash.com/photo-1531386816431-984525eb880b?auto=format&fit=crop&w=300&q=80"
          badge="DANGER"
        />
        <Sighting
          name="Funnel Web"
          time="5h ago"
          location="Backyard, Oak Street"
          img="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=300&q=80"
        />
      </section>

      {/* BOTTOM NAVIGATION */}
      <nav className="eco-bottom-nav">
        <div className="nav-item active" onClick={() => navigate('/home')}>
          <span>🏠</span>
          <label>Home</label>
        </div>
        <div className="nav-item" onClick={() => navigate('/hotspots')}>
          <span>🗺️</span>
          <label>Map</label>
        </div>
        <div className="nav-fab-container">
          <button className="nav-fab" onClick={() => navigate('/detect')}>
            📷
          </button>
        </div>
        <div className="nav-item" onClick={() => navigate('/alerts')}>
          <span>🔔</span>
          <label>Alerts</label>
        </div>
        <div className="nav-item" onClick={() => navigate('/profile')}>
          <span>👤</span>
          <label>Profile</label>
        </div>
      </nav>
    </div>
  );
}
