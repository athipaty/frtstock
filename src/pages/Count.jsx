// pages/Count.jsx
import { useState, useRef } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function Count() {
  const [form, setForm] = useState({
    tagNo: "",
    partNo: "",
    location: "",
    qtyPerBox: "",
    boxes: "",
    openBoxQty: "",
  });

  const [message, setMessage] = useState("");
  const [recentCounts, setRecentCounts] = useState([]);
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const tagInputRef = useRef(null);

  // ---- derived values (auto-calc) ----
  const qtyPerBoxNum = Number(form.qtyPerBox || 0);
  const boxesNum = Number(form.boxes || 0);
  const openBoxNum = Number(form.openBoxQty || 0);

  const subtotalQty = qtyPerBoxNum * boxesNum;
  const totalQty = subtotalQty + openBoxNum;

  const submitCount = async () => {
    // Basic required fields
    if (!form.tagNo || !form.partNo || !form.location) {
      return setMessage("Please fill Tag No, Part No, Location");
    }

    // Validate numeric inputs
    if (form.qtyPerBox === "" || form.boxes === "" || form.openBoxQty === "") {
      return setMessage("Please fill Qty/Box, Boxes, Open Box Qty");
    }

    if ([qtyPerBoxNum, boxesNum, openBoxNum].some((n) => Number.isNaN(n))) {
      return setMessage("Qty/Box, Boxes, Open Box Qty must be numbers");
    }

    if (qtyPerBoxNum < 0 || boxesNum < 0 || openBoxNum < 0) {
      return setMessage("Numbers cannot be negative");
    }

    if (!Number.isInteger(boxesNum)) {
      return setMessage("Boxes must be an integer");
    }

    try {
      const res = await axios.post(`${API}/count`, {
        tagNo: form.tagNo,
        partNo: form.partNo,
        location: form.location,
        qtyPerBox: qtyPerBoxNum,
        boxes: boxesNum,
        openBoxQty: openBoxNum,
        // optional: you can also send these, but backend can compute:
        // subtotalQty,
        // totalQty,
      });

      setMessage("Count saved successfully");

      const saved = res.data?.record;

      // Add last 5 (prefer server values if returned)
      setRecentCounts((prev) =>
        [
          {
            tagNo: saved?.tagNo ?? form.tagNo,
            location: saved?.location ?? form.location,
            partNo: saved?.partNo ?? form.partNo,
            qtyPerBox: saved?.qtyPerBox ?? qtyPerBoxNum,
            boxes: saved?.boxes ?? boxesNum,
            openBoxQty: saved?.openBoxQty ?? openBoxNum,
            subtotalQty: saved?.subtotalQty ?? subtotalQty,
            totalQty: saved?.totalQty ?? totalQty,
          },
          ...prev,
        ].slice(0, 5)
      );

      setForm({
        tagNo: "",
        partNo: "",
        location: "",
        qtyPerBox: "",
        boxes: "",
        openBoxQty: "",
      });

      // focus back to tag input
      tagInputRef.current?.focus();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save count");
    }
  };

  const searchLocation = async (value) => {
    if (!value) return setLocationSuggestions([]);
    try {
      const res = await axios.get(`${API}/upload/locations/search?q=${value}`);
      setLocationSuggestions(res.data);
    } catch {
      setLocationSuggestions([]);
    }
  };

  const searchPartNo = async (value) => {
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

  const inputCls = "w-full border px-2 py-1 rounded text-center";
  const labelCls = "text-xs font-medium text-gray-400";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-gray-800">Inventory Count</h2>
          <p className="text-xs text-gray-500">
            Enter counts by box to validate and reconcile system data.
          </p>
        </div>

        {/* Tag No */}
        <div className="space-y-1">
          <label className={labelCls}>Tag No</label>
          <input
            ref={tagInputRef}
            className={inputCls}
            placeholder="IV25120002"
            value={form.tagNo}
            onChange={(e) => setForm({ ...form, tagNo: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Location */}
        <div className="space-y-1 relative">
          <label className={labelCls}>Location</label>
          <input
            className={inputCls}
            placeholder="A1-01"
            value={form.location}
            onChange={(e) => {
              setForm({ ...form, location: e.target.value });
              searchLocation(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded shadow text-sm">
              {locationSuggestions.map((l, i) => (
                <div
                  key={i}
                  className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-center"
                  onClick={() => {
                    setForm({ ...form, location: l });
                    setLocationSuggestions([]);
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Part No */}
        <div className="space-y-1 relative">
          <label className={labelCls}>Part No</label>
          <input
            className={inputCls}
            placeholder="TG949046-4100"
            value={form.partNo}
            onChange={(e) => {
              setForm({ ...form, partNo: e.target.value });
              searchPartNo(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {partSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded shadow text-sm">
              {partSuggestions.map((p, i) => (
                <div
                  key={i}
                  className="px-2 py-2 hover:bg-blue-50 cursor-pointer text-center"
                  onClick={() => {
                    setForm({ ...form, partNo: p });
                    setPartSuggestions([]);
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Qty / Box */}
        <div className="space-y-1">
          <label className={labelCls}>Qty / Box</label>
          <input
            type="number"
            className={inputCls}
            placeholder="300"
            value={form.qtyPerBox}
            onChange={(e) => setForm({ ...form, qtyPerBox: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Boxes */}
        <div className="space-y-1">
          <label className={labelCls}>Boxes</label>
          <input
            type="number"
            className={inputCls}
            placeholder="2"
            value={form.boxes}
            onChange={(e) => setForm({ ...form, boxes: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Subtotal Qty (read-only) */}
        <div className="space-y-1">
          <label className={labelCls}>Subtotal Qty (Qty/Box × Boxes)</label>
          <input className={`${inputCls} bg-gray-50`} value={subtotalQty} readOnly />
        </div>

        {/* Open / Remaining Box */}
        <div className="space-y-1">
          <label className={labelCls}>Open / Remaining Box (Loose Qty)</label>
          <input
            type="number"
            className={inputCls}
            placeholder="0"
            value={form.openBoxQty}
            onChange={(e) => setForm({ ...form, openBoxQty: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Total Qty (read-only) */}
        <div className="space-y-1">
          <label className={labelCls}>Total Qty</label>
          <input className={`${inputCls} bg-gray-50 font-semibold`} value={totalQty} readOnly />
        </div>

        <button
          onClick={submitCount}
          className="w-full bg-blue-600 text-white py-2 rounded text-lg mt-2"
        >
          Save
        </button>

        {message && (
          <div
            className={`text-center text-sm p-2 ${
              message === "Count saved successfully" ? "text-blue-700" : "text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Last 5 counts */}
        {recentCounts.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-xs font-semibold text-gray-500">Last 5 Counts</div>

            {recentCounts.map((c, i) => (
              <div key={i} className="p-2 border rounded bg-gray-50 text-sm space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{c.tagNo}</span>
                  <span>{c.location}</span>
                </div>
                <div className="text-gray-700">{c.partNo}</div>
                <div className="flex flex-wrap gap-x-3 text-xs text-gray-600">
                  <span>qty/box: {c.qtyPerBox}</span>
                  <span>boxes: {c.boxes}</span>
                  <span>open: {c.openBoxQty}</span>
                  <span className="font-semibold text-gray-800">total: {c.totalQty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}