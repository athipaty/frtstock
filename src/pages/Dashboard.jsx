// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

/* ---------- UI helpers (display only) ---------- */
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/count/dashboard-status`);
      setDashboard(res.data);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const percent = (actual, total) =>
    total ? Math.round((actual / total) * 100) : 0;

  const AnimatedNumber = ({ value, duration = 500 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const step = Math.max(1, Math.floor(value / (duration / 16)));

      const timer = setInterval(() => {
        start += step;
        if (start >= value) {
          start = value;
          clearInterval(timer);
        }
        setDisplay(start);
      }, 16);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <>{formatNumber(display)}</>;
  };

  /* ---------- Circle UI (presentation only) ---------- */
  const CircleProgress = ({
    label,
    actual,
    system,
    color,
    size = "sm", // sm | lg
  }) => {
    const pct = percent(actual, system);
    const r = size === "lg" ? 36 : 28;
    const box = size === "lg" ? 88 : 64;
    const c = 2 * Math.PI * r;

    return (
      <div className="flex items-center justify-between gap-4">
        {/* Circle */}
        <div className="relative shrink-0" style={{ width: box, height: box }}>
          <svg width={box} height={box} className="-rotate-90">
            <circle
              cx={box / 2}
              cy={box / 2}
              r={r}
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx={box / 2}
              cy={box / 2}
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

        {/* Label + Number (RIGHT side) */}
        <div className="flex flex-col">
          <div className="text-l text-gray-600 text-right">{label}</div>
          <div className="text-xs font-medium text-gray-800 text-right">
            <AnimatedNumber value={actual} /> /{" "}
            <AnimatedNumber value={system} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      {dashboard && (
        <div
          className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2
                animate-fade-in"
        >
          {/* Header */}
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Inventory Progress
            </h2>
            <p className="text-xs text-gray-500">
              Actual inventory status compared against system records.
            </p>
          </div>

          {/* Quantity (Hero) */}
          <CircleProgress
            label="Quantity"
            actual={dashboard.qty.actual}
            system={dashboard.qty.system}
            color="#2563eb"
            size="lg"
          />

          {/* Part No */}
          <CircleProgress
            label="Part No"
            actual={dashboard.partNo.actual}
            system={dashboard.partNo.system}
            size="lg"
            color="#16a34a"
          />

          {/* Location */}
          <CircleProgress
            label="Location"
            actual={dashboard.location.actual}
            system={dashboard.location.system}
            size="lg"
            color="#7c3aed"
          />
        </div>
      )}
    </div>
  );
}
