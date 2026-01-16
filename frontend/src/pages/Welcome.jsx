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
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <h1 className="auth-title">AI Safety</h1>
                    <p className="auth-subtitle">Identify. Protect. Alert.</p>
                </div>

                {/* Forest Image Placeholder - Using a nice nature placeholder */}
                <img
                    src="https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
