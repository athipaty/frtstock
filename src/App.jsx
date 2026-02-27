import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import SideNav from "./components/SideNav";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Count from "./pages/Count";
import Variance from "./pages/Variance";
import UploadStocktake from "./pages/UploadStocktake";
import Matched from "./pages/Matched";
import Uncounted from "./pages/Uncounted";
import Unrecognized from "./pages/Unrecognized";
import UploadSystemStock from "./pages/UploadSystemStock";
import UploadTagList from "./pages/UploadTagList";
import UploadLocationList from "./pages/UploadLocationList";
import UploadProductionParts from "./pages/UploadProductionParts";
import ProductionCounted from "./pages/ProductionCounted";
import UploadPreviousDiff from "./pages/UploadPreviousDiff";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">

        {/* ── Sidebar (desktop only) ── */}
        <div className="hidden md:flex md:w-60 md:flex-shrink-0">
          <SideNav />
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 pb-16 md:pb-0 md:overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/count" element={<Count />} />
            <Route path="/variance" element={<Variance />} />
            <Route path="/upload-stocktake" element={<UploadStocktake />} />
            <Route path="/matched" element={<Matched />} />
            <Route path="/uncounted" element={<Uncounted />} />
            <Route path="/unrecognized" element={<Unrecognized />} />
            <Route path="/upload/system-stock" element={<UploadSystemStock />} />
            <Route path="/upload/tags" element={<UploadTagList />} />
            <Route path="/upload/locations" element={<UploadLocationList />} />
            <Route path="/production-counted" element={<ProductionCounted />} />
            <Route path="/upload/production-parts" element={<UploadProductionParts />} />
            <Route path="/upload/previous-diff" element={<UploadPreviousDiff />} />
          </Routes>
        </div>

      </div>

      {/* ── Bottom nav (mobile only) ── */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}