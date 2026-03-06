import { useMemo, useRef, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function UploadStocktake() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState([]);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return { name: file.name, sizeMB: (file.size / (1024 * 1024)).toFixed(2) };
  }, [file]);

  const resetAll = () => {
    setFile(null); setConfirm(false); setResult(null); setError(""); setDetails([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPickFile = (f) => {
    setResult(null); setError(""); setDetails([]); setConfirm(false);
    if (!f) return setFile(null);
    const isXlsx = f.name.toLowerCase().endsWith(".xlsx") ||
      f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isXlsx) {
      setFile(null);
      setError("Please upload an .xlsx Excel file");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return setError("Please choose an Excel file first");
    if (!confirm) return setError("Please confirm you understand this will replace ALL counts");
    try {
      setUploading(true); setError(""); setDetails([]); setResult(null);
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/count/upload-stocktake`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ inserted: res.data?.inserted ?? 0, deleted: res.data?.deleted ?? 0, merged: res.data?.merged ?? 0 });
    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed";
      const det = err.response?.data?.details || [];
      setError(msg); setDetails(Array.isArray(det) ? det : []);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-2xl mx-auto space-y-4 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">Upload Stock Take</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            Replace all existing counted data with the uploaded Excel file.
          </p>
        </div>

        {/* Danger banner */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
          <span className="text-red-500 text-lg mt-0.5">🗑</span>
          <div className="text-xs text-red-700 space-y-1">
            <div className="font-semibold">Strict Replace Mode</div>
            <div className="text-red-500">
              This will permanently delete ALL existing count records and replace them with the content of the uploaded file. This action cannot be undone.
            </div>
          </div>
        </div>

        {/* Format guide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Required Format</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-semibold">tagNo</th>
                  <th className="text-left px-3 py-2 font-semibold">partNo</th>
                  <th className="text-left px-3 py-2 font-semibold">location</th>
                  <th className="text-left px-3 py-2 font-semibold">qtyPerBox</th>
                  <th className="text-left px-3 py-2 font-semibold">boxes</th>
                  <th className="text-left px-3 py-2 font-semibold">openBoxQty</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">T-001</td>
                  <td className="px-3 py-2 font-mono text-gray-700">ABC-001</td>
                  <td className="px-3 py-2 font-mono text-gray-700">A-01-01</td>
                  <td className="px-3 py-2 font-mono text-gray-700">100</td>
                  <td className="px-3 py-2 font-mono text-gray-700">5</td>
                  <td className="px-3 py-2 font-mono text-gray-700">25</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">T-002</td>
                  <td className="px-3 py-2 font-mono text-gray-700">XYZ-002</td>
                  <td className="px-3 py-2 font-mono text-gray-700">B-02-01</td>
                  <td className="px-3 py-2 font-mono text-gray-700">50</td>
                  <td className="px-3 py-2 font-mono text-gray-700">10</td>
                  <td className="px-3 py-2 font-mono text-gray-700">0</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-400">
            boxes must be an integer. totalQty is calculated automatically by the server.
          </div>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select File</div>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
              file
                ? "border-blue-300 bg-blue-50/30"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPickFile(e.dataTransfer.files?.[0]); }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            {file ? (
              <div className="space-y-1">
                <div className="text-2xl">📄</div>
                <div className="text-sm font-semibold text-blue-600">{fileInfo.name}</div>
                <div className="text-xs text-gray-400">{fileInfo.sizeMB} MB</div>
                <button
                  type="button"
                  className="mt-2 text-xs text-red-400 hover:text-red-600 transition"
                  onClick={(e) => { e.stopPropagation(); resetAll(); }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl">📂</div>
                <div className="text-sm font-medium text-gray-500">Click or drag and drop</div>
                <div className="text-xs text-gray-400">.xlsx files only</div>
              </div>
            )}
          </div>

          {/* Confirm checkbox */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
            confirm ? "border-red-300 bg-red-50/50" : "border-gray-100 bg-gray-50 hover:border-red-200"
          }`}>
            <input
              type="checkbox"
              className="mt-0.5 accent-red-500"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
              disabled={!file || uploading}
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              I understand this upload will <span className="font-semibold text-red-600">delete ALL existing counts</span> and replace them with the Excel content. This cannot be undone.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={upload}
              disabled={!file || !confirm || uploading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${
                !file || !confirm || uploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Uploading...
                </span>
              ) : "Upload and Replace All"}
            </button>
            <button
              onClick={resetAll}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Success */}
        {result && (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✅</span>
              <div className="text-sm font-semibold text-green-700">Upload completed</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-red-500">{result.deleted}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">deleted</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-600">{result.inserted}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">inserted</div>
              </div>
              <div className={`rounded-xl p-3 text-center ${result.merged > 0 ? "bg-orange-50" : "bg-gray-50"}`}>
                <div className={`text-lg font-bold ${result.merged > 0 ? "text-orange-500" : "text-gray-300"}`}>
                  {result.merged}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">merged</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">❌</span>
              <div className="text-sm font-semibold text-red-700">{error}</div>
            </div>
            {details.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3 max-h-40 overflow-auto space-y-1">
                {details.slice(0, 50).map((d, i) => (
                  <div key={i} className="text-xs text-red-600">• {d}</div>
                ))}
                {details.length > 50 && (
                  <div className="text-xs text-red-400 pt-1">Showing first 50 errors...</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}