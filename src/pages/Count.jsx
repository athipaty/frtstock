import { useState, useRef, useEffect } from "react";
import axios from "axios";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";
const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n);

export default function Count() {
  const [form, setForm] = useState({
    tagNo: "",
    partNo: "",
    location: "",
    qtyPerBox: "",
    boxes: "",
    openBoxQty: "0",
  });

  const partSuggestRef = useRef(null);
  const locationSuggestRef = useRef(null);
  const tagInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [recentCounts, setRecentCounts] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allSearch, setAllSearch] = useState("");
  const [allLoading, setAllLoading] = useState(true);
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [partHighlight, setPartHighlight] = useState(-1);
  const [locationHighlight, setLocationHighlight] = useState(-1);
  const [saving, setSaving] = useState(false);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editMsg, setEditMsg] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadAllCounts();
    const handleClickOutside = (e) => {
      if (partSuggestRef.current && !partSuggestRef.current.contains(e.target))
        setPartSuggestions([]);
      if (
        locationSuggestRef.current &&
        !locationSuggestRef.current.contains(e.target)
      )
        setLocationSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAllCounts = async () => {
    try {
      setAllLoading(true);
      const res = await axios.get(`${API}/count/all`);
      setAllCounts(res.data);
    } catch {
      setAllCounts([]);
    } finally {
      setAllLoading(false);
    }
  };

  const qtyPerBoxNum = Number(form.qtyPerBox || 0);
  const boxesNum = Number(form.boxes || 0);
  const openBoxNum = Number(form.openBoxQty || 0);
  const totalQty = qtyPerBoxNum * boxesNum + openBoxNum;

  const submitCount = async () => {
    if (!form.tagNo || !form.partNo || !form.location)
      return setMessage("Please fill Tag No, Part No, Location");
    if (form.openBoxQty === "") return setMessage("Please fill Open Box Qty");
    if (Number.isNaN(openBoxNum))
      return setMessage("Open Box Qty must be a number");
    if (openBoxNum < 0) return setMessage("Open Box Qty cannot be negative");
    if (boxesNum && !Number.isInteger(boxesNum))
      return setMessage("Boxes must be an integer");

    try {
      const check = await axios.get(
        `${API}/count/latest?partNo=${encodeURIComponent(form.partNo)}&location=${encodeURIComponent(form.location)}`,
      );
      if (check.data?._id) {
        const confirm = window.confirm(
          `⚠️ A count for ${form.partNo} at ${form.location} already exists (Qty: ${formatNumber(check.data.totalQty)}).\n\nOverwrite it?`,
        );
        if (!confirm) return;
      }
    } catch (err) {
      if (err.response?.status !== 404)
        return setMessage("Failed to check existing record.");
    }

    try {
      setSaving(true);
      const res = await axios.post(`${API}/count/count`, {
        tagNo: form.tagNo,
        partNo: form.partNo,
        location: form.location,
        qtyPerBox: form.qtyPerBox === "" ? 0 : qtyPerBoxNum,
        boxes: form.boxes === "" ? 0 : boxesNum,
        openBoxQty: form.openBoxQty === "" ? 0 : openBoxNum,
      });

      setMessage("Count saved successfully");
      setLastSaved({
        tagNo: form.tagNo,
        partNo: form.partNo,
        location: form.location,
        totalQty,
      });
      const saved = res.data?.record;
      const newRecord = {
        tagNo: saved?.tagNo ?? form.tagNo,
        location: saved?.location ?? form.location,
        partNo: saved?.partNo ?? form.partNo,
        qtyPerBox: saved?.qtyPerBox ?? qtyPerBoxNum,
        boxes: saved?.boxes ?? boxesNum,
        openBoxQty: saved?.openBoxQty ?? openBoxNum,
        totalQty: saved?.totalQty ?? totalQty,
        _id: saved?._id,
      };
      setRecentCounts((prev) => [newRecord, ...prev].slice(0, 5));
      setAllCounts((prev) => {
        // update existing or prepend
        const idx = prev.findIndex(
          (c) =>
            c.partNo === newRecord.partNo && c.location === newRecord.location,
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newRecord;
          return updated;
        }
        return [newRecord, ...prev];
      });
      setForm({
        tagNo: "",
        partNo: "",
        location: "",
        qtyPerBox: "",
        boxes: "",
        openBoxQty: "0",
      });
      tagInputRef.current?.focus();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save count");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (record) => {
    setEditMsg("");
    setEditing({
      _id: record._id,
      tagNo: record.tagNo ?? "",
      partNo: record.partNo ?? "",
      location: record.location ?? "",
      qtyPerBox: String(record.qtyPerBox ?? ""),
      boxes: String(record.boxes ?? ""),
      openBoxQty: String(record.openBoxQty ?? 0),
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      setEditMsg("");
      await axios.put(`${API}/count/${editing._id}`, editing);
      setEditOpen(false);
      setEditing(null);
      loadAllCounts();
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

  const searchLocation = async (value) => {
    setLocationHighlight(-1);
    if (!value) return setLocationSuggestions([]);
    try {
      const res = await axios.get(`${API}/upload/locations/search?q=${value}`);
      setLocationSuggestions(res.data);
    } catch {
      setLocationSuggestions([]);
    }
  };

  const searchPartNo = async (value) => {
    setPartHighlight(-1);
    if (!value) return setPartSuggestions([]);
    try {
      const res = await axios.get(`${API}/upload/parts/search?q=${value}`);
      setPartSuggestions(res.data);
    } catch {
      setPartSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitCount();
    }
  };

  const handleLocationKeyDown = (e) => {
    if (locationSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setLocationHighlight((p) =>
          Math.min(p + 1, locationSuggestions.length - 1),
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setLocationHighlight((p) => Math.max(p - 1, 0));
        return;
      }
      if (e.key === "Enter" && locationHighlight >= 0) {
        e.preventDefault();
        setForm({ ...form, location: locationSuggestions[locationHighlight] });
        setLocationSuggestions([]);
        setLocationHighlight(-1);
        return;
      }
      if (e.key === "Escape") {
        setLocationSuggestions([]);
        setLocationHighlight(-1);
        return;
      }
    }
    if (e.key === "Enter") submitCount();
  };

  const handlePartKeyDown = (e) => {
    if (partSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPartHighlight((p) => Math.min(p + 1, partSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPartHighlight((p) => Math.max(p - 1, 0));
        return;
      }
      if (e.key === "Enter" && partHighlight >= 0) {
        e.preventDefault();
        setForm({ ...form, partNo: partSuggestions[partHighlight] });
        setPartSuggestions([]);
        setPartHighlight(-1);
        return;
      }
      if (e.key === "Escape") {
        setPartSuggestions([]);
        setPartHighlight(-1);
        return;
      }
    }
    if (e.key === "Enter") submitCount();
  };

  const inputCls =
    "w-full border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition";
  const labelCls =
    "text-[11px] font-semibold text-gray-400 uppercase tracking-wide";
  const isSuccess = message === "Count saved successfully";
  const isDuplicate = message.includes("already exists");

  const filteredAll = allCounts.filter(
    (c) =>
      c.partNo?.toLowerCase().includes(allSearch.toLowerCase()) ||
      c.location?.toLowerCase().includes(allSearch.toLowerCase()) ||
      c.tagNo?.toLowerCase().includes(allSearch.toLowerCase()),
  );

  const deleteRecord = async () => {
  try {
    await axios.delete(`${API}/count/${editing._id}`);
    setEditOpen(false);
    setEditing(null);
    loadAllCounts();
    setRecentCounts((prev) => prev.filter((r) => r._id !== editing._id));
  } catch (err) {
    setEditMsg(err.response?.data?.error || "Failed to delete.");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-7xl mx-auto anoimate-fade-in">
        {/* ── Header ── */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
            Inventory Count
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            Scan or enter tag details to record physical stock.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          {/* ── LEFT: Form + Recent ── */}
          <div className="w-full md:w-80 shrink-0 space-y-4">
            {/* Form card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold text-gray-700 border-b border-gray-50 pb-2">
                Enter Count
              </div>

              {/* Tag + Location */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={labelCls}>Tag No</label>
                  <input
                    ref={tagInputRef}
                    className={inputCls}
                    placeholder="IV25120002"
                    value={form.tagNo}
                    onChange={(e) =>
                      setForm({ ...form, tagNo: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="space-y-1 relative" ref={locationSuggestRef}>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    placeholder="A1-01"
                    value={form.location}
                    onChange={(e) => {
                      setForm({ ...form, location: e.target.value });
                      searchLocation(e.target.value);
                    }}
                    onKeyDown={handleLocationKeyDown}
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-100 rounded-xl shadow-lg text-sm mt-1 overflow-hidden">
                      {locationSuggestions.map((l, i) => (
                        <div
                          key={i}
                          className={`px-3 py-1.5 cursor-pointer text-center transition ${i === locationHighlight ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                          onClick={() => {
                            setForm({ ...form, location: l });
                            setLocationSuggestions([]);
                            setLocationHighlight(-1);
                          }}
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Part No */}
              <div className="space-y-1 relative" ref={partSuggestRef}>
                <label className={labelCls}>Part No</label>
                <input
                  className={inputCls}
                  placeholder="TG949046-4100"
                  value={form.partNo}
                  onChange={(e) => {
                    setForm({ ...form, partNo: e.target.value });
                    searchPartNo(e.target.value);
                  }}
                  onKeyDown={handlePartKeyDown}
                />
                {partSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border border-gray-100 rounded-xl shadow-lg text-sm mt-1 overflow-hidden">
                    {partSuggestions.map((p, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 cursor-pointer text-center transition ${i === partHighlight ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                        onClick={() => {
                          setForm({ ...form, partNo: p });
                          setPartSuggestions([]);
                          setPartHighlight(-1);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-gray-100" />

              {/* Qty/Box + Boxes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={labelCls}>Qty / Box</label>
                  <input
                    className={inputCls}
                    placeholder="300"
                    value={form.qtyPerBox}
                    onChange={(e) =>
                      setForm({ ...form, qtyPerBox: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Boxes</label>
                  <input
                    className={inputCls}
                    placeholder="2"
                    value={form.boxes}
                    onChange={(e) =>
                      setForm({ ...form, boxes: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              {/* Open + Total */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={labelCls}>Open / Remaining</label>
                  <input
                    className={inputCls}
                    placeholder="0"
                    value={form.openBoxQty}
                    onFocus={() => {
                      if (form.openBoxQty === "0")
                        setForm({ ...form, openBoxQty: "" });
                    }}
                    onBlur={() => {
                      if (form.openBoxQty === "")
                        setForm({ ...form, openBoxQty: "0" });
                    }}
                    onChange={(e) =>
                      setForm({ ...form, openBoxQty: e.target.value })
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Total Qty</label>
                  <div className="w-full border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-xl text-sm text-center font-bold text-blue-700">
                    {formatNumber(totalQty)}
                  </div>
                </div>
              </div>

              {/* Save */}
              <button
                onClick={submitCount}
                disabled={saving}
                className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm tracking-wide transition ${saving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
              >
                {saving ? "Saving…" : "Save Count"}
              </button>

              {/* Message */}
              {message && (
                <div
                  className={`text-center text-xs py-2 px-3 rounded-xl font-medium ${
                    isSuccess
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : isDuplicate
                        ? "bg-orange-50 text-orange-700 border border-orange-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {isSuccess ? "✅ " : isDuplicate ? "⚠️ " : "❌ "}
                  {message}
                </div>
              )}

              {/* Last saved */}
              {lastSaved && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1.5">
                    Last Saved
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Part</span>
                      <span className="font-semibold">{lastSaved.partNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location</span>
                      <span className="font-semibold">
                        {lastSaved.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Qty</span>
                      <span className="font-bold text-blue-700">
                        {formatNumber(lastSaved.totalQty)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent counts (mobile only) */}
            {recentCounts.length > 0 && (
              <div className="md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="text-sm font-semibold text-gray-700">
                    This Session
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentCounts.map((r, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs"
                      onClick={() => openEdit(r)}
                    >
                      <div>
                        <div className="font-semibold text-gray-700">
                          {r.partNo}
                        </div>
                        <div className="text-gray-400">{r.location}</div>
                      </div>
                      <div className="font-bold text-blue-600">
                        {formatNumber(r.totalQty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: All counted records ── */}
          <div className="hidden md:block flex-1 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header + Search */}
              <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-700">
                    All Counted Records
                  </div>
                  <div className="text-xs text-gray-400">
                    {allCounts.length} records total
                  </div>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    className="w-full border border-gray-200 bg-gray-50 pl-8 pr-8 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                    placeholder="Search part, location, tag..."
                    value={allSearch}
                    onChange={(e) => setAllSearch(e.target.value)}
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    🔍
                  </span>
                  {allSearch && (
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      onClick={() => setAllSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {allLoading ? (
                <div className="text-xs text-gray-400 text-center py-12">
                  Loading records…
                </div>
              ) : filteredAll.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-12 italic">
                  No records found.
                </div>
              ) : (
                <>
                  {/* ── Desktop: table ── */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50 bg-gray-50">
                          <th className="text-left px-5 py-3 font-semibold">
                            Part No
                          </th>
                          <th className="text-left px-5 py-3 font-semibold">
                            Tag No
                          </th>
                          <th className="text-left px-5 py-3 font-semibold">
                            Location
                          </th>
                          <th className="text-right px-5 py-3 font-semibold">
                            Qty/Box
                          </th>
                          <th className="text-right px-5 py-3 font-semibold">
                            Boxes
                          </th>
                          <th className="text-right px-5 py-3 font-semibold">
                            Open
                          </th>
                          <th className="text-right px-5 py-3 font-semibold">
                            Total Qty
                          </th>
                          <th className="text-right px-5 py-3 font-semibold">
                            Edit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAll.map((r, i) => (
                          <tr
                            key={r._id ?? i}
                            className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition cursor-pointer"
                            onClick={() => openEdit(r)}
                          >
                            <td className="px-5 py-2.5 font-medium text-gray-700">
                              {r.partNo}
                            </td>
                            <td className="px-5 py-2.5 text-gray-400 text-xs">
                              {r.tagNo}
                            </td>
                            <td className="px-5 py-2.5 text-gray-500">
                              {r.location}
                            </td>
                            <td className="px-5 py-2.5 text-right text-gray-500">
                              {formatNumber(r.qtyPerBox)}
                            </td>
                            <td className="px-5 py-2.5 text-right text-gray-500">
                              {formatNumber(r.boxes)}
                            </td>
                            <td className="px-5 py-2.5 text-right text-gray-500">
                              {formatNumber(r.openBoxQty)}
                            </td>
                            <td className="px-5 py-2.5 text-right font-bold text-blue-700">
                              {formatNumber(r.totalQty)}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                              <button
                                className="text-xs text-blue-600 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(r);
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Mobile: card list ── */}
                  <div className="md:hidden divide-y divide-gray-50">
                    {filteredAll.map((r, i) => (
                      <div
                        key={r._id ?? i}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                        onClick={() => openEdit(r)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">
                            {r.partNo}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {r.location}
                            {r.tagNo && (
                              <span className="ml-2 text-gray-300">
                                · {r.tagNo}
                              </span>
                            )}
                          </div>
                          {(r.boxes > 0 || r.qtyPerBox > 0) && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {r.qtyPerBox} × {r.boxes}
                              {r.openBoxQty > 0 && ` + ${r.openBoxQty}`}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 text-right shrink-0">
                          <div className="font-bold text-blue-700 text-sm">
                            {formatNumber(r.totalQty)}
                          </div>
                          <div className="text-[10px] text-blue-400 mt-0.5">
                            tap to edit
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCountModal
        open={editOpen}
        loading={editLoading}
        data={editing}
        message={editMsg}
        onChange={(k, v) => setEditing({ ...editing, [k]: v })}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSave={saveEdit}
        onDelete={deleteRecord}
      />
    </div>
  );
}
