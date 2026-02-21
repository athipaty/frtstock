// pages/Variance.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://center-kitchen-backend.onrender.com";

const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(n);

export default function Variance() {
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPart, setOpenPart] = useState(null);
  const [openActual, setOpenActual] = useState(null);

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
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">

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
          <div className="text-xs text-gray-500 text-center py-6">
            Loading variance data…
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="space-y-2">
            {[...variances]
              .sort(
                (a, b) =>
                  (a.actual - a.system) -
                  (b.actual - b.system)
              )
              .map((v) => {
                const diff = v.actual - v.system;
                const isOpen = openPart === v.partNo;
                const isActualOpen = openActual === v.partNo;

                return (
                  <div
                    key={v.partNo}
                    className="border rounded-md px-3 py-2"
                  >
                    {/* PART ROW */}
                    <button
                      onClick={() =>
                        setOpenPart(isOpen ? null : v.partNo)
                      }
                      className="w-full flex justify-between items-center text-xs"
                    >
                      <span className="text-gray-700">
                        {v.partNo}
                      </span>

                      <span
                        className={`font-medium ${
                          diff < 0
                            ? "text-red-600"
                            : diff > 0
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {diff < 0 &&
                          `Short ${formatNumber(diff)}`}
                        {diff > 0 &&
                          `Excess +${formatNumber(diff)}`}
                        {diff === 0 && "Matched"}
                      </span>
                    </button>

                    {/* EXPAND PART */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 mt-2" : "max-h-0"
                      }`}
                    >
                      <div className="text-xs text-gray-600 space-y-1 pl-2">
                        <div>
                          System stock:{" "}
                          <span className="font-medium">
                            {formatNumber(v.system)}
                          </span>
                        </div>

                        {/* ACTUAL TOGGLE */}
                        <button
                          onClick={() =>
                            setOpenActual(
                              isActualOpen ? null : v.partNo
                            )
                          }
                          className="flex justify-between w-full text-left"
                        >
                          <span>
                            Actual stock:{" "}
                            <span className="font-medium">
                              {formatNumber(v.actual)}
                            </span>
                          </span>
                          <span className="text-gray-400">
                            {isActualOpen ? "−" : "+"}
                          </span>
                        </button>

                        {/* LOCATION BREAKDOWN */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isActualOpen
                              ? "max-h-64 mt-1"
                              : "max-h-0"
                          }`}
                        >
                          <div className="pl-3 space-y-1">
                            {v.locations?.map((l, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-xs text-gray-500"
                              >
                                <span>{l.location}</span>
                                <span>
                                  {formatNumber(l.qty)}
                                </span>
                              </div>
                            ))}

                            {!v.locations && (
                              <div className="text-gray-400">
                                No location data
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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