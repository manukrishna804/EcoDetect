import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut, updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import styles from "../styles/Profile.module.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        phoneNumber: "",
        location: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [stats, setStats] = useState({
        detections: 0,
        alerts: 0
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            displayName: currentUser.displayName || data.displayName || "",
                            phoneNumber: data.phoneNumber || "",
                            location: data.location || ""
                        });
                        setStats({
                            detections: data.totalDetections || 124,
                            alerts: data.totalAlerts || 8
                        });
                    } else {
                        setFormData({
                            displayName: currentUser.displayName || "",
                            phoneNumber: "",
                            location: ""
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        try {
            await updateProfile(user, { displayName: formData.displayName });
            await setDoc(doc(db, "users", user.uid), {
                displayName: formData.displayName,
                email: user.email,
                phoneNumber: formData.phoneNumber,
                location: formData.location
            }, { merge: true });
            setUser({ ...user, displayName: formData.displayName });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            // 1. Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // 2. Update password
            await updatePassword(user, passwordData.newPassword);

            alert("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Error updating password:", error);
            alert(error.code === 'auth/wrong-password' ? "Incorrect current password." : "Failed to update password. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            navigate("/login");
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("This action requires a recent login. Please log out and log back in to delete your account.");
            setShowDeleteModal(false);
        }
    };

    const getJoinYear = () => {
        if (user?.metadata?.creationTime) {
            return new Date(user.metadata.creationTime).getFullYear();
        }
        return 2026;
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <span className="material-icons">arrow_back_ios_new</span>
                    </button>
                    <h1 className={styles.headerTitle}>Account Profile</h1>
                    <div className={styles.spacer}></div>
                </header>

                <main className={`${styles.main} ${isEditing ? styles.editAnimation : ""}`}>
                    {/* Hero Section */}
                    <section className={styles.profileHero}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatarContainer}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className={styles.avatarImage} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <span className="material-icons" style={{ fontSize: '4.5rem' }}>person</span>
                                    </div>
                                )}
                            </div>
                            <button className={styles.cameraButton}>
                                <span className="material-icons" style={{ fontSize: '1.25rem' }}>camera_alt</span>
                            </button>
                        </div>

                        <div className={styles.userNameContainer}>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className={styles.userNameInput}
                                    autoFocus
                                />
                            ) : (
                                <h2 className={styles.userName}>{user?.displayName || "User Name"}</h2>
                            )}
                            <button onClick={() => setIsEditing(!isEditing)} className={styles.editToggleBtn}>
                                <span className="material-icons" style={{ fontSize: '1.25rem' }}>
                                    {isEditing ? "close" : "edit"}
                                </span>
                            </button>
                        </div>
                        <span className={styles.roleBadge}>Environmental Warden since {getJoinYear()}</span>
                    </section>

                    {/* Stats Grid */}
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={`${styles.statIcon} material-icons`} style={{ color: '#14b84b' }}>visibility</span>
                            <span className={styles.statValue}>{stats.detections}</span>
                            <span className={styles.statLabel}>Detections</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={`${styles.statIcon} material-icons`} style={{ color: '#f59e0b' }}>warning</span>
                            <span className={styles.statValue}>{stats.alerts}</span>
                            <span className={styles.statLabel}>Alerts</span>
                        </div>
                    </section>

                    {/* Info Card */}
                    <section className={styles.infoSection}>
                        <h3 className={styles.sectionHeader}>Personal Information</h3>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={`${styles.input} ${!isEditing ? styles.inputReadOnly : styles.inputEditing}`}
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input
                                className={`${styles.input} ${styles.inputReadOnly}`}
                                type="email"
                                value={user?.email || ""}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                className={`${styles.input} ${!isEditing ? styles.inputReadOnly : styles.inputEditing}`}
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                readOnly={!isEditing}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Home Location</label>
                            <input
                                className={`${styles.input} ${!isEditing ? styles.inputReadOnly : styles.inputEditing}`}
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                                readOnly={!isEditing}
                            />
                        </div>
                    </section>

                    {/* Security Card */}
                    <section className={styles.infoSection}>
                        <h3 className={styles.sectionHeader}>Security & Access</h3>
                        <button className={styles.securityButton} onClick={() => setShowPasswordModal(true)}>
                            <div className={styles.securityLeft}>
                                <span className={`${styles.securityIcon} material-icons`}>lock_reset</span>
                                <span className={styles.securityText}>Update Password</span>
                            </div>
                            <span className="material-icons" style={{ color: '#cbd5e1' }}>chevron_right</span>
                        </button>
                    </section>

                    {/* Actions */}
                    <div className={styles.actionGroup}>
                        {isEditing ? (
                            <button onClick={handleSave} className={styles.primaryButton}>
                                <span className="material-icons">save</span>
                                Save Profile Changes
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className={styles.secondaryButton}>
                                <span className="material-icons">edit</span>
                                Edit Account Details
                            </button>
                        )}
                        <button onClick={handleLogout} className={styles.logoutButton}>Sign Out from Device</button>
                    </div>

                    <button onClick={() => setShowDeleteModal(true)} className={styles.deleteAccountBtn}>
                        Permanently Delete Account
                    </button>
                </main>

                {/* Password Update Modal */}
                {showPasswordModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{ maxWidth: '380px' }}>
                            <div className={styles.warningIconWrapper} style={{ backgroundColor: '#ecfdf5', color: '#14b84b' }}>
                                <span className="material-icons" style={{ fontSize: '2rem' }}>lock</span>
                            </div>
                            <h3 className={styles.modalTitle}>Update Password</h3>
                            <p className={styles.modalText}>
                                Please enter your current password to authorize this change.
                            </p>

                            <form onSubmit={handlePasswordUpdate} className={styles.modalActions} style={{ gap: '1rem' }}>
                                <div className={styles.inputGroup} style={{ textAlign: 'left' }}>
                                    <label className={styles.label}>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup} style={{ textAlign: 'left' }}>
                                    <label className={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        minLength="6"
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup} style={{ textAlign: 'left' }}>
                                    <label className={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        minLength="6"
                                        required
                                    />
                                </div>

                                <div className={styles.modalActions} style={{ marginTop: '0.5rem' }}>
                                    <button type="submit" className={styles.primaryButton} style={{ borderRadius: '0.75rem', padding: '0.75rem' }}>
                                        Confirm Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.warningIconWrapper}>
                                <span className="material-icons" style={{ fontSize: '2rem' }}>priority_high</span>
                            </div>
                            <h3 className={styles.modalTitle}>Are you absolutely sure?</h3>
                            <p className={styles.modalText}>
                                This action is permanent. Deleting your account will erase all your detection history and personal settings.
                            </p>
                            <div className={styles.modalActions}>
                                <button onClick={handleDeleteAccount} className={styles.confirmDeleteBtn}>
                                    Yes, Delete Account
                                </button>
                                <button onClick={() => setShowDeleteModal(false)} className={styles.cancelBtn}>
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

