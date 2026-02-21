// pages/Count.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function Count() {
  const [form, setForm] = useState({
    tagNo: "",
    partNo: "",
    actualQty: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [recentCounts, setRecentCounts] = useState([]); // 👈 last 5 (full info)
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const tagInputRef = useRef(null);

  const submitCount = async () => {
    if (!form.tagNo || !form.partNo || !form.actualQty || !form.location) {
      return setMessage("Please fill all fields");
    }

    try {
      await axios.post(`${API}/count`, {
        tagNo: form.tagNo,
        partNo: form.partNo,
        actualQty: Number(form.actualQty),
        location: form.location,
      });

      setMessage("Count saved successfully");

      // 👇 add full record to last 5 list
      setRecentCounts((prev) =>
        [
          {
            tagNo: form.tagNo,
            location: form.location,
            partNo: form.partNo,
            qty: form.actualQty,
          },
          ...prev,
        ].slice(0, 5),
      );

      // Reset per-tag fields
      setForm({
        tagNo: "",
        partNo: "",
        actualQty: "",
        location: "",
      });

    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save count");
    }
  };

  const searchLocation = async (value) => {
    if (!value) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API}/upload/locations/search?q=${value}`);
      setLocationSuggestions(res.data);
    } catch {
      setLocationSuggestions([]);
    }
  };

  const searchPartNo = async (value) => {
    if (!value) {
      setPartSuggestions([]);
      return;
    }

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

  return (
    <div className="min-h-screen bg-gray-100 p-3">
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6
                animate-fade-in">
        {/* Tag No */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400">Tag No</label>
          <input
            ref={tagInputRef}
            className="w-full border px-2 py-1 rounded text-center"
            placeholder="IV25120002"
            value={form.tagNo}
            onChange={(e) => setForm({ ...form, tagNo: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Part No */}
        <div className="space-y-1 relative">
          <label className="text-xs font-medium text-gray-400">Part No</label>
          <input
            className="w-full border px-2 py-1 rounded text-center"
            placeholder="TG949046-4100"
            value={form.partNo}
            onChange={(e) => {
              setForm({ ...form, partNo: e.target.value });
              searchPartNo(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Suggestions */}
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

        {/* Actual Qty */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400">
            Actual Quantity
          </label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded text-center"
            placeholder="4000"
            value={form.actualQty}
            onChange={(e) => setForm({ ...form, actualQty: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Location */}
        <div className="space-y-1 relative">
          <label className="text-xs font-medium text-gray-400">Location</label>
          <input
            className="w-full border px-2 py-1 rounded text-center"
            placeholder="A1-01"
            value={form.location}
            onChange={(e) => {
              setForm({ ...form, location: e.target.value });
              searchLocation(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Suggestions */}
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

        <button
          onClick={submitCount}
          className="w-full bg-blue-600 text-white py-2 rounded text-lg mt-3"
        >
          Save
        </button>

        {message && (
          <div
            className={`text-center text-sm text-gray-700 p-2 ${
              message === "Count saved successfully"
                ? "text-blue-700"
                : "text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* 👇 Last 5 counts (2-line format) */}
        {recentCounts.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-xs font-semibold text-gray-500">
              Last 5 Counts
            </div>

            {recentCounts.map((c, i) => (
              <div key={i} className="p-2 border rounded bg-gray-50 text-sm">
                <div className="flex justify-between font-medium">
                  <span>{c.tagNo}</span>
                  <span>{c.location}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{c.partNo}</span>
                  <span>{c.qty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
