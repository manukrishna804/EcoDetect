import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveDetection(data) {
  try {
    await addDoc(collection(db, "detections"), {
      ...data,
      timestamp: serverTimestamp()
    });
    console.log("✅ Detection saved");
  } catch (error) {
    console.error("❌ Failed to save detection", error);
  }
}
