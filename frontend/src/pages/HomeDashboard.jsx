import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchRecentSightings } from "../services/detectionService";
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
  const [recentSightings, setRecentSightings] = useState([]);
  const [loadingSightings, setLoadingSightings] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  // SOS Modal State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // 1. Get User Location (similar to alerts.jsx)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation error:", err.message)
      );
    }

    // 2. Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setUserName(user.displayName);
      } else if (user && user.email) {
        setUserName(user.email.split('@')[0]);
      }
    });

    // 3. Load recent sightings
    const loadSightings = async () => {
      setLoadingSightings(true);
      const sightings = await fetchRecentSightings(5);
      setRecentSightings(sightings);
      setLoadingSightings(false);
    };

    loadSightings();

    return () => unsubscribeAuth();
  }, []);

  // Helper: Calculate Distance (Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 3958.8; // Miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Helper: Format timestamp to "X ago"
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Helper: Get image for species
  const getImageUrl = (sighting) => {
    if (sighting.image_path) return sighting.image_path;
    if (sighting.image_url) return sighting.image_url;

    const species = (sighting.detected_class || sighting.detected_species || "").toLowerCase().trim();

    const nameMap = {
      "ades": "/Images/Aedes.jpg",
      "culex": "/Images/Culex.jpg",
      "bubble frog": "/Images/Bubble frog.jpg",
      "cane toad": "/Images/Cane toad.jpg",
      "chinese edible frog": "/Images/Chinese edible frog.jpg",
      "common green frog": "/Images/Common green frog.jpg",
      "common tree frog": "/Images/Common tree frog.jpg",
      "pacman frog": "/Images/Pacman frog.jpg",
      "pignose frog": "/Images/pignose frog.jpg",
      "poison dart frog": "/Images/poison dart frog.jpg",
      "smoky jungle frog": "/Images/smoky jungle frog.jpg",
      "spotted litter frog": "/Images/spotted litter frog.jpg",
      "white-s tree frog": "/Images/White's Tree Frog.jpg",
      "check_keel-back": "/Images/checkered keelback.jpg",
      "indian_python": "/Images/Indian python.jpg",
      "ratsnakes": "/Images/Rat snake.webp",
      "sandboa": "/Images/Sand boa.webp",
      "king cobra": "/Images/King cobra.jpg",
      "russels_viper": "/Images/Russell's viper.jpg",
      "common-kraits": "/Images/Common krait.webp",
      "indian_cobra": "/Images/Indian cobra.webp",
      "pit_viper": "/Images/Pit viper.jpg",
      "golden orb weaver": "/Images/Golden orb weaver.jpg",
      "huntsman spider": "/Images/Huntsman spider.jpg",
      "peacock spider": "/Images/Peacock spider.webp",
      "yellow garden spider": "/Images/Yellow Garden Spider.jpg",
      "red-eyed tree frog": "/Images/red-eyed-treefrog.jpg",
      "red_eyed_tree_frog": "/Images/red-eyed-treefrog.jpg",
      "red-eyed-treefrog": "/Images/red-eyed-treefrog.jpg"
    };

    return nameMap[species] || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80";
  };

  // SOS Handlers
  const handleSOSClick = () => {
    setShowSOSModal(true);
    setSelectedService(null);
  };

  const handleCloseModal = () => {
    setShowSOSModal(false);
    setSelectedService(null);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  return (
    <div className="eco-container">
      {/* HEADER */}
      <header className="eco-header">
        <div className="logo-section">
          <div className="logo-icon">🛡️</div>
          <h1>Ecodetect</h1>
        </div>
        <div
          className="user-profile"
          onClick={() => navigate('/profile')}
          role="button"
          title="View your profile"
        >
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

                <a
                  href={`tel:${selectedService.number.replace(/\s/g, '')}`}
                  className="sos-action-btn"
                  style={{ textDecoration: 'none' }}
                >
                  📞 Call Now
                </a>

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
        {loadingSightings ? (
          <div className="loading-state">Loading sightings...</div>
        ) : recentSightings.length > 0 ? (
          recentSightings.map((sighting) => {
            let distanceLabel = "Distance unknown";
            if (userLocation && sighting.location?.lat && sighting.location?.lng) {
              const dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                sighting.location.lat,
                sighting.location.lng
              );
              distanceLabel = dist ? `${dist} miles away` : "Nearby";
            }

            return (
              <Sighting
                key={sighting.id}
                name={sighting.detected_class || sighting.detected_species || "Unknown Species"}
                time={getTimeAgo(sighting.timestamp)}
                location={distanceLabel}
                img={getImageUrl(sighting)}
                badge={(sighting.danger_level === "extreme" ? "High" : sighting.danger_level || "").toUpperCase()}
              />
            );
          })
        ) : (
          <div className="empty-state">No recent sightings found. Start scanning!</div>
        )}
      </section>
    </div>
  );
}
