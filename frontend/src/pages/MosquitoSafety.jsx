import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dengueImg from '../assets/mosquito-awareness/dengue.jpg';
import malariaImg from '../assets/mosquito-awareness/malaria.jpg';
import mosquitoImg from '../assets/mosquito-awareness/mosquito.jpg';
import standing_water from '../assets/mosquito-awareness/standing_water.jpg';

const MosquitoSafety = () => {
    const navigate = useNavigate();
    const [selectedDisease, setSelectedDisease] = useState(null); // For modal
    const [checkedTips, setCheckedTips] = useState({
        repellent: false,
        clothing: false,
        nets: false
    });

    const toggleTip = (key) => {
        setCheckedTips(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const openModal = (disease) => {
        setSelectedDisease(disease);
    };

    const closeModal = () => {
        setSelectedDisease(null);
    };

    // Disease Data
    const diseases = {
        dengue: {
            name: "Dengue Fever",
            symptoms: ["High fever", "Severe headache", "Pain behind eyes", "Muscle & joint pain", "Rash", "Nausea"],
            action: "Seek medical attention immediately if symptoms appear after mosquito bites.",
            color: "#FFCDD2"
        },
        malaria: {
            name: "Malaria",
            symptoms: ["Chills", "Fever", "Sweating", "Headache", "Nausea", "Fatigue", "Body aches"],
            action: "Malaria can be fatal. Blood tests are required for confirmation. Consult a doctor.",
            color: "#E1BEE7"
        }
    };

    // Styles
    const styles = {
        container: {
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#F7F9F8',
            minHeight: '100vh',
            maxWidth: '1000px',
            margin: '0 auto',
            paddingBottom: '80px',
            position: 'relative', // For modal overlay
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        backButton: {
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333',
        },
        headerTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#1F2937',
            margin: 0,
        },
        shareButton: {
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#333',
        },
        content: {
            padding: '20px',
        },
        riskBanner: {
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
        },
        riskBadge: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
        },
        riskHeadline: {
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '8px',
            lineHeight: 1.3,
            maxWidth: '60%',
        },
        mosquitoImgPlaceholder: {
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            width: '150px',
            height: '150px',
            background: `rgba(255,255,255,0.1) url(${mosquitoImg}) no-repeat center/cover`,
            borderRadius: '50%',
        },
        actionGrid: {
            display: 'flex',
            gap: '16px',
            marginBottom: '32px',
        },
        actionCard: (color) => ({
            flex: 1,
            backgroundColor: color === 'green' ? '#E8F5E9' : '#FFEBEE',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: `1px solid ${color === 'green' ? '#C8E6C9' : '#FFCDD2'}`,
            userSelect: 'none',
        }),
        actionIcon: (color) => ({
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: color === 'green' ? '#4CAF50' : '#EF5350',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
        }),
        actionText: (color) => ({
            fontSize: '14px',
            fontWeight: '700',
            color: color === 'green' ? '#2E7D32' : '#C62828',
        }),
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        seeAll: {
            fontSize: '14px',
            color: '#4CAF50',
            cursor: 'pointer',
            fontWeight: '600',
        },
        diseaseList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
        },
        diseaseCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
        },
        diseaseImg: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            flexShrink: 0,
            objectFit: 'cover',
        },
        diseaseContent: {
            flex: 1,
        },
        diseaseHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
        },
        diseaseName: {
            fontSize: '16px',
            fontWeight: '700',
            color: '#374151',
            margin: 0,
        },
        diseaseTag: (type) => ({
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: '8px',
            backgroundColor: type === 'VIRAL' ? '#FFEDD5' : '#F3E8FF',
            color: type === 'VIRAL' ? '#C2410C' : '#7E22CE',
            fontWeight: '700',
            textTransform: 'uppercase',
        }),
        diseaseDesc: {
            fontSize: '13px',
            color: '#6B7280',
            margin: '4px 0 8px 0',
            lineHeight: '1.4',
        },
        learnLink: {
            fontSize: '13px',
            color: '#4CAF50',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
        },
        preventionCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        tipItem: (active) => ({
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            cursor: 'pointer',
            opacity: active ? 1 : 0.7,
            transition: 'opacity 0.2s',
        }),
        checkIcon: (active) => ({
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: active ? '#4CAF50' : '#E0E0E0',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
            transition: 'background-color 0.2s',
        }),
        tipContent: {
            flex: 1,
        },
        tipTitle: (active) => ({
            fontSize: '15px',
            fontWeight: '700',
            color: active ? '#374151' : '#9CA3AF',
            marginBottom: '4px',
            textDecoration: active ? 'none' : 'none', // Could strike-through if strictly checklist
        }),
        tipDesc: {
            fontSize: '13px',
            color: '#6B7280',
            lineHeight: '1.4',
        },
        envCard: {
            backgroundColor: '#E0F2F1',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            border: '1px solid #B2DFDB',
        },
        envImg: {
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            backgroundColor: '#4DB6AC',
            flexShrink: 0,
            objectFit: 'cover',
        },
        alertFooter: {
            backgroundColor: '#FFF3E0',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #FFE0B2',
        },
        alertIcon: {
            fontSize: '20px',
            color: '#F57C00',
        },
        alertText: {
            fontSize: '13px',
            color: '#E65100',
            fontWeight: '600',
            lineHeight: '1.4',
        },
        // Modal
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end', // Bottom sheet style on mobile
            justifyContent: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.2s',
        },
        modalContent: {
            backgroundColor: 'white',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s',
            zIndex: 101,
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1F2937',
        },
        modalSubtitle: {
            fontSize: '14px',
            fontWeight: '700',
            color: '#6B7280',
            marginTop: '16px',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        symptomList: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '20px',
        },
        symptomTag: {
            backgroundColor: '#F3F4F6',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#374151',
            textAlign: 'center',
            fontWeight: '500',
        },
        closeButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button className="eco-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 style={styles.headerTitle}>Mosquito Safety</h1>
                <button style={styles.shareButton} onClick={() => alert("Share feature coming soon!")}>🔗</button>
            </header>

            <div style={styles.content}>
                {/* Risk Banner */}
                <div style={styles.riskBanner}>
                    <div style={styles.riskBadge}>
                        <span>🛡️</span> LOW RISK AREA
                    </div>
                    <h2 style={styles.riskHeadline}>Know the risks,<br />stay protected.</h2>
                    <div style={styles.mosquitoImgPlaceholder}></div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actionGrid}>
                    <div
                        style={styles.actionCard('green')}
                        onClick={() => navigate('/detect')}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={styles.actionIcon('green')}>📷</div>
                        <span style={styles.actionText('green')}>Identify Insect</span>
                    </div>
                    <div
                        style={styles.actionCard('red')}
                        onClick={() => navigate('/hotspots')} // Mocking report flow
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={styles.actionIcon('red')}>⚠️</div>
                        <span style={styles.actionText('red')}>Report Sighting</span>
                    </div>
                </div>

                {/* Common Diseases */}
                <div style={styles.sectionTitle}>
                    Common Diseases <span style={styles.seeAll}>See All</span>
                </div>
                <div style={styles.diseaseList}>
                    {/* Dengue */}
                    <div
                        style={styles.diseaseCard}
                        onClick={() => openModal(diseases.dengue)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ ...styles.diseaseImg, background: `#FFCDD2 url(${dengueImg}) center/cover` }}></div>
                        <div style={styles.diseaseContent}>
                            <div style={styles.diseaseHeader}>
                                <h3 style={styles.diseaseName}>Dengue Fever</h3>
                                <span style={styles.diseaseTag('VIRAL')}>VIRAL</span>
                            </div>
                            <p style={styles.diseaseDesc}>High fever, rash, and severe muscle and joint pain.</p>
                            <div style={styles.learnLink}>ℹ️ Learn symptoms</div>
                        </div>
                    </div>

                    {/* Malaria */}
                    <div
                        style={styles.diseaseCard}
                        onClick={() => openModal(diseases.malaria)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ ...styles.diseaseImg, background: `#E1BEE7 url(${malariaImg}) center/cover` }}></div>
                        <div style={styles.diseaseContent}>
                            <div style={styles.diseaseHeader}>
                                <h3 style={styles.diseaseName}>Malaria</h3>
                                <span style={styles.diseaseTag('PARASITIC')}>PARASITIC</span>
                            </div>
                            <p style={styles.diseaseDesc}>Chills, sweating, fever, and fatigue. Transmitted by Anopheles.</p>
                            <div style={styles.learnLink}>ℹ️ Learn symptoms</div>
                        </div>
                    </div>
                </div>

                {/* Prevention Tips - Interactive Checklist */}
                <div style={styles.sectionTitle}>🛡️ Prevention Tips</div>
                <div style={styles.preventionCard}>
                    <div style={styles.tipItem(checkedTips.repellent)} onClick={() => toggleTip('repellent')}>
                        <div style={styles.checkIcon(checkedTips.repellent)}>✓</div>
                        <div style={styles.tipContent}>
                            <div style={styles.tipTitle(checkedTips.repellent)}>Use Insect Repellent</div>
                            <div style={styles.tipDesc}>Apply EPA-registered repellents containing DEET or Picaridin.</div>
                        </div>
                    </div>
                    <div style={styles.tipItem(checkedTips.clothing)} onClick={() => toggleTip('clothing')}>
                        <div style={styles.checkIcon(checkedTips.clothing)}>✓</div>
                        <div style={styles.tipContent}>
                            <div style={styles.tipTitle(checkedTips.clothing)}>Wear Protective Clothing</div>
                            <div style={styles.tipDesc}>Wear long-sleeved shirts and long pants, especially at dusk and dawn.</div>
                        </div>
                    </div>
                    <div style={{ ...styles.tipItem(checkedTips.nets), marginBottom: 0 }} onClick={() => toggleTip('nets')}>
                        <div style={styles.checkIcon(checkedTips.nets)}>✓</div>
                        <div style={styles.tipContent}>
                            <div style={styles.tipTitle(checkedTips.nets)}>Mosquito Nets</div>
                            <div style={styles.tipDesc}>Sleep under a mosquito net if sleeping outdoors or in unscreened rooms.</div>
                        </div>
                    </div>
                </div>

                {/* Environmental Control */}
                <div style={styles.sectionTitle}>Environmental Control</div>
                <div style={styles.envCard}>
                    <div style={{ ...styles.envImg, background: `#B2DFDB url(${standing_water}) center/cover` }}></div>
                    <div>
                        <h3 style={styles.diseaseName}>Remove Standing Water</h3>
                        <p style={styles.diseaseDesc}>Mosquitoes lay eggs in standing water. Empty pots weekly.</p>
                    </div>
                </div>

                {/* Community Alert */}
                <div style={styles.alertFooter}>
                    <div style={styles.alertIcon}>🔔</div>
                    <div style={styles.alertText}>
                        Community Alert: Local spraying scheduled for Tuesday, 8 PM.
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {selectedDisease && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: selectedDisease.color }}></div>
                            <h2 style={styles.modalTitle}>{selectedDisease.name}</h2>
                        </div>

                        <div style={styles.modalSubtitle}>Common Symptoms</div>
                        <div style={styles.symptomList}>
                            {selectedDisease.symptoms.map((sym, idx) => (
                                <div key={idx} style={styles.symptomTag}>{sym}</div>
                            ))}
                        </div>

                        <div style={styles.modalSubtitle}>Action Required</div>
                        <p style={{ ...styles.diseaseDesc, fontSize: '14px', color: '#B91C1C', fontWeight: '500' }}>
                            {selectedDisease.action}
                        </p>

                        <button style={styles.closeButton} onClick={closeModal}>Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MosquitoSafety;
