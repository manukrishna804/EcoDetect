import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { protocols } from "../../data/protocols";

import { API_BASE_URL } from '../../config';


function SpeciesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [species, setSpecies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/species/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Species not found");
                return res.json();
            })
            .then((data) => {
                setSpecies(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching species detail:", err);
                setError("Error loading species details.");
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div style={styles.statusContainer}>
            <p style={styles.statusText}>Loading details...</p>
        </div>
    );

    if (error || !species) return (
        <div style={styles.statusContainer}>
            <p style={styles.errorText}>{error || "Species not found."}</p>
            <button className="eco-back-btn" onClick={() => navigate(-1)}>
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
    );

    // Helper to resolve protocol data (handling aliases)
    const resolveProtocol = (id) => {
        if (!id) return null;
        let data = protocols[id];
        if (data && data.alias) {
            return protocols[data.alias] || null;
        }
        return data || null;
    };

    // Match detailed protocol from protocols.js (try first aid then precaution)
    const protocolData = resolveProtocol(species.firstaid_protocol) || resolveProtocol(species.precaution_protocol);

    const dangerColor =
        species.danger_level?.toLowerCase() === "high" || species.danger_level?.toLowerCase() === "extreme"
            ? "#ef4444"
            : species.danger_level?.toLowerCase() === "medium"
                ? "#f59e0b"
                : "#10b981";

    return (
        <div style={styles.container}>
            <button
                className="eco-back-btn"
                onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start', marginBottom: '20px' }}
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div style={styles.card}>
                <div style={styles.imageSection}>
                    <img
                        src={species.media?.image || "https://images.unsplash.com/photo-1528158222524-d4d912b2e20a?auto=format&fit=crop&w=400&q=80"}
                        alt={species.name}
                        style={styles.image}
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1528158222524-d4d912b2e20a?auto=format&fit=crop&w=400&q=80";
                        }}
                    />
                    <div style={{ ...styles.badge, backgroundColor: dangerColor }}>
                        {species.danger_level}
                    </div>
                </div>

                <div style={styles.contentSection}>
                    <h1 style={styles.title}>{species.name}</h1>
                    <p style={styles.scientificName}>{species.scientific_name}</p>

                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <span style={styles.label}>Category</span>
                            <span style={styles.value}>{species.category}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.label}>Venomous</span>
                            <span style={{ ...styles.value, color: species.venomous ? "#ef4444" : "#10b981" }}>
                                {species.venomous ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Overview</h3>
                        <p style={styles.text}>{species.ai_note || "No overview available."}</p>
                    </div>

                    {/* Protocol Details */}
                    {protocolData ? (
                        <div style={styles.protocolBox}>
                            <h2 style={styles.mainProtocolTitle}>🚑 Safety Protocol: {protocolData.title}</h2>

                            <div style={styles.dosDontsRow}>
                                <div style={styles.dosSection}>
                                    <h4 style={styles.subTitle}>✅ What to Do</h4>
                                    <ul style={styles.list}>
                                        {protocolData.what_to_do.map((item, idx) => (
                                            <li key={idx} style={styles.listItem}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={styles.dontsSection}>
                                    <h4 style={styles.subTitle}>❌ What NOT to Do</h4>
                                    <ul style={styles.list}>
                                        {protocolData.what_not_to_do.map((item, idx) => (
                                            <li key={idx} style={styles.listItem}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {protocolData.steps && protocolData.steps.length > 0 && (
                                <div style={styles.section}>
                                    <h4 style={styles.subTitle}>🔢 Steps to Follow</h4>
                                    <div style={styles.timeline}>
                                        {protocolData.steps.map((step, idx) => (
                                            <div key={idx} style={styles.timelineItem}>
                                                <div style={styles.timelineCircle}>{idx + 1}</div>
                                                <div style={styles.timelineContent}>
                                                    <h5 style={styles.timelineTitle}>{step.title}</h5>
                                                    <p style={styles.timelineDesc}>{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {protocolData.symptoms && protocolData.symptoms.length > 0 && (
                                <div style={styles.section}>
                                    <h4 style={styles.subTitle}>⚠️ Symptoms</h4>
                                    <div style={styles.symptomsGrid}>
                                        {protocolData.symptoms.map((symptom, idx) => (
                                            <div key={idx} style={styles.symptomCard}>{symptom}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={styles.protocolGrid}>
                            <div style={styles.protocolItem}>
                                <h3 style={styles.sectionTitle}>First Aid</h3>
                                <p style={styles.protocolText}>
                                    Protocol: <span style={styles.code}>{species.firstaid_protocol || "General precaution"}</span>
                                </p>
                            </div>
                            <div style={styles.protocolItem}>
                                <h3 style={styles.sectionTitle}>Precaution</h3>
                                <p style={styles.protocolText}>
                                    Protocol: <span style={styles.code}>{species.precaution_protocol || "Standard safety"}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {species.risk_info?.possible_effects?.length > 0 && (
                        <div style={{ ...styles.section, marginTop: '20px' }}>
                            <h3 style={styles.sectionTitle}>Possible Effects</h3>
                            <div style={styles.tagContainer}>
                                {species.risk_info.possible_effects.map((effect, index) => (
                                    <span key={index} style={styles.tag}>{effect}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px 20px 100px 20px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    backIconBtn: {
        alignSelf: "flex-start",
        background: "white",
        border: "none",
        borderRadius: "12px",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        cursor: "pointer",
        color: "#16a34a",
        marginBottom: "20px",
    },
    card: {
        maxWidth: "800px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #f3f4f6",
    },
    imageSection: {
        position: "relative",
        height: "350px",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    badge: {
        position: "absolute",
        bottom: "20px",
        right: "20px",
        padding: "6px 16px",
        borderRadius: "12px",
        color: "white",
        fontSize: "14px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    contentSection: {
        padding: "30px",
    },
    title: {
        fontSize: "36px",
        fontWeight: "800",
        color: "#111827",
        margin: "0 0 4px 0",
    },
    scientificName: {
        fontSize: "18px",
        fontStyle: "italic",
        color: "#6b7280",
        margin: "0 0 24px 0",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "20px",
        borderRadius: "16px",
    },
    infoItem: {
        display: "flex",
        flexDirection: "column",
    },
    label: {
        fontSize: "12px",
        textTransform: "uppercase",
        color: "#94a3b8",
        fontWeight: "700",
        marginBottom: "4px",
    },
    value: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#334155",
        textTransform: "capitalize",
    },
    section: {
        marginBottom: "30px",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: "12px",
    },
    mainProtocolTitle: {
        fontSize: "22px",
        fontWeight: "800",
        color: "#111827",
        marginBottom: "20px",
        paddingBottom: "10px",
        borderBottom: "2px solid #e2e8f0",
    },
    protocolBox: {
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "20px",
        marginBottom: "30px",
        border: "1px solid #e2e8f0",
    },
    dosDontsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },
    dosSection: {
        backgroundColor: "#f0fdf4",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #dcfce7",
    },
    dontsSection: {
        backgroundColor: "#fef2f2",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #fee2e2",
    },
    subTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#334155",
        marginBottom: "12px",
    },
    list: {
        paddingLeft: "20px",
        margin: 0,
    },
    listItem: {
        fontSize: "14px",
        color: "#475569",
        marginBottom: "8px",
        lineHeight: "1.4",
    },
    timeline: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    timelineItem: {
        display: "flex",
        gap: "16px",
    },
    timelineCircle: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: "#16a34a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "700",
        flexShrink: 0,
    },
    timelineContent: {
        paddingTop: "2px",
    },
    timelineTitle: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#1e293b",
        margin: "0 0 2px 0",
    },
    timelineDesc: {
        fontSize: "14px",
        color: "#64748b",
        margin: 0,
        lineHeight: "1.4",
    },
    symptomsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "10px",
    },
    symptomCard: {
        backgroundColor: "white",
        padding: "8px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    text: {
        fontSize: "16px",
        lineHeight: "1.6",
        color: "#475569",
    },
    tagContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
    },
    tag: {
        padding: "6px 14px",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "500",
    },
    protocolGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginTop: "10px",
    },
    protocolItem: {
        backgroundColor: "#f0fdf4",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #dcfce7",
    },
    protocolText: {
        margin: 0,
        fontSize: "15px",
        color: "#166534",
    },
    code: {
        fontFamily: "monospace",
        fontWeight: "700",
        backgroundColor: "rgba(0,0,0,0.05)",
        padding: "2px 4px",
        borderRadius: "4px",
    },
    statusContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
    },
    statusText: {
        fontSize: "18px",
        color: "#64748b",
    },
    errorText: {
        fontSize: "18px",
        color: "#ef4444",
        fontWeight: "600",
    },
    backButton: {
        padding: "10px 24px",
        backgroundColor: "#16a34a",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600",
    },
};

export default SpeciesDetail;
