import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios"; // ✅ add this
import {
  FiHome,
  FiEdit,
  FiBarChart2,
  FiMoreHorizontal,
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const API = "https://center-kitchen-backend.onrender.com";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0); // ✅ add this
  const [varianceCount, setVarianceCount] = useState(0); // ✅ add this

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  // ✅ fetch variance count on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [matchedRes, varianceRes] = await Promise.all([
          axios.get(`${API}/count/matched`),
          axios.get(`${API}/count/variance`),
        ]);
        setMatchedCount(matchedRes.data.length);
        setVarianceCount(varianceRes.data.length); // ✅ add this
      } catch {
        setMatchedCount(0);
        setVarianceCount(0);
      }
    };
    fetchCounts();
  }, []);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t shadow-lg p-4 animate-fade-in">
            <div className="text-sm font-semibold text-gray-800 px-2 pb-3">
              More
            </div>

            <div className="flex justify-around pb-2">
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/upload")}
              >
                <FiFileText className="text-2xl text-gray-600" />
                <span className="text-[11px] text-gray-500">Master Data</span>
              </button>
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/upload-stocktake")}
              >
                <FiUpload className="text-2xl text-gray-600" />
                <span className="text-[11px] text-gray-500">Stock Take</span>
              </button>
              {/* ✅ Matched icon with badge */}
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 relative"
                onClick={() => navigate("/matched")}
              >
                <div className="relative">
                  <FiCheckCircle className="text-2xl text-gray-600" />
                  {matchedCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {matchedCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500">Matched</span>
              </button>
              // in the icon grid
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/uncounted")}
              >
                <FiAlertCircle className="text-2xl text-orange-500" />
                <span className="text-[11px] text-gray-500">Uncounted</span>
              </button>
            </div>

            <button
              className="mt-2 w-full py-2 text-sm text-gray-400"
              onClick={() => setMoreOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm">
        <div className="flex justify-around text-xs">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 ${isActive("/") ? "text-blue-600" : "text-gray-400"}`}
          >
            <FiHome className="text-lg" />
            <div>Dashboard</div>
          </Link>
          <Link
            to="/count"
            className={`flex flex-col items-center py-2 ${isActive("/count") ? "text-blue-600" : "text-gray-400"}`}
          >
            <FiEdit className="text-lg" />
            <div>Count</div>
          </Link>
          <Link
            to="/variance"
            className={`flex flex-col items-center py-2 ${isActive("/variance") ? "text-blue-600" : "text-gray-400"}`}
          >
            <div className="relative">
              <FiBarChart2 className="text-lg" />
              {varianceCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {varianceCount}
                </span>
              )}
            </div>
            <div>Result</div>
          </Link>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center py-2 ${moreOpen ? "text-blue-600" : "text-gray-400"}`}
            type="button"
          >
            <FiMoreHorizontal className="text-lg" />
            <div>More</div>
          </button>
        </div>
      </div>
    </>
  );
}
