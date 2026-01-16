import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function SignUp() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);
        try {
            // Note: In a real app, we'd save fullName, phone, location to Firestore here.
            // For now, only Auth is implemented.
            await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            navigate('/home');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
                    <div className="auth-logo-icon" style={{ width: '48px', height: '48px', fontSize: '24px', marginBottom: '1rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h2 className="auth-title" style={{ fontSize: '1.5rem' }}>Create Account</h2>
                    <p className="auth-subtitle">Join the community to stay safe and informed.</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSignup} className="auth-form" style={{ gap: '1rem' }}>

                    <div className="input-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <input name="fullName" type="text" className="auth-input" placeholder="e.g. Alex Johnson" value={formData.fullName} onChange={handleChange} required />
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <input name="email" type="email" className="auth-input" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <div className="input-wrapper">
                            <input name="phone" type="tel" className="auth-input" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Location</label>
                        <div className="input-wrapper">
                            <select name="location" className="auth-input" style={{ appearance: 'none' }} value={formData.location} onChange={handleChange}>
                                <option value="">Select City or Region</option>
                                <option value="kerala">Kerala</option>
                                <option value="tamilnadu">Tamil Nadu</option>
                                <option value="karnataka">Karnataka</option>
                            </select>
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input name="password" type="password" className="auth-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <input name="confirmPassword" type="password" className="auth-input" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                            <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>
                        </div>
                    </div>

                    <button type="submit" className="auth-button btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
}
