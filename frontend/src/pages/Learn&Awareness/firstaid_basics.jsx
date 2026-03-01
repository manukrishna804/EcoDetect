import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FirstAidBasics.css';

const FirstAidBasics = () => {
    const navigate = useNavigate();
    const [openIncident, setOpenIncident] = useState(null);

    const toggleIncident = (key) => {
        setOpenIncident(prev => (prev === key ? null : key));
    };

    const incidentData = {
        snake: {
            title: "Snake Bite",
            symptoms: ["Fang marks", "Swelling/Pain", "Blurred vision"],
            actions: ["Keep limb still", "Remove jewelry", "Get to ICU fast"]
        },
        mosquito: {
            title: "Mosquito Bite",
            symptoms: ["Itchy bump", "Redness", "Swelling"],
            actions: ["Wash with soap", "Apply cool pack", "Don't scratch"]
        },
        spider: {
            title: "Spider Bite",
            symptoms: ["Redness/Pain", "Skin lesion", "Muscle cramps"],
            actions: ["Clean wound", "Apply ice", "Monitor breathing"]
        },
        frog: {
            title: "Frog / Toxin Contact",
            symptoms: ["Skin irritation", "Numbness", "Allergic reaction"],
            actions: ["Wash skin fast", "Don't touch eyes", "Use lots of water"]
        }
    };

    return (
        <div className="fab-container">
            <div className="fab-content">
                {/* 1. Emergency Bar */}
                <header className="fab-emergency-bar">
                    <button className="eco-back-btn fab-back-top" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="fab-emergency-header">
                        <span className="material-symbols-outlined">emergency</span>
                        <h3>🚨 Emergency Contacts (India)</h3>
                    </div>
                    <div className="fab-contacts-grid">
                        <div className="fab-contact-item">
                            <label>Ambulance</label>
                            <strong>108</strong>
                        </div>
                        <div className="fab-contact-item">
                            <label>Emergency</label>
                            <strong>112</strong>
                        </div>
                        <div className="fab-contact-item">
                            <label>Health Helpline</label>
                            <strong>104</strong>
                        </div>
                    </div>
                </header>

                <div className="fab-body">
                    {/* 2. Immediate Steps */}
                    <section className="fab-section">
                        <h2 className="fab-section-title">What To Do Immediately</h2>
                        <div className="fab-steps-card">
                            <div className="fab-step">
                                <span className="material-symbols-outlined fab-step-icon">psychology</span>
                                <span className="fab-step-text">Stay calm and don't panic</span>
                            </div>
                            <div className="fab-step">
                                <span className="material-symbols-outlined fab-step-icon">directions_run</span>
                                <span className="fab-step-text">Move away from danger</span>
                            </div>
                            <div className="fab-step">
                                <span className="material-symbols-outlined fab-step-icon">accessibility_new</span>
                                <span className="fab-step-text">Keep affected area still</span>
                            </div>
                            <div className="fab-step">
                                <span className="material-symbols-outlined fab-step-icon">block</span>
                                <span className="fab-step-text">Avoid home remedies</span>
                            </div>
                            <div className="fab-step fab-step-critical">
                                <span className="material-symbols-outlined fab-step-icon">local_hospital</span>
                                <span className="fab-step-text">Go to hospital immediately</span>
                            </div>
                        </div>
                    </section>

                    {/* 3. What NOT To Do */}
                    <section className="fab-section">
                        <div className="fab-warning-box">
                            <h2 className="fab-warning-title">❌ WHAT NOT TO DO</h2>
                            <ul className="fab-warning-list">
                                <li>Do not cut or suck wounds</li>
                                <li>Do not apply tourniquet</li>
                                <li>Do not delay medical help</li>
                                <li>Do not use chemicals or herbs</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Type of Incident */}
                    <section className="fab-section">
                        <h2 className="fab-section-title">Select Incident Type</h2>
                        <div className="fab-incident-list">
                            {Object.entries(incidentData).map(([key, data]) => (
                                <div key={key} className={`fab-incident-card ${openIncident === key ? 'open' : ''}`}>
                                    <div className="fab-incident-header" onClick={() => toggleIncident(key)}>
                                        <span>{data.title}</span>
                                        <span className="material-symbols-outlined fab-chevron">
                                            {openIncident === key ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </div>
                                    {openIncident === key && (
                                        <div className="fab-incident-content">
                                            <div className="fab-incident-inner-grid">
                                                <div>
                                                    <h4>Symptoms</h4>
                                                    <ul>
                                                        {data.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4>First Actions</h4>
                                                    <ul>
                                                        {data.actions.map((a, i) => <li key={i}>{a}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5. When To Seek Immediate Help */}
                    <section className="fab-section">
                        <div className="fab-danger-card">
                            <h2 className="fab-danger-title">🚨 SEEK HELP IMMEDIATELY IF:</h2>
                            <div className="fab-danger-grid">
                                <div className="fab-danger-item">Severe pain or swelling</div>
                                <div className="fab-danger-item">Breathing difficulty</div>
                                <div className="fab-danger-item">Loss of consciousness</div>
                                <div className="fab-danger-item">Rapidly worsening symptoms</div>
                            </div>
                        </div>
                    </section>

                    {/* 6. Disclaimer */}
                    <footer className="fab-disclaimer">
                        This guide provides general first aid awareness only. Always consult trained medical professionals.
                    </footer>

                    <button className="fab-back-btn" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirstAidBasics;
