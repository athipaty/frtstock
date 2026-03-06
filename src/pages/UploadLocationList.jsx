import { useMemo, useRef, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function UploadLocationList() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState([]);

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
      const res = await axios.post(`${API}/upload/locations`, form, {
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-md md:max-w-2xl mx-auto space-y-4 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
            Upload Location List
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            Upload the list of warehouse locations for stock counting.
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex gap-3">
          <span className="text-purple-400 text-lg mt-0.5">ℹ</span>
          <div className="text-xs text-purple-700 space-y-1">
            <div className="font-semibold">
              Used to validate count locations
            </div>
            <div className="text-purple-500">
              Only locations in this list are recognized during stock counting.
              Parts counted at unregistered locations may be flagged or
              rejected.
            </div>
          </div>
        </div>
        
        {/* Format guide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Required Format
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-semibold rounded-lg">
                    location
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">A-01-01</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-700">A-01-02</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-400">...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-400">
            Each row represents one warehouse location code.
          </div>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Select File
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
              file
                ? "border-purple-300 bg-purple-50/30"
                : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
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
                <div className="text-sm font-semibold text-purple-600">
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
                  Click or drag and drop
                </div>
                <div className="text-xs text-gray-400">.xlsx files only</div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={upload}
              disabled={!file || uploading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${
                !file || uploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
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
                  Uploading...
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
          </div>
        </div>

        {/* Success */}
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
                  locations uploaded successfully
                </div>
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
                  <div key={i} className="text-xs text-red-600">
                    • {d}
                  </div>
                ))}
                {details.length > 50 && (
                  <div className="text-xs text-red-400 pt-1">
                    Showing first 50 errors...
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
