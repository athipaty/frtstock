// pages/Variance.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

function SwipeRow({ onEdit, children }) {
  const startX = useState({ x: 0, active: false })[0]; // simple ref-like
  const [dx, setDx] = useState(0);

  const THRESHOLD = 70;
  const MAX = 110;

  const onTouchStart = (e) => {
    startX.x = e.touches[0].clientX;
    startX.active = true;
    setDx(0);
  };

  const onTouchMove = (e) => {
    if (!startX.active) return;
    const moveX = e.touches[0].clientX;
    const delta = moveX - startX.x; // swipe right = positive
    setDx(Math.max(0, Math.min(MAX, delta)));
  };

  const onTouchEnd = () => {
    if (!startX.active) return;
    startX.active = false;

    if (dx >= THRESHOLD) {
      setDx(0);
      onEdit?.();
      return;
    }
    setDx(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background "Edit" */}
      <div className="absolute inset-0 flex items-center pl-3 text-xs font-semibold text-blue-700 bg-blue-50">
        Edit
      </div>

      {/* Foreground swipeable content */}
      <div
        className="relative bg-white"
        style={{ transform: `translateX(${dx}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [editing, setEditing] = useState(null);
  // { _id, tagNo, partNo, location, qtyPerBox, boxes, openBoxQty, totalQty }

  useEffect(() => {
    loadVariance();
  }, []);

  const loadVariance = async () => {
    try {
      const res = await axios.get(`${API}/count/variance`);
      setVariances(res.data);
    } catch (err) {
      console.error("Failed to load variance data", err);
    } finally {
      setLoading(false);
    }
  };

  const calcTotal = (f) => {
    const qtyPerBoxNum = Number(f?.qtyPerBox || 0);
    const boxesNum = Number(f?.boxes || 0);
    const openBoxNum = Number(f?.openBoxQty || 0);
    return qtyPerBoxNum * boxesNum + openBoxNum;
  };

  const openEditForLocation = async (partNo, location) => {
    try {
      setEditMsg("");
      setEditLoading(true);
      setEditOpen(true);

      const res = await axios.get(
        `${API}/count/latest?partNo=${encodeURIComponent(partNo)}&location=${encodeURIComponent(location)}`,
      );

      const d = res.data;
      setEditing({
        _id: d._id,
        tagNo: d.tagNo || "",
        partNo: d.partNo || partNo,
        location: d.location || location,
        qtyPerBox: String(d.qtyPerBox ?? ""),
        boxes: String(d.boxes ?? ""),
        openBoxQty: String(d.openBoxQty ?? 0),
      });
    } catch (err) {
      setEditMsg(err.response?.data?.error || "Failed to load record");
    } finally {
      setEditLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editing?._id) return;

    const qtyPerBoxNum = Number(editing.qtyPerBox || 0);
    const boxesNum = Number(editing.boxes || 0);
    const openBoxNum =
      editing.openBoxQty === "" ? 0 : Number(editing.openBoxQty || 0);

    if ([qtyPerBoxNum, boxesNum, openBoxNum].some((n) => Number.isNaN(n))) {
      return setEditMsg("Qty/Box, Boxes, Open Box Qty must be numbers");
    }
    if (qtyPerBoxNum < 0 || boxesNum < 0 || openBoxNum < 0) {
      return setEditMsg("Numbers cannot be negative");
    }
    if (!Number.isInteger(boxesNum)) {
      return setEditMsg("Boxes must be an integer");
    }

    try {
      setEditMsg("");
      await axios.put(`${API}/count/${editing._id}`, {
        qtyPerBox: qtyPerBoxNum,
        boxes: boxesNum,
        openBoxQty: openBoxNum,
      });

      setEditOpen(false);
      setEditing(null);

      setLoading(true);
      await loadVariance();
    } catch (err) {
      setEditMsg(err.response?.data?.error || "Failed to save edit");
    }
  };

  const togglePart = (partNo) => {
    if (openPart === partNo) {
      setOpenPart(null);
    } else {
      setOpenPart(partNo);
    }
  };

  const editTotalQty =
    Number(editing?.qtyPerBox || 0) * Number(editing?.boxes || 0) +
    Number(editing?.openBoxQty || 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Inventory Variance
          </h2>
          <p className="text-xs text-gray-500">
            Highlights differences between actual counts and system records.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-xs text-gray-500 text-center py-6">
            Loading variance data…
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="space-y-2">
            {[...variances]
              .sort((a, b) => a.actual - a.system - (b.actual - b.system))
              .map((v) => {
                const diff = v.actual - v.system;
                const isOpen = openPart === v.partNo;

                return (
                  <div key={v.partNo} className="border rounded-md px-3 py-2">
                    {/* PART ROW */}
                    <button
                      onClick={() => togglePart(v.partNo)}
                      className="w-full flex justify-between items-center text-xs"
                    >
                      <span className="text-gray-700">{v.partNo}</span>

                      <span
                        className={`font-medium ${
                          diff < 0
                            ? "text-red-600"
                            : diff > 0
                              ? "text-green-600"
                              : "text-gray-500"
                        }`}
                      >
                        {diff < 0 && formatNumber(diff)}
                        {diff > 0 && `+${formatNumber(diff)}`}
                        {diff === 0 && "Matched"}
                      </span>
                    </button>

                    {/* EXPAND PART (SYSTEM + ACTUAL + LOCATIONS) */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-96 opacity-100 mt-2"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="text-xs text-gray-600 space-y-2 pl-2">
                        {/* System */}
                        <div className="flex justify-between">
                          <span>System stock</span>
                          <span className="font-medium">
                            {formatNumber(v.system)}
                          </span>
                        </div>

                        {/* Actual */}
                        <div className="flex justify-between">
                          <span>Actual stock</span>
                          <span className="font-medium">
                            {formatNumber(v.actual)}
                          </span>
                        </div>

                        {/* Location breakdown */}
                        <div className="pt-1 border-t space-y-1">
                          {v.locations?.length > 0 ? (
                            v.locations.map((l, i) => (
                              <SwipeRow
                                key={i}
                                onEdit={() =>
                                  openEditForLocation(v.partNo, l.location)
                                }
                              >
                                <div className="text-xs text-gray-500 border-b last:border-b-0 pb-1">
                                  <div className="flex justify-between">
                                    <div className="font-medium text-gray-700 flex-1">
                                      {l.location}
                                    </div>

                                    <div className="flex-1 text-[11px] text-left">
                                      <span>
                                        {l.boxes > 0 && (
                                          <span>
                                            {l.qtyPerBox} × {l.boxes}
                                          </span>
                                        )}
                                        {l.openBoxQty > 0 && (
                                          <span>
                                            {l.boxes > 0 && " + "}
                                            {l.openBoxQty}
                                          </span>
                                        )}
                                        {l.boxes === 0 &&
                                          l.openBoxQty === 0 && (
                                            <span className="text-gray-400">
                                              —
                                            </span>
                                          )}
                                      </span>
                                    </div>

                                    <div className="font-semibold text-gray-800 flex-1 text-right">
                                      {formatNumber(l.totalQty)}
                                    </div>
                                  </div>
                                </div>
                              </SwipeRow>
                            ))
                          ) : (
                            <div className="text-gray-400 italic">
                              Location not recorded
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {editOpen && (
                      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        {/* Backdrop */}
                        <div
                          className="absolute inset-0 bg-black/30"
                          onClick={() => {
                            setEditOpen(false);
                            setEditing(null);
                            setEditMsg("");
                          }}
                        />

                        {/* Card */}
                        <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-lg border">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-base font-semibold text-gray-800">
                                Edit Count
                              </h3>
                              <p className="text-xs text-gray-500">
                                Update the counted numbers for this location
                              </p>
                            </div>
                            <button
                              className="text-gray-500 text-lg"
                              onClick={() => {
                                setEditOpen(false);
                                setEditing(null);
                                setEditMsg("");
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          {editLoading && (
                            <div className="text-xs text-gray-500 text-center py-6">
                              Loading…
                            </div>
                          )}

                          {!editLoading && editing && (
                            <div className="mt-3 space-y-3">
                              {/* Tag + Location side-by-side */}
                              <div className="flex items-center space-x-4">
                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Tag No
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center bg-gray-50"
                                    value={editing.tagNo}
                                    readOnly
                                  />
                                </div>

                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Location
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center bg-gray-50"
                                    value={editing.location}
                                    readOnly
                                  />
                                </div>
                              </div>

                              {/* Part No full width */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">
                                  Part No
                                </label>
                                <input
                                  className="w-full border px-2 py-1 rounded text-center bg-gray-50"
                                  value={editing.partNo}
                                  readOnly
                                />
                              </div>

                              {/* Qty/Box + Boxes side-by-side */}
                              <div className="flex items-center space-x-4">
                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Qty / Box
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center"
                                    value={editing.qtyPerBox}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        qtyPerBox: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Boxes
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center"
                                    value={editing.boxes}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        boxes: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Open + Total side-by-side */}
                              <div className="flex items-center space-x-4">
                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Open / Remaining Box
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center"
                                    placeholder="0"
                                    value={editing.openBoxQty}
                                    onFocus={() => {
                                      if (editing.openBoxQty === "0") {
                                        setEditing({
                                          ...editing,
                                          openBoxQty: "",
                                        });
                                      }
                                    }}
                                    onBlur={() => {
                                      if (editing.openBoxQty === "") {
                                        setEditing({
                                          ...editing,
                                          openBoxQty: "0",
                                        });
                                      }
                                    }}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        openBoxQty: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-1 flex-1">
                                  <label className="text-xs font-medium text-gray-400">
                                    Total Qty
                                  </label>
                                  <input
                                    className="w-full border px-2 py-1 rounded text-center bg-gray-50 font-semibold"
                                    value={formatNumber(calcTotal(editing))}
                                    readOnly
                                  />
                                </div>
                              </div>

                              {editMsg && (
                                <div className="text-center text-sm text-red-700">
                                  {editMsg}
                                </div>
                              )}

                              <button
                                onClick={saveEdit}
                                className="w-full bg-blue-600 text-white py-2 rounded text-lg mt-2"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
