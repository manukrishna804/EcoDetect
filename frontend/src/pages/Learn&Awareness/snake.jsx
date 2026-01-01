import React, { useState } from 'react';
import './snake.css';
import biteImage from '../../assets/bite.png';

const SnakeEmergency = () => {
  const [activeTab, setActiveTab] = useState('firstaid');

  return (
    <div className="snake-emergency-container">
      {/* ===== STICKY HEADER ===== */}
      <header className="emergency-header">
        <div className="header-left">
          <button className="back-button" onClick={() => window.history.back()}>
            ←
          </button>
          <div className="header-title-wrapper">
            <h1 className="header-title">Snake Emergency</h1>
            <span className="warning-icon">⚠️</span>
          </div>
        </div>
        <button className="sound-icon">🔊</button>
      </header>

      {/* ===== TAB SWITCHER ===== */}
      <div className="tab-switcher">
        <button
          className={`tab-button ${activeTab === 'firstaid' ? 'active' : ''}`}
          onClick={() => setActiveTab('firstaid')}
        >
          First Aid
        </button>
        <button
          className={`tab-button ${activeTab === 'precautions' ? 'active' : ''}`}
          onClick={() => setActiveTab('precautions')}
        >
          Precautions
        </button>
      </div>

      {/* ===== CONTENT WRAPPER ===== */}
      <div className="content-wrapper">
        {activeTab === 'firstaid' && (
          <>
            {/* ===== IMMEDIATE ACTIONS SECTION ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🚨</span>
                Immediate Actions
              </h2>
              <div className="action-cards">
                <div className="action-card">
                  <h3 className="action-card-title">
                    <span className="action-card-icon">🧘</span>
                    Stay Calm & Immobilize
                  </h3>
                  <p className="action-card-text">
                    Keep the affected limb still and below heart level. Movement and panic can spread venom faster through the bloodstream.
                  </p>
                </div>
                <div className="action-card">
                  <h3 className="action-card-title">
                    <span className="action-card-icon">⌚</span>
                    Remove Constrictions
                  </h3>
                  <p className="action-card-text">
                    Immediately remove rings, watches, and tight clothing near the bite area. Swelling can cut off blood flow and cause serious complications.
                  </p>
                </div>
              </div>
            </section>

            {/* ===== DO NOT SECTION ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🛑</span>
                DO NOT Do These
              </h2>
              <div className="warning-cards">
                <div className="warning-card">
                  <h3 className="warning-card-title">
                    <span className="warning-icon-card">❌</span>
                    DO NOT Cut the Wound
                  </h3>
                  <p className="warning-card-text">
                    Cutting the bite area can cause severe bleeding, infection, and nerve damage. It does not remove venom and makes treatment harder.
                  </p>
                </div>
                <div className="warning-card">
                  <h3 className="warning-card-title">
                    <span className="warning-icon-card">❌</span>
                    DO NOT Suck the Venom
                  </h3>
                  <p className="warning-card-text">
                    Sucking venom by mouth is ineffective and dangerous. It can introduce bacteria and expose your mouth to venom.
                  </p>
                </div>
                <div className="warning-card">
                  <h3 className="warning-card-title">
                    <span className="warning-icon-card">❌</span>
                    DO NOT Apply Tourniquet
                  </h3>
                  <p className="warning-card-text">
                    Tourniquets can cause tissue death and limb loss. Use a firm bandage instead, but never cut off circulation completely.
                  </p>
                </div>
              </div>
            </section>

            {/* ===== FIRST AID STEPS (TIMELINE) ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">📋</span>
                First Aid Steps
              </h2>
              <div className="steps-timeline">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3 className="step-title">Note the Time of Bite</h3>
                    <p className="step-description">
                      Record the exact time when the bite occurred. This information is crucial for medical professionals to assess venom progression and plan treatment.
                    </p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3 className="step-title">Keep Person Still & Lying Down</h3>
                    <p className="step-description">
                      Have the victim lie down with the bite area below heart level. Minimize all movement to slow venom spread. Keep them calm and reassured.
                    </p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3 className="step-title">Bandage Firmly (Not a Tourniquet)</h3>
                    <p className="step-description">
                      Apply a firm pressure bandage over the bite and wrap upward. The bandage should be snug like a sprain bandage, but you should still be able to slip a finger underneath.
                    </p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3 className="step-title">Photograph the Snake (If Safe)</h3>
                    <p className="step-description">
                      Only if it can be done safely from a distance, take a photo of the snake. This helps identify the species and determine the right antivenom. Never attempt to catch or kill the snake.
                    </p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h3 className="step-title">Reach Hospital Immediately</h3>
                    <p className="step-description">
                      Call emergency services or transport the victim to the nearest hospital with antivenom. Time is critical. All snake bites should be treated as medical emergencies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="disclaimer">
                <p className="disclaimer-text">
                  ⚠️ First aid does not replace hospital treatment. Always seek immediate medical attention for any snake bite.
                </p>
              </div>

              <div className="bite-image-container">
                <img src={biteImage} alt="Snake bite identification guide" className="bite-image" />
              </div>
            </section>

            {/* ===== NEAREST ANTIVENOM SECTION ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🏥</span>
                Nearest Antivenom
              </h2>
              <div className="map-container">
                <div className="map-mockup">
                  <div className="map-marker">📍</div>
                </div>
              </div>

              <div className="hospital-card">
                <div className="hospital-header">
                  <div className="hospital-info">
                    <h3>City General Hospital</h3>
                    <p className="hospital-distance">2.3 km • 8 min away</p>
                  </div>
                  <span className="antivenom-badge">Antivenom Available</span>
                </div>
                <button className="go-button">🧭 GO - Navigate Now</button>
              </div>
            </section>
          </>
        )}

{activeTab === 'precautions' && (
          <>
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🛡️</span>
                Snake Bite Precautions
              </h2>
              <p className="precautions-intro">
                Most snake bites are preventable. Simple habits and awareness of your surroundings can greatly reduce the risk of an encounter.
              </p>

              {/* ===== DAILY SAFETY HABITS ===== */}
              <h3 className="section-title" style={{ fontSize: '16px', marginTop: '20px' }}>Daily Safety Habits</h3>
              <div className="habits-grid">
                <div className="habit-card">
                  <span className="habit-icon">👢</span>
                  <p className="habit-text">Wear footwear outdoors, especially at night</p>
                </div>
                <div className="habit-card">
                  <span className="habit-icon">🔦</span>
                  <p className="habit-text">Always use a torch/light in dark areas</p>
                </div>
                <div className="habit-card">
                  <span className="habit-icon">🌿</span>
                  <p className="habit-text">Avoid tall grass & leaf piles</p>
                </div>
                <div className="habit-card">
                  <span className="habit-icon">🚪</span>
                  <p className="habit-text">Keep doors & windows closed at night</p>
                </div>
              </div>
            </section>

            {/* ===== HOME SAFETY ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🏠</span>
                Make Your Home Safer
              </h2>
              <div className="safety-list">
                <div className="safety-item">
                  <span className="check-icon">✅</span>
                  <p className="safety-text">Clear debris and trash around the house</p>
                </div>
                <div className="safety-item">
                  <span className="check-icon">✅</span>
                  <p className="safety-text">Seal cracks and holes in walls/floors</p>
                </div>
                <div className="safety-item">
                  <span className="check-icon">✅</span>
                  <p className="safety-text">Keep firewood/materials away from living areas</p>
                </div>
                <div className="safety-item">
                  <span className="check-icon">✅</span>
                  <p className="safety-text">Control rodents (they attract snakes)</p>
                </div>
              </div>
            </section>

            {/* ===== IF YOU SEE A SNAKE ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">🐍</span>
                If You See a Snake
              </h2>
              <div className="encounter-card">
                <span className="encounter-title">DO NOT PANIC</span>
                <div className="encounter-steps">
                  <div className="encounter-step">
                    <span className="step-bullet">1.</span>
                    <p>Keep a safe distance (at least 6 feet).</p>
                  </div>
                  <div className="encounter-step">
                    <span className="step-bullet">2.</span>
                    <p>Do NOT attempt to touch, catch, or kill it.</p>
                  </div>
                  <div className="encounter-step">
                    <span className="step-bullet">3.</span>
                    <p>Slowly back away without sudden movements.</p>
                  </div>
                  <div className="encounter-step">
                    <span className="step-bullet">4.</span>
                    <p>Call local snake rescue or 112/911.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== HIGH RISK SITUATIONS ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">⚠️</span>
                High-Risk Situations
              </h2>
              <div className="risk-grid">
                <div className="risk-card">
                  <span className="risk-icon">🦶</span>
                  <p className="risk-text">Farming or gardening barefoot</p>
                </div>
                <div className="risk-card">
                  <span className="risk-icon">🌑</span>
                  <p className="risk-text">Walking at night without light</p>
                </div>
                <div className="risk-card">
                  <span className="risk-icon">🪵</span>
                  <p className="risk-text">Reaching into holes, logs, or unknown places</p>
                </div>
                <div className="risk-card">
                  <span className="risk-icon">🛌</span>
                  <p className="risk-text">Sleeping on the floor in snake-prone areas</p>
                </div>
              </div>
            </section>

            {/* ===== MYTHS & FACTS ===== */}
            <section className="section">
              <h2 className="section-title">
                <span className="urgency-icon">💡</span>
                Common Myths vs Facts
              </h2>
              <div className="myths-container">
                <div className="myth-fact-card">
                  <div className="myth-section">
                    <span className="myth-label">MYTH</span>
                    <p className="myth-text">"Snakes chase humans."</p>
                  </div>
                  <div className="fact-section">
                    <span className="fact-label">FACT</span>
                    <p className="fact-text">Snakes fear humans and only bite when threatened or provoked. They want to escape, not chase.</p>
                  </div>
                </div>

                <div className="myth-fact-card">
                  <div className="myth-section">
                    <span className="myth-label">MYTH</span>
                    <p className="myth-text">"All snakes are venomous."</p>
                  </div>
                  <div className="fact-section">
                    <span className="fact-label">FACT</span>
                    <p className="fact-text">Most snakes are non-venomous and harmless. However, treat all bites as potentially venomous to be safe.</p>
                  </div>
                </div>

                <div className="myth-fact-card">
                  <div className="myth-section">
                    <span className="myth-label">MYTH</span>
                    <p className="myth-text">"Killing snakes prevents danger."</p>
                  </div>
                  <div className="fact-section">
                    <span className="fact-label">FACT</span>
                    <p className="fact-text">Attempting to kill a snake increases the risk of getting bitten. It is also illegal in many regions.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="footer-reminder">
              <p className="reminder-text">
                🌿 Snakes are protected wildlife in many regions. They play a vital role in nature. Avoid harm and prioritize safety.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== FIXED BOTTOM ACTION BAR ===== */}
      <div className="bottom-action-bar">
        <button className="hospital-button">🏥 Nearest Hospital</button>
        <button className="sos-button">🚨 SOS CALL</button>
      </div>
    </div>
  );
};

export default SnakeEmergency;