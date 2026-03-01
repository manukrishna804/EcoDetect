import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    {/* Icon Placeholder - Shield/Leaf */}
                    <div className="auth-logo-icon">
                        <img src="/Images/authlogo.png" alt="Logo" />
                    </div>
                    <h1 className="auth-title">EcoDetect</h1>
                    <p className="auth-subtitle">Identify. Protect. Alert.</p>
                </div>

                {/* Forest Image Placeholder - Using a nice nature placeholder */}
                <img
                    src="/Images/authfront.png"
                    alt="Forest Mystery"
                    className="welcome-image"
                />

                <div className="welcome-actions">
                    <button className="auth-button btn-primary" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="auth-button btn-outline" onClick={() => navigate('/signup')}>
                        Sign Up
                    </button>
                </div>

                <div className="auth-footer" style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
                    v1.0.2 • Terms of Service
                </div>
            </div>
        </div>
    );
}
