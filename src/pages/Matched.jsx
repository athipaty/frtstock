import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import MatchedList from "../components/matched/MatchedList";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

// ✅ parts that had a gap in N-1 or N-2 or both
const hadPrevGap = (v) =>
  (v.diffN1 != null && v.diffN1 !== 0) || (v.diffN2 != null && v.diffN2 !== 0);

export default function Matched() {
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");
  const [showPrevGap, setShowPrevGap] = useState(false);

  useEffect(() => {
    loadMatched();
  }, []);

  const loadMatched = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/count/matched`);
    setMatched(res.data);
    setLoading(false);
  };

  const downloadExcel = () => {
    const rows = [...filtered]
      .sort((a, b) => a.partNo.localeCompare(b.partNo))
      .map((v) => ({
        "Part No": v.partNo,
        "System Qty": v.system,
        "Actual Qty": v.actual,
        Diff: 0,
        "N-1": v.diffN1 ?? "",
        "N-2": v.diffN2 ?? "",
        Locations: v.locations?.length ?? 0,
        Status: "Matched",
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 }, // Part No
      { wch: 12 }, // System Qty
      { wch: 12 }, // Actual Qty
      { wch: 8 }, // Diff
      { wch: 10 }, // N-1
      { wch: 10 }, // N-2
      { wch: 10 }, // Locations
      { wch: 10 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matched");

    const date = new Date().toISOString().slice(0, 10);
    const filterLabel = showPrevGap ? "-prev-gap" : "";
    XLSX.writeFile(wb, `matched${filterLabel}-${date}.xlsx`);
  };

  const totalMatchedQty = matched.reduce((sum, v) => sum + (v.actual || 0), 0);

  // ✅ parts with previous gap
  const prevGapParts = matched.filter(hadPrevGap);

  const filtered = matched
    .filter((v) => v.partNo.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => {
      if (showPrevGap) return hadPrevGap(v);
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
              Matched Parts
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Parts where actual count matches system quantity exactly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              disabled={filtered.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filtered.length === 0
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Export
            </button>
            <button
              onClick={loadMatched}
              className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Matched Parts
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {formatNumber(matched.length)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">part numbers</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Total Qty
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {formatNumber(totalMatchedQty)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">units matched</div>
          </div>

          {/* ✅ Had Previous Gap card */}
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 transition ${
              showPrevGap
                ? "border-yellow-400 ring-2 ring-yellow-200"
                : "border-yellow-100"
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Had Prev Gap
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-2xl font-bold text-yellow-500">
                {formatNumber(prevGapParts.length)}
              </div>
              <div className="text-xs text-gray-400 mb-0.5">parts</div>
            </div>
            <button
              onClick={() => {
                setShowPrevGap((v) => !v);
                setSearch("");
                setOpenPart(null);
              }}
              className={`mt-2 w-full text-xs py-1 rounded-lg font-medium transition ${
                showPrevGap
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
              }`}
            >
              {showPrevGap ? "✕ Clear Filter" : "Show Items"}
            </button>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">
              Loading matched data…
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
                    No matched parts found.
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
                          Actual Qty
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
                          Locations
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...filtered]
                        .sort((a, b) => a.partNo.localeCompare(b.partNo))
                        .map((v) => {
                          const isOpen = openPart === v.partNo;
                          const diff = v.actual - v.system; // should always be 0 for matched
                          return (
                            <React.Fragment key={v.partNo}>
                              <tr
                                className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${isOpen ? "bg-green-50/30" : ""}`}
                                onClick={() =>
                                  setOpenPart(isOpen ? null : v.partNo)
                                }
                              >
                                <td className="px-4 py-3 font-medium text-gray-700">
                                  {v.partNo}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500">
                                  {formatNumber(v.system)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                  {formatNumber(v.actual)}
                                </td>

                                {/* ✅ Diff column */}
                                <td className="px-4 py-3 text-right text-xs text-gray-400 font-medium">
                                  {diff === 0 ? (
                                    <span className="text-green-500">0</span>
                                  ) : (
                                    <DiffCell value={diff} />
                                  )}
                                </td>

                                <td className="px-4 py-3 text-right text-xs">
                                  <DiffCell value={v.diffN1} />
                                </td>
                                <td className="px-4 py-3 text-right text-xs">
                                  <DiffCell value={v.diffN2} />
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                                  {v.locations?.length ?? 0}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    ✓ Matched
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">
                                  {isOpen ? "▲" : "▼"}
                                </td>
                              </tr>

                              {isOpen && (
                                <tr className="bg-green-50/20">
                                  <td colSpan={9} className="px-6 py-3">
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Locations
                                      </div>
                                      {[...v.locations]
                                        .sort((a, b) =>
                                          a.location.localeCompare(b.location),
                                        )
                                        .map((l, i) => (
                                          <div
                                            key={i}
                                            className="flex items-center justify-between text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0"
                                          >
                                            <span className="font-medium text-gray-700 w-32">
                                              {l.location}
                                            </span>
                                            <span className="text-gray-400 flex-1">
                                              {l.boxes > 0 &&
                                                `${l.qtyPerBox} × ${l.boxes}`}
                                              {l.openBoxQty > 0 &&
                                                `${l.boxes > 0 ? " + " : ""}${l.openBoxQty}`}
                                              {l.boxes === 0 &&
                                                l.openBoxQty === 0 &&
                                                "—"}
                                            </span>
                                            <span className="font-semibold text-gray-800 w-24 text-right">
                                              {formatNumber(l.totalQty)}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── Mobile: original list ── */}
              <div className="md:hidden">
                <MatchedList
                  matched={filtered}
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
