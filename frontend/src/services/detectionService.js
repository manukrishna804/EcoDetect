import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, updateDoc, increment } from "firebase/firestore";

import { API_BASE_URL } from '../config';


/**
 * Fetch the latest detection records from the global detections collection.
 * @param {number} count Number of records to fetch
 * @returns {Promise<Array>} List of detection objects
 */
export async function fetchRecentSightings(count = 5) {
  try {
    const q = query(
      collection(db, "detections"),
      orderBy("timestamp", "desc"),
      limit(20) // Fetch more to allow for filtering unknown
    );
    const querySnapshot = await getDocs(q);
    const sightings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out unknown species
    return sightings
      .filter(s => {
        const species = (s.detected_class || s.detected_species || "").toLowerCase().trim();
        return species !== "unknown" && species !== "unknown species" && species !== "";
      })
      .slice(0, count);
  } catch (error) {
    console.error("❌ Failed to fetch recent sightings:", error);
    return [];
  }
}

export async function saveDetection(data, userId = null) {
  try {
    await addDoc(collection(db, "detections"), {
      ...data,
      userId: userId,
      timestamp: serverTimestamp()
    });
    console.log("✅ Detection saved");

    // Atomic increment for user statistics
    if (userId) {
      const userRef = doc(db, "users", userId);
      const isHighRisk = (data.danger_level || "").toLowerCase() === "high" ||
        (data.danger_level || "").toLowerCase() === "extreme";

      await updateDoc(userRef, {
        totalDetections: increment(1),
        totalAlerts: isHighRisk ? increment(1) : increment(0)
      }).catch(err => console.warn("⚠️ Could not update user stats:", err));
    }

    // Automatically trigger hotspot analysis if it's a high/extreme risk detection
    const dangerLevel = (data.danger_level || "").toLowerCase();
    const category = (data.category || "").toLowerCase();

    // Only trigger for high/extreme risk, non-insect detections
    if ((dangerLevel === "high" || dangerLevel === "extreme") &&
      category !== "mosquito" && category !== "insect") {
      console.log("🔄 Auto-triggering hotspot analysis...");
      // Trigger in background (don't wait for it)
      triggerHotspotAnalysisBackground().catch(err => {
        console.warn("⚠️ Background hotspot analysis failed:", err);
      });
    }
  } catch (error) {
    console.error("❌ Failed to save detection", error);
  }
}

/**
 * Trigger hotspot analysis in the background (non-blocking)
 */
async function triggerHotspotAnalysisBackground() {
  try {
    const response = await fetch(`${API_BASE_URL}/run-hotspot`, {
      method: "POST"
    });
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Hotspot analysis completed: ${data.hotspots_created} created, ${data.hotspots_updated} updated`);
    }
  } catch (error) {
    // Silently fail in background - user doesn't need to see this
    console.warn("Background hotspot analysis error:", error);
  }
}
