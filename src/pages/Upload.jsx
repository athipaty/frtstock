// pages/Upload.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function Upload() {
  const [systemFile, setSystemFile] = useState(null);
  const [tagFile, setTagFile] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [locationFile, setLocationFile] = useState(null);

  const loadStatus = async () => {
    try {
      const res = await axios.get(`${API}/upload/status`);
      setStatus(res.data);
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const uploadFile = async (file, endpoint) => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${API}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Upload successful");
      loadStatus(); // 👈 refresh status after upload
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6
                animate-fade-in">
                  {/* Header */}
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Upload master data
            </h2>
            <p className="text-xs text-gray-500">
              
            </p>
          </div>

        {/* STATUS */}
        {status && (
          <div className="text-sm space-y-1">
            <div>
              System Stock:{" "}
              {status.systemStock.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({status.systemStock.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>

            <div>
              Tag List:{" "}
              {status.tagList.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({status.tagList.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>

            <div>
              Location List:{" "}
              {status.locationList.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({status.locationList.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>
          </div>
        )}

        <hr />

        {/* System Stock Upload */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            System Stock (Excel)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setSystemFile(e.target.files[0])}
            className="w-full text-sm"
          />
          <button
            onClick={() => uploadFile(systemFile, "/upload/system-stock")}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm"
          >
            Upload System Stock
          </button>
        </div>

        <hr />

        {/* Tag List Upload */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Tag List (Excel)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setTagFile(e.target.files[0])}
            className="w-full text-sm"
          />
          <button
            onClick={() => uploadFile(tagFile, "/upload/tags")}
            className="w-full bg-green-600 text-white py-2 rounded text-sm"
          >
            Upload Tag List
          </button>
        </div>

        <hr />

        {/* Location List Upload */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Location List (Excel)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setLocationFile(e.target.files[0])}
            className="w-full text-sm"
          />
          <button
            onClick={() => uploadFile(locationFile, "/upload/locations")}
            className="w-full bg-purple-600 text-white py-2 rounded text-sm"
          >
            Upload Location List
          </button>
        </div>

        {message && (
          <div
            className={`text-center text-sm p-2 rounded ${
              message === "Upload successful"
                ? "text-blue-700 bg-blue-50"
                : "text-red-700 bg-red-50"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
