import { useMemo, useRef, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function UploadSystemStock() {
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
    setFile(null); setResult(null); setError(""); setDetails([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPickFile = (f) => {
    setResult(null); setError(""); setDetails([]);
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
    try {
      setUploading(true); setError(""); setDetails([]); setResult(null);
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/upload/system-stock`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ inserted: res.data?.count ?? 0 });
    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed";
      const det = err.response?.data?.details || [];
      setError(msg); setDetails(Array.isArray(det) ? det : []);
    } finally {
      setUploading(false);
    }
  };

  const labelCls = "text-xs font-medium text-gray-400";

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 animate-fade-in">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Upload System Stock</h2>
          <p className="text-xs text-gray-500">Upload system stock data to compare against physical counts.</p>
        </div>

        <div className="rounded border bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
          <div className="font-semibold text-gray-600">Excel columns required</div>
          <div className="font-mono">partNo, systemQty</div>
          <div className="text-[11px] text-gray-500">Each row represents one part number and its system quantity.</div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Excel file (.xlsx)</label>
          <input ref={inputRef} type="file" accept=".xlsx" className="w-full text-xs"
            onChange={(e) => onPickFile(e.target.files?.[0])} />
          {fileInfo && (
            <div className="mt-2 rounded border p-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">File</span>
                <button type="button" className="text-blue-600" onClick={resetAll}>Clear</button>
              </div>
              <div className="mt-1">
                <div><span className="text-gray-500">Name:</span> {fileInfo.name}</div>
                <div><span className="text-gray-500">Size:</span> {fileInfo.sizeMB} MB</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={upload} disabled={!file || uploading}
            className={`flex-1 py-2 rounded text-white text-sm ${!file || uploading ? "bg-gray-400" : "bg-blue-600"}`}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={resetAll} disabled={uploading} className="px-3 py-2 rounded text-sm border">Reset</button>
        </div>

        {result && (
          <div className="mt-2 rounded border border-green-200 bg-green-50 p-3 text-sm">
            <div className="text-green-700 font-medium">✅ Upload completed</div>
            <div className="mt-1 text-gray-700 text-xs">
              <div><span className="font-medium">Records uploaded:</span> {result.inserted}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-3 text-sm">
            <div className="text-red-700 font-medium">❌ {error}</div>
            {details.length > 0 && (
              <div className="mt-2 text-xs text-red-700 space-y-1 max-h-40 overflow-auto">
                {details.slice(0, 50).map((d, i) => <div key={i}>• {d}</div>)}
                {details.length > 50 && <div className="text-[11px] text-red-600">Showing first 50 errors…</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}