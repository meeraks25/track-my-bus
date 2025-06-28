
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Demo from "./pages/Demo";
import Admin from "./pages/Admin";
import Map from "./pages/Map";
import DriverDashboard from "./pages/DriverDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import GPSTracking from "./pages/GPSTracking";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/map" element={<Map />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/gps-tracking" element={<GPSTracking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </TooltipProvider>
  );
}

export default App;
