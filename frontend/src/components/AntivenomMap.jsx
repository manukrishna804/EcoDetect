// AntivenomMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './AntivenomMap.css';
import { hospitals } from '../data/hospitals';
import userIconImg from '../assets/snake_emergency/user.png';
import hospitalIconImg from '../assets/snake_emergency/hospital.png';
import nearestHospitalIconImg from '../assets/snake_emergency/medicine.png';


// --- Fix for default Leaflet Marker Icons in React ---
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconMarker2x,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// Custom Icon for User Location 
const userIcon = new L.Icon({
  iconUrl: userIconImg,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});


// Hospital Icon (Emergency Medical Center)
const hospitalIcon = new L.Icon({
  iconUrl: hospitalIconImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});


// Nearest Hospital Icon (More Prominent - Green/Gold)
const nearestHospitalIcon = new L.Icon({
  iconUrl: nearestHospitalIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to handle map bounds and centering
const MapController = ({ userLocation, nearestHospital }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && nearestHospital) {
      // Create bounds including user and the nearest hospital
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [nearestHospital.latitude, nearestHospital.longitude]
      ]);
      // Add padding so markers aren't on the edge
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, nearestHospital, map]);

  return null;
};

const AntivenomMap = () => {
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [nearestId, setNearestId] = useState(null);

  // Default center (Kerala) if location denied
  const defaultCenter = { lat: 10.8505, lng: 76.2711 }; 

  // Haversine Formula for Distance Calculation (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    const antivenomHospitals = hospitals.filter(h => h.antivenom);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Calculate Distances
          const hospitalsWithDistance = antivenomHospitals.map(hospital => {
            const dist = calculateDistance(latitude, longitude, hospital.latitude, hospital.longitude);
            return { ...hospital, distance: dist };
          });

          // Sort by nearest distance
          hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
          setSortedHospitals(hospitalsWithDistance);
          setNearestId(hospitalsWithDistance[0]?.id); // Track nearest ID
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          setPermissionDenied(true);
          const hospitalsWithoutDistance = antivenomHospitals.map(h => ({ ...h, distance: null }));
          setSortedHospitals(hospitalsWithoutDistance);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setPermissionDenied(true);
      setSortedHospitals(antivenomHospitals.map(h => ({ ...h, distance: null })));
      setLoading(false);
    }
  }, []);

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [defaultCenter.lat, defaultCenter.lng];
  const zoomLevel = userLocation ? 13 : 8;

  return (
    <div className="antivenom-map-container">
      
      {/* DISCLAIMER */}
      <div className="disclaimer-box">
        <span>⚠️</span>
        <p style={{ margin: 0 }}>
          Antivenom availability may vary. Always proceed to the nearest hospital immediately.
        </p>
      </div>

      {/* MAP SECTION */}
      <div className="map-wrapper">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Locating nearest help...</p>
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={zoomLevel} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Hospital Markers */}
          {sortedHospitals.map((hospital, index) => {
            const isNearest = hospital.id === nearestId;
            return (
              <Marker 
                key={hospital.id} 
                position={[hospital.latitude, hospital.longitude]}
                icon={isNearest ? nearestHospitalIcon : hospitalIcon}
                zIndexOffset={isNearest ? 1000 : 0} // Keep nearest on top
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{hospital.name}</strong><br/>
                    {isNearest && <span style={{ color: '#e63946', fontWeight: '800' }}>⭐ NEAREST HOSPITAL ⭐<br/></span>}
                    <small>{hospital.district}</small><br/>
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Antivenom Center</span><br/>
                    {hospital.distance && <small>{hospital.distance.toFixed(1)} km away</small>}<br/>
                    <button 
                      onClick={() => openGoogleMaps(hospital.latitude, hospital.longitude)}
                      style={{ 
                        marginTop: '5px', 
                        padding: '6px 12px', 
                        background: isNearest ? '#e63946' : '#4361ee', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Navigate
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Map Controller for Bounds */}
          <MapController 
            userLocation={userLocation} 
            nearestHospital={sortedHospitals[0]} 
          />
        </MapContainer>
      </div>

      {/* HOSPITAL LIST SECTION */}
      <div className="hospital-list">
        {sortedHospitals.slice(0, 4).map(hospital => {
          const isNearest = hospital.id === nearestId;
          return (
            <div 
              key={hospital.id} 
              className={`hospital-list-card ${isNearest ? 'nearest-card' : ''}`}
              style={isNearest ? { borderLeft: '6px solid #e63946', background: '#fff5f5' } : {}}
            >
              <div className="hospital-card-header">
                <div>
                  <h4 className="hospital-name">
                    {hospital.name} {isNearest && <span style={{color: '#e63946'}}> (Nearest)</span>}
                  </h4>
                  <p className="hospital-district">{hospital.district}</p>
                </div>
                {hospital.distance !== null && (
                  <span className={`distance-badge ${isNearest ? 'nearest-badge' : ''}`}
                    style={isNearest ? { background: '#e63946', color: 'white' } : {}}
                  >
                    {hospital.distance.toFixed(1)} km
                  </span>
                )}
              </div>
              
              <div className="antivenom-status">
                <span>💉</span> Antivenom Available
              </div>

              <div className="card-actions">
                <button 
                  className="nav-button"
                  onClick={() => openGoogleMaps(hospital.latitude, hospital.longitude)}
                  style={isNearest ? { background: '#e63946' } : {}}
                >
                  <span>🧭</span> GO - Navigate
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AntivenomMap;
