import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Count from "./pages/Count";
import Variance from "./pages/Variance";
import UploadStocktake from "./pages/UploadStocktake";
import Matched from "./pages/Matched"; // ✅ add this
import Uncounted from "./pages/Uncounted";
import Unrecognized from "./pages/Unrecognized";
import UploadSystemStock from "./pages/UploadSystemStock";
import UploadTagList from "./pages/UploadTagList";
import UploadLocationList from "./pages/UploadLocationList";

export default function App() {
  return (
    <BrowserRouter>
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/count" element={<Count />} />
          <Route path="/variance" element={<Variance />} />
          <Route path="/upload-stocktake" element={<UploadStocktake />} />
          <Route path="/matched" element={<Matched />} /> {/* ✅ add this */}
          <Route path="/uncounted" element={<Uncounted />} />
          <Route path="/unrecognized" element={<Unrecognized />} />
          <Route path="/upload/system-stock" element={<UploadSystemStock />} />
          <Route path="/upload/tags" element={<UploadTagList />} />
          <Route path="/upload/locations" element={<UploadLocationList />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}
