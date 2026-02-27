import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiHome,
  FiEdit,
  FiBarChart2,
  FiMoreHorizontal,
  FiUpload,
  FiGrid,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiDatabase,
  FiPackage,
  FiTag, // ✅ add
} from "react-icons/fi";

const API = "https://center-kitchen-backend.onrender.com";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false); // ✅ upload submenu
  const [matchedCount, setMatchedCount] = useState(0);
  const [varianceCount, setVarianceCount] = useState(0);
  const [uncountedCount, setUncountedCount] = useState(0);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    setMoreOpen(false);
    setUploadOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          matchedRes,
          varianceRes,
          uncountedRes,
          unrecognizedRes,
          statusRes,
        ] = await Promise.all([
          axios.get(`${API}/count/matched`),
          axios.get(`${API}/count/variance`),
          axios.get(`${API}/count/uncounted`),
          axios.get(`${API}/count/unrecognized`),
          axios.get(`${API}/upload/status`), // ✅ add this
        ]);
        setMatchedCount(matchedRes.data.length);
        setVarianceCount(varianceRes.data.length);
        setUncountedCount(uncountedRes.data.length);
        setUnrecognizedCount(unrecognizedRes.data.length);
        setUploadStatus(statusRes.data); // ✅ add this
      } catch {
        setMatchedCount(0);
        setVarianceCount(0);
        setUncountedCount(0);
        setUnrecognizedCount(0);
      }
    };
    fetchCounts();
  }, []);

  const GreenCheck = ({ show }) =>
    show ? (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
        ✓
      </span>
    ) : null;

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const NavBadge = ({ count }) =>
    count > 0 ? (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
        {count}
      </span>
    ) : null;

  return (
    <>
      {/* ===== MORE SHEET ===== */}
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setMoreOpen(false);
              setUploadOpen(false);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t shadow-lg p-4 animate-fade-in">
            <div className="text-sm font-semibold text-gray-800 px-2 pb-3">
              More
            </div>

            <div className="grid grid-cols-3 gap-1 pb-2">

              {/* ── Unrecognized ── */}
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/unrecognized")}
              >
                <div className="relative">
                  <FiXCircle className="text-2xl text-gray-600" />
                  <NavBadge count={unrecognizedCount} />
                </div>
                <span className="text-[11px] text-gray-600">Unrecognized</span>
              </button>

              {/* ── Uncounted ── */}
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/uncounted")}
              >
                <div className="relative">
                  <FiAlertCircle className="text-2xl text-gray-600" />
                  <NavBadge count={uncountedCount} />
                </div>
                <span className="text-[11px] text-gray-600">Uncounted</span>
              </button>


              {/* ── Matched ── */}
              <button
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-50"
                onClick={() => navigate("/matched")}
              >
                <div className="relative">
                  <FiCheckCircle className="text-2xl text-gray-600" />
                  <NavBadge count={matchedCount} />
                </div>
                <span className="text-[11px] text-gray-600">Matched</span>
              </button>

              {/* ── Upload (collapsible) ── */}
              <button
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${uploadOpen ? "bg-blue-50 text-gray-600" : "hover:bg-gray-50 text-gray-600"}`}
                onClick={() => setUploadOpen((v) => !v)}
              >
                <FiUpload className="text-2xl" />
                <span className="text-[11px] text-gray-500">Upload</span>
              </button>
            </div>

            {/* ── Upload submenu (expands inline) ── */}
            {uploadOpen && (
              <div className="pt-2 pb-1 border-t border-dashed border-gray-100 animate-fade-in space-y-1">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide px-2">
                  Master Data
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-50"
                    onClick={() => navigate("/upload/system-stock")}
                  >
                    <div className="relative">
                      <FiDatabase className="text-2xl text-blue-500" />
                      <GreenCheck show={uploadStatus?.systemStock?.uploaded} />
                    </div>
                    <span className="text-[11px] text-gray-500 text-center">
                      System Stock
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-50"
                    onClick={() => navigate("/upload/tags")}
                  >
                    <div className="relative">
                      <FiTag className="text-2xl text-blue-500" />
                      <GreenCheck show={uploadStatus?.tagList?.uploaded} />
                    </div>
                    <span className="text-[11px] text-gray-500 text-center">
                      Tag List
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-50"
                    onClick={() => navigate("/upload/locations")}
                  >
                    <div className="relative">
                      <FiGrid className="text-2xl text-blue-500" />
                      <GreenCheck show={uploadStatus?.locationList?.uploaded} />
                    </div>
                    <span className="text-[11px] text-gray-500 text-center">
                      Location List
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-50"
                    onClick={() => navigate("/upload-stocktake")}
                  >
                    <div className="relative">
                      <FiPackage className="text-2xl text-blue-500" />
                      {/* ✅ green check if any physical counts exist */}
                      <GreenCheck
                        show={
                          uncountedCount <
                          matchedCount + varianceCount + uncountedCount
                        }
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 text-center">
                      Upload Count
                    </span>
                  </button>
                </div>
              </div>
            )}

            <button
              className="mt-2 w-full py-2 text-sm text-gray-400"
              onClick={() => {
                setMoreOpen(false);
                setUploadOpen(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== BOTTOM NAV ===== */}
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
            <div>Gap</div>
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
