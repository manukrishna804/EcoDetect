import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Welcome from "./pages/Welcome";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/detect" element={<DetectSpecies />} />
        <Route path="/result" element={<DetectResult />} />
        <Route path="/precaution" element={<PrecautionFirstAid />} />
        <Route path="/plan-awareness" element={<PlanAwareness />} />
        <Route path="/learn/safety-tips" element={<SafetyTips />} />
        <Route path="/learn/prevention" element={<Prevention />} />
        <Route path="/snake" element={<SnakeEmergency />} />
        <Route path="/learn/first-aid-basics" element={<FirstAidBasics />} />
        <Route path="/learn/seasonal-alerts" element={<SeasonalAlerts />} />
        <Route path="/learn/community" element={<Community />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
