// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

export default function Dashboard() {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [countStatus, setCountStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const [uploadRes, countRes] = await Promise.all([
        axios.get(`${API}/upload/status`),
        axios.get(`${API}/count/status`),
      ]);

      setUploadStatus(uploadRes.data);
      setCountStatus(countRes.data);
    } catch {
      // silently fail for now
    }
  };

  const readyToCount =
    uploadStatus?.systemStock.uploaded &&
    uploadStatus?.locationList.uploaded;

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">

        {/* Title */}
        <h1 className="text-xl font-bold">Dashboard</h1>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="bg-white rounded shadow p-3 space-y-1 text-sm">
            <div className="font-semibold text-gray-600">Upload Status</div>

            <div>
              System Stock:{" "}
              {uploadStatus.systemStock.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({uploadStatus.systemStock.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>

            <div>
              Tag List:{" "}
              {uploadStatus.tagList.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({uploadStatus.tagList.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>

            <div>
              Location List:{" "}
              {uploadStatus.locationList.uploaded ? (
                <span className="text-blue-700">
                  Uploaded ({uploadStatus.locationList.count})
                </span>
              ) : (
                <span className="text-red-600">Not uploaded</span>
              )}
            </div>
          </div>
        )}

        {/* Counting Progress */}
        {countStatus && (
          <div className="bg-white rounded shadow p-3 text-sm space-y-1">
            <div className="font-semibold text-gray-600">
              Counting Progress
            </div>

            <div>
              {countStatus.counted} / {countStatus.total} tags counted
            </div>

            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{
                  width: `${
                    countStatus.total
                      ? Math.round(
                          (countStatus.counted / countStatus.total) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded shadow p-3 space-y-2">
          <div className="font-semibold text-gray-600 text-sm">
            Quick Actions
          </div>

          <button
            onClick={() => navigate("/upload")}
            className="w-full border py-2 rounded text-sm"
          >
            Go to Upload
          </button>

          <button
            onClick={() => navigate("/count")}
            disabled={!readyToCount}
            className={`w-full py-2 rounded text-sm ${
              readyToCount
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            Start Counting
          </button>

          <button
            onClick={() => navigate("/variance")}
            className="w-full border py-2 rounded text-sm"
          >
            View Result
          </button>
        </div>
      </div>
    </div>
  );
}