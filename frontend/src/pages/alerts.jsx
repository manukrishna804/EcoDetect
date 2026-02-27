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
                        },
                        image_path: raw.image_path || null
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

    const getImageUrl = (alertItem) => {
        if (alertItem.image_path) return alertItem.image_path;
        const speciesName = alertItem.speciesName;
        if (!speciesName) return null;

        // Fallback mapping for older records without image_path
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

        const lowerName = speciesName.toLowerCase().trim();
        return nameMap[lowerName] || "https://via.placeholder.com/70?text=IMG";
    };

    // --- 4. Process & Render Logic ---

    // Merge State with Calculations
    const finalAlerts = alerts.map(alertItem => {
        let dist = null;
        if (userLocation && alertItem.detectionLocation?.lat && alertItem.detectionLocation?.lng) {
            dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                alertItem.detectionLocation.lat,
                alertItem.detectionLocation.lng
            );
        }

        return {
            ...alertItem,
            distanceMiles: dist ? parseFloat(dist) : Infinity,
            distanceLabel: dist ? `${dist} miles away` : "Distance unknown",
            timeLabel: getTimeAgo(alertItem.detectedAt),
            riskValue: alertItem.risk === "High" ? 3 : alertItem.risk === "Medium" ? 2 : 1
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

    // Sort: Latest to Oldest first, then Risk, then Distance
    displayList.sort((a, b) => {
        // 1. Time (Latest first)
        const tA = a.detectedAt?.seconds || (a.detectedAt instanceof Date ? a.detectedAt.getTime() / 1000 : 0);
        const tB = b.detectedAt?.seconds || (b.detectedAt instanceof Date ? b.detectedAt.getTime() / 1000 : 0);
        if (tB !== tA) return tB - tA;

        // 2. Risk (High first)
        if (b.riskValue !== a.riskValue) return b.riskValue - a.riskValue;

        // 3. Distance (Nearest first)
        return a.distanceMiles - b.distanceMiles;
    });



    const navigate = useNavigate();


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
                    {displayList.map((alertItem) => (
                        <div key={alertItem.id} style={styles.card}>
                            {/* Safe Image Rendering */}
                            <img
                                src={getImageUrl(alertItem)}
                                alt={alertItem.speciesName}
                                style={styles.image}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/70?text=IMG";
                                }}
                            />

                            <div style={styles.info}>
                                {/* Risk Badge */}
                                <div style={styles.badge(alertItem.risk)}>
                                    {alertItem.risk} Risk
                                </div>

                                {/* Species Name */}
                                <h3 style={styles.speciesName}>{alertItem.speciesName}</h3>

                                {/* Details */}
                                <div style={styles.details}>
                                    <span>📍 {alertItem.distanceLabel}</span>
                                    <span>🕒 {alertItem.timeLabel}</span>
                                </div>
                            </div>


                            <button
                                style={styles.button}
                                onClick={() => navigate(`/learn/species/${encodeURIComponent(alertItem.speciesName)}`)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
