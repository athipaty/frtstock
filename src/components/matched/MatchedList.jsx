import { formatNumber } from "../../utils/number";

export default function MatchedList({ matched, openPart, togglePart }) {
  if (matched.length === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-6 italic">
        No matched parts found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...matched]
        .sort((a, b) => a.partNo.localeCompare(b.partNo))
        .map((v) => {
          const isOpen = openPart === v.partNo;

          return (
            <div key={v.partNo} className="border rounded-md px-3 py-2">
              {/* PART ROW */}
              <button
                onClick={() => togglePart(v.partNo)}
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="text-gray-700">{v.partNo}</span>
                <span className="font-medium text-green-600">✓ Matched</span>
              </button>

              {/* EXPAND */}
              {isOpen && (
                <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 animate-fade-in">
                  <div className="flex justify-between">
                    <span>System stock</span>
                    <span className="font-medium">
                      {formatNumber(v.system)}
                    </span>
                  </div>
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
                          <div
                            key={i}
                            className="flex justify-between text-xs text-gray-500 border-b last:border-b-0 pb-1"
                          >
                            <div className="font-medium text-gray-700 flex-1">
                              {l.location}
                            </div>
                            <div className="flex-1 text-[11px]">
                              {l.boxes > 0 && (
                                <span>
                                  {l.qtyPerBox} × {l.boxes}
                                </span>
                              )}
                              {l.openBoxQty > 0 && (
                                <span>
                                  {l.boxes > 0 && " + "}
                                  {l.openBoxQty}
                                </span>
                              )}
                              {l.boxes === 0 && l.openBoxQty === 0 && (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                            <div className="font-semibold text-gray-800 flex-1 text-right">
                              {formatNumber(l.totalQty)}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-gray-400 italic">
                        Location not recorded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
