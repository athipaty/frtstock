import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiHome, FiEdit, FiBarChart2, FiCheckCircle,
  FiAlertCircle, FiXCircle, FiDatabase, FiPackage,
  FiTag, FiGrid, FiTool, FiClock, FiCpu, FiChevronDown,
  FiChevronRight, FiUpload,
} from "react-icons/fi";

const API = "https://center-kitchen-backend.onrender.com";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [counts, setCounts] = useState({
    matched: 0, variance: 0, uncounted: 0,
    unrecognized: 0, production: 0,
  });
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [matchedRes, varianceRes, uncountedRes, unrecognizedRes, statusRes, productionRes] =
          await Promise.all([
            axios.get(`${API}/count/matched`),
            axios.get(`${API}/count/variance`),
            axios.get(`${API}/count/uncounted`),
            axios.get(`${API}/count/unrecognized`),
            axios.get(`${API}/upload/status`),
            axios.get(`${API}/count/production-counted`),
          ]);
        setCounts({
          matched: matchedRes.data.length,
          variance: varianceRes.data.length,
          uncounted: uncountedRes.data.length,
          unrecognized: unrecognizedRes.data.length,
          production: productionRes.data.length,
        });
        setUploadStatus(statusRes.data);
      } catch {}
    };
    fetchCounts();
  }, [location.pathname]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname === to;

  const NavItem = ({ to, icon: Icon, label, badge, color = "text-gray-500" }) => (
    <Link
      to={to}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition group ${
        isActive(to)
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`text-base ${isActive(to) ? "text-blue-600" : color}`} />
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </Link>
  );

  const GreenDot = ({ show }) =>
    show ? <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> : <span className="w-2 h-2" />;

  const UploadItem = ({ to, icon: Icon, label, uploaded }) => (
    <Link
      to={to}
      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
        isActive(to) ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="text-sm text-blue-500" />
        <span>{label}</span>
      </div>
      <GreenDot show={uploaded} />
    </Link>
  );

  return (
    <div className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col z-40">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="text-base font-bold text-gray-800">📦 Stock Check</div>
        <div className="text-[11px] text-gray-400 mt-0.5">Inventory Management</div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

        {/* Main */}
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1">Main</div>
        <NavItem to="/" icon={FiHome} label="Dashboard" />
        <NavItem to="/count" icon={FiEdit} label="Count" />
        <NavItem to="/variance" icon={FiBarChart2} label="Gap" badge={counts.variance} />

        {/* Results */}
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1 mt-3">Results</div>
        <NavItem to="/matched" icon={FiCheckCircle} label="Matched" badge={counts.matched} color="text-green-500" />
        <NavItem to="/uncounted" icon={FiAlertCircle} label="Uncounted" badge={counts.uncounted} color="text-orange-500" />
        <NavItem to="/unrecognized" icon={FiXCircle} label="Unrecognized" badge={counts.unrecognized} color="text-red-500" />
        <NavItem to="/production-counted" icon={FiCpu} label="Production" badge={counts.production} color="text-blue-500" />

        {/* Upload */}
        <div className="mt-3">
          <button
            onClick={() => setUploadOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2.5">
              <FiUpload className="text-base text-gray-500" />
              <span className="font-medium">Upload</span>
            </div>
            {uploadOpen ? <FiChevronDown className="text-xs" /> : <FiChevronRight className="text-xs" />}
          </button>

          {uploadOpen && (
            <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
              <UploadItem to="/upload/system-stock" icon={FiDatabase} label="System Stock" uploaded={uploadStatus?.systemStock?.uploaded} />
              <UploadItem to="/upload/tags" icon={FiTag} label="Tag List" uploaded={uploadStatus?.tagList?.uploaded} />
              <UploadItem to="/upload/locations" icon={FiGrid} label="Location List" uploaded={uploadStatus?.locationList?.uploaded} />
              <UploadItem to="/upload/production-parts" icon={FiTool} label="Production Parts" uploaded={uploadStatus?.productionParts?.uploaded} />
              <UploadItem to="/upload/previous-diff" icon={FiClock} label="Previous Diff" uploaded={uploadStatus?.previousDiff?.uploaded} />
              <UploadItem to="/upload-stocktake" icon={FiPackage} label="Upload Count" uploaded={counts.matched + counts.variance + counts.uncounted > 0} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="text-[11px] text-gray-400">Power by TingTong</div>
      </div>
    </div>
  );
}