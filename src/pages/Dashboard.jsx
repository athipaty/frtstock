import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => {
  if (n == null || isNaN(n)) return "0";
  return new Intl.NumberFormat("en-US").format(n);
};

const AnimatedNumber = ({ value, duration = 800 }) => {
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

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dashRes, varRes, matchRes, uncountRes, unrecRes] =
        await Promise.all([
          axios.get(`${API}/count/dashboard-status`),
          axios.get(`${API}/count/variance`),
          axios.get(`${API}/count/matched`),
          axios.get(`${API}/count/uncounted`),
          axios.get(`${API}/count/unrecognized`),
        ]);

      setDashboard(dashRes.data);

      const variances = varRes.data;
      const shortCount = variances.filter(
        (v) => v.actual - v.system < 0,
      ).length;
      const overCount = variances.filter((v) => v.actual - v.system > 0).length;
      const shortQty = variances
        .filter((v) => v.actual - v.system < 0)
        .reduce((sum, v) => sum + Math.abs(v.actual - v.system), 0);
      const overQty = variances
        .filter((v) => v.actual - v.system > 0)
        .reduce((sum, v) => sum + (v.actual - v.system), 0);

      const shortValue = variances
        .filter(
          (v) =>
            v.actual - v.system < 0 &&
            v.price != null &&
            !isNaN(Number(v.price)),
        )
        .reduce(
          (sum, v) => sum + Math.abs(v.actual - v.system) * Number(v.price),
          0,
        );

      const overValue = variances
        .filter(
          (v) =>
            v.actual - v.system > 0 &&
            v.price != null &&
            !isNaN(Number(v.price)),
        )
        .reduce((sum, v) => sum + (v.actual - v.system) * Number(v.price), 0);

      const shortValueParts = variances.filter(
        (v) =>
          v.actual - v.system < 0 &&
          v.price != null &&
          !isNaN(Number(v.price)) &&
          Number(v.price) > 0,
      ).length;

      const overValueParts = variances.filter(
        (v) =>
          v.actual - v.system > 0 &&
          v.price != null &&
          !isNaN(Number(v.price)) &&
          Number(v.price) > 0,
      ).length;

      setCounts({
        variance: variances.length,
        shortCount,
        overCount,
        shortQty,
        overQty,
        shortValue,
        overValue, // ✅
        shortValueParts,
        overValueParts, // ✅
        matched: matchRes.data.length,
        uncounted: uncountRes.data.length,
        unrecognized: unrecRes.data.length,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">
          Loading dashboard…
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-red-500">❌ {error}</div>
      </div>
    );

  if (!dashboard) return null;

  const qtyDiff = dashboard.qty.actual - dashboard.qty.system;
  const percent = (a, t) => (t ? Math.min(Math.round((a / t) * 100), 100) : 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Inventory Progress
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Actual inventory status compared against system records.
            </p>
          </div>
          <button
            onClick={loadData}
            className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
          >
            Refresh
          </button>
        </div>

        {/* ── Top stat row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              System Qty
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              <AnimatedNumber value={dashboard.qty.system} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">system records</div>
          </div>
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Actual Qty
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              <AnimatedNumber value={dashboard.qty.actual} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              physically counted
            </div>
          </div>
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 ${qtyDiff < 0 ? "border-red-50" : "border-green-50"}`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Qty Difference
            </div>
            <div
              className={`text-2xl font-bold mt-1 ${qtyDiff < 0 ? "text-red-500" : "text-green-500"}`}
            >
              {qtyDiff > 0 ? "+" : ""}
              <AnimatedNumber value={Math.abs(qtyDiff)} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {qtyDiff <= 0 ? "short vs system" : "over vs system"}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Parts Progress
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              <AnimatedNumber value={dashboard.partNo.actual} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              of {formatNumber(dashboard.partNo.system)} parts
            </div>
          </div>
        </div>

        {/* ── Progress bars ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Count Progress
          </div>
          {[
            { label: "Quantity", ...dashboard.qty, color: "#2563eb" },
            { label: "Part No", ...dashboard.partNo, color: "#16a34a" },
            { label: "Location", ...dashboard.location, color: "#7c3aed" },
          ].map((row) => {
            const pct = percent(row.actual, row.system);
            return (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-600">{row.label}</span>
                  <span className="text-gray-400">
                    {formatNumber(row.actual)} / {formatNumber(row.system)}
                    <span
                      className="ml-2 font-semibold"
                      style={{ color: row.color }}
                    >
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Gap summary cards ── */}
        {counts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-orange-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Gap Parts
              </div>
              <div className="text-2xl font-bold text-orange-500 mt-1">
                {formatNumber(counts.variance)}
              </div>
              <div className="text-xs mt-1 space-x-1">
                <span className="text-red-400">
                  {formatNumber(counts.shortCount)} short
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-green-500">
                  {formatNumber(counts.overCount)} over
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Matched
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatNumber(counts.matched)}
              </div>
              <div className="text-xs text-gray-400 mt-1">exact match</div>
            </div>
            <div className="bg-white rounded-2xl border border-yellow-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Uncounted
              </div>
              <div className="text-2xl font-bold text-yellow-500 mt-1">
                {formatNumber(counts.uncounted)}
              </div>
              <div className="text-xs text-gray-400 mt-1">not yet counted</div>
            </div>
            <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Unrecognized
              </div>
              <div className="text-2xl font-bold text-red-500 mt-1">
                {formatNumber(counts.unrecognized)}
              </div>
              <div className="text-xs text-gray-400 mt-1">not in system</div>
            </div>
          </div>
        )}

        {/* ── Qty gap breakdown ── */}
        {counts && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Total Short Qty
              </div>
              <div className="text-2xl font-bold text-red-500 mt-1">
                {formatNumber(counts.shortQty)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                across {formatNumber(counts.shortCount)} parts
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${counts.shortQty + counts.overQty > 0 ? Math.round((counts.shortQty / (counts.shortQty + counts.overQty)) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Total Over Qty
              </div>
              <div className="text-2xl font-bold text-green-500 mt-1">
                {formatNumber(counts.overQty)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                across {formatNumber(counts.overCount)} parts
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${counts.shortQty + counts.overQty > 0 ? Math.round((counts.overQty / (counts.shortQty + counts.overQty)) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Value gap breakdown ── */}
        {counts && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Short Value
              </div>
              <div className="text-2xl font-bold text-red-500 mt-1">
                {counts.shortValue === 0 ? (
                  <span className="text-gray-300 text-base">No price data</span>
                ) : (
                  <>
                    
                    {isNaN(counts.shortValue) || counts.shortValue === 0 ? (
                      <span className="text-gray-300 text-base">
                        No price data
                      </span>
                    ) : (
                      <>฿{formatNumber(Math.round(counts.shortValue))}</>
                    )}
                  </>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {counts.shortValueParts > 0
                  ? `from ${formatNumber(counts.shortValueParts)} parts`
                  : "no price data available"}
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      counts.shortValue + counts.overValue > 0
                        ? Math.round(
                            (counts.shortValue /
                              (counts.shortValue + counts.overValue)) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Over Value
              </div>
              <div className="text-2xl font-bold text-green-500 mt-1">
                {counts.overValue === 0 ? (
                  <span className="text-gray-300 text-base">No price data</span>
                ) : (
                  <>฿{formatNumber(Math.round(counts.overValue))}</>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {counts.overValueParts > 0
                  ? `from ${formatNumber(counts.overValueParts)} parts`
                  : "no price data available"}
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      counts.shortValue + counts.overValue > 0
                        ? Math.round(
                            (counts.overValue /
                              (counts.shortValue + counts.overValue)) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Summary table (desktop) ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="text-sm font-semibold text-gray-700">
              Count Summary
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold">Category</th>
                <th className="text-right px-6 py-3 font-semibold">System</th>
                <th className="text-right px-6 py-3 font-semibold">Actual</th>
                <th className="text-right px-6 py-3 font-semibold">
                  Difference
                </th>
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
                  <tr
                    key={row.label}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {formatNumber(row.system)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">
                      {formatNumber(row.actual)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${diff < 0 ? "text-red-500" : diff > 0 ? "text-green-500" : "text-gray-400"}`}
                    >
                      {diff === 0
                        ? "—"
                        : diff > 0
                          ? `+${formatNumber(diff)}`
                          : formatNumber(diff)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {pct}%
                        </span>
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
