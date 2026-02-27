import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function ProductionCounted() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await axios.get(`${API}/count/production-counted`);
    setParts(res.data);
    setLoading(false);
  };

  const filtered = parts.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 animate-fade-in">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Production Parts Counted</h2>
          <p className="text-xs text-gray-500">
            Production part numbers that have been physically counted.
          </p>
        </div>

        {loading && (
          <div className="text-xs text-gray-500 text-center py-6">Loading…</div>
        )}

        {/* Search */}
        <div className="relative">
          <input
            className="w-full border px-3 py-1.5 rounded-lg text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
            placeholder={`Search part no. (${parts.length} parts)`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenPart(null); }}
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          {search && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              onClick={() => setSearch("")}
            >✕</button>
          )}
        </div>

        {!loading && (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-6 italic">
                No production parts counted yet.
              </div>
            ) : (
              [...filtered]
                .sort((a, b) => a.partNo.localeCompare(b.partNo))
                .map((v) => {
                  const isOpen = openPart === v.partNo;
                  return (
                    <div key={v.partNo} className="border rounded-md px-3 py-2">
                      {/* PART ROW */}
                      <button
                        onClick={() => setOpenPart(openPart === v.partNo ? null : v.partNo)}
                        className="w-full flex justify-between items-center text-xs"
                      >
                        <span className="text-gray-700">{v.partNo}</span>
                        <span className="font-medium text-blue-600">
                          {formatNumber(v.actual)}
                        </span>
                      </button>

                      {/* EXPAND */}
                      {isOpen && (
                        <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 animate-fade-in">
                          <div className="flex justify-between">
                            <span>Total counted</span>
                            <span className="font-medium">{formatNumber(v.actual)}</span>
                          </div>

                          {/* Locations */}
                          <div className="pt-1 border-t space-y-1">
                            {v.locations?.length > 0 ? (
                              [...v.locations]
                                .sort((a, b) => a.location.localeCompare(b.location))
                                .map((l, i) => (
                                  <div key={i} className="flex justify-between text-xs text-gray-500 border-b last:border-b-0 pb-1">
                                    <div className="font-medium text-gray-700 flex-1">{l.location}</div>
                                    <div className="flex-1 text-[11px]">
                                      {l.boxes > 0 && <span>{l.qtyPerBox} × {l.boxes}</span>}
                                      {l.openBoxQty > 0 && <span>{l.boxes > 0 && " + "}{l.openBoxQty}</span>}
                                      {l.boxes === 0 && l.openBoxQty === 0 && <span className="text-gray-400">—</span>}
                                    </div>
                                    <div className="font-semibold text-gray-800 flex-1 text-right">
                                      {formatNumber(l.totalQty)}
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-gray-400 italic">Location not recorded</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}