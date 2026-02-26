import { useEffect, useState } from "react";
import axios from "axios";
import MatchedList from "../components/matched/MatchedList";

const API = "https://center-kitchen-backend.onrender.com";

export default function Matched() {
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMatched();
  }, []);

  const loadMatched = async () => {
    const res = await axios.get(`${API}/count/matched`);
    console.log("matched response:", res.data); // ✅ check this

    setMatched(res.data); // no need to filter, backend already returns matched only
    setLoading(false);
  };

  const filtered = matched.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 animate-fade-in">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Matched Parts
          </h2>
          <p className="text-xs text-gray-500">
            Parts where actual count matches system quantity exactly.
          </p>
        </div>

        {loading && (
          <div className="text-xs text-gray-500 text-center py-6">
            Loading matched data…
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <input
            className="w-full border px-3 py-1.5 rounded-lg text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
            placeholder="Search part no..."
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
          <MatchedList
            matched={filtered}
            openPart={openPart}
            togglePart={(p) => setOpenPart(openPart === p ? null : p)}
          />
        )}
      </div>
    </div>
  );
}
