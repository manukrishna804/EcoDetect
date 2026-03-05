import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";

const API_BASE_URL = import.meta.env.VITE_API_URL;


/**
 * Fetch hotspots directly from Firestore
 * @returns {Promise<Array>} Array of hotspot objects
 */
export async function getHotspotsFromFirestore() {
  try {
    const hotspotsRef = collection(db, "hotspots");
    // Try to order by updated_at, but fallback to just getting all if field doesn't exist
    let q;
    try {
      q = query(hotspotsRef, orderBy("updated_at", "desc"));
    } catch (e) {
      // If ordering fails (e.g., no documents or field doesn't exist), just get all
      q = hotspotsRef;
    }
    const querySnapshot = await getDocs(q);

    const hotspots = [];
    querySnapshot.forEach((doc) => {
      hotspots.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Fetched ${hotspots.length} hotspot(s) from Firestore`);
    return hotspots;
  } catch (error) {
    console.error("❌ Failed to fetch hotspots from Firestore:", error);
    throw error;
  }
}

/**
 * Fetch hotspots from backend API
 * @returns {Promise<Array>} Array of hotspot objects
 */
export async function getHotspotsFromAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/hotspots`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ Fetched ${data.count} hotspot(s) from API`);
    return data.hotspots || [];
  } catch (error) {
    console.error("❌ Failed to fetch hotspots from API:", error);
    throw error;
  }
}

/**
 * Trigger hotspot analysis on the backend
 * @returns {Promise<Object>} Result object with status and hotspot count
 */
export async function triggerHotspotAnalysis() {
  try {
    const response = await fetch(`${API_BASE_URL}/run-hotspot`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ Hotspot analysis completed: ${data.hotspots_created} hotspot(s) created`);
    return data;
  } catch (error) {
    console.error("❌ Failed to trigger hotspot analysis:", error);
    throw error;
  }
}

/**
 * Fetch detections by their IDs
 * @param {Array<string>} detectionIds - Array of detection document IDs
 * @returns {Promise<Array>} Array of detection objects
 */
export async function getDetectionsByIds(detectionIds) {
  try {
    if (!detectionIds || detectionIds.length === 0) return [];

    const detectionsRef = collection(db, "detections");
    const detections = [];

    // Firestore doesn't support IN queries with more than 10 items, so batch them
    const batchSize = 10;
    for (let i = 0; i < detectionIds.length; i += batchSize) {
      const batch = detectionIds.slice(i, i + batchSize);
      // For now, fetch individually (could optimize with whereIn if needed)
      const promises = batch.map(async (id) => {
        try {
          const docRef = doc(detectionsRef, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
          return null;
        } catch (err) {
          console.warn(`Failed to fetch detection ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      detections.push(...results.filter(d => d !== null));
    }

    console.log(`✅ Fetched ${detections.length} detection(s) by IDs`);
    return detections;
  } catch (error) {
    console.error("❌ Failed to fetch detections by IDs:", error);
    throw error;
  }
}

/**
 * Get alerts from Firestore
 * @param {number} limitCount - Maximum number of alerts to fetch
 * @returns {Promise<Array>} Array of alert objects
 */
export async function getAlerts(limitCount = 10) {
  try {
    const alertsRef = collection(db, "alerts");
    // Try to order by created_at, but fallback if field doesn't exist
    let q;
    try {
      q = query(alertsRef, orderBy("created_at", "desc"), limit(limitCount));
    } catch (e) {
      // If ordering fails, just get all (up to limit)
      q = query(alertsRef, limit(limitCount));
    }
    const querySnapshot = await getDocs(q);

    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Fetched ${alerts.length} alert(s) from Firestore`);
    return alerts;
  } catch (error) {
    console.error("❌ Failed to fetch alerts:", error);
    throw error;
  }
}

