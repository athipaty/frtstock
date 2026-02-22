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
    <div className="p-4">
      {loading ? "Loading…" : (
        <VarianceList
          variances={variances}
          openPart={openPart}
          togglePart={setOpenPart}
          onEditLocation={openEditLocation}
        />
      )}

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