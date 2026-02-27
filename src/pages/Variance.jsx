import { useEffect, useState } from "react";
import axios from "axios";
import VarianceList from "../components/variance/VarianceList";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { loadVariance(); }, []);

  const loadVariance = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/count/variance`);
    setVariances(res.data);
    setLoading(false);
  };

  const openEditLocation = async (partNo, location) => {
    try {
      setEditMsg("");
      setEditLoading(true);
      const res = await axios.get(
        `${API}/count/latest?partNo=${encodeURIComponent(partNo)}&location=${encodeURIComponent(location)}`
      );
      const d = res.data;
      if (!d || !d._id) throw new Error("Invalid record");
      setEditing({
        _id: d._id,
        tagNo: d.tagNo ?? "",
        partNo: d.partNo ?? partNo,
        location: d.location ?? location,
        qtyPerBox: String(d.qtyPerBox ?? ""),
        boxes: String(d.boxes ?? ""),
        openBoxQty: String(d.openBoxQty ?? 0),
      });
      setEditOpen(true);
    } catch (err) {
      setEditMsg(err.response?.data?.error || "Failed to load record");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const saveEdit = async () => {
    try {
      setEditMsg("");
      await axios.put(`${API}/count/${editing._id}`, editing);
      setEditOpen(false);
      setEditing(null);
      loadVariance();
    } catch (err) {
      if (err.response?.status === 409) {
        setEditMsg("⚠️ Another record already exists with the same Part No + Location.");
      } else {
        setEditMsg(err.response?.data?.error || "Failed to save.");
      }
    }
  };

  const deleteRecord = async () => {
    try {
      await axios.delete(`${API}/count/${editing._id}`);
      setEditOpen(false);
      setEditing(null);
      loadVariance();
    } catch (err) {
      setEditMsg(err.response?.data?.error || "Failed to delete.");
    }
  };

  const filtered = variances.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalShort = variances.filter((v) => v.actual - v.system < 0).length;
  const totalOver = variances.filter((v) => v.actual - v.system > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">Inventory Gap</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Differences between actual counts and system records.
            </p>
          </div>
          <button onClick={loadVariance}
            className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
            Refresh
          </button>
        </div>

        {/* ── Stat cards (desktop) ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{formatNumber(variances.length)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Short</div>
            <div className="text-2xl font-bold text-red-500 mt-1">{formatNumber(totalShort)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Over</div>
            <div className="text-2xl font-bold text-green-500 mt-1">{formatNumber(totalOver)}</div>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">

          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">Loading variance data…</div>
          )}

          {/* Search */}
          <div className="relative">
            <input
              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-gray-50"
              placeholder={`Search part no. (${variances.length} parts)`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenPart(null); }}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* ── Desktop: table ── */}
          {!loading && (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50 rounded-xl">
                      <th className="text-left px-4 py-3 font-semibold">Part No</th>
                      <th className="text-right px-4 py-3 font-semibold">System</th>
                      <th className="text-right px-4 py-3 font-semibold">Actual</th>
                      <th className="text-right px-4 py-3 font-semibold">Diff</th>
                      <th className="text-right px-4 py-3 font-semibold">N-1</th>
                      <th className="text-right px-4 py-3 font-semibold">N-2</th>
                      <th className="text-right px-4 py-3 font-semibold">Locations</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered]
                      .sort((a, b) => (a.actual - a.system) - (b.actual - b.system))
                      .map((v) => {
                        const diff = v.actual - v.system;
                        const isOpen = openPart === v.partNo;
                        return (
                          <>
                            <tr key={v.partNo}
                              className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${isOpen ? "bg-blue-50/30" : ""}`}
                              onClick={() => setOpenPart(isOpen ? null : v.partNo)}>
                              <td className="px-4 py-3 font-medium text-gray-700">{v.partNo}</td>
                              <td className="px-4 py-3 text-right text-gray-500">{formatNumber(v.system)}</td>
                              <td className="px-4 py-3 text-right text-gray-700 font-medium">{formatNumber(v.actual)}</td>
                              <td className={`px-4 py-3 text-right font-bold ${diff < 0 ? "text-red-500" : diff > 0 ? "text-green-500" : "text-gray-400"}`}>
                                {diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)}
                              </td>
                              <td className={`px-4 py-3 text-right text-xs ${(v.diffN1 ?? 0) < 0 ? "text-red-400" : (v.diffN1 ?? 0) > 0 ? "text-green-400" : "text-gray-300"}`}>
                                {v.diffN1 == null ? "—" : v.diffN1 > 0 ? `+${formatNumber(v.diffN1)}` : formatNumber(v.diffN1)}
                              </td>
                              <td className={`px-4 py-3 text-right text-xs ${(v.diffN2 ?? 0) < 0 ? "text-red-400" : (v.diffN2 ?? 0) > 0 ? "text-green-400" : "text-gray-300"}`}>
                                {v.diffN2 == null ? "—" : v.diffN2 > 0 ? `+${formatNumber(v.diffN2)}` : formatNumber(v.diffN2)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-400 text-xs">{v.locations?.length ?? 0}</td>
                              <td className="px-4 py-3 text-right text-xs text-blue-400">{isOpen ? "▲" : "▼"}</td>
                            </tr>

                            {/* Expanded location rows */}
                            {isOpen && (
                              <tr key={`${v.partNo}-expand`} className="bg-blue-50/20">
                                <td colSpan={8} className="px-6 py-3">
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
                                          <button
                                            className="ml-4 text-xs text-blue-500 hover:underline"
                                            onClick={(e) => { e.stopPropagation(); openEditLocation(v.partNo, l.location); }}
                                          >Edit</button>
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
              </div>

              {/* ── Mobile: original list ── */}
              <div className="md:hidden">
                <VarianceList
                  variances={filtered}
                  openPart={openPart}
                  togglePart={(p) => setOpenPart(openPart === p ? null : p)}
                  onEditLocation={openEditLocation}
                  search={search}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <EditCountModal
        open={editOpen}
        loading={editLoading}
        data={editing}
        message={editMsg}
        onChange={(k, v) => setEditing({ ...editing, [k]: v })}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
        onDelete={deleteRecord}
      />
    </div>
  );
}