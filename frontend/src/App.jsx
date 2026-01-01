import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import DetectSpecies from "./pages/DetectSpecies";
import DetectResult from "./pages/DetectResult";
import PrecautionFirstAid from "./pages/PrecautionFirstAid";
import PlanAwareness from "./pages/PlanAwareness";
import SafetyTips from "./pages/Learn&Awareness/safety_tips";
import SnakeEmergency from "./pages/Learn&Awareness/snake";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/detect" element={<DetectSpecies />} />
        <Route path="/result" element={<DetectResult />} />
        <Route path="/precaution" element={<PrecautionFirstAid />} />
        <Route path="/plan-awareness" element={<PlanAwareness />} />
        <Route path="/learn/safety-tips" element={<SafetyTips />} />
        <Route path="/snake" element={<SnakeEmergency />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
