import React from 'react';
import { Link } from 'react-router-dom';
import './PlanAwareness.css'; // Import the new CSS

// Local assets
import snakeImg from '../assets/plan-awareness/snake.jpg';
import speciesImg from '../assets/plan-awareness/species-library.jpg';
import safetyImg from '../assets/plan-awareness/safety-tips.jpg';
import preventionImg from '../assets/plan-awareness/prevention.jpg';
import firstAidImg from '../assets/plan-awareness/first-aid.jpg';
import seasonalImg from '../assets/plan-awareness/seasonal-alerts.jpg';
import communityImg from '../assets/plan-awareness/community.jpg';

export default function PlanAwareness() {
    return (
        <div className="pa-container">
            {/* Header */}

            <header className="pa-header">
                <div className="pa-content">
                    <div className="pa-header-top">
                        <button className="pa-search-btn">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>
                    <h1 className="pa-title">Learn & Awareness</h1>
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
                        <p className="pa-fact-text">
                            Most snake bites occur when people try to capture or kill the snake. Leave them alone!
                        </p>
                        <button className="pa-read-more-btn">
                            Read More
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                        </button>
                    </div>
                    <div className="pa-fact-image" style={{ backgroundImage: `url(${snakeImg})` }}></div>
                </div>

                {/* Categories Grid */}
                <h3 className="pa-section-title">Browse Categories</h3>
                <div className="pa-grid">

                    {/* Card 1 */}
                    <div className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${speciesImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">pets</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Species Library</h3>
                            <p>Identify local wildlife</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <Link to="/learn/safety-tips" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${safetyImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Safety Tips</h3>
                            <p>Immediate actions</p>
                        </div>
                    </Link>

                    {/* Card 3 */}
                    <Link to="/learn/prevention" className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${preventionImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">home_health</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Prevention</h3>
                            <p>Home safety guides</p>
                        </div>
                    </Link>

                    {/* Card 4 */}
                    <div className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${firstAidImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>First Aid Basics</h3>
                            <p>Treating bites</p>
                        </div>
                    </div>

                    {/* Card 5 */}
                    <div className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${seasonalImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Seasonal Alerts</h3>
                            <p>Monthly watch</p>
                        </div>
                    </div>

                    {/* Card 6 */}
                    <div className="pa-card">
                        <div className="pa-card-img-container" style={{ backgroundImage: `url(${communityImg})` }}>
                            <div className="pa-card-icon-badge">
                                <span className="material-symbols-outlined">forum</span>
                            </div>
                        </div>
                        <div className="pa-card-info">
                            <h3>Community</h3>
                            <p>Local stories</p>
                        </div>
                    </div>

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
