import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Import db
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import styles from "../styles/Profile.module.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        phoneNumber: "",
        location: ""
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch additional data from Firestore
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        displayName: currentUser.displayName || data.displayName || "",
                        phoneNumber: data.phoneNumber || "",
                        location: data.location || ""
                    });
                } else {
                    // Initialize with defaults if no doc exists
                    setFormData({
                        displayName: currentUser.displayName || "",
                        phoneNumber: "",
                        location: ""
                    });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            // Update Firebase Auth Profile (DisplayName)
            await updateProfile(user, {
                displayName: formData.displayName
            });

            // Save to Firestore (Persistent Database)
            await setDoc(doc(db, "users", user.uid), {
                displayName: formData.displayName,
                email: user.email,
                phoneNumber: formData.phoneNumber,
                location: formData.location
            }, { merge: true });

            // Update local user state to reflect change immediately
            setUser({ ...user, displayName: formData.displayName });

            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
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

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 min-h-screen">
            <div className="max-w-[430px] mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24">
                {/* Header */}
                <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/30">
                    <button className={`p-2 -ml-2 ${styles.backButton}`} onClick={() => navigate(-1)}>
                        <span className="material-icons">arrow_back_ios</span>
                    </button>
                    <h1 className="text-lg font-bold">Account Profile</h1>
                    <div className="w-10"></div>
                </nav>

                <main className="px-5 mt-6 space-y-6">
                    {/* Profile Section */}
                    <section className="flex flex-col items-center text-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-emerald-900 shadow-xl overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <img alt="User P" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtnw14ZMRgbMosy3lhCVdphUba2YOgQnGPXOFXa1hyC7sfs9k_zKiqtM9XixDTtvDgxL24J6d6bLA415KmM6gcecfaeyfxN_qbha6ihL6DARVvCFXGVQQGW5yoFzkARXoaT664w85dDQ0ZPqSHLyhKR5i8HJ2jjDPF62CQOnysObx-N05FYfkHRk7DB9aYyH5H1m_BKOgThnnVAFrg7_pcVBVo-1KYkIKCkvogfNUVc_uRHn-Bv6ewjkI9iovCK4E6vEgjyE-UGng" />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                                <span className="material-icons text-sm">camera_alt</span>
                            </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="text-2xl font-bold text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-green-500"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold">{user?.displayName || "User Name"}</h2>
                            )}
                            <span
                                className="material-icons text-primary text-lg cursor-pointer"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "close" : "edit"}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-emerald-400 text-sm font-medium">Environmental Warden since 2026</p>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-emerald-900/20 p-4 rounded-xl shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                            <span className="text-primary material-icons mb-1">visibility</span>
                            <div className="text-2xl font-bold">124</div>
                            <div className="text-xs text-slate-500 dark:text-emerald-300 font-medium">Recent Detections</div>
                        </div>
                        <div className="bg-white dark:bg-emerald-900/20 p-4 rounded-xl shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                            <span className="text-amber-500 material-icons mb-1">warning</span>
                            <div className="text-2xl font-bold">8</div>
                            <div className="text-xs text-slate-500 dark:text-emerald-300 font-medium">Alerts Reported</div>
                        </div>
                    </section>

                    {/* Personal Info */}
                    <section className="bg-white dark:bg-emerald-900/10 p-5 rounded-xl shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-emerald-500 uppercase tracking-wider mb-4">Personal Information</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold px-1">Full Name</label>
                                <input
                                    className={`w-full bg-slate-50 dark:bg-emerald-950/50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all ${isEditing ? 'bg-white shadow-sm' : ''}`}
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold px-1">Email Address</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-emerald-950/50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-gray-500"
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold px-1">Phone Number</label>
                                <input
                                    className={`w-full bg-slate-50 dark:bg-emerald-950/50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all ${isEditing ? 'bg-white shadow-sm' : ''}`}
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold px-1">Location</label>
                                <input
                                    className={`w-full bg-slate-50 dark:bg-emerald-950/50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all ${isEditing ? 'bg-white shadow-sm' : ''}`}
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="bg-white dark:bg-emerald-900/10 p-5 rounded-xl shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-emerald-500 uppercase tracking-wider mb-4">Security & Access</h3>
                        <div className="space-y-2">
                            <button className={`w-full flex items-center justify-between py-3 px-1 hover:bg-slate-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors group ${styles.changePasswordButton}`}>
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-slate-400 group-hover:text-primary transition-colors">lock_reset</span>
                                    <span className="font-medium text-slate-600 dark:text-emerald-100 group-hover:text-green-600">Change Password</span>
                                </div>
                                <span className="material-icons text-slate-300">chevron_right</span>
                            </button>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="pt-6 space-y-4">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-lg">save</span>
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-white dark:bg-emerald-900/20 text-primary font-bold py-4 rounded-xl border border-primary/20 shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-lg">edit</span>
                                Edit Profile
                            </button>
                        )}
                        <button onClick={handleLogout} className="w-full bg-white dark:bg-transparent border border-emerald-100 dark:border-emerald-900 text-slate-500 dark:text-emerald-400 font-semibold py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-emerald-900/10 transition-colors">
                            Log Out
                        </button>
                    </div>

                    <div className="text-center pt-4 pb-8">
                        <button className="text-slate-400 dark:text-emerald-900 text-xs font-medium hover:text-red-500 transition-colors">
                            Permanently Delete Account
                        </button>
                    </div>
                </main>

                {/* Note: Bottom Nav is handled by App.jsx globally now */}
            </div>
        </div>
    );
}