import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiEdit,
  FiBarChart2,
  FiMoreHorizontal,
  FiUpload,
  FiFileText,
} from "react-icons/fi";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ===== MORE MENU (BOTTOM SHEET) ===== */}
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t shadow-lg p-3 animate-fade-in">
            <div className="text-sm font-semibold text-gray-800 px-2 pb-2">
              More
            </div>

            {/* ✅ Upload Master (your Upload.jsx) */}
            <button
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-sm"
              onClick={() => {
                setMoreOpen(false);
                navigate("/upload");
              }}
            >
              <FiFileText className="text-lg" />
              <div className="text-left">
                <div className="font-medium text-gray-800">Upload Master</div>
                <div className="text-xs text-gray-500">
                  Upload parts / locations
                </div>
              </div>
            </button>

            {/* ✅ Upload Stocktake */}
            <button
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-sm"
              onClick={() => {
                setMoreOpen(false);
                navigate("/upload-stocktake");
              }}
            >
              <FiUpload className="text-lg" />
              <div className="text-left">
                <div className="font-medium text-gray-800">
                  Upload Stocktake
                </div>
                <div className="text-xs text-gray-500">
                  Replace counts from Excel
                </div>
              </div>
            </button>

            <button
              className="mt-2 w-full py-2 text-sm text-gray-500"
              onClick={() => setMoreOpen(false)}
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
            className={`flex flex-col items-center py-2 ${
              isActive("/") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <FiHome className="text-lg" />
            <div>Dashboard</div>
          </Link>

          <Link
            to="/count"
            className={`flex flex-col items-center py-2 ${
              isActive("/count") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <FiEdit className="text-lg" />
            <div>Count</div>
          </Link>

          <Link
            to="/variance"
            className={`flex flex-col items-center py-2 ${
              isActive("/variance") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <FiBarChart2 className="text-lg" />
            <div>Result</div>
          </Link>

          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center py-2 ${
              moreOpen ? "text-blue-600" : "text-gray-400"
            }`}
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