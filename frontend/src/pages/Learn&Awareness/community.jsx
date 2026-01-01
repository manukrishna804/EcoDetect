import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Community.css';

export default function Community() {
    const [showModal, setShowModal] = useState(false);

    const handleJoinClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="co-container">
            <div className="co-content-wrapper">

                {/* Header */}
                <header className="co-header">
                    <h1 className="co-title">Community Awareness</h1>
                    <h2 className="co-subtitle">Safety improves when communities learn and act together</h2>
                    <div className="co-info-text">
                        “Awareness shared is safety multiplied.”
                    </div>
                </header>

                {/* SECTION 1: Why Community Awareness Matters */}
                <section className="co-section">
                    <div className="co-card">
                        <h3 className="co-section-title">Why Community Awareness Matters</h3>
                        <ul className="co-list">
                            <li>Risks from insects and venomous animals affect neighborhoods, not just individuals</li>
                            <li>Shared knowledge helps prevent panic and accidents</li>
                            <li>Community awareness improves safety for everyone</li>
                            <li>Collective action is more effective than individual effort</li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 2: Community Safety & Awareness Practices */}
                <section className="co-section">
                    <div className="co-card">
                        <h3 className="co-section-title">Community-Level Safety Practices</h3>
                        <ul className="co-list">
                            <li>Keep shared spaces clean and well maintained</li>
                            <li>Avoid dumping waste in open areas</li>
                            <li>Maintain proper drainage in common spaces</li>
                            <li>Ensure lighting in streets and pathways</li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 3: Community Groups */}
                <section className="co-section">
                    <h3 className="co-section-title">Community Groups</h3>
                    <div className="co-grid">

                        {/* Card 1 */}
                        <div className="co-group-card">
                            <div>
                                <div className="co-group-title">Local Awareness Community</div>
                                <div className="co-group-desc">
                                    A community focused on learning about common insects and venomous animals, understanding risks, and sharing safety knowledge.
                                </div>
                                <ul className="co-focus-list">
                                    <li>• Awareness about local species</li>
                                    <li>• Safe behavior habits</li>
                                    <li>• Seasonal risk understanding</li>
                                </ul>
                            </div>
                            <button className="co-join-btn" onClick={handleJoinClick}>
                                Join Awareness Community
                            </button>
                        </div>

                        {/* Card 2 */}
                        <div className="co-group-card">
                            <div>
                                <div className="co-group-title">Prevention & Cleanliness Community</div>
                                <div className="co-group-desc">
                                    A community that promotes prevention practices and environmental cleanliness to reduce insect and animal-related risks.
                                </div>
                                <ul className="co-focus-list">
                                    <li>• Waste and water management awareness</li>
                                    <li>• Clean surroundings</li>
                                    <li>• Shared prevention responsibility</li>
                                </ul>
                            </div>
                            <button className="co-join-btn" onClick={handleJoinClick}>
                                Join Prevention Community
                            </button>
                        </div>

                        {/* Card 3 */}
                        <div className="co-group-card">
                            <div>
                                <div className="co-group-title">Safety & Preparedness Community</div>
                                <div className="co-group-desc">
                                    A learning-focused community that helps members understand first aid basics, emergency readiness, and calm response.
                                </div>
                                <ul className="co-focus-list">
                                    <li>• First aid awareness</li>
                                    <li>• Emergency contact preparedness</li>
                                    <li>• Responsible response education</li>
                                </ul>
                            </div>
                            <button className="co-join-btn" onClick={handleJoinClick}>
                                Join Safety Community
                            </button>
                        </div>

                    </div>
                </section>

                {/* SECTION 4: Information Sharing Responsibility */}
                <section className="co-section">
                    <div className="co-info-box">
                        <h3 className="co-section-title">Information Sharing Responsibility</h3>
                        <ul className="co-list">
                            <li>Share only verified and accurate safety information</li>
                            <li>Avoid spreading rumors or fear</li>
                            <li>Encourage calm and informed discussions</li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 5: Ethical & Environmental Responsibility */}
                <section className="co-section">
                    <h3 className="co-section-title">Coexistence with Nature</h3>
                    <div className="co-card">
                        <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                            Our safety extends to how we treat the environment. Avoid harming animals unnecessarily, respect natural habitats, and focus on prevention rather than destruction.
                        </p>
                    </div>
                </section>

                {/* SECTION 6: What This Page Is NOT */}
                <section className="co-section">
                    <div className="co-disclaimer-box">
                        <span className="co-disclaimer-title">What This Page Is NOT</span>
                        <ul className="co-check-list">
                            <li><span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: '18px' }}>cancel</span> This page is not for reporting incidents</li>
                            <li><span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: '18px' }}>cancel</span> This page does not provide real-time alerts</li>
                            <li><span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: '18px' }}>cancel</span> This page does not replace local authorities</li>
                            <li><span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '18px' }}>check_circle</span> It focuses on awareness, cooperation, and learning</li>
                        </ul>
                    </div>
                </section>

                {/* Footer Navigation */}
                <footer className="co-footer-nav">
                    <Link to="/learn/safety-tips" className="co-nav-btn">Safety Tips</Link>
                    <Link to="/learn/prevention" className="co-nav-btn">Prevention</Link>
                    <Link to="/learn/first-aid-basics" className="co-nav-btn">First Aid Basics</Link>
                    <Link to="/learn/seasonal-alerts" className="co-nav-btn">Seasonal Alerts</Link>
                </footer>

                {/* Modal */}
                {showModal && (
                    <div className="co-modal-overlay" onClick={closeModal}>
                        <div className="co-modal" onClick={e => e.stopPropagation()}>
                            <div className="co-modal-title">Community Feature</div>
                            <p className="co-modal-text">
                                Community features focus on shared learning and awareness.<br />
                                This is not an emergency reporting or alert system.
                            </p>
                            <button className="co-modal-close-btn" onClick={closeModal}>Got it</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
