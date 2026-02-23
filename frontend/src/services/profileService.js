import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

/**
 * Fetch the user's Firestore profile document and merge it with
 * their Firebase Auth data into a single clean object.
 *
 * Priority for displayName: Auth object → Firestore → empty string.
 *
 * @param {import("firebase/auth").User} authUser
 * @returns {Promise<{
 *   displayName: string,
 *   email: string,
 *   phoneNumber: string,
 *   location: string,
 *   stats: { detections: number, alerts: number }
 * }>}
 */
export async function fetchUserProfile(authUser) {
    const docRef = doc(db, "users", authUser.uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.exists() ? docSnap.data() : {};

    return {
        displayName: authUser.displayName || data.displayName || "",
        email: authUser.email || "",
        phoneNumber: data.phoneNumber || "",
        location: data.location || "",
        stats: {
            // Use ?? (nullish coalescing) NOT || so that a true value of 0 is
            // kept instead of being replaced by the fallback.
            detections: data.totalDetections ?? 0,
            alerts: data.totalAlerts ?? 0,
        },
    };
}

/**
 * Save profile edits to both Firebase Auth (displayName) and Firestore.
 * Uses { merge: true } so only provided fields are written.
 *
 * @param {import("firebase/auth").User} authUser
 * @param {{ displayName: string, phoneNumber: string, location: string }} formData
 */
export async function saveUserProfile(authUser, formData) {
    // 1. Update Firebase Auth displayName
    await updateProfile(authUser, { displayName: formData.displayName });

    // 2. Write extra profile fields to Firestore
    await setDoc(
        doc(db, "users", authUser.uid),
        {
            displayName: formData.displayName,
            email: authUser.email,
            phoneNumber: formData.phoneNumber,
            location: formData.location,
        },
        { merge: true }
    );
}
