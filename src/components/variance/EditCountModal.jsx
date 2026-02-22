import { formatNumber } from "../../utils/number";

export default function EditCountModal({
  open,
  loading,
  data,
  message,
  onClose,
  onChange,
  onSave,
}) {
  if (!open) return null;

  const total =
    Number(data.qtyPerBox || 0) *
      Number(data.boxes || 0) +
    Number(data.openBoxQty || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-lg">
        <h3 className="text-base font-semibold">Edit Count</h3>

        {loading && <div className="py-6 text-center text-xs">Loading…</div>}

        {!loading && data && (
          <div className="space-y-3 mt-3">
            <input className="w-full border p-1 text-center bg-gray-50" value={data.partNo} readOnly />
            <input className="w-full border p-1 text-center bg-gray-50" value={data.location} readOnly />

            <div className="flex gap-2">
              <input
                className="w-full border p-1 text-center"
                value={data.qtyPerBox}
                onChange={(e) => onChange("qtyPerBox", e.target.value)}
              />
              <input
                className="w-full border p-1 text-center"
                value={data.boxes}
                onChange={(e) => onChange("boxes", e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <input
                className="w-full border p-1 text-center"
                value={data.openBoxQty}
                onChange={(e) => onChange("openBoxQty", e.target.value)}
              />
              <input
                className="w-full border p-1 text-center bg-gray-50 font-semibold"
                value={formatNumber(total)}
                readOnly
              />
            </div>

            {message && <div className="text-red-600 text-sm">{message}</div>}

            <button
              onClick={onSave}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}