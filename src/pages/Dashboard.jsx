// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

/* ---------- UI HELPERS (no logic change) ---------- */
const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(n);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardRes = await axios.get(
        `${API}/count/dashboard-status`
      );
      setDashboard(dashboardRes.data);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const percent = (actual, total) =>
    total ? Math.round((actual / total) * 100) : 0;

  /* ---------- Circle UI (presentation only) ---------- */
  const CircleProgress = ({ label, actual, system, color }) => {
    const pct = percent(actual, system);
    const r = 28;
    const c = 2 * Math.PI * r;

    return (
      <div className="flex items-center gap-4">
        {/* Circle */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background */}
            <circle
              cx="32"
              cy="32"
              r={r}
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress */}
            <circle
              cx="32"
              cy="32"
              r={r}
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={(1 - pct / 100) * c}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800">
            {pct}%
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium text-gray-800">
              {formatNumber(actual)} / {formatNumber(system)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      {dashboard && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Inventory Progress
            </h2>
            <p className="text-xs text-gray-500">
              Actual count vs system record
            </p>
          </div>

          {/* Quantity */}
          <CircleProgress
            label="Quantity"
            actual={dashboard.qty.actual}
            system={dashboard.qty.system}
            color="#2563eb" // blue
          />

          {/* Part No */}
          <CircleProgress
            label="Part No"
            actual={dashboard.partNo.actual}
            system={dashboard.partNo.system}
            color="#16a34a" // green
          />

          {/* Location */}
          <CircleProgress
            label="Location"
            actual={dashboard.location.actual}
            system={dashboard.location.system}
            color="#7c3aed" // purple
          />
        </div>
      )}
    </div>
  );
}