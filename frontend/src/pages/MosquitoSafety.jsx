import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dengueImg from '../assets/mosquito-awareness/dengue.jpg';
import malariaImg from '../assets/mosquito-awareness/malaria.jpg';
import mosquitoImg from '../assets/mosquito-awareness/mosquito.jpg';
import standing_water from '../assets/mosquito-awareness/standing_water.jpg';
import drainImg from '../assets/mosquito-awareness/drain.jpg';

const MosquitoSafety = () => {
    const navigate = useNavigate();
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [activeTab, setActiveTab] = useState('diseases');

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const openModal = (disease) => setSelectedDisease(disease);
    const closeModal = () => setSelectedDisease(null);

    const diseases = [
        {
            key: 'dengue',
            name: "Dengue Fever",
            tag: "VIRAL",
            tagColor: { bg: '#FFEDD5', text: '#C2410C' },
            img: dengueImg,
            imgBg: '#FFCDD2',
            desc: "Spread by Aedes mosquitoes, primarily during the day.",
            symptoms: ["High fever (40°C)", "Severe headache", "Pain behind eyes", "Muscle & joint pain", "Skin rash", "Nausea & vomiting"],
            onset: "3-14 days after bite",
            severity: "High",
            action: "Seek medical attention immediately if symptoms appear. Stay hydrated and avoid aspirin/ibuprofen.",
        },
        {
            key: 'malaria',
            name: "Malaria",
            tag: "PARASITIC",
            tagColor: { bg: '#F3E8FF', text: '#7E22CE' },
            img: malariaImg,
            imgBg: '#E1BEE7',
            desc: "Caused by Plasmodium parasites via Anopheles mosquitoes, mainly at night.",
            symptoms: ["Cyclical chills", "High fever", "Excessive sweating", "Severe headache", "Nausea & vomiting", "Muscle fatigue", "Body aches"],
            onset: "7-30 days after bite",
            severity: "Very High",
            action: "Malaria can be fatal if untreated. Blood tests are required for diagnosis. Consult a doctor immediately.",
        },
        {
            key: 'chikungunya',
            name: "Chikungunya",
            tag: "VIRAL",
            tagColor: { bg: '#FFEDD5', text: '#C2410C' },
            img: '/Images/Culex.jpg',
            imgBg: '#FFE0CC',
            desc: "Spread by Aedes mosquitoes. Characterized by severe joint pain.",
            symptoms: ["Sudden high fever", "Joint pain/swelling", "Muscle pain", "Headache", "Fatigue", "Skin rash"],
            onset: "2-12 days after bite",
            severity: "Moderate",
            action: "No specific antiviral treatment. Rest, stay hydrated, and take paracetamol for pain relief.",
        },
    ];

    const preventionTips = [
        {
            icon: '🧴',
            title: 'Use Insect Repellent',
            desc: 'Apply EPA-registered repellents containing DEET (20-30%) or Picaridin to exposed skin and clothing.',
        },
        {
            icon: '👕',
            title: 'Wear Protective Clothing',
            desc: 'Long-sleeved shirts, long pants, socks and shoes especially at dusk and dawn when mosquitoes are most active.',
        },
        {
            icon: '🛏️',
            title: 'Use Mosquito Nets',
            desc: 'Sleep under insecticide-treated nets (ITNs) if in a high-risk area or sleeping outdoors.',
        },
        {
            icon: '🪟',
            title: 'Secure Your Home',
            desc: 'Install window and door screens. Keep them in good repair to prevent mosquitoes from entering.',
        },
        {
            icon: '🌿',
            title: 'Avoid Peak Hours',
            desc: 'Limit outdoor activity during dusk and dawn (malaria risk). Aedes mosquitoes bite throughout the day.',
        },
    ];

    const envTips = [
        { img: standing_water, imgBg: '#B2DFDB', title: 'Remove Stagnant Water', desc: 'Mosquitoes breed in still water. Empty flower pots, buckets, birdbaths, and tyres regularly.' },
        { img: drainImg, imgBg: '#DCEDC8', title: 'Keep Drains Clean', desc: 'Ensure drains and gutters flow freely. Block drains with mesh to prevent mosquito breeding sites.' },
    ];

    const s = {
        page: { fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F0F4F1', minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '90px' },
        header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid #E5EAE6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
        headerTitle: { fontSize: '18px', fontWeight: '800', color: '#1a2e1c', margin: 0 },
        spacer: { width: '40px' },

        // Hero
        hero: { background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)', padding: '28px 20px 24px', position: 'relative', overflow: 'hidden' },
        heroOverline: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' },
        heroTitle: { fontSize: '26px', fontWeight: '900', color: '#fff', lineHeight: 1.25, marginBottom: '8px', maxWidth: '65%', whiteSpace: 'pre-line' },
        heroSub: { fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: '65%', marginBottom: '20px' },
        heroActions: { display: 'flex', gap: '10px' },
        heroBtn: (primary) => ({
            flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none',
            backgroundColor: primary ? '#fff' : 'rgba(255,255,255,0.18)', color: primary ? '#2E7D32' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }),
        heroMosquito: { position: 'absolute', right: '-25px', top: '50%', transform: 'translateY(-50%)', width: '130px', height: '130px', borderRadius: '50%', background: `rgba(255,255,255,0.08) url(${mosquitoImg}) center/cover`, border: '2px solid rgba(255,255,255,0.1)' },

        // Stats row
        statsRow: { display: 'flex', gap: '0', backgroundColor: '#fff', borderBottom: '1px solid #E5EAE6' },
        statItem: { flex: 1, padding: '14px 12px', textAlign: 'center', borderRight: '1px solid #E5EAE6' },
        statValue: { fontSize: '20px', fontWeight: '900', color: '#1B5E20', margin: 0 },
        statLabel: { fontSize: '10px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' },

        // Tabs
        tabBar: { display: 'flex', backgroundColor: '#fff', borderBottom: '2px solid #E5EAE6', position: 'sticky', top: '57px', zIndex: 10 },
        tab: (active) => ({ flex: 1, padding: '12px 8px', textAlign: 'center', fontSize: '13px', fontWeight: active ? '700' : '600', color: active ? '#2E7D32' : '#9CA3AF', cursor: 'pointer', borderBottom: active ? '2px solid #2E7D32' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s', background: 'none', border: 'none', borderBottomStyle: 'solid', borderBottomWidth: '2px', borderBottomColor: active ? '#2E7D32' : 'transparent' }),

        // Body
        body: { padding: '20px' },

        // Section
        sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', marginTop: '4px' },

        // Disease Card
        diseaseCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #F0F4F1' },
        diseaseCardInner: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
        diseaseThumb: (bg) => ({ width: '58px', height: '58px', borderRadius: '12px', background: `${bg} center/cover`, flexShrink: 0 }),
        diseaseMeta: { flex: 1, minWidth: 0 },
        diseaseTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
        diseaseName: { fontSize: '15px', fontWeight: '800', color: '#1a2e1c', margin: 0 },
        diseaseTag: (colors) => ({ fontSize: '9px', padding: '3px 7px', borderRadius: '6px', backgroundColor: colors.bg, color: colors.text, fontWeight: '800', letterSpacing: '0.5px', flexShrink: 0 }),
        diseaseDesc: { fontSize: '12.5px', color: '#6B7280', lineHeight: 1.45, marginBottom: '10px' },
        diseaseMini: { display: 'flex', gap: '8px' },
        miniChip: { fontSize: '11px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px' },
        chipDot: (sev) => ({ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sev === 'Very High' ? '#ef4444' : sev === 'High' ? '#f97316' : '#f59e0b', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }),

        // Prevention bullet
        tipCard: { backgroundColor: '#fff', borderRadius: '14px', padding: '16px 18px', marginBottom: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #F0F4F1' },
        tipIcon: { width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
        tipTitle: { fontSize: '14px', fontWeight: '700', color: '#1a2e1c', marginBottom: '3px' },
        tipDesc: { fontSize: '12.5px', color: '#6B7280', lineHeight: 1.45 },

        // Env tips
        envCard: { backgroundColor: '#E8F5E9', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid #C8E6C9' },
        envThumb: (bg) => ({ width: '52px', height: '52px', borderRadius: '10px', background: `${bg} center/cover`, flexShrink: 0 }),
        envTitle: { fontSize: '14px', fontWeight: '700', color: '#1B5E20', marginBottom: '3px' },
        envDesc: { fontSize: '12px', color: '#4B7B4E', lineHeight: 1.4 },

        // Modal
        overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
        modal: { backgroundColor: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '28px 20px', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' },
        modalHandle: { width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#E5E7EB', margin: '0 auto 20px' },
        modalTitle: { fontSize: '22px', fontWeight: '900', color: '#1a2e1c', marginBottom: '4px' },
        modalOnset: { fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' },
        modalSectionLabel: { fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', marginTop: '16px' },
        symptomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' },
        symptomTag: { backgroundColor: '#F9FAFB', padding: '9px 12px', borderRadius: '10px', fontSize: '12.5px', color: '#374151', textAlign: 'center', fontWeight: '600', border: '1px solid #F3F4F6' },
        actionBox: { backgroundColor: '#FFF1F2', borderRadius: '12px', padding: '14px', marginBottom: '20px', borderLeft: '3px solid #ef4444' },
        actionText: { fontSize: '13px', color: '#991B1B', lineHeight: 1.5, margin: 0 },
        closeBtn: { width: '100%', padding: '14px', backgroundColor: '#1B5E20', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
    };

    const tabs = [
        { key: 'diseases', label: '🦟 Diseases' },
        { key: 'prevention', label: '🛡️ Prevention' },
        { key: 'environment', label: '🏡 Environment' },
    ];

    return (
        <div style={s.page}>
            {/* Header */}
            <header style={s.header}>
                <button className="eco-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 style={s.headerTitle}>Mosquito Safety</h1>
                <div style={s.spacer}></div>
            </header>

            {/* Hero */}
            <div style={s.hero}>
                <p style={s.heroOverline}>Health Advisory</p>
                <h2 style={s.heroTitle}>Know the risks,{'\n'}stay protected.</h2>
                <p style={s.heroSub}>Mosquito-borne diseases are preventable with the right knowledge and precautions.</p>
                <div style={s.heroActions}>
                    <button style={s.heroBtn(true)} onClick={() => navigate('/detect')}>
                        📷 Identify Insect
                    </button>
                    <button style={s.heroBtn(false)} onClick={() => navigate('/hotspots')}>
                        ⚠️ View Hotspots
                    </button>
                </div>
                <div style={s.heroMosquito}></div>
            </div>

            {/* Quick Stats */}
            <div style={s.statsRow}>
                <div style={s.statItem}>
                    <p style={s.statValue}>3+</p>
                    <p style={s.statLabel}>Diseases</p>
                </div>
                <div style={s.statItem}>
                    <p style={s.statValue}>40°C</p>
                    <p style={s.statLabel}>Max Fever</p>
                </div>
                <div style={{ ...s.statItem, borderRight: 'none' }}>
                    <p style={s.statValue}>5 Tips</p>
                    <p style={s.statLabel}>Prevention</p>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={s.tabBar}>
                {tabs.map(t => (
                    <button key={t.key} style={s.tab(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content Body */}
            <div style={s.body}>

                {/* --- DISEASES TAB --- */}
                {activeTab === 'diseases' && (
                    <>
                        <p style={s.sectionLabel}>Tap a card for symptoms & action steps</p>
                        {diseases.map(d => (
                            <div
                                key={d.key}
                                style={s.diseaseCard}
                                onClick={() => openModal(d)}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                            >
                                <div style={s.diseaseCardInner}>
                                    <div style={{ ...s.diseaseThumb(d.imgBg), backgroundImage: `url(${d.img})` }}></div>
                                    <div style={s.diseaseMeta}>
                                        <div style={s.diseaseTop}>
                                            <h3 style={s.diseaseName}>{d.name}</h3>
                                            <span style={s.diseaseTag(d.tagColor)}>{d.tag}</span>
                                        </div>
                                        <p style={s.diseaseDesc}>{d.desc}</p>
                                        <div style={s.diseaseMini}>
                                            <span style={s.miniChip}>⏱ {d.onset}</span>
                                            <span style={s.miniChip}>
                                                <span style={s.chipDot(d.severity)}></span>
                                                {d.severity} Risk
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* --- PREVENTION TAB --- */}
                {activeTab === 'prevention' && (
                    <>
                        <p style={s.sectionLabel}>5 evidence-based prevention methods</p>
                        {preventionTips.map((tip, i) => (
                            <div key={i} style={s.tipCard}>
                                <div style={s.tipIcon}>{tip.icon}</div>
                                <div>
                                    <div style={s.tipTitle}>{tip.title}</div>
                                    <div style={s.tipDesc}>{tip.desc}</div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* --- ENVIRONMENT TAB --- */}
                {activeTab === 'environment' && (
                    <>
                        <p style={s.sectionLabel}>Reduce breeding grounds near you</p>
                        {envTips.map((tip, i) => (
                            <div key={i} style={s.envCard}>
                                <div style={{ ...s.envThumb(tip.imgBg), backgroundImage: `url(${tip.img})` }}></div>
                                <div>
                                    <div style={s.envTitle}>{tip.title}</div>
                                    <div style={s.envDesc}>{tip.desc}</div>
                                </div>
                            </div>
                        ))}
                        {/* Additional tips as bullet list */}
                        <p style={{ ...s.sectionLabel, marginTop: '20px' }}>Also remember to</p>
                        {[
                            'Change pet water bowls every 2-3 days',
                            'Cover water storage tanks tightly',
                            'Clear leaf litter from around the house',
                            'Report mosquito breeding sites to local health authorities',
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4CAF50', marginTop: '5px', flexShrink: 0 }}></div>
                                <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{tip}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Disease Detail Modal */}
            {selectedDisease && (
                <div style={s.overlay} onClick={closeModal}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.modalHandle}></div>
                        <h2 style={s.modalTitle}>{selectedDisease.name}</h2>
                        <p style={s.modalOnset}>⏱ Incubation: {selectedDisease.onset}</p>

                        <p style={s.modalSectionLabel}>Common Symptoms</p>
                        <div style={s.symptomGrid}>
                            {selectedDisease.symptoms.map((sym, idx) => (
                                <div key={idx} style={s.symptomTag}>{sym}</div>
                            ))}
                        </div>

                        <p style={s.modalSectionLabel}>What to Do</p>
                        <div style={s.actionBox}>
                            <p style={s.actionText}>{selectedDisease.action}</p>
                        </div>

                        <button style={s.closeBtn} onClick={closeModal}>Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MosquitoSafety;
