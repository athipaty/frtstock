import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Count from "./pages/Count";
import Variance from "./pages/Variance";

export default function App() {
  return (
    <BrowserRouter>
      {/* Main content */}
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/count" element={<Count />} />
          <Route path="/variance" element={<Variance />} />
        </Routes>
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </BrowserRouter>
  );
}