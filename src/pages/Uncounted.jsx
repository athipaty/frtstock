import React, { useEffect, useState } from "react";
import axios from "axios";
import UncountedList from "../components/uncounted/UncountedList";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

// ✅ same as variance page
const isEqual3Uncounted = (n1, n2, system) => {
  if (n1 == null || n2 == null) return false;
  // for uncounted, current diff = 0 - system = -system
  const currentDiff = -system;
  return (
    Math.round(currentDiff) === Math.round(n1) &&
    Math.round(currentDiff) === Math.round(n2)
  );
};

export default function Uncounted() {
  const [uncounted, setUncounted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");
  const [showSame3, setShowSame3] = useState(false);

  useEffect(() => {
    loadUncounted();
  }, []);

  const loadUncounted = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/count/uncounted`);
    setUncounted(res.data);
    setLoading(false);
  };

  const totalSystemQty = uncounted.reduce((sum, v) => sum + (v.system || 0), 0);

  // ✅ parts where N-1 and N-2 equal current diff (-system)
  const same3Parts = uncounted.filter((v) =>
    isEqual3Uncounted(v.diffN1, v.diffN2, v.system),
  );

  const filtered = uncounted
    .filter((v) => v.partNo.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => {
      if (showSame3) return isEqual3Uncounted(v.diffN1, v.diffN2, v.system);
      return true;
    });

  const DiffCell = ({ value }) => {
    if (value == null) return <span className="text-gray-300">—</span>;
    return (
      <span
        className={
          value < 0
            ? "text-red-400"
            : value > 0
              ? "text-green-400"
              : "text-gray-300"
        }
      >
        {value > 0 ? `+${formatNumber(value)}` : formatNumber(value)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Uncounted Parts
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Parts in the system that have not been physically counted yet.
            </p>
          </div>
          <button
            onClick={loadUncounted}
            className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
          >
            Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-orange-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Uncounted Parts
            </div>
            <div className="text-2xl font-bold text-orange-500 mt-1">
              {formatNumber(uncounted.length)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">not yet counted</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              System Qty
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {formatNumber(totalSystemQty)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">units in system</div>
          </div>

          {/* ✅ Same 3x card */}
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 transition ${
              showSame3
                ? "border-red-400 ring-2 ring-red-200"
                : "border-red-100"
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Same Gap 3X
            </div>
            <div className="flex gap-2 mt-1 items-center">
              <div className="text-2xl font-bold text-red-400">
                {formatNumber(same3Parts.length)}
              </div>
              <div className="text-xs text-gray-400 mb-0.5">parts</div>
            </div>
            <button
              onClick={() => {
                setShowSame3((v) => !v);
                setSearch("");
                setOpenPart(null);
              }}
              className={`mt-2 w-full text-xs py-1 rounded-lg font-medium transition ${
                showSame3
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
              }`}
            >
              {showSame3 ? "✕ Clear Filter" : "Show Items"}
            </button>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">
              Loading uncounted data…
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <input
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder={`Search part no. (${filtered.length} parts)`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenPart(null);
              }}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            {search && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          {!loading && (
            <>
              {/* ── Desktop: table ── */}
              <div className="hidden md:block">
                {filtered.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-8 italic">
                    All parts have been counted! 🎉
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold">
                          Part No
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          System Qty
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Actual
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Diff
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          N-1
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          N-2
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filtered]
                        .sort((a, b) => a.partNo.localeCompare(b.partNo))
                        .map((v) => {
                          const diff = 0 - v.system;
                          return (
                            <tr
                              key={v.partNo}
                              className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition"
                            >
                              <td className="px-4 py-3 font-medium text-gray-700">
                                {v.partNo}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-500">
                                {formatNumber(v.system)}
                              </td>
                              <td className="px-4 py-3 text-right text-orange-400 font-medium">
                                0
                              </td>
                              {/* ✅ Diff column */}
                              <td className="px-4 py-3 text-right font-bold text-red-500 text-xs">
                                {formatNumber(diff)}
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                <DiffCell value={v.diffN1} />
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                <DiffCell value={v.diffN2} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                  ⚠ Not counted
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── Mobile: original list ── */}
              <div className="md:hidden">
                <UncountedList
                  uncounted={filtered}
                  openPart={openPart}
                  togglePart={(p) => setOpenPart(openPart === p ? null : p)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
