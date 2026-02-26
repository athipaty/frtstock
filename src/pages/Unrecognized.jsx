import { useEffect, useState } from "react";
import axios from "axios";
import UnrecognizedList from "../components/unrecognized/UnrecognizedList";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";

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
    const res = await axios.get(`${API}/count/unrecognized`);
    setUnrecognized(res.data);
    setLoading(false);
  };

  const filtered = unrecognized.filter((v) =>
    v.partNo.toLowerCase().includes(search.toLowerCase()),
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 animate-fade-in">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Unrecognized Parts
          </h2>
          <p className="text-xs text-gray-500">
            Parts that were counted but do not exist in the system.
          </p>
        </div>

        {loading && (
          <div className="text-xs text-gray-500 text-center py-6">
            Loading unrecognized data…
          </div>
        )}

        <div className="relative">
          <input
            className="w-full border px-3 py-1.5 rounded-lg text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-300"
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
          <UnrecognizedList
            unrecognized={filtered}
            openPart={openPart}
            togglePart={(p) => setOpenPart(openPart === p ? null : p)}
            onEditLocation={openEditLocation}
          />
        )}
      </div>

      {/* ✅ Modal */}
      <EditCountModal
        open={editOpen}
        loading={editLoading}
        data={editing}
        message={editMsg}
        onChange={(k, v) => setEditing({ ...editing, [k]: v })}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
      />
    </div>
  );
}
