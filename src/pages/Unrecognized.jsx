import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import UnrecognizedList from "../components/unrecognized/UnrecognizedList";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Unrecognized() {
  const [unrecognized, setUnrecognized] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => {
    loadUnrecognized();
  }, []);

  const loadUnrecognized = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/count/unrecognized`);
    setUnrecognized(res.data);
    setLoading(false);
  };

  const filtered = unrecognized.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActualQty = unrecognized.reduce(
    (sum, v) => sum + (v.actual || 0),
    0,
  );

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
      loadUnrecognized();
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
      loadUnrecognized();
    } catch (err) {
      setEditMsg(err.response?.data?.error || "Failed to delete.");
    }
  };

  const downloadExcel = () => {
    const rows = [...filtered]
      .sort((a, b) => a.partNo.localeCompare(b.partNo))
      .map((v) => ({
        "Part No": v.partNo,
        System: "Not found",
        "Actual Qty": v.actual,
        Locations: v.locations?.length ?? 0,
        "Location Details":
          v.locations?.map((l) => `${l.location}(${l.totalQty})`).join(", ") ??
          "",
        Status: "Not in system",
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 }, // Part No
      { wch: 12 }, // System
      { wch: 12 }, // Actual Qty
      { wch: 10 }, // Locations
      { wch: 40 }, // Location Details
      { wch: 16 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Unrecognized");

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `unrecognized-${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-5xl mx-auto space-y-4 animate-fade-in">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Unrecognized Parts
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              Parts that were counted but do not exist in the system.
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
              onClick={loadUnrecognized}
              className="text-xs text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Unrecognized Parts
            </div>
            <div className="text-2xl font-bold text-red-500 mt-1">
              {formatNumber(unrecognized.length)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">not in system</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Total Counted Qty
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {formatNumber(totalActualQty)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">units counted</div>
          </div>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Search Results
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {formatNumber(filtered.length)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {search ? "matching search" : "all parts"}
            </div>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">
              Loading unrecognized data…
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <input
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder={`Search part no. (${unrecognized.length} parts)`}
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
                    No unrecognized parts found. ✓
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
                          Actual Qty
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
                          return (
                            <React.Fragment key={v.partNo}>
                              <tr
                                className={`border-b border-gray-50 hover:bg-red-50/20 transition cursor-pointer ${isOpen ? "bg-red-50/30" : ""}`}
                                onClick={() =>
                                  setOpenPart(isOpen ? null : v.partNo)
                                }
                              >
                                <td className="px-4 py-3 font-medium text-gray-700">
                                  {v.partNo}
                                </td>
                                <td className="px-4 py-3 text-right text-red-400 text-xs">
                                  Not found
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                  {formatNumber(v.actual)}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                                  {v.locations?.length ?? 0}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                    ✗ Not in system
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">
                                  {isOpen ? "▲" : "▼"}
                                </td>
                              </tr>

                              {/* Expanded locations */}
                              {isOpen && (
                                <tr className="bg-red-50/10">
                                  <td colSpan={6} className="px-6 py-3">
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Locations
                                      </div>
                                      {[...(v.locations ?? [])]
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
                <UnrecognizedList
                  unrecognized={filtered}
                  openPart={openPart}
                  togglePart={(p) => setOpenPart(openPart === p ? null : p)}
                  onEditLocation={openEditLocation}
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
