import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Prevention.css';

const Prevention = () => {
    // State for Section 1: Environmental Prevention (Independent Collapsible Cards)
    const [environmentalState, setEnvironmentalState] = useState({
        water: false,
        drainage: false,
        garbage: false,
        debris: false
    });

    const toggleEnvironmental = (key) => {
        setEnvironmentalState(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // State for Section 2: Home & Building Prevention (Accordion - Only one open at a time)
    const [homeOpenKey, setHomeOpenKey] = useState(null);

    const toggleHome = (key) => {
        setHomeOpenKey(prev => (prev === key ? null : key));
    };

    // State for Section 4: Seasonal Prevention (Tabs)
    const [activeTab, setActiveTab] = useState('rainy');

    // State for Section 5: Community Prevention (Checklist)
    const [checklist, setChecklist] = useState({
        neighbors: false,
        cleaning: false,
        report: false,
        programs: false
    });

    const toggleChecklist = (key) => {
        setChecklist(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="prevention-container">
            <div className="prev-content-wrapper">

                {/* Header */}
                <header className="prev-header">
                    <h1 className="prev-title">Prevention</h1>
                    <h2 className="prev-subtitle">Reduce risk by improving your environment and daily practices</h2>
                    <div className="prev-info-text">
                        “Prevention is safer, easier, and better than cure.”
                    </div>
                </header>

                {/* SECTION 1: Environmental Prevention */}
                <section className="prev-section">
                    <h3 className="prev-section-title">
                        <span className="material-symbols-outlined">nature_people</span>
                        Environmental Prevention
                    </h3>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleEnvironmental('water')}>
                            Remove stagnant water
                            <span className={`material-symbols-outlined prev-expand-icon ${environmentalState.water ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {environmentalState.water && (
                            <div className="prev-expand-content">
                                Eliminate standing water sources around your home and fields to prevent mosquito breeding.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleEnvironmental('drainage')}>
                            Ensure proper drainage
                            <span className={`material-symbols-outlined prev-expand-icon ${environmentalState.drainage ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {environmentalState.drainage && (
                            <div className="prev-expand-content">
                                Keep gutters and drains clean to avoid water logging which attracts pests.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleEnvironmental('garbage')}>
                            Dispose garbage regularly
                            <span className={`material-symbols-outlined prev-expand-icon ${environmentalState.garbage ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {environmentalState.garbage && (
                            <div className="prev-expand-content">
                                Use covered bins and dispose of waste frequently to discourage scavenging animals.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleEnvironmental('debris')}>
                            Avoid debris accumulation
                            <span className={`material-symbols-outlined prev-expand-icon ${environmentalState.debris ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {environmentalState.debris && (
                            <div className="prev-expand-content">
                                Clear piles of wood, leaves, or construction materials where snakes might hide.
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 2: Home & Building Prevention */}
                <section className="prev-section">
                    <h3 className="prev-section-title">
                        <span className="material-symbols-outlined">home</span>
                        Home & Building Prevention
                    </h3>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleHome('cracks')}>
                            Seal cracks and holes
                            <span className={`material-symbols-outlined prev-expand-icon ${homeOpenKey === 'cracks' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {homeOpenKey === 'cracks' && (
                            <div className="prev-expand-content">
                                Inspect walls and foundations. Seal any gaps to prevent insects and snakes from entering.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleHome('screens')}>
                            Use window screens
                            <span className={`material-symbols-outlined prev-expand-icon ${homeOpenKey === 'screens' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {homeOpenKey === 'screens' && (
                            <div className="prev-expand-content">
                                Install nets on windows and vents to keep mosquitoes and other pests out while allowing ventilation.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleHome('storage')}>
                            Keep storage areas dry
                            <span className={`material-symbols-outlined prev-expand-icon ${homeOpenKey === 'storage' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {homeOpenKey === 'storage' && (
                            <div className="prev-expand-content">
                                Organize storage rooms and keep them dry. Clutter creates hiding spots.
                            </div>
                        )}
                    </div>

                    <div className="prev-card">
                        <div className="prev-expand-header" onClick={() => toggleHome('unused')}>
                            Manage unused items
                            <span className={`material-symbols-outlined prev-expand-icon ${homeOpenKey === 'unused' ? 'open' : ''}`}>expand_more</span>
                        </div>
                        {homeOpenKey === 'unused' && (
                            <div className="prev-expand-content">
                                Discard or store unused items properly. Do not leave them lying around for long periods.
                            </div>
                        )}
                    </div>
                </section>


                {/* SECTION 3: Water & Waste Management */}
                <section className="prev-section">
                    <div className="prev-highlight-section">
                        <h3 className="prev-section-title" style={{ marginTop: 0 }}>
                            <span className="material-symbols-outlined">water_drop</span>
                            Water & Waste Management
                        </h3>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#374151' }}>
                            <li>Cover all water storage containers tightly.</li>
                            <li>Clean water tanks periodically to prevent algae and larvae.</li>
                            <li>Do not allow water to collect in empty pots, tires, or coconut shells.</li>
                            <li>Manage animal waste properly to maintain hygiene.</li>
                        </ul>
                        <span className="prev-highlight-footer">
                            “Most insect risks start with poor water and waste management.”
                        </span>
                    </div>
                </section>

                {/* SECTION 4: Seasonal Prevention Awareness */}
                <section className="prev-section">
                    <h3 className="prev-section-title">
                        <span className="material-symbols-outlined">calendar_month</span>
                        Seasonal Awareness
                    </h3>
                    <div className="prev-tabs-container">
                        <div className="prev-tabs-header">
                            <button
                                className={`prev-tab ${activeTab === 'rainy' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rainy')}
                            >
                                Rainy Season
                            </button>
                            <button
                                className={`prev-tab ${activeTab === 'summer' ? 'active' : ''}`}
                                onClick={() => setActiveTab('summer')}
                            >
                                Summer
                            </button>
                            <button
                                className={`prev-tab ${activeTab === 'flood' ? 'active' : ''}`}
                                onClick={() => setActiveTab('flood')}
                            >
                                Flood / Monsoon
                            </button>
                        </div>

                        <div className="prev-tab-content">
                            {activeTab === 'rainy' && (
                                <div>
                                    <p><strong>High Risk:</strong> Mosquito breeding & Snake movement.</p>
                                    <ul>
                                        <li>Clear drainage regularly to prevent blocking.</li>
                                        <li>Remove stagnant water immediately after rains.</li>
                                        <li>Watch your step in tall grass.</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'summer' && (
                                <div>
                                    <p><strong>High Risk:</strong> Snakes seeking cool spots.</p>
                                    <ul>
                                        <li>Be cautious near shaded areas and cool resting spots.</li>
                                        <li>Check shoes and dark corners before use.</li>
                                        <li>Keep water sources clean for birds, but safe from breeding.</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'flood' && (
                                <div>
                                    <p><strong>High Risk:</strong> Displacement of wildlife.</p>
                                    <ul>
                                        <li>Animals may move closer to homes for dry ground.</li>
                                        <li>Stay alert and maintain cleanliness indoors.</li>
                                        <li>Seal entry points effectively.</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION 5: Community Prevention */}
                <section className="prev-section">
                    <h3 className="prev-section-title">
                        <span className="material-symbols-outlined">groups</span>
                        Community Prevention
                    </h3>
                    <div className="prev-card" style={{ padding: 0 }}>
                        <div
                            className={`prev-checklist-item ${checklist.neighbors ? 'checked' : ''}`}
                            onClick={() => toggleChecklist('neighbors')}
                        >
                            <div className="prev-checkbox">
                                {checklist.neighbors && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
                            </div>
                            <span className="prev-checklist-text">Inform neighbors about identified risk areas</span>
                        </div>

                        <div
                            className={`prev-checklist-item ${checklist.cleaning ? 'checked' : ''}`}
                            onClick={() => toggleChecklist('cleaning')}
                        >
                            <div className="prev-checkbox">
                                {checklist.cleaning && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
                            </div>
                            <span className="prev-checklist-text">Participate in local cleaning drives</span>
                        </div>

                        <div
                            className={`prev-checklist-item ${checklist.report ? 'checked' : ''}`}
                            onClick={() => toggleChecklist('report')}
                        >
                            <div className="prev-checkbox">
                                {checklist.report && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
                            </div>
                            <span className="prev-checklist-text">Report unhygienic conditions to authorities</span>
                        </div>

                        <div
                            className={`prev-checklist-item ${checklist.programs ? 'checked' : ''}`}
                            onClick={() => toggleChecklist('programs')}
                        >
                            <div className="prev-checkbox">
                                {checklist.programs && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
                            </div>
                            <span className="prev-checklist-text">Support and share awareness programs</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: Info Box */}
                <section className="prev-info-box">
                    <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#1e40af' }}>What Prevention Is NOT</h4>
                    <ul className="prev-info-list" style={{ color: '#1e3a8a' }}>
                        <li>
                            <span>❌</span> Prevention does not mean harming animals or insects.
                        </li>
                        <li>
                            <span>❌</span> Prevention does not encourage killing species indiscriminately.
                        </li>
                        <li>
                            <span>✔</span> <strong>Prevention focuses on safe coexistence and risk reduction.</strong>
                        </li>
                    </ul>
                </section>

                {/* Footer Navigation */}
                <div className="prev-footer-nav">
                    <Link to="/learn/safety-tips" className="prev-nav-pill">Safety Tips</Link>
                    <Link to="/learn/first-aid-basics" className="prev-nav-pill">First Aid Basics</Link>
                    <Link to="/learn/seasonal-alerts" className="prev-nav-pill">Seasonal Alerts</Link>
                    <Link to="/learn/community" className="prev-nav-pill">Community Awareness</Link>
                </div>

            </div>
        </div>
    );
};

export default Prevention;
