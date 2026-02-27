import LocationRow from "./LocationRow";
import { formatNumber } from "../../utils/number";

export default function VarianceList({
  variances,
  openPart,
  togglePart,
  onEditLocation,
  search,
}) {
  return (
    <div className="space-y-2">
      {[...variances]
        .sort((a, b) => {
          // ✅ matched parts float to top, rest sorted by variance
          const aMatch = a.partNo.toLowerCase().includes(search.toLowerCase());
          const bMatch = b.partNo.toLowerCase().includes(search.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return a.actual - a.system - (b.actual - b.system);
        })
        .map((v) => {
          const diff = v.actual - v.system;
          const isOpen = openPart === v.partNo;

          return (
            <div key={v.partNo} className="border rounded-md px-3 py-2">
              {/* PART ROW */}
              <button
                onClick={() => togglePart(v.partNo)}
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="text-gray-700">{v.partNo}</span>

                <span
                  className={`font-medium ${
                    diff < 0
                      ? "text-red-600"
                      : diff > 0
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  {diff < 0 && formatNumber(diff)}
                  {diff > 0 && `+${formatNumber(diff)}`}
                  {diff === 0 && "Matched"}
                </span>
              </button>

              {/* EXPAND PART */}
              {isOpen && (
                <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 animate-fade-in">
                  {/* ✅ SYSTEM STOCK */}
                  <div className="flex justify-between">
                    <span>System stock</span>
                    <span className="font-medium">
                      {formatNumber(v.system)}
                    </span>
                  </div>

                  {/* ✅ ACTUAL STOCK */}
                  <div className="flex justify-between">
                    <span>Actual stock</span>
                    <span className="font-medium">
                      {formatNumber(v.actual)}
                    </span>
                  </div>

                  {/* LOCATIONS */}
                  <div className="pt-1 border-t space-y-1">
                    {v.locations?.length > 0 ? (
                      [...v.locations]
                        .sort((a, b) => a.location.localeCompare(b.location)) // ✅ A-Z
                        .map((l, i) => (
                          <LocationRow
                            key={i}
                            partNo={v.partNo}
                            data={l}
                            onEdit={onEditLocation}
                          />
                        ))
                    ) : (
                      <div className="text-gray-400 italic">
                        Location not recorded
                      </div>
                    )}
                  </div>

                  {/* ✅ PREVIOUS DIFF */}
                  {(v.diffN1 != null ||
                    v.diffN2 != null ||
                    v.price != null) && (
                    <div className="pt-1 border-t space-y-1 text-xs text-gray-500">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        Previous Differences
                      </div>

                      <div className="flex justify-between">
                        <span>Diff Count N-1</span>
                        <span
                          className={`font-medium ${
                            (v.diffN1 ?? 0) < 0
                              ? "text-red-500"
                              : (v.diffN1 ?? 0) > 0
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        >
                          {v.diffN1 == null
                            ? "—"
                            : v.diffN1 > 0
                              ? `+${formatNumber(v.diffN1)}`
                              : formatNumber(v.diffN1)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Diff Count N-2</span>
                        <span
                          className={`font-medium ${
                            (v.diffN2 ?? 0) < 0
                              ? "text-red-500"
                              : (v.diffN2 ?? 0) > 0
                                ? "text-green-500"
                                : "text-gray-400"
                          }`}
                        >
                          {v.diffN2 == null
                            ? "—"
                            : v.diffN2 > 0
                              ? `+${formatNumber(v.diffN2)}`
                              : formatNumber(v.diffN2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
