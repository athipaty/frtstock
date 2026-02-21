// pages/Variance.jsx
import { useEffect, useState } from "react";

export default function Variance() {
  // placeholder state (wire to real data later)
  const [variances, setVariances] = useState([]);

  useEffect(() => {
    // TODO: fetch variance data
  }, []);

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

        {/* Content */}
        {variances.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No variances found.
          </div>
        ) : (
          <div className="space-y-3">
            {variances.map((v, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 text-sm space-y-1"
              >
                <div className="font-medium text-gray-800">
                  {v.partNo}
                </div>
                <div className="text-gray-600">
                  Actual: {v.actual} / System: {v.system}
                </div>
                <div className="text-red-600 text-xs font-medium">
                  Variance: {v.actual - v.system}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}