import { formatNumber } from "../../utils/number";

export default function MatchedList({ matched, openPart, togglePart }) {
  if (matched.length === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-6 italic">
        No matched parts found.
      </div>
    );
  }

  const DiffValue = ({ value }) => {
    if (value == null) return <span className="text-gray-300">—</span>;
    return (
      <span className={value < 0 ? "text-red-500" : value > 0 ? "text-green-500" : "text-gray-400"}>
        {value > 0 ? `+${formatNumber(value)}` : formatNumber(value)}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {[...matched]
        .sort((a, b) => a.partNo.localeCompare(b.partNo))
        .map((v) => {
          const isOpen = openPart === v.partNo;
          const hasPrevGap = (v.diffN1 != null && v.diffN1 !== 0) || (v.diffN2 != null && v.diffN2 !== 0);

          return (
            <div key={v.partNo} className={`border rounded-md px-3 py-2 ${hasPrevGap ? "border-yellow-200 bg-yellow-50/30" : ""}`}>
              <button
                onClick={() => togglePart(v.partNo)}
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="text-gray-700">{v.partNo}</span>
                <div className="flex items-center gap-2">
                  {hasPrevGap && (
                    <span className="text-[10px] text-yellow-500 font-medium">prev gap</span>
                  )}
                  <span className="font-medium text-green-600">✓ Matched</span>
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 space-y-1 text-xs text-gray-600 pl-2 animate-fade-in">

                  {/* Qty */}
                  <div className="flex justify-between">
                    <span>System stock</span>
                    <span className="font-medium">{formatNumber(v.system)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual stock</span>
                    <span className="font-medium text-green-600">{formatNumber(v.actual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diff</span>
                    <span className="font-medium text-green-500">0</span>
                  </div>

                  {/* Locations */}
                  {v.locations?.length > 0 && (
                    <div className="pt-1 border-t border-gray-100 space-y-1">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Locations</div>
                      {[...v.locations]
                        .sort((a, b) => a.location.localeCompare(b.location))
                        .map((l, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-500 border-b last:border-b-0 pb-1">
                            <div className="font-medium text-gray-700 flex-1">{l.location}</div>
                            <div className="flex-1 text-[11px]">
                              {l.boxes > 0 && <span>{l.qtyPerBox} × {l.boxes}</span>}
                              {l.openBoxQty > 0 && <span>{l.boxes > 0 && " + "}{l.openBoxQty}</span>}
                              {l.boxes === 0 && l.openBoxQty === 0 && <span className="text-gray-400">—</span>}
                            </div>
                            <div className="font-semibold text-gray-800 flex-1 text-right">
                              {formatNumber(l.totalQty)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Previous Diff history */}
                  {(v.diffN1 != null || v.diffN2 != null) && (
                    <div className="pt-1 border-t border-gray-100 space-y-1 mt-1">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        Previous Differences
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">N-1 Diff</span>
                        <DiffValue value={v.diffN1} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">N-2 Diff</span>
                        <DiffValue value={v.diffN2} />
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