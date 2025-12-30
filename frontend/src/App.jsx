import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import DetectSpecies from "./pages/DetectSpecies";
import DetectResult from "./pages/DetectResult";
import PrecautionFirstAid from "./pages/PrecautionFirstAid";
import PlanAwareness from "./pages/PlanAwareness";
import SafetyTips from "./pages/Learn&Awareness/safety_tips";
import Prevention from "./pages/Learn&Awareness/prevention";
import FirstAidBasics from "./pages/Learn&Awareness/firstaid_basics";

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
        <Route path="/learn/prevention" element={<Prevention />} />
        <Route path="/learn/first-aid-basics" element={<FirstAidBasics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
