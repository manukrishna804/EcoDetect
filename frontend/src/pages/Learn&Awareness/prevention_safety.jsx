import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PreventionSafety.css';

export default function PreventionSafety() {
    const navigate = useNavigate();

    const safetyCards = [
        {
            icon: "🌙",
            title: "Night Safety",
            bullets: [
                "Use a torch outdoors",
                "Avoid tall grass paths",
                "Keep porch lights on"
            ]
        },
        {
            icon: "🏠",
            title: "Home Safety",
            bullets: [
                "Keep doors/windows sealed",
                "Check corners regularly",
                "Shake shoes/bedding"
            ]
        },
        {
            icon: "🌧️",
            title: "Rainy Season",
            bullets: [
                "Avoid stagnant water",
                "Watch for displacements",
                "Check wet footwear"
            ]
        },
        {
            icon: "🚜",
            title: "Outdoor/Farm",
            bullets: [
                "Wear rubber boots",
                "Don't reach into holes",
                "Stick to visible trails"
            ]
        }
    ];

    const preventionItems = [
        "Seal wall cracks & door gaps",
        "Clear debris & yard clutter",
        "Tighten waste & water lids"
    ];

    return (
        <div className="ps-container">
            <div className="ps-content">

                {/* Header Section */}
                <header className="ps-header-card">
                    <button className="eco-back-btn" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="ps-title">Prevention & Safety</h1>
                    <p className="ps-subtitle">Simple actions to reduce wildlife risk.</p>
                    <div className="ps-context-badge">General</div>
                </header>

                {/* Section 1: Quick Safety Contexts */}
                <h3 className="ps-section-title">Safety Contexts</h3>
                <div className="ps-cards-grid">
                    {safetyCards.map((card, i) => (
                        <div key={i} className="ps-action-card">
                            <span className="ps-card-icon">{card.icon}</span>
                            <strong className="ps-card-title">{card.title}</strong>
                            <ul className="ps-card-bullets">
                                {card.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Section 2: Home & Environment Prevention */}
                <h3 className="ps-section-title">Home Maintenance</h3>
                <div className="ps-info-list">
                    {preventionItems.map((item, i) => (
                        <div key={i} className="ps-info-item">
                            <span className="material-symbols-outlined ps-info-icon">check_circle</span>
                            <span className="ps-info-text">{item}</span>
                        </div>
                    ))}
                </div>

                {/* Section 3: Do's & Don'ts */}
                <div className="ps-dodont-container">
                    <div className="ps-dodont-col">
                        <h4 className="ps-dodont-title ps-do-title">
                            <span className="material-symbols-outlined">done</span> DO
                        </h4>
                        <ul className="ps-dodont-list">
                            <li className="ps-dodont-item">Stay observant</li>
                            <li className="ps-dodont-item">Use protection</li>
                            <li className="ps-dodont-item">Stay informed</li>
                        </ul>
                    </div>
                    <div className="ps-dodont-col">
                        <h4 className="ps-dodont-title ps-dont-title">
                            <span className="material-symbols-outlined">close</span> DON'T
                        </h4>
                        <ul className="ps-dodont-list">
                            <li className="ps-dodont-item">Touch unknown</li>
                            <li className="ps-dodont-item">Ignore signs</li>
                            <li className="ps-dodont-item">Trust myths</li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer */}
                <footer className="ps-disclaimer">
                    This is a seasonal awareness guide. Always exercise caution regardless of risk level.
                </footer>

            </div>
        </div>
    );
}
