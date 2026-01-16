// Firebase core
import { initializeApp } from "firebase/app";

// Firestore (Database)
import { getFirestore } from "firebase/firestore";

// ❌ Analytics is NOT needed now
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcje-XcURwciOdUCDHTaNq_xcwrvB83YY",
  authDomain: "sign-language-learning-a-88b04.firebaseapp.com",
  projectId: "sign-language-learning-a-88b04",
  storageBucket: "sign-language-learning-a-88b04.appspot.com",
  messagingSenderId: "949427335182",
  appId: "1:949427335182:web:90bcfa586db7d7ec4d4c5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore and EXPORT it
export const db = getFirestore(app);

// ✅ Initialize Auth and EXPORT it
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
