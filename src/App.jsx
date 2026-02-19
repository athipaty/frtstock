import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Count from "./pages/Count";
import Variance from "./pages/Variance";

export default function App() {
  return (
    <BrowserRouter>
      {/* Simple top navigation */}
      <nav className="bg-blue-600 text-white p-3">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/count">Count</Link>
          <Link to="/variance">Variance</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/count" element={<Count />} />
        <Route path="/variance" element={<Variance />} />
      </Routes>
    </BrowserRouter>
  );
}
