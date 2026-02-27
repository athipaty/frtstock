import { formatNumber } from "../../utils/number";

export default function EditCountModal({
  open,
  loading,
  data,
  message,
  onClose,
  onChange,
  onSave,
  onDelete, // ✅ add this prop
}) {
  if (!open) return null;

  const inputCls = "w-full border px-2 py-1 rounded text-center";
  const labelCls = "text-xs font-medium text-gray-400";

  const qtyPerBoxNum = Number(data?.qtyPerBox || 0);
  const boxesNum = Number(data?.boxes || 0);
  const openBoxNum = Number(data?.openBoxQty || 0);
  const totalQty = qtyPerBoxNum * boxesNum + openBoxNum;

  const handleDelete = () => {
    const confirm = window.confirm(
      `⚠️ Delete count for ${data?.partNo} at ${data?.location}?\n\nThis cannot be undone.`,
    );
    if (confirm) onDelete?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Edit Count
              </h2>
              <p className="text-xs text-gray-500">
                Update counts by box for this location.
              </p>
            </div>
            <button
              className="text-gray-500 text-lg leading-none px-2"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {loading && (
            <div className="text-xs text-gray-500 text-center py-6">
              Loading…
            </div>
          )}

          {!loading && data && (
            <>
              <div className="flex items-center space-x-4">
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Tag No</label>
                  <input
                    className={`${inputCls} bg-gray-50 text-gray-700`}
                    value={data.tagNo || ""}
                    onChange={(e) => onChange("tagNo", e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Location</label>
                  <input
                    className={`${inputCls} bg-gray-50 text-gray-700`}
                    value={data.location || ""}
                    onChange={(e) => onChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Part No</label>
                <input
                  className={`${inputCls} bg-gray-50 text-gray-700`}
                  value={data.partNo || ""}
                  onChange={(e) => onChange("partNo", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Qty / Box</label>
                  <input
                    className={inputCls}
                    placeholder="300"
                    value={data.qtyPerBox ?? ""}
                    onChange={(e) => onChange("qtyPerBox", e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Boxes</label>
                  <input
                    className={inputCls}
                    placeholder="2"
                    value={data.boxes ?? ""}
                    onChange={(e) => onChange("boxes", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Open / Remaining Box</label>
                  <input
                    className={inputCls}
                    placeholder="0"
                    value={data.openBoxQty ?? "0"}
                    onFocus={() => {
                      if (String(data.openBoxQty) === "0")
                        onChange("openBoxQty", "");
                    }}
                    onBlur={() => {
                      if (data.openBoxQty === "") onChange("openBoxQty", "0");
                    }}
                    onChange={(e) => onChange("openBoxQty", e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className={labelCls}>Total Qty</label>
                  <input
                    className="w-full border px-2 py-1 rounded text-center bg-gray-50 font-semibold"
                    value={formatNumber(totalQty)}
                    readOnly
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`text-center text-sm p-2 rounded ${
                    message.toLowerCase().includes("success")
                      ? "text-blue-700 bg-blue-50"
                      : message.includes("⚠️")
                        ? "text-orange-700 bg-orange-50 border border-orange-200"
                        : "text-red-700 bg-red-50"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Save button */}
              <div className="pt-1">
                <button
                  onClick={onSave}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold"
                >
                  Save
                </button>
              </div>

              {/* Delete button - bottom right, light gray */}
              {onDelete && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gray-400 hover:text-red-400 transition"
                  >
                    Delete this record
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
