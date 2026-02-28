import React, { useEffect, useState } from "react";
import axios from "axios";
import VarianceList from "../components/variance/VarianceList";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

// ✅ outside component — single source of truth
const isEqual3 = (diff, n1, n2) => {
  if (n1 == null || n2 == null) return false;
  return (
    Math.round(diff) === Math.round(n1) && Math.round(diff) === Math.round(n2)
  );
};

const isShort3 = (v) => {
  const diff = v.actual - v.system;
  return diff < 0 && isEqual3(diff, v.diffN1, v.diffN2);
};

const isOver3 = (v) => {
  const diff = v.actual - v.system;
  return diff > 0 && isEqual3(diff, v.diffN1, v.diffN2);
};

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [search, setSearch] = useState("");
  const [consistentFilter, setConsistentFilter] = useState(null);

  useEffect(() => {
    loadVariance();
  }, []);

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
        `${API}/count/latest?partNo=${encodeURIComponent(partNo)}&location=${encodeURIComponent(location)}`,
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
        setEditMsg(
          "⚠️ Another record already exists with the same Part No + Location.",
        );
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

  // ✅ all use same functions
  const totalShort = variances.filter((v) => v.actual - v.system < 0).length;
  const totalOver = variances.filter((v) => v.actual - v.system > 0).length;
  const consistentShort = variances.filter(isShort3).length;
  const consistentOver = variances.filter(isOver3).length;
  const consistentShortQty = variances
    .filter(isShort3)
    .reduce((sum, v) => sum + Math.abs(v.actual - v.system), 0);
  const consistentOverQty = variances
    .filter(isOver3)
    .reduce((sum, v) => sum + (v.actual - v.system), 0);

  // ✅ filtered uses same functions
  const filtered = variances
    .filter((v) => v.partNo.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => {
      if (consistentFilter === "short3") return isShort3(v);
      if (consistentFilter === "over3") return isOver3(v);
      if (consistentFilter === "first")
        return (
          (v.diffN1 === 0 || v.diffN1 == null) &&
          (v.diffN2 === 0 || v.diffN2 == null)
        ); // ✅

      return true;
    });

  // ✅ parts where N-1 = 0 and N-2 = 0 (first time diff)
  const firstTimeDiff = variances.filter((v) => {
    return (
      (v.diffN1 === 0 || v.diffN1 == null) &&
      (v.diffN2 === 0 || v.diffN2 == null)
    );
  });

  const firstTimeDiffCount = firstTimeDiff.length;
  const firstTimeDiffQty = firstTimeDiff.reduce(
    (sum, v) => sum + Math.abs(v.actual - v.system),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Inventory Gap
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Differences between actual counts and system records.
            </p>
          </div>
          <button
            onClick={loadVariance}
            className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
          >
            Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-2">
          {/* Row 1 */}
          {/* Total */}
          <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Total Parts
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {formatNumber(variances.length)}
            </div>
          </div>

          {/* Short */}
          <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Short
            </div>
            <div className="text-2xl font-bold text-red-500 mt-1">
              {formatNumber(totalShort)}
            </div>
          </div>

          {/* Over */}
          <div className="bg-white rounded-2xl border border-green-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Over
            </div>
            <div className="text-2xl font-bold text-green-500 mt-1">
              {formatNumber(totalOver)}
            </div>
          </div>

          {/* Row 2 */}
          {/* First Time Diff */}
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 transition ${
              consistentFilter === "first"
                ? "border-blue-400 ring-2 ring-blue-200"
                : "border-blue-50"
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              First Time
            </div>
            <div className="flex items-end gap-2 mt-1 items-center">
              <div className="text-xl font-bold text-blue-500">
                {formatNumber(firstTimeDiffCount)}
              </div>
              <div className="text-xs text-gray-400 mb-0.5">parts</div>
            </div>
            <div className="text-xs text-blue-400 mt-0.5">
              {formatNumber(firstTimeDiffQty)} pcs
            </div>
            <button
              onClick={() => {
                setConsistentFilter(
                  consistentFilter === "first" ? null : "first",
                );
                setOpenPart(null);
                setSearch("");
              }}
              className={`mt-2 w-full text-xs py-1 rounded-lg font-medium transition ${
                consistentFilter === "first"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 text-blue-500 hover:bg-blue-100"
              }`}
            >
              {consistentFilter === "first" ? "Clear Filter" : "Show Items"}
            </button>
          </div>

          {/* Short 3x */}
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 transition ${
              consistentFilter === "short3"
                ? "border-red-400 ring-2 ring-red-200"
                : "border-red-100"
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Short 3X
            </div>
            <div className="flex items-end gap-2 mt-1 items-center">
              <div className="text-xl font-bold text-red-400">
                {formatNumber(consistentShort)}
              </div>
              <div className="text-xs text-gray-400 mb-0.5">parts</div>
            </div>
            <div className="text-xs text-red-400 mt-0.5">
              -{formatNumber(consistentShortQty)} pcs
            </div>
            <button
              onClick={() => {
                setConsistentFilter(
                  consistentFilter === "short3" ? null : "short3",
                );
                setOpenPart(null);
                setSearch("");
              }}
              className={`mt-2 w-full text-xs py-1 rounded-lg font-medium transition ${
                consistentFilter === "short3"
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
              }`}
            >
              {consistentFilter === "short3" ? "Clear Filter" : "Show Items"}
            </button>
          </div>

          {/* Over 3x */}
          <div
            className={`bg-white rounded-2xl border shadow-sm p-4 transition ${
              consistentFilter === "over3"
                ? "border-green-400 ring-2 ring-green-200"
                : "border-green-100"
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Over 3X
            </div>
            <div className="flex items-end gap-2 mt-1 items-center">
              <div className="text-xl font-bold text-green-400">
                {formatNumber(consistentOver)}
              </div>
              <div className="text-xs text-gray-400 mb-0.5">parts</div>
            </div>
            <div className="text-xs text-green-400 mt-0.5">
              +{formatNumber(consistentOverQty)} pcs
            </div>
            <button
              onClick={() => {
                setConsistentFilter(
                  consistentFilter === "over3" ? null : "over3",
                );
                setOpenPart(null);
                setSearch("");
              }}
              className={`mt-2 w-full text-xs py-1 rounded-lg font-medium transition ${
                consistentFilter === "over3"
                  ? "bg-green-500 text-white"
                  : "bg-green-50 text-green-500 hover:bg-green-100"
              }`}
            >
              {consistentFilter === "over3" ? "✕ Clear Filter" : "Show Items"}
            </button>
          </div>
        </div>

      

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">
              Loading variance data…
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
                    No variance found.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold">
                          Part No
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          System
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
                          Locations
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...filtered]
                        .sort(
                          (a, b) => a.actual - a.system - (b.actual - b.system),
                        )
                        .map((v) => {
                          const diff = v.actual - v.system;
                          const isOpen = openPart === v.partNo;
                          return (
                            <React.Fragment key={v.partNo}>
                              <tr
                                className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${isOpen ? "bg-blue-50/30" : ""}`}
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
                                <td className="px-4 py-3 text-right font-medium text-gray-700">
                                  {formatNumber(v.actual)}
                                </td>
                                <td
                                  className={`px-4 py-3 text-right font-bold ${diff < 0 ? "text-red-500" : diff > 0 ? "text-green-500" : "text-gray-400"}`}
                                >
                                  {diff > 0
                                    ? `+${formatNumber(diff)}`
                                    : formatNumber(diff)}
                                </td>
                                <td
                                  className={`px-4 py-3 text-right text-xs ${(v.diffN1 ?? 0) < 0 ? "text-red-400" : (v.diffN1 ?? 0) > 0 ? "text-green-400" : "text-gray-300"}`}
                                >
                                  {v.diffN1 == null
                                    ? "—"
                                    : v.diffN1 > 0
                                      ? `+${formatNumber(v.diffN1)}`
                                      : formatNumber(v.diffN1)}
                                </td>
                                <td
                                  className={`px-4 py-3 text-right text-xs ${(v.diffN2 ?? 0) < 0 ? "text-red-400" : (v.diffN2 ?? 0) > 0 ? "text-green-400" : "text-gray-300"}`}
                                >
                                  {v.diffN2 == null
                                    ? "—"
                                    : v.diffN2 > 0
                                      ? `+${formatNumber(v.diffN2)}`
                                      : formatNumber(v.diffN2)}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                                  {v.locations?.length ?? 0}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">
                                  {isOpen ? "▲" : "▼"}
                                </td>
                              </tr>

                              {isOpen && (
                                <tr className="bg-blue-50/20">
                                  <td colSpan={8} className="px-6 py-3">
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
                                            <button
                                              className="ml-4 text-xs text-blue-500 hover:underline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditLocation(
                                                  v.partNo,
                                                  l.location,
                                                );
                                              }}
                                            >
                                              Edit
                                            </button>
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
