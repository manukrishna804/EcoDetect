import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import DetectSpecies from "./pages/DetectSpecies";
import DetectResult from "./pages/DetectResult";
import PrecautionFirstAid from "./pages/PrecautionFirstAid";
import PlanAwareness from "./pages/PlanAwareness";
import SafetyTips from "./pages/Learn&Awareness/safety_tips";
import SnakeEmergency from "./pages/snake_emergency";
import Prevention from "./pages/Learn&Awareness/prevention";
import FirstAidBasics from "./pages/Learn&Awareness/firstaid_basics";
import SeasonalAlerts from "./pages/Learn&Awareness/seasonal_alerts";
import Community from "./pages/Learn&Awareness/community";
import SpeciesLibrary from "./pages/Learn&Awareness/species_library";
import SpeciesDetail from "./pages/Learn&Awareness/SpeciesDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";
import HotspotPage from "./pages/hotspot";
import Alerts from "./pages/alerts";
import MosquitoSafety from "./pages/MosquitoSafety";
import Chatbot from "./components/Chatbot";
import BottomNavbar from "./components/BottomNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";


// Wrapper component to conditionally render chatbot
function AppContent() {
  const location = useLocation();

  // Hide chatbot and bottom navbar on these routes
  const hideChatbotRoutes = ['/', '/login', '/signup', '/detect', '/result'];
  const shouldShowChatbot = !hideChatbotRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/detect" element={<ProtectedRoute><DetectSpecies /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><DetectResult /></ProtectedRoute>} />
        <Route path="/precaution" element={<ProtectedRoute><PrecautionFirstAid /></ProtectedRoute>} />
        <Route path="/plan-awareness" element={<ProtectedRoute><PlanAwareness /></ProtectedRoute>} />
        <Route path="/learn/safety-tips" element={<ProtectedRoute><SafetyTips /></ProtectedRoute>} />
        <Route path="/learn/prevention" element={<ProtectedRoute><Prevention /></ProtectedRoute>} />
        <Route path="/snake" element={<ProtectedRoute><SnakeEmergency /></ProtectedRoute>} />
        <Route path="/learn/first-aid-basics" element={<ProtectedRoute><FirstAidBasics /></ProtectedRoute>} />
        <Route path="/learn/seasonal-alerts" element={<ProtectedRoute><SeasonalAlerts /></ProtectedRoute>} />
        <Route path="/learn/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/learn/species-library" element={<ProtectedRoute><SpeciesLibrary /></ProtectedRoute>} />
        <Route path="/learn/species/:id" element={<ProtectedRoute><SpeciesDetail /></ProtectedRoute>} />
        <Route path="/hotspots" element={<ProtectedRoute><HotspotPage /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/mosquito-safety" element={<ProtectedRoute><MosquitoSafety /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>

      {/* Conditionally render chatbot */}
      {shouldShowChatbot && <Chatbot />}

      {/* Conditionally render BottomNavbar */}
      {shouldShowChatbot && <BottomNavbar />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
