import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { hospitals as verifiedHospitals } from '../data/hospitals';
import styles from '../styles/NearbyHospitals.module.css';

// ─── Fix Leaflet default icon paths in React ─────────────────────────────────
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import userPng from '../assets/snake_emergency/user.png';
import hospitalPng from '../assets/snake_emergency/hospital.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

const userDotIcon = new L.Icon({
    iconUrl: userPng,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
});

const antivenomIcon = new L.Icon({
    iconUrl: '/Images/venom.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
});

const hospitalIcon = new L.Icon({
    iconUrl: hospitalPng,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
});

const clinicIcon = new L.Icon({
    iconUrl: '/Images/clinic.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -17],
});

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Inner component: auto-fly when emergency mode ───────────────────────────
function MapFlyTo({ target, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (target) map.flyTo([target.lat, target.lng], zoom || 14, { duration: 1.2 });
    }, [target, zoom, map]);
    return null;
}

// ─── Fit map to route bounds ─────────────────────────────────────────────────
function MapFitBounds({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 1) {
            map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] });
        }
    }, [coords, map]);
    return null;
}

// ─── Overpass query builder ───────────────────────────────────────────────────
function buildOverpassQuery(lat, lng, radiusM) {
    return `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="clinic"](around:${radiusM},${lat},${lng});
      way["amenity"="clinic"](around:${radiusM},${lat},${lng});
    );
    out center;
  `.trim();
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function NearbyHospitals() {
    const navigate = useNavigate();
    const location = useLocation();
    const isSOS = location.state?.sos === true;

    // ── State ────────────────────────────────────────────────────────────────────
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(false);
    const [osmMarkers, setOsmMarkers] = useState([]);
    const [osmLoading, setOsmLoading] = useState(false);
    const [osmError, setOsmError] = useState(false);
    const [showMore, setShowMore] = useState(false);

    // ── Routing state ─────────────────────────────────────────────────────────────
    const [activeRoute, setActiveRoute] = useState(null);   // [[lat,lng], ...]
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);       // { name, distKm, durationMin }
    const [showMapPopup, setShowMapPopup] = useState(false);

    const [filters, setFilters] = useState({
        antivenom: true,
        hospital: true,
        clinic: true,
    });

    const RADIUS_KM = 10;
    const RADIUS_M = RADIUS_KM * 1000;
    const DEDUP_THRESHOLD_KM = 0.1; // 100 m

    // ── Geolocation ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError(true);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
            () => setLocationError(true),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    }, []);

    // ── Overpass fetch ───────────────────────────────────────────────────────────
    const fetchOSM = useCallback(async (lat, lng) => {
        setOsmLoading(true);
        setOsmError(false);
        try {
            const query = buildOverpassQuery(lat, lng, RADIUS_M);
            const res = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
            });
            const data = await res.json();

            const elements = data.elements || [];
            const parsed = elements
                .map((el) => {
                    const lat2 = el.lat ?? el.center?.lat;
                    const lon2 = el.lon ?? el.center?.lon;
                    if (!lat2 || !lon2) return null;
                    if (!el.tags?.name) return null;
                    return {
                        id: `osm-${el.id}`,
                        name: el.tags.name,
                        amenity: el.tags?.amenity,
                        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                        latitude: lat2,
                        longitude: lon2,
                        source: 'osm',
                    };
                })
                .filter(Boolean);

            // 1. Dedup OSM against Verified (Existing)
            let filtered = parsed.filter((osm) => {
                return !verifiedHospitals.some(
                    (v) => haversine(v.latitude, v.longitude, osm.latitude, osm.longitude) < DEDUP_THRESHOLD_KM
                );
            });

            // 2. Internal OSM Dedup (handle Same Hospital in Node and Way)
            // If name is same and distance < 200m, keep only one
            const INTERNAL_DEDUP_KM = 0.2;
            const finalDeduped = [];
            filtered.forEach(item => {
                const isDuplicate = finalDeduped.some(existing =>
                    existing.name.toLowerCase() === item.name.toLowerCase() &&
                    haversine(existing.latitude, existing.longitude, item.latitude, item.longitude) < INTERNAL_DEDUP_KM
                );
                if (!isDuplicate) {
                    finalDeduped.push(item);
                }
            });

            setOsmMarkers(finalDeduped);
        } catch (error) {
            console.error("OSM Fetch Error:", error);
            setOsmError(true);
        } finally {
            setOsmLoading(false);
        }
    }, [RADIUS_M]);

    useEffect(() => {
        if (userLocation) fetchOSM(userLocation.lat, userLocation.lng);
    }, [userLocation, fetchOSM]);

    // ── Combine & annotate with distance ─────────────────────────────────────────
    const addDistance = (item) => {
        if (!userLocation) return { ...item, distance: null };
        return {
            ...item,
            distance: haversine(userLocation.lat, userLocation.lng, item.latitude, item.longitude),
        };
    };

    const antivenomList = verifiedHospitals.map(addDistance);
    const osmHospitals = osmMarkers.filter((m) => m.amenity === 'hospital').map(addDistance);
    const osmClinics = osmMarkers.filter((m) => m.amenity === 'clinic').map(addDistance);

    // Sorted + paginated list (antivenom always first; max 10 shown)
    const INITIAL_SHOW = 4;
    const MAX_SHOW = 10;

    const allSorted = [
        ...(filters.antivenom ? antivenomList : []),
        ...(filters.hospital ? osmHospitals : []),
        ...(filters.clinic ? osmClinics : []),
    ].sort((a, b) => {
        // sort purely by distance (nearest first)
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });

    const visibleCount = showMore ? MAX_SHOW : INITIAL_SHOW;
    const sortedList = allSorted.slice(0, visibleCount);
    const canShowMore = !showMore && allSorted.length > INITIAL_SHOW;
    const extraCount = Math.min(allSorted.length - INITIAL_SHOW, MAX_SHOW - INITIAL_SHOW);

    // Nearest antivenom for SOS highlight (visual only – no auto-fly)
    const nearestAntivenom = isSOS
        ? [...antivenomList].sort((a, b) => (a.distance || 999) - (b.distance || 999))[0]
        : null;

    // ── Map defaults ──────────────────────────────────────────────────────────────
    const DEFAULT_CENTER = [10.8505, 76.2711]; // Kerala centre
    const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER;
    const mapZoom = userLocation ? 13 : 8;

    // ── In-page routing via OSRM ────────────────────────────────────────────────
    const fetchRoute = useCallback(async (destLat, destLng, destName) => {
        if (!userLocation) return;
        setRouteLoading(true);
        setActiveRoute(null);
        setRouteInfo(null);
        try {
            const { lat, lng } = userLocation;
            const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${destLng},${destLat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                // OSRM returns [lon, lat] — flip to [lat, lon] for Leaflet
                const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
                setActiveRoute(coords);
                setRouteInfo({
                    name: destName,
                    distKm: (route.distance / 1000).toFixed(1),
                    durationMin: Math.round(route.duration / 60),
                    lat: destLat,
                    lng: destLng
                });
                setShowMapPopup(true);
            }
        } catch {
            alert('Could not fetch route. Please check your connection.');
        } finally {
            setRouteLoading(false);
        }
    }, [userLocation]);

    const clearRoute = () => { setActiveRoute(null); setRouteInfo(null); setShowMapPopup(false); };

    // ── Helpers ───────────────────────────────────────────────────────────────────
    const openGoogleMaps = (lat, lng) => {
        const from = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
        const url = from
            ? `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${lat},${lng}&travelmode=driving`
            : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const toggleFilter = (key) =>
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

    const fmtDist = (d) => (d !== null ? `${d.toFixed(1)} km away` : 'Distance unknown');

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <button className="eco-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Nearby Hospitals</h1>
                    <p className={styles.subtitle}>Find the nearest medical help</p>
                </div>
                {isSOS && (
                    <span className={styles.sosBadge}>SOS</span>
                )}
            </header>

            {/* ── LOCATION ERROR ── */}
            {locationError && (
                <div className={styles.errorBanner}>
                    <span className="material-symbols-outlined">location_off</span>
                    Location unavailable — showing all Kerala centres
                </div>
            )}

            {/* ── FILTER TOGGLES ── */}
            <div className={styles.filterBar}>
                <label className={`${styles.filterChip} ${filters.antivenom ? styles.chipRed : styles.chipOff}`}>
                    <input
                        type="checkbox"
                        checked={filters.antivenom}
                        onChange={() => toggleFilter('antivenom')}
                        className={styles.hiddenCheck}
                    />
                    <img src="/Images/venom.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
                    Antivenom Centers
                </label>
                <label className={`${styles.filterChip} ${filters.hospital ? styles.chipBlue : styles.chipOff}`}>
                    <input
                        type="checkbox"
                        checked={filters.hospital}
                        onChange={() => toggleFilter('hospital')}
                        className={styles.hiddenCheck}
                    />
                    <img src={hospitalPng} alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
                    General Hospitals
                </label>
                <label className={`${styles.filterChip} ${filters.clinic ? styles.chipGreen : styles.chipOff}`}>
                    <input
                        type="checkbox"
                        checked={filters.clinic}
                        onChange={() => toggleFilter('clinic')}
                        className={styles.hiddenCheck}
                    />
                    <img src="/Images/clinic.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
                    Clinics
                </label>
            </div>

            {/* ── OSM LOADING / ERROR ── */}
            {osmLoading && (
                <div className={styles.infoBanner}>
                    <span className={styles.spinnerInline} /> Fetching nearby hospitals from OpenStreetMap…
                </div>
            )}
            {osmError && !osmLoading && (
                <div className={styles.warnBanner}>
                    ⚠️ Could not load OSM data — showing verified centers only.
                    <button className={styles.retryBtn} onClick={() => userLocation && fetchOSM(userLocation.lat, userLocation.lng)}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── MAP ── */}
            <div className={styles.mapWrapper}>
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Fly to user location once geolocation resolves */}
                    {userLocation && !activeRoute && (
                        <MapFlyTo target={userLocation} zoom={14} />
                    )}

                    {/* User location */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userDotIcon}>
                            <Popup>
                                <strong>📍 You are here</strong>
                            </Popup>
                        </Marker>
                    )}

                    {/* Verified antivenom */}
                    {filters.antivenom &&
                        antivenomList.map((h) => (
                            <Marker
                                key={`v-${h.id}`}
                                position={[h.latitude, h.longitude]}
                                icon={antivenomIcon}
                                zIndexOffset={200}
                            >
                                <Popup>
                                    <div className={styles.popup}>
                                        <div className={styles.popupBadge} style={{ background: '#fef2f2', color: '#dc2626' }}>
                                            💉 Antivenom Center
                                        </div>
                                        <strong className={styles.popupName}>{h.name}</strong>
                                        <p className={styles.popupDist}>{fmtDist(h.distance)}</p>
                                        <div className={styles.popupActions}>
                                            <button
                                                className={`${styles.popupBtn} ${styles.popupBtnRed}`}
                                                onClick={() => fetchRoute(h.latitude, h.longitude, h.name)}
                                                disabled={!userLocation}
                                            >
                                                🧭 Navigate
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                    {/* OSM hospitals */}
                    {filters.hospital &&
                        osmHospitals.map((h) => (
                            <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
                                <Popup>
                                    <div className={styles.popup}>
                                        <div className={styles.popupBadge} style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                            🏥 General Hospital
                                        </div>
                                        <strong className={styles.popupName}>{h.name}</strong>
                                        <p className={styles.popupDist}>{fmtDist(h.distance)}</p>
                                        <div className={styles.popupActions}>
                                            {h.phone && (
                                                <a className={`${styles.popupBtn} ${styles.popupBtnBlue}`} href={`tel:${h.phone}`}>
                                                    📞 Call
                                                </a>
                                            )}
                                            <button
                                                className={`${styles.popupBtn} ${styles.popupBtnBlue}`}
                                                onClick={() => fetchRoute(h.latitude, h.longitude, h.name)}
                                                disabled={!userLocation}
                                            >
                                                🧭 Navigate
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                    {/* OSM clinics */}
                    {filters.clinic &&
                        osmClinics.map((h) => (
                            <Marker key={h.id} position={[h.latitude, h.longitude]} icon={clinicIcon}>
                                <Popup>
                                    <div className={styles.popup}>
                                        <div className={styles.popupBadge} style={{ background: '#f0fdf4', color: '#15803d' }}>
                                            🩺 Clinic
                                        </div>
                                        <strong className={styles.popupName}>{h.name}</strong>
                                        <p className={styles.popupDist}>{fmtDist(h.distance)}</p>
                                        <div className={styles.popupActions}>
                                            {h.phone && (
                                                <a className={`${styles.popupBtn} ${styles.popupBtnGreen}`} href={`tel:${h.phone}`}>
                                                    📞 Call
                                                </a>
                                            )}
                                            <button
                                                className={`${styles.popupBtn} ${styles.popupBtnGreen}`}
                                                onClick={() => fetchRoute(h.latitude, h.longitude, h.name)}
                                                disabled={!userLocation}
                                            >
                                                🧭 Navigate
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}



                    {/* Route polyline */}
                    {activeRoute && (
                        <Polyline
                            positions={activeRoute}
                            pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
                        />
                    )}

                    {/* Fit map to route */}
                    {activeRoute && <MapFitBounds coords={activeRoute} />}
                </MapContainer>
            </div>

            {/* ── GOOGLE MAPS POPUP ── */}
            {showMapPopup && routeInfo && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Open in Google Maps?</h3>
                        <p className={styles.modalText}>
                            Would you like to open Google Maps for driving directions to <strong>{routeInfo.name}</strong>?
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setShowMapPopup(false)}>Cancel</button>
                            <button className={styles.modalOk} onClick={() => {
                                setShowMapPopup(false);
                                openGoogleMaps(routeInfo.lat, routeInfo.lng);
                            }}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ROUTE LOADING ── */}
            {routeLoading && (
                <div className={styles.infoBanner}>
                    <span className={styles.spinnerInline} /> Calculating route…
                </div>
            )}

            {/* ── ROUTE INFO BAR ── */}
            {routeInfo && !routeLoading && (
                <div className={styles.routeBar}>
                    <div className={styles.routeBarLeft}>
                        <span className={styles.routeIcon}>🧭</span>
                        <div>
                            <p className={styles.routeBarName}>{routeInfo.name}</p>
                            <p className={styles.routeBarMeta}>
                                {routeInfo.distKm} km by road · ~{routeInfo.durationMin} min
                            </p>
                        </div>
                    </div>
                    <button className={styles.routeClearBtn} onClick={clearRoute}>✕ Clear</button>
                </div>
            )}

            {/* ── MAP LEGEND ── */}
            <div className={styles.legend}>
                <span className={styles.legendItem}>
                    <img src="/Images/venom.png" alt="antivenom" style={{ width: 18, height: 18, objectFit: 'contain' }} /> Antivenom
                </span>
                <span className={styles.legendItem}>
                    <img src={hospitalPng} alt="hospital" style={{ width: 18, height: 18, objectFit: 'contain' }} /> Hospital
                </span>
                <span className={styles.legendItem}>
                    <img src="/Images/clinic.png" alt="clinic" style={{ width: 18, height: 18, objectFit: 'contain' }} /> Clinic
                </span>
                <span className={styles.legendItem}>
                    <img src={userPng} alt="you" style={{ width: 18, height: 18, objectFit: 'contain' }} /> You
                </span>
            </div>

            {/* ── SORTED LIST ── */}
            <div className={styles.listSection}>


                {sortedList.length === 0 && (
                    <p className={styles.emptyMsg}>No results match the active filters.</p>
                )}

                {sortedList.map((h) => {
                    const isAntivenom = !!h.antivenom;
                    const isClinic = h.amenity === 'clinic';
                    const accentColor = isAntivenom ? '#ef4444' : isClinic ? '#22c55e' : '#3b82f6';
                    const typeLabel = isAntivenom ? '💉 Antivenom' : isClinic ? '🩺 Clinic' : '🏥 Hospital';

                    return (
                        <div
                            key={h.id}
                            className={styles.card}
                            style={{ borderLeftColor: accentColor }}
                        >
                            <div className={styles.cardTop}>
                                <div>
                                    <span className={styles.cardType} style={{ color: accentColor }}>
                                        {typeLabel}
                                    </span>
                                    <p className={styles.cardName}>{h.name}</p>
                                    {h.district && <p className={styles.cardSub}>{h.district}</p>}
                                </div>
                                {h.distance !== null && (
                                    <span className={styles.distBadge} style={{ background: accentColor }}>
                                        {h.distance.toFixed(1)} km
                                    </span>
                                )}
                            </div>
                            <div className={styles.cardActions}>
                                {h.phone && (
                                    <a className={styles.cardBtn} href={`tel:${h.phone}`}>
                                        📞 Call
                                    </a>
                                )}
                                <button
                                    className={styles.cardBtn}
                                    onClick={() => fetchRoute(h.latitude, h.longitude, h.name)}
                                    disabled={!userLocation}
                                >
                                    🧭 Navigate
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Show more button */}
                {canShowMore && extraCount > 0 && (
                    <button
                        className={styles.showMoreBtn}
                        onClick={() => setShowMore(true)}
                    >
                        Show more
                    </button>
                )}
            </div>

            <div className={styles.disclaimer}>
                ⚠️ Antivenom availability may vary. Always proceed to the nearest hospital immediately.
            </div>
        </div>
    );
}
