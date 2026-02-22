import { useEffect, useState } from "react";
import axios from "axios";
import VarianceList from "../components/variance/VarianceList";
import EditCountModal from "../components/variance/EditCountModal";

const API = "https://center-kitchen-backend.onrender.com";

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => {
    loadVariance();
  }, []);

  const loadVariance = async () => {
    const res = await axios.get(`${API}/count/variance`);
    setVariances(res.data);
    setLoading(false);
  };

  const openEditLocation = async (partNo, location) => {
    setEditOpen(true);
    setEditLoading(true);
    const res = await axios.get(
      `${API}/count/latest?partNo=${partNo}&location=${location}`,
    );
    setEditing({ ...res.data, openBoxQty: String(res.data.openBoxQty ?? 0) });
    setEditLoading(false);
  };

  const saveEdit = async () => {
    await axios.put(`${API}/count/${editing._id}`, editing);
    setEditOpen(false);
    setEditing(null);
    loadVariance();
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">

        {/* ✅ HEADER (put it back here) */}
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
          <VarianceList
            variances={variances}
            openPart={openPart}
            togglePart={(p) => setOpenPart(openPart === p ? null : p)}
            onEditLocation={openEditLocation}
          />
        )}
      </div>

      {/* ✅ Modal OUTSIDE the card */}
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