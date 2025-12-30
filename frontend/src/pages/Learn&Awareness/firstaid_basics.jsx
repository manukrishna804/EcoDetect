import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FirstAidBasics.css';

const FirstAidBasics = () => {
    // Section 1: Core Principles (Expandable, default true)
    const [coreExpanded, setCoreExpanded] = useState(true);

    // Section 2: Situations (Accordion)
    const [openSituation, setOpenSituation] = useState(null);

    const toggleSituation = (key) => {
        setOpenSituation(prev => (prev === key ? null : key));
    };

    // Section 6: Preparedness (Expandable, default false)
    const [preparednessExpanded, setPreparednessExpanded] = useState(false);

    return (
        <div className="fa-container">
            <div className="fa-content-wrapper">

                {/* Header */}
                <header className="fa-header">
                    <h1 className="fa-title">First Aid Basics</h1>
                    <h2 className="fa-subtitle">Basic first-aid awareness for insect and animal encounters</h2>
                    <div className="fa-disclaimer-badge">
                        “This information is for awareness only and does not replace professional medical care.”
                    </div>
                </header>

                {/* SECTION 1: Core First Aid Principles */}
                <section className="fa-section">
                    <h3 className="fa-section-title">
                        <span className="material-symbols-outlined">medical_services</span>
                        General First Aid Awareness
                    </h3>
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => setCoreExpanded(!coreExpanded)}>
                            Core Principles
                            <span className={`material-symbols-outlined fa-expand-icon ${coreExpanded ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {coreExpanded && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li><strong>Stay Calm:</strong> Panic increases heart rate and stress.</li>
                                    <li><strong>Ensure Safety:</strong> Make sure you and the victim are safe from further harm.</li>
                                    <li><strong>Minimize Movement:</strong> Keep the affected person still.</li>
                                    <li><strong>No Myths:</strong> Do not rely on unverified home remedies.</li>
                                    <li><strong>Seek Help:</strong> Professional medical attention is always the priority.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 2: Awareness by Situation */}
                <section className="fa-section">
                    <h3 className="fa-section-title">
                        <span className="material-symbols-outlined">emergency</span>
                        Situation Awareness
                    </h3>

                    {/* Card 1: Snake Bite */}
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => toggleSituation('snake')}>
                            Snake Bite
                            <span className={`material-symbols-outlined fa-expand-icon ${openSituation === 'snake' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {openSituation === 'snake' && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li>Do not panic or run.</li>
                                    <li>Do not cut, suck, or tightly tie the limb.</li>
                                    <li>Keep the affected limb still and below heart level if possible.</li>
                                    <li>Reach a hospital immediately.</li>
                                </ul>
                                <span className="fa-card-footer-note">“Only hospitals can treat snake venom safely.”</span>
                            </div>
                        )}
                    </div>

                    {/* Card 2: Mosquito Bite */}
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => toggleSituation('mosquito')}>
                            Mosquito Bite
                            <span className={`material-symbols-outlined fa-expand-icon ${openSituation === 'mosquito' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {openSituation === 'mosquito' && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li>Clean the bite area gently with soap and water.</li>
                                    <li>Avoid scratching to prevent infection.</li>
                                    <li>Observe for fever or unusual symptoms in the following days.</li>
                                </ul>
                                <span className="fa-card-footer-note">“Seek medical help if symptoms worsen.”</span>
                            </div>
                        )}
                    </div>

                    {/* Card 3: Spider Bite */}
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => toggleSituation('spider')}>
                            Spider Bite
                            <span className={`material-symbols-outlined fa-expand-icon ${openSituation === 'spider' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {openSituation === 'spider' && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li>Wash the affected area with clean water.</li>
                                    <li>Avoid applying chemicals or unknown substances.</li>
                                    <li>Observe for swelling, pain, or discoloration.</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Card 4: Frog / Toxin Contact */}
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => toggleSituation('frog')}>
                            Frog / Toxin Contact
                            <span className={`material-symbols-outlined fa-expand-icon ${openSituation === 'frog' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {openSituation === 'frog' && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li>Wash skin or hands immediately with soap and water.</li>
                                    <li>Avoid touching eyes, mouth, or open wounds.</li>
                                    <li>Seek help if irritation or allergic reaction occurs.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 3: What NOT to Do */}
                <section className="fa-section">
                    <h3 className="fa-section-title" style={{ color: '#92400e' }}>
                        <span className="material-symbols-outlined">warning</span>
                        Unsafe First Aid Practices
                    </h3>
                    <div className="fa-warning-card">
                        <ul className="fa-warning-list">
                            <li><span className="material-symbols-outlined">block</span> Cutting or sucking wounds</li>
                            <li><span className="material-symbols-outlined">block</span> Applying herbs, oils, or chemicals</li>
                            <li><span className="material-symbols-outlined">block</span> Using tight tourniquets</li>
                            <li><span className="material-symbols-outlined">block</span> Ignoring symptoms or delaying medical help</li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 4: When to Seek Medical Help */}
                <section className="fa-section">
                    <h3 className="fa-section-title">
                        <span className="material-symbols-outlined">ambulance</span>
                        When to Seek Medical Help Immediately
                    </h3>
                    <div className="fa-help-list">
                        <div className="fa-help-item"><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>pain_filled</span> Severe pain or swelling</div>
                        <div className="fa-help-item"><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>lungs</span> Difficulty breathing</div>
                        <div className="fa-help-item"><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>sick</span> Fever, vomiting, or dizziness</div>
                        <div className="fa-help-item"><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>visibility_off</span> Loss of consciousness</div>
                        <div className="fa-help-item"><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>trending_down</span> Rapid worsening of symptoms</div>
                    </div>
                </section>

                {/* SECTION 5: Emergency Contact */}
                <section className="fa-section">
                    <div className="fa-emergency-box">
                        <span className="fa-emergency-title">Emergency Contact Numbers (India)</span>
                        <div className="fa-emergency-numbers">
                            <div className="fa-number-item">
                                <span className="fa-number-label">Ambulance</span>
                                <span className="fa-number-value">108</span>
                            </div>
                            <div className="fa-number-item">
                                <span className="fa-number-label">General Emergency</span>
                                <span className="fa-number-value">112</span>
                            </div>
                            <div className="fa-number-item">
                                <span className="fa-number-label">Health Helpline</span>
                                <span className="fa-number-value">104</span>
                            </div>
                        </div>
                        <p className="fa-card-footer-note" style={{ background: 'none', marginBottom: 0 }}>
                            “Keep these numbers saved on your phone and shared with family members.”
                        </p>
                    </div>
                </section>

                {/* SECTION 6: Preparedness */}
                <section className="fa-section">
                    <h3 className="fa-section-title">
                        <span className="material-symbols-outlined">backpack</span>
                        Be Prepared
                    </h3>
                    <div className="fa-card">
                        <div className="fa-expand-header" onClick={() => setPreparednessExpanded(!preparednessExpanded)}>
                            Preparedness Steps
                            <span className={`material-symbols-outlined fa-expand-icon ${preparednessExpanded ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {preparednessExpanded && (
                            <div className="fa-expand-content">
                                <ul>
                                    <li>Save emergency numbers on your phone.</li>
                                    <li>Know the location of the nearest hospital or health center.</li>
                                    <li>Keep a basic first-aid kit at home (bandages, antiseptic, etc.).</li>
                                    <li>Educate family members about emergency response.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 7: Disclaimer */}
                <section className="fa-section" style={{ textAlign: 'center', margin: '40px 0' }}>
                    <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '16px', fontSize: '14px', color: '#64748b' }}>
                        <p style={{ margin: '0 0 8px 0' }}>“This section provides general first-aid awareness only.”</p>
                        <p style={{ margin: '0 0 8px 0' }}>It does not replace professional medical advice or treatment.</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>Always consult trained healthcare professionals during emergencies.</p>
                    </div>
                </section>

                {/* Footer Navigation */}
                <div className="fa-footer-nav">
                    <Link to="/learn/safety-tips" className="fa-nav-pill">Safety Tips</Link>
                    <Link to="/learn/prevention" className="fa-nav-pill">Prevention</Link>
                    <Link to="/learn/seasonal-alerts" className="fa-nav-pill">Seasonal Alerts</Link>
                    <Link to="/learn/community" className="fa-nav-pill">Community Awareness</Link>
                </div>

            </div>
        </div>
    );
};

export default FirstAidBasics;
