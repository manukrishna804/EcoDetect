import React, { useState } from 'react';
import './SafetyTips.css';
import { Link } from 'react-router-dom';

export default function SafetyTips() {
    // State for tabs
    const [activeTab, setActiveTab] = useState('Outdoors');

    // State for collapsible sections
    const [isPreparedExpanded, setIsPreparedExpanded] = useState(true);
    const [isRiskExpanded, setIsRiskExpanded] = useState(false);

    // Tab Content Data
    const tabContent = {
        Outdoors: [
            "Walk on clear and visible paths",
            "Avoid tall grass, bushes, and dense vegetation",
            "Wear closed footwear when outdoors"
        ],
        Home: [
            "Keep storage areas and corners clean",
            "Seal cracks and gaps in walls and floors",
            "Shake clothes, shoes, and bedding before use"
        ],
        Night: [
            "Use proper lighting around homes and pathways",
            "Avoid walking barefoot at night",
            "Keep doors and windows closed when possible"
        ],
        "Farm / Forest": [
            "Wear gloves and protective boots",
            "Avoid touching holes, logs, or rock piles",
            "Stay alert near water bodies and wet areas"
        ]
    };

    return (
        <div className="st-container">
            <div className="st-content">

                {/* Header */}
                <header className="st-header">
                    <h1 className="st-title">Safety Tips</h1>
                    <h2 className="st-subtitle">Learn safe practices to avoid harmful insects and animals</h2>
                    <div className="st-info-badge">
                        “Awareness is the first step to safety.”
                    </div>
                </header>

                {/* SECTION 1: Preparedness Tips */}
                <div className="st-card">
                    <div
                        className="st-expand-header"
                        onClick={() => setIsPreparedExpanded(!isPreparedExpanded)}
                    >
                        <h3 className="st-expand-title">Be Prepared – Basic Safety Awareness</h3>
                        <span className={`material-symbols-outlined st-expand-icon ${isPreparedExpanded ? 'open' : ''}`}>
                            expand_more
                        </span>
                    </div>
                    {isPreparedExpanded && (
                        <div className="st-expand-content">
                            <ul className="st-list">
                                <li>Stay observant in outdoor and unfamiliar areas</li>
                                <li>Be cautious during night time and rainy seasons</li>
                                <li>Maintain a safe distance from unknown insects and animals</li>
                                <li>Be aware of whom to contact in case of emergencies</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* SECTION 2: Daily-Life Safety Practices */}
                <div className="st-card">
                    <h3 className="st-expand-title" style={{ marginBottom: '16px' }}>Daily-Life Safety Practices</h3>

                    {/* Tabs */}
                    <div className="st-tabs">
                        {Object.keys(tabContent).map((tab) => (
                            <button
                                key={tab}
                                className={`st-tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="st-tab-content">
                        <ul className="st-list">
                            {tabContent[activeTab].map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* SECTION 3: Risk Awareness */}
                <div className="st-card">
                    <div
                        className="st-expand-header"
                        onClick={() => setIsRiskExpanded(!isRiskExpanded)}
                    >
                        <h3 className="st-expand-title">Risk Awareness</h3>
                        <span className={`material-symbols-outlined st-expand-icon ${isRiskExpanded ? 'open' : ''}`}>
                            expand_more
                        </span>
                    </div>
                    {isRiskExpanded && (
                        <div className="st-expand-content">
                            <ul className="st-list">
                                <li>Stagnant water increases mosquito breeding</li>
                                <li>Garbage piles attract insects and snakes</li>
                                <li>Dark, unused spaces attract spiders</li>
                                <li>Wet environments may contain toxic frogs</li>
                            </ul>
                            <p style={{ marginTop: '16px', fontStyle: 'italic', color: 'var(--st-text-light)', fontSize: '0.9rem' }}>
                                “Understanding risk zones helps prevent encounters.”
                            </p>
                        </div>
                    )}
                </div>

                {/* SECTION 4: Do’s & Don’ts */}
                <div className="st-card">
                    <div className="st-dodont-grid">
                        <div className="st-col dos">
                            <h4>Do's</h4>
                            <ul className="st-list">
                                <li>Keep surroundings clean</li>
                                <li>Use protective clothing</li>
                                <li>Stay informed and alert</li>
                            </ul>
                        </div>
                        <div className="st-col donts">
                            <h4>Don'ts</h4>
                            <ul className="st-list">
                                <li>Touching unknown species</li>
                                <li>Believing myths and unsafe remedies</li>
                                <li>Ignoring warning signs in the environment</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SECTION FOOTER NOTE */}
                <footer className="st-footer">
                    <p>This section focuses on prevention and awareness.</p>
                    <p>For medical response or treatment guidance, refer to the First Aid Basics section.</p>

                   <div className="prev-footer-nav">
                                       <Link to="/learn/prevention" className="prev-nav-pill">Prevention</Link>
                                       <Link to="/learn/first-aid-basics" className="prev-nav-pill">First Aid Basics</Link>
                                       <Link to="/learn/seasonal-alerts" className="prev-nav-pill">Seasonal Alerts</Link>
                                       <Link to="/learn/community" className="prev-nav-pill">Community Awareness</Link>
                                   </div>
                </footer>

            </div>
        </div>
    );
}
