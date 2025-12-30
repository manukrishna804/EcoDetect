import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SeasonalAlerts.css';

export default function SeasonalAlerts() {
    const [isWhyMattersExpanded, setIsWhyMattersExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('monsoon');

    const toggleWhyMatters = () => {
        setIsWhyMattersExpanded(!isWhyMattersExpanded);
    };

    const seasons = {
        monsoon: {
            title: 'Rainy / Monsoon',
            risks: [
                'Increase in mosquitoes due to stagnant water',
                'Higher chance of snakes near homes'
            ],
            tips: [
                'Remove stagnant water regularly',
                'Keep surroundings clean and dry',
                'Use protective measures like nets where needed'
            ]
        },
        summer: {
            title: 'Summer',
            risks: [
                'Snakes and animals seek cool, shaded areas',
                'Increased encounters near water sources'
            ],
            tips: [
                'Be cautious near shaded and cool places',
                'Avoid walking barefoot',
                'Stay alert during early morning and evening'
            ]
        },
        winter: {
            title: 'Winter',
            risks: [
                'Insects hiding indoors',
                'Reduced visibility in foggy conditions'
            ],
            tips: [
                'Check stored clothes and bedding',
                'Keep homes clean and ventilated',
                'Maintain proper lighting'
            ]
        },
        flood: {
            title: 'Flood / Post-Flood',
            risks: [
                'Animals displaced from natural habitats',
                'Increased mixed-species encounters',
                'Unsanitary surroundings'
            ],
            tips: [
                'Avoid walking through floodwater',
                'Maintain hygiene and cleanliness',
                'Stay alert around homes and shelters'
            ]
        }
    };

    return (
        <div className="sa-container">
            <div className="sa-content-wrapper">

                {/* Header */}
                <header className="sa-header">
                    <h1 className="sa-title">Seasonal Alerts</h1>
                    <h2 className="sa-subtitle">Understand how seasons affect insect and animal risks</h2>
                    <div className="sa-info-text">
                        “Nature changes with seasons — awareness helps you adapt safely.”
                    </div>
                </header>

                {/* SECTION 1: Why Seasonal Awareness Matters */}
                <section className="sa-section">
                    <div className="sa-card">
                        <div className="sa-expand-header" onClick={toggleWhyMatters}>
                            <span>Why Seasonal Awareness Matters</span>
                            <span className={`material-symbols-outlined sa-expand-icon ${isWhyMattersExpanded ? 'open' : ''}`}>
                                expand_more
                            </span>
                        </div>
                        {isWhyMattersExpanded && (
                            <div className="sa-expand-content">
                                <ul className="sa-list-basic" style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                    <li>Weather conditions affect insect and animal behavior</li>
                                    <li>Many species are active only during specific seasons</li>
                                    <li>Human movement and routines also change with seasons</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 2: Season-Wise Awareness */}
                <section className="sa-section">
                    <h3 className="sa-section-title">Season-Wise Awareness</h3>
                    <div className="sa-tabs-container">
                        <div className="sa-tabs-header">
                            {Object.keys(seasons).map((key) => (
                                <button
                                    key={key}
                                    className={`sa-tab-btn ${activeTab === key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {seasons[key].title}
                                </button>
                            ))}
                        </div>
                        <div className="sa-tab-content">
                            <div className="sa-risk-group">
                                <div className="sa-risk-title">
                                    <span className="material-symbols-outlined" style={{ color: '#eab308' }}>warning</span>
                                    Common Risks
                                </div>
                                <ul className="sa-list-basic">
                                    {seasons[activeTab].risks.map((risk, index) => (
                                        <li key={index}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                            <br />
                            <div className="sa-risk-group">
                                <div className="sa-risk-title">
                                    <span className="material-symbols-outlined" style={{ color: 'var(--sa-primary-green)' }}>check_circle</span>
                                    Awareness Tips
                                </div>
                                <ul className="sa-list-basic">
                                    {seasons[activeTab].tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: Seasonal Risk Pattern Summary */}
                <section className="sa-section">
                    <h3 className="sa-section-title">Seasonal Risk Patterns</h3>
                    <div className="sa-card">
                        <div className="sa-summary-list">
                            <div className="sa-summary-item">
                                <span>Rainy season</span>
                                <strong>Highest mosquito activity</strong>
                            </div>
                            <div className="sa-summary-item">
                                <span>Summer</span>
                                <strong>Higher snake encounters</strong>
                            </div>
                            <div className="sa-summary-item">
                                <span>Floods</span>
                                <strong>Sudden animal displacement</strong>
                            </div>
                            <div className="sa-summary-item">
                                <span>Winter</span>
                                <strong>Indoor hiding behavior of insects</strong>
                            </div>
                        </div>
                        <div className="sa-footer-hint">
                            “Seasonal patterns help predict risk before it occurs.”
                        </div>
                    </div>
                </section>

                {/* SECTION 4: Preparedness Checklist */}
                <section className="sa-section">
                    <h3 className="sa-section-title">Be Prepared in Any Season</h3>
                    <div className="sa-card">
                        {[
                            'Keep surroundings clean',
                            'Save emergency contact numbers',
                            'Know the nearest medical facility',
                            'Stay informed about local conditions'
                        ].map((item, index) => (
                            <div key={index} className="sa-checklist-item">
                                <span className="sa-check-circle">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                                </span>
                                <span style={{ color: '#4b5563', fontWeight: 500 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 5: Important Clarification */}
                <section className="sa-section">
                    <div className="sa-clarification-box">
                        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>info</span>
                        <strong>Note:</strong> This page provides seasonal awareness only. It does not provide real-time alerts or warnings.
                    </div>
                </section>

                {/* Footer Navigation */}
                <footer className="sa-footer-nav">
                    <Link to="/learn/safety-tips" className="sa-nav-btn">Safety Tips</Link>
                    <Link to="/learn/prevention" className="sa-nav-btn">Prevention</Link>
                    <Link to="/learn/first-aid-basics" className="sa-nav-btn">First Aid Basics</Link>
                    <Link to="/learn/community" className="sa-nav-btn">Community Awareness</Link>
                </footer>
            </div>
        </div>
    );
}
