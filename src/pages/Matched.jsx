import { useEffect, useState } from "react";
import axios from "axios";
import MatchedList from "../components/matched/MatchedList";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Matched() {
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadMatched(); }, []);

  const loadMatched = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/count/matched`);
    setMatched(res.data);
    setLoading(false);
  };

  const filtered = matched.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalMatchedQty = matched.reduce((sum, v) => sum + (v.actual || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">Matched Parts</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Parts where actual count matches system quantity exactly.
            </p>
          </div>
          <button onClick={loadMatched}
            className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
            Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Matched Parts</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{formatNumber(matched.length)}</div>
            <div className="text-xs text-gray-400 mt-0.5">part numbers</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Qty</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{formatNumber(totalMatchedQty)}</div>
            <div className="text-xs text-gray-400 mt-0.5">units matched</div>
          </div>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Search Results</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{formatNumber(filtered.length)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{search ? "matching search" : "all parts"}</div>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">

          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">Loading matched data…</div>
          )}

          {/* Search */}
          <div className="relative">
            <input
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder={`Search part no. (${matched.length} parts)`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenPart(null); }}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {!loading && (
            <>
              {/* ── Desktop: table ── */}
              <div className="hidden md:block">
                {filtered.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-8 italic">No matched parts found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold">Part No</th>
                        <th className="text-right px-4 py-3 font-semibold">System Qty</th>
                        <th className="text-right px-4 py-3 font-semibold">Actual Qty</th>
                        <th className="text-right px-4 py-3 font-semibold">Locations</th>
                        <th className="text-right px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...filtered]
                        .sort((a, b) => a.partNo.localeCompare(b.partNo))
                        .map((v) => {
                          const isOpen = openPart === v.partNo;
                          return (
                            <>
                              <tr key={v.partNo}
                                className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${isOpen ? "bg-green-50/30" : ""}`}
                                onClick={() => setOpenPart(isOpen ? null : v.partNo)}>
                                <td className="px-4 py-3 font-medium text-gray-700">{v.partNo}</td>
                                <td className="px-4 py-3 text-right text-gray-500">{formatNumber(v.system)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatNumber(v.actual)}</td>
                                <td className="px-4 py-3 text-right text-gray-400 text-xs">{v.locations?.length ?? 0}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Matched</span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">{isOpen ? "▲" : "▼"}</td>
                              </tr>

                              {/* Expanded locations */}
                              {isOpen && (
                                <tr key={`${v.partNo}-expand`} className="bg-green-50/20">
                                  <td colSpan={6} className="px-6 py-3">
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Locations</div>
                                      {[...v.locations]
                                        .sort((a, b) => a.location.localeCompare(b.location))
                                        .map((l, i) => (
                                          <div key={i} className="flex items-center justify-between text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                                            <span className="font-medium text-gray-700 w-32">{l.location}</span>
                                            <span className="text-gray-400 flex-1">
                                              {l.boxes > 0 && `${l.qtyPerBox} × ${l.boxes}`}
                                              {l.openBoxQty > 0 && `${l.boxes > 0 ? " + " : ""}${l.openBoxQty}`}
                                              {l.boxes === 0 && l.openBoxQty === 0 && "—"}
                                            </span>
                                            <span className="font-semibold text-gray-800 w-24 text-right">{formatNumber(l.totalQty)}</span>
                                          </div>
                                        ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
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