import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getHotspotsFromFirestore, getDetectionsByIds } from "../services/hotspotService";
import "./hotspot.css";

// Fix default Leaflet marker icons (in case we add markers later)
import iconMarker2x from "leaflet/dist/images/marker-icon-2x.png";
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconMarker2x,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// Helper to compute map center from hotspots / user location
const getInitialCenter = (userLocation, hotspots) => {
  if (userLocation) {
    return [userLocation.lat, userLocation.lng];
  }
  if (hotspots.length > 0 && hotspots[0].center) {
    return [hotspots[0].center.lat, hotspots[0].center.lng];
  }
  // Fallback: Kerala-ish center
  return [10.8505, 76.2711];
};

// Helper to choose circle color based on danger + count
const getCircleColor = (dangerLevel, count) => {
  const lvl = (dangerLevel || "").toLowerCase();
  if (lvl === "extreme") return "#ef4444"; // red-500
  if (lvl === "high") {
    if (count >= 5) return "#b91c1c"; // red-700
    if (count >= 3) return "#f97316"; // orange-500
    return "#f59e0b"; // amber-500
  }
  if (lvl === "low") return "#10b981"; // emerald-500
  return "#6b7280"; // slate-500 for unknown
};

// Helper to choose risk badge class
const getRiskBadgeClass = (dangerLevel) => {
  const lvl = (dangerLevel || "").toLowerCase();
  if (lvl === "extreme") return "risk-extreme";
  if (lvl === "high") return "risk-high";
  if (lvl === "low") return "risk-low";
  return "risk-unknown";
};

// Component to fit map bounds around all hotspots
const HotspotMapController = ({ userLocation, hotspots }) => {
  const map = useMap();

  useEffect(() => {
    if (hotspots.length === 0 && !userLocation) return;

    const points = [];
    hotspots.forEach((h) => {
      if (h.center?.lat && h.center?.lng) {
        points.push([h.center.lat, h.center.lng]);
      }
    });

    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length === 0) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }, [userLocation, hotspots, map]);

  return null;
};

const HotspotPage = () => {
  const [hotspots, setHotspots] = useState([]);
  const [detectionsMap, setDetectionsMap] = useState({}); // Map hotspot ID -> detections array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [expandedHotspot, setExpandedHotspot] = useState(null); // Track which hotspot is expanded

  // Get user location (optional, for centering)
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Load hotspots from Firestore
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getHotspotsFromFirestore();
        setHotspots(data);
        
        // Load detections for each hotspot
        const detectionsMap = {};
        for (const hotspot of data) {
          if (hotspot.detection_ids && hotspot.detection_ids.length > 0) {
            try {
              const detections = await getDetectionsByIds(hotspot.detection_ids);
              detectionsMap[hotspot.id] = detections;
            } catch (err) {
              console.warn(`Failed to load detections for hotspot ${hotspot.id}:`, err);
              detectionsMap[hotspot.id] = [];
            }
          } else {
            detectionsMap[hotspot.id] = [];
          }
        }
        setDetectionsMap(detectionsMap);
      } catch (err) {
        console.error("Failed to load hotspots", err);
        setError(err.message || "Failed to load hotspots");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const center = getInitialCenter(userLocation, hotspots);
  const zoom = userLocation ? 11 : 8;

  return (
    <div className="hotspot-page">
      {/* Header */}
      <header className="hotspot-header">
        <button className="hotspot-back-button" onClick={() => window.history.back()}>
          ←
        </button>
        <div className="hotspot-title-wrapper">
          <h1 className="hotspot-title">Wildlife Hotspots</h1>
          <span className="hotspot-subtitle">
            High–risk snake activity zones near your region
          </span>
        </div>
      </header>

      {/* Status / summary bar */}
      <div className="hotspot-summary-bar">
        {loading && <span>Loading hotspots...</span>}
        {!loading && error && <span className="hotspot-error">Error: {error}</span>}
        {!loading && !error && (
          <span>
            Showing <strong>{hotspots.length}</strong> hotspot
            {hotspots.length !== 1 && "s"} from the last 24 hours
          </span>
        )}
      </div>

      {/* Map section */}
      <section className="hotspot-map-section">
        <div className="hotspot-map-wrapper">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <HotspotMapController
              userLocation={userLocation}
              hotspots={hotspots}
            />

            {hotspots.map((hotspot) => {
              if (!hotspot.center?.lat || !hotspot.center?.lng) return null;

              const count = hotspot.detection_count || hotspot.count || 1;
              const radiusKm = hotspot.radius_km || 10;
              const color = getCircleColor(hotspot.danger_level, count);

              return (
                <Circle
                  key={hotspot.id}
                  center={[hotspot.center.lat, hotspot.center.lng]}
                  radius={radiusKm * 1000}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "180px" }}>
                      <h3
                        style={{
                          marginTop: 0,
                          marginBottom: "4px",
                          fontSize: "1rem",
                        }}
                      >
                        {hotspot.species_counts && Object.keys(hotspot.species_counts).length > 1
                          ? `${Object.keys(hotspot.species_counts).length} High-Risk Species`
                          : (hotspot.species || "Unknown").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} ({hotspot.danger_level || "unknown"}{" "}
                        risk)
                      </h3>
                      {hotspot.species_counts && Object.keys(hotspot.species_counts).length > 0 && (
                        <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: "#64748b" }}>
                            Detected Species:
                          </div>
                          {Object.entries(hotspot.species_counts)
                            .sort((a, b) => b[1] - a[1]) // Sort by count descending
                            .map(([species, speciesCount]) => (
                            <div key={species} style={{ fontSize: "0.85rem", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                                {species.replace(/_/g, " ")}
                              </span>
                              <span style={{ color: "#64748b", marginLeft: "8px" }}>
                                {speciesCount} {speciesCount === 1 ? "detection" : "detections"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        {hotspot.species_summary || `Total: ${count} detection${count !== 1 ? "s" : ""}`}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.8rem",
                          color: "#4b5563",
                        }}
                      >
                        Detections: {count} • Radius: {radiusKm} km
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        </div>
      </section>

      {/* List / details section below map */}
      <section className="hotspot-list-section">
        <h2 className="hotspot-list-title">Detected hotspots</h2>
        <p className="hotspot-list-caption">
          Each hotspot represents an area with confirmed snake detections within a
          {` `}
          typical radius of 10 km. Use this to understand nearby risk zones.
        </p>

        {loading && <div className="hotspot-empty">Loading hotspot details...</div>}
        {!loading && error && (
          <div className="hotspot-error">Unable to load hotspot details.</div>
        )}
        {!loading && !error && hotspots.length === 0 && (
          <div className="hotspot-empty">
            No hotspots detected yet. Once the system detects high–risk snake
            activity in your area, they will appear here.
          </div>
        )}

        {!loading && !error && hotspots.length > 0 && (
          <div className="hotspot-card-list">
            {hotspots.map((hotspot) => {
              if (!hotspot.center?.lat || !hotspot.center?.lng) return null;

              const count = hotspot.detection_count || hotspot.count || 1;
              const radiusKm = hotspot.radius_km || 10;
              const riskClass = getRiskBadgeClass(hotspot.danger_level);
              const riskLabel = (hotspot.danger_level || "unknown").toUpperCase();

              const detections = detectionsMap[hotspot.id] || [];
              const isExpanded = expandedHotspot === hotspot.id;

              // Get all species in this hotspot
              const allSpecies = hotspot.species_counts || {};
              const speciesList = Object.entries(allSpecies)
                .map(([species, count]) => `${count} ${species}`)
                .join(", ");
              
              return (
                <div key={`card-${hotspot.id}`} className="hotspot-card">
                  <div className="hotspot-card-header">
                    <h3 className="hotspot-card-title">
                      {Object.keys(allSpecies).length > 1 
                        ? `${Object.keys(allSpecies).length} High-Risk Species`
                        : (hotspot.species || "Unknown Species").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`hotspot-risk-badge ${riskClass}`}>
                      {riskLabel} RISK
                    </span>
                  </div>
                  
                  {/* Show all species prominently */}
                  {Object.keys(allSpecies).length > 0 && (
                    <div className="hotspot-species-list">
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: "#64748b" }}>
                        High-Risk Species Detected:
                      </div>
                      {Object.entries(allSpecies)
                        .sort((a, b) => b[1] - a[1]) // Sort by count descending
                        .map(([species, speciesCount]) => (
                        <div key={species} className="hotspot-species-item">
                          <span className="species-name">
                            {species.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="species-count-badge">{speciesCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="hotspot-card-summary">
                    {speciesList || hotspot.species_summary || "Cluster of snake detections in this area."}
                  </p>
                  <div className="hotspot-card-meta">
                    <span className="hotspot-chip">
                      🐍 Detections: <strong>{count}</strong>
                    </span>
                    <span className="hotspot-chip">
                      📍 Lat: {hotspot.center.lat.toFixed(4)}, Lng:{" "}
                      {hotspot.center.lng.toFixed(4)}
                    </span>
                    <span className="hotspot-chip">
                      📏 Radius: {radiusKm} km
                    </span>
                  </div>
                  
                  {/* Expandable detections list */}
                  {detections.length > 0 && (
                    <div className="hotspot-detections-section">
                      <button
                        className="hotspot-toggle-detections"
                        onClick={() => setExpandedHotspot(isExpanded ? null : hotspot.id)}
                      >
                        {isExpanded ? "▼" : "▶"} View {detections.length} detection{detections.length !== 1 ? "s" : ""} in this region
                      </button>
                      
                      {isExpanded && (
                        <div className="hotspot-detections-list">
                          {detections.map((detection) => {
                            const timestamp = detection.timestamp?.toDate 
                              ? detection.timestamp.toDate() 
                              : detection.timestamp 
                              ? new Date(detection.timestamp) 
                              : null;
                            
                            return (
                              <div key={detection.id} className="hotspot-detection-item">
                                <div className="detection-item-header">
                                  <span className="detection-species">
                                    {(detection.detected_class || detection.species_name || "Unknown")
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span className={`detection-risk-badge ${getRiskBadgeClass(detection.danger_level)}`}>
                                    {(detection.danger_level || "unknown").toUpperCase()}
                                  </span>
                                </div>
                                <div className="detection-item-details">
                                  {detection.location?.lat && detection.location?.lng && (
                                    <span className="detection-chip">
                                      📍 {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                                    </span>
                                  )}
                                  {detection.confidence && (
                                    <span className="detection-chip">
                                      🎯 Confidence: {(detection.confidence * 100).toFixed(0)}%
                                    </span>
                                  )}
                                  {timestamp && (
                                    <span className="detection-chip">
                                      🕐 {timestamp.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HotspotPage;


