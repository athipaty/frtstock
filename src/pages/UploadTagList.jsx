import { useMemo, useRef, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function UploadTagList() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState([]);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return { name: file.name, sizeMB: (file.size / (1024 * 1024)).toFixed(2) };
  }, [file]);

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError("");
    setDetails([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPickFile = (f) => {
    setResult(null);
    setError("");
    setDetails([]);
    if (!f) return setFile(null);
    const isXlsx =
      f.name.toLowerCase().endsWith(".xlsx") ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
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
    try {
      setUploading(true);
      setError("");
      setDetails([]);
      setResult(null);
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/upload/tags`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ inserted: res.data?.count ?? 0 });
    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed";
      const det = err.response?.data?.details || [];
      setError(msg);
      setDetails(Array.isArray(det) ? det : []);
    } finally {
      setUploading(false);
    }
  };

  const clearAll = async () => {
    try {
      setClearing(true);
      setClearResult(null);
      setError("");
      setShowConfirm(false);
      const res = await axios.delete(`${API}/upload/tags`);
      setClearResult(res.data?.deleted ?? 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to clear data");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-2xl mx-auto space-y-4 animate-fade-in">
        {/* ── Header ── */}
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
            Upload Tag List
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            Upload the list of inventory tags used in the stock count.
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3">
          <span className="text-green-400 text-lg mt-0.5">ℹ</span>
          <div className="text-xs text-green-700 space-y-1">
            <div className="font-semibold">Used to track counting progress</div>
            <div className="text-green-500">
              Each tag number represents a physical count sheet. Uploading this
              list allows the system to track which tags have been counted and
              which are still outstanding.
            </div>
          </div>
        </div>

        {/* ── Format guide ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Required Format
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-semibold rounded-lg">
                    tagNo
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">
                    TAG-0001
                  </td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">
                    TAG-0002
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-400">…</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-gray-400">
            Each row represents one tag number used during the physical count.
          </div>
        </div>

        {/* ── Upload card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Select File
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
              file
                ? "border-green-300 bg-green-50/30"
                : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPickFile(e.dataTransfer.files?.[0]);
            }}
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
                <div className="text-sm font-semibold text-green-600">
                  {fileInfo.name}
                </div>
                <div className="text-xs text-gray-400">
                  {fileInfo.sizeMB} MB
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs text-red-400 hover:text-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAll();
                  }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl">📂</div>
                <div className="text-sm font-medium text-gray-500">
                  Click or drag & drop
                </div>
                <div className="text-xs text-gray-400">.xlsx files only</div>
              </div>
            )}
          </div>

          {/* Buttons */}
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={upload}
              disabled={!file || uploading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${
                !file || uploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Uploading…
                </span>
              ) : (
                "Upload"
              )}
            </button>
            <button
              onClick={resetAll}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setClearResult(null);
                setShowConfirm(true);
              }}
              disabled={clearing || uploading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                clearing || uploading
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
              }`}
            >
              {clearing ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Clearing...
                </span>
              ) : (
                "Clear Data"
              )}
            </button>
          </div>
        </div>

        {/* Confirm clear card */}
        {showConfirm && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🗑️</span>
              </div>
              <div>
                <div className="text-sm font-bold text-red-600">
                  Clear All Tag Data?
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  This will permanently delete{" "}
                  <span className="font-semibold text-gray-700">
                    all tag records
                  </span>{" "}
                  from the system. This action cannot be undone.
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl px-3 py-2 text-xs text-red-500 flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Counting progress will no longer be tracked until you re-upload
                the tag list.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Success result ── */}
        {result && (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✅</span>
              <div>
                <div className="text-sm font-semibold text-green-700">
                  Upload completed
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-700">
                    {result.inserted}
                  </span>{" "}
                  tags uploaded successfully
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear success */}
        {clearResult !== null && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-lg">🗑️</span>
              <div>
                <div className="text-sm font-semibold text-orange-700">
                  Data cleared
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-700">
                    {clearResult}
                  </span>{" "}
                  tags removed from the system
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Error result ── */}
        {error && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">❌</span>
              <div className="text-sm font-semibold text-red-700">{error}</div>
            </div>
            {details.length > 0 && (
              <div className="mt-2 bg-red-50 rounded-xl p-3 max-h-40 overflow-auto space-y-1">
                {details.slice(0, 50).map((d, i) => (
                  <div key={i} className="text-xs text-red-600">
                    • {d}
                  </div>
                ))}
                {details.length > 50 && (
                  <div className="text-[11px] text-red-400 pt-1">
                    Showing first 50 errors…
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
