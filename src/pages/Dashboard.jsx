import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/count/dashboard-status`);
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const percent = (actual, total) =>
    total ? Math.round((actual / total) * 100) : 0;

  const AnimatedNumber = ({ value, duration = 600 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const step = Math.max(1, Math.floor(value / (duration / 16)));
      const timer = setInterval(() => {
        start += step;
        if (start >= value) { start = value; clearInterval(timer); }
        setDisplay(start);
      }, 16);
      return () => clearInterval(timer);
    }, [value, duration]);
    return <>{formatNumber(display)}</>;
  };

  const CircleProgress = ({ label, actual, system, color, bgColor, icon }) => {
    const pct = percent(actual, system);
    const r = 54;
    const box = 130;
    const c = 2 * Math.PI * r;

    return (
      <div className={`flex flex-col items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5 gap-3`}>
        
        {/* Circle */}
        <div className="relative" style={{ width: box, height: box }}>
          <svg width={box} height={box} className="-rotate-90">
            <circle cx={box/2} cy={box/2} r={r} stroke="#f3f4f6" strokeWidth="14" fill="none" />
            <circle
              cx={box/2} cy={box/2} r={r}
              stroke={color} strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={(1 - pct / 100) * c}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{pct}%</span>
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700">{label}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            <AnimatedNumber value={actual} /> / <AnimatedNumber value={system} />
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ label, value, sub, color }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-1xl font-bold" style={{ color }}>{formatNumber(value)}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-400">Loading dashboard…</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-red-500">❌ {error}</div>
    </div>
  );

  if (!dashboard) return null;

  const qtyDiff = dashboard.qty.actual - dashboard.qty.system;
  const partDiff = dashboard.partNo.actual - dashboard.partNo.system;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 md:space-y-3 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">Inventory Progress</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Actual inventory status compared against system records.
            </p>
          </div>
          <button
            onClick={loadData}
            className="text-xs text-blue-600 hover:underline border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50"
          >
            Refresh
          </button>
        </div>

        {/* ── Stat summary row (desktop) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Qty (System)"
            value={dashboard.qty.system} 
            sub="System records"
            color="#2563eb"
          />
          <StatCard
            label="Total Qty (Actual)"
            value={dashboard.qty.actual}
            sub="Physically counted"
            color="#16a34a"
          />
          <StatCard
            label="Qty Difference"
            value={Math.abs(qtyDiff)}
            sub={qtyDiff <= 0 ? "Short vs system" : "Over vs system"}
            color={qtyDiff < 0 ? "#dc2626" : "#16a34a"}
          />
          <StatCard
            label="Parts Progress"
            value={dashboard.partNo.actual}
            sub={`of ${formatNumber(dashboard.partNo.system)} parts`}
            color="#7c3aed"
          />
        </div>

        {/* ── Circle progress cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CircleProgress
            label="Quantity"
            actual={dashboard.qty.actual}
            system={dashboard.qty.system}
            color="#2563eb"
          />
          <CircleProgress
            label="Part No"
            actual={dashboard.partNo.actual}
            system={dashboard.partNo.system}
            color="#16a34a"
          />
          <CircleProgress
            label="Location"
            actual={dashboard.location.actual}
            system={dashboard.location.system}
            color="#7c3aed"
          />
        </div>

        {/* ── Detail table (desktop only) ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="text-sm font-semibold text-gray-700">Summary</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                <th className="text-left px-6 py-3 font-semibold">Category</th>
                <th className="text-right px-6 py-3 font-semibold">System</th>
                <th className="text-right px-6 py-3 font-semibold">Actual</th>
                <th className="text-right px-6 py-3 font-semibold">Difference</th>
                <th className="text-right px-6 py-3 font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Quantity", ...dashboard.qty, color: "#2563eb" },
                { label: "Part No", ...dashboard.partNo, color: "#16a34a" },
                { label: "Location", ...dashboard.location, color: "#7c3aed" },
              ].map((row) => {
                const diff = row.actual - row.system;
                const pct = percent(row.actual, row.system);
                return (
                  <tr key={row.label} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-700">{row.label}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatNumber(row.system)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">{formatNumber(row.actual)}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${diff < 0 ? "text-red-500" : diff > 0 ? "text-green-500" : "text-gray-400"}`}>
                      {diff === 0 ? "—" : diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}