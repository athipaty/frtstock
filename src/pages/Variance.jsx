// pages/Variance.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(n);

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVariance();
  }, []);

  const loadVariance = async () => {
    try {
      const res = await axios.get(`${API}/count/variance`);
      setVariances(res.data);
    } catch (err) {
      console.error("Failed to load variance data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6">

        {/* Header */}
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
          <div className="text-sm text-gray-500 text-center py-8">
            Loading variance data…
          </div>
        )}

        {/* Empty */}
        {!loading && variances.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8">
            No variances found.
          </div>
        )}

        {/* Variance List */}
        {!loading && variances.length > 0 && (
          <div className="space-y-3">
            {variances.map((v, index) => {
              const diff = v.actual - v.system;
              const isShort = diff < 0;
              const isExcess = diff > 0;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-sm space-y-1"
                >
                  
<div className="flex justify-between items-center text-xs">
  {/* Part No */}
  <span className="text-gray-700">
    {v.partNo}
  </span>

  {/* Result */}
  <span
    className={`font-medium ${
      v.actual - v.system < 0
        ? "text-red-600"
        : v.actual - v.system > 0
        ? "text-green-600"
        : "text-gray-500"
    }`}
  >
    {v.actual - v.system < 0 &&
      `Short ${formatNumber(v.actual - v.system)}`}
    {v.actual - v.system > 0 &&
      `Excess +${formatNumber(v.actual - v.system)}`}
    {v.actual - v.system === 0 && "Matched"}
  </span>
</div>
                  

                  
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}