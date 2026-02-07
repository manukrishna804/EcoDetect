import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// --- Stylings ---
const styles = {
    container: {
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#F4F7F6",
        minHeight: "100vh",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#2C3E50",
        margin: 0,
    },
    filterContainer: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        overflowX: "auto",
        paddingBottom: "5px",
    },
    filterButton: (isActive) => ({
        padding: "8px 16px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: isActive ? "#2E7D32" : "#E0E0E0",
        color: isActive ? "#FFF" : "#333",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        transition: "background-color 0.3s",
    }),
    card: {
        backgroundColor: "#FFF",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    image: {
        width: "70px",
        height: "70px",
        borderRadius: "10px",
        objectFit: "cover",
        backgroundColor: "#EEE",
        minWidth: "70px", // prevent collapse
    },
    imgPlaceholder: {
        width: "70px",
        height: "70px",
        borderRadius: "10px",
        backgroundColor: "#DDD",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        color: "#666",
        minWidth: "70px",
    },
    info: {
        flex: 1,
    },
    speciesName: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#2C3E50",
        margin: "0 0 4px 0",
        textTransform: "capitalize",
    },
    badge: (riskLevel) => {
        let bg = "#9E9E9E";
        if (riskLevel === "High") bg = "#E53935"; // Red
        else if (riskLevel === "Medium") bg = "#FB8C00"; // Orange
        else if (riskLevel === "Low") bg = "#43A047"; // Green
        return {
            display: "inline-block",
            backgroundColor: bg,
            color: "#FFF",
            fontSize: "10px",
            fontWeight: "bold",
            padding: "2px 8px",
            borderRadius: "4px",
            marginBottom: "4px",
            textTransform: "uppercase",
        };
    },
    details: {
        fontSize: "13px",
        color: "#666",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    loading: {
        textAlign: "center",
        padding: "40px",
        color: "#666",
    },
    button: {
        backgroundColor: "#2E7D32",
        color: "#FFF",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};

const Alerts = () => {
    // State
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null); // { lat, lng }
    const [filter, setFilter] = useState("all");

    // --- 1. Load Data & Location ---
    useEffect(() => {
        const init = async () => {
            console.log("Initializing Alerts Page...");

            // A. Get User Location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const loc = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        console.log("User Location Found:", loc);
                        setUserLocation(loc);
                    },
                    (error) => {
                        console.warn("Geolocation denied or error:", error.message);
                        // Continue without location
                    }
                );
            } else {
                console.warn("Geolocation not supported by this browser.");
            }

            // B. Fetch Firestore Data
            try {
                console.log("Fetching collection: detections");
                const querySnapshot = await getDocs(collection(db, "detections"));

                console.log(`Fetched ${querySnapshot.size} documents.`);

                const mappedData = querySnapshot.docs.map((doc) => {
                    const raw = doc.data();
                    console.log(`Raw Doc [${doc.id}]:`, raw);

                    // --- 2. EXPLICIT FIELD MAPPING ---
                    return {
                        id: doc.id,
                        speciesName: raw.detected_class || "Unknown Species",
                        // Map "extreme" -> "High", and capitalize others
                        risk: (raw.danger_level === "extreme" ? "High" :
                            (raw.danger_level?.charAt(0).toUpperCase() + raw.danger_level?.slice(1))) || "Unknown",
                        detectedAt: raw.timestamp, // Timestamp object
                        detectionLocation: {
                            lat: raw.location?.lat,
                            lng: raw.location?.lng
                        }
                        // Debug fields removed
                    };
                });

                console.log("Mapped Alerts Data:", mappedData);
                setAlerts(mappedData);

            } catch (error) {
                console.error("Critical Error fetching Firestore data:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []); // Run ONCE on mount

    // --- 3. Helpers ---

    // Haversine Formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        try {
            const toRad = (value) => (value * Math.PI) / 180;
            const R = 3958.8; // Radius of Earth in Miles
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = (R * c).toFixed(1);
            // console.log(`Distance calc: ${lat1},${lon1} to ${lat2},${lon2} = ${dist} miles`);
            return dist;
        } catch (e) {
            console.error("Error calculating distance:", e);
            return null;
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return "";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const diff = Math.floor((new Date() - date) / 1000); // seconds
            if (isNaN(diff)) return "";

            if (diff < 60) return `${diff}s ago`;
            const minutes = Math.floor(diff / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        } catch (e) {
            console.error("Date formatting error:", e);
            return "";
        }
    };

    const getImageUrl = (speciesName) => {
        if (!speciesName) return null;
        try {
            // Convert "King Cobra" -> "king_cobra"
            const fileName = speciesName.toLowerCase().trim().replace(/\s+/g, '_');
            // Using logic safe for Vite if assets exist
            return new URL(`../assets/species/${fileName}.jpg`, import.meta.url).href;
        } catch (e) {
            return null;
        }
    };

    // --- 4. Process & Render Logic ---

    // Merge State with Calculations
    const finalAlerts = alerts.map(alert => {
        let dist = null;
        if (userLocation && alert.detectionLocation?.lat && alert.detectionLocation?.lng) {
            dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                alert.detectionLocation.lat,
                alert.detectionLocation.lng
            );
        }

        return {
            ...alert,
            distanceMiles: dist ? parseFloat(dist) : Infinity,
            distanceLabel: dist ? `${dist} miles away` : "Distance unknown",
            timeLabel: getTimeAgo(alert.detectedAt),
            riskValue: alert.risk === "High" ? 3 : alert.risk === "Medium" ? 2 : 1
        };
    });

    // Filter & Sort
    let displayList = finalAlerts;

    // Filter
    if (filter === "high") {
        displayList = displayList.filter(a => a.risk === "High");
    } else if (filter === "near") {
        displayList = displayList.filter(a => a.distanceMiles < 2);
    } else if (filter === "recent") {
        // Last 48 hours
        const cutoff = Date.now() - (48 * 60 * 60 * 1000);
        displayList = displayList.filter(a => {
            const d = a.detectedAt?.toDate ? a.detectedAt.toDate() : new Date(a.detectedAt);
            return d > cutoff;
        });
    }

    // Sort
    displayList.sort((a, b) => {
        // 1. Risk
        if (b.riskValue !== a.riskValue) return b.riskValue - a.riskValue;
        // 2. Distance
        if (a.distanceMiles !== b.distanceMiles) return a.distanceMiles - b.distanceMiles;
        // 3. Time
        const tA = a.detectedAt?.seconds || 0;
        const tB = b.detectedAt?.seconds || 0;
        return tB - tA;
    });


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Community Alerts</h1>
            </div>

            {/* Filter Buttons */}
            <div style={styles.filterContainer}>
                {[
                    { key: "all", label: "All" },
                    { key: "high", label: "High Risk" },
                    { key: "near", label: "Near Me" },
                    { key: "recent", label: "Recent" },
                ].map((btn) => (
                    <button
                        key={btn.key}
                        style={styles.filterButton(filter === btn.key)}
                        onClick={() => setFilter(btn.key)}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={styles.loading}>Loading detections...</div>
            ) : displayList.length === 0 ? (
                <div style={styles.loading}>No alerts found.</div>
            ) : (
                <div>
                    {displayList.map((alert) => (
                        <div key={alert.id} style={styles.card}>
                            {/* Safe Image Rendering */}
                            <img
                                src={getImageUrl(alert.speciesName) || "https://via.placeholder.com/70?text=IMG"}
                                alt={alert.speciesName}
                                style={styles.image}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/70?text=IMG";
                                }}
                            />

                            <div style={styles.info}>
                                {/* Risk Badge */}
                                <div style={styles.badge(alert.risk)}>
                                    {alert.risk} Risk
                                </div>

                                {/* Species Name */}
                                <h3 style={styles.speciesName}>{alert.speciesName}</h3>

                                {/* Details */}
                                <div style={styles.details}>
                                    <span>📍 {alert.distanceLabel}</span>
                                    <span>🕒 {alert.timeLabel}</span>
                                </div>
                            </div>

                            <button style={styles.button} onClick={() => console.log("View", alert)}>
                                View
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
