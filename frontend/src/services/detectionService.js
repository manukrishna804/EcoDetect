import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const API_BASE_URL = "http://127.0.0.1:5000";

export async function saveDetection(data) {
  try {
    await addDoc(collection(db, "detections"), {
      ...data,
      timestamp: serverTimestamp()
    });
    console.log("✅ Detection saved");
    
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
