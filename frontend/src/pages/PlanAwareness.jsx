import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import snakeFacts from '../data/snakeFacts';
import './PlanAwareness.css';

// Local assets

import speciesImg from '../assets/plan-awareness/species-library.jpg';
import safetyPreventionImg from '../assets/plan-awareness/prevention.jpg';
import firstAidImg from '../assets/plan-awareness/first-aid.jpg';
import seasonalImg from '../assets/plan-awareness/seasonal-alerts.jpg';

export default function PlanAwareness() {
    const navigate = useNavigate();
    const [currentFact, setCurrentFact] = useState(null);

    useEffect(() => {
        // Pick a random fact on mount
        const randomIndex = Math.floor(Math.random() * snakeFacts.length);
        setCurrentFact(snakeFacts[randomIndex]);
    }, []);

    const showAnotherFact = () => {
        let newFact;
        do {
            const randomIndex = Math.floor(Math.random() * snakeFacts.length);
            newFact = snakeFacts[randomIndex];
        } while (currentFact && newFact.id === currentFact.id && snakeFacts.length > 1);
        setCurrentFact(newFact);
    };

    return (
        <div className="pa-container">
            {/* Header */}

            <header className="pa-header">
                <div className="pa-content">
                    <div className="pa-header-top">
                        <button className="eco-back-btn" onClick={() => navigate(-1)}>
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="pa-title">Learn & Awareness</h1>
                    </div>
                </div>
            </header>

            <div className="pa-content">

                {/* Hero Card */}
                <div className="pa-fact-card">
                    <div className="pa-fact-content">
                        <div className="pa-fact-badge">
                            <span className="material-symbols-outlined pa-icon-green">lightbulb</span>
                            <span>Fact of the Day</span>
                        </div>
                        <p className="pa-fact-headline">
                            {currentFact ? currentFact.fact : 'Loading fact...'}
                        </p>
                        {currentFact && (
                            <p className="pa-fact-explanation">{currentFact.explanation}</p>
                        )}
                        <button className="pa-next-fact-btn" onClick={showAnotherFact}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                            Show Another Fact
                        </button>
                    </div>
                </div>

                {/* Categories Grid */}
                <h3 className="pa-section-title">Browse Categories</h3>
                <div className="pa-grid">

                    {/* Card 1 */}
                    <Link to="/learn/species-library" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${speciesImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">pets</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Species Library</h3>
                            <p>Identify local wildlife</p>
                        </div>
                    </Link>

                    {/* Card 2 & 3 Merged */}
                    <Link to="/learn/prevention-safety" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${safetyPreventionImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Prevention & Safety</h3>
                            <p>Guides & quick tips</p>
                        </div>
                    </Link>

                    {/* Card 4 */}
                    <Link to="/learn/first-aid-basics" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${firstAidImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>First Aid Basics</h3>
                            <p>Treating bites</p>
                        </div>
                    </Link>

                    {/* Card 5 */}
                    <Link to="/learn/seasonal-alerts" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${seasonalImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Seasonal Alerts</h3>
                            <p>Monthly watch</p>
                        </div>
                    </Link>

                </div>
            </div>

            {/* Bottom Nav provided by layout probably, but I will replicate the structure if needed. 
            The user didn't mention modifying the App Layout, but the original HTML had it. 
            I'll leave it out of this component if it's rendered globally, 
             OR include it if this is a standalone page. 
             Looking at the user's HTML, it was included. 
             Looking at App.jsx, there's no layout wrapper. 
             So I should probably include the bottom nav or assume it's elsewhere.
             The user's original HTML had a bottom nav. I will add it back to be safe,
             styled with the new CSS.
        */}
        </div>
    );
}
