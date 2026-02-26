import { formatNumber } from "../../utils/number";

export default function UncountedList({ uncounted, openPart, togglePart }) {
  if (uncounted.length === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-6 italic">
        All parts have been counted! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...uncounted]
        .sort((a, b) => a.partNo.localeCompare(b.partNo))
        .map((v) => {
          const isOpen = openPart === v.partNo;

          return (
            <div key={v.partNo} className="border rounded-md px-3 py-2">
              <button
                onClick={() => togglePart(v.partNo)}
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="text-gray-700">{v.partNo}</span>
                <span className="font-medium text-orange-500">⚠ Not counted</span>
              </button>

              {isOpen && (
                <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 animate-fade-in">
                  <div className="flex justify-between">
                    <span>System stock</span>
                    <span className="font-medium">{formatNumber(v.system)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual stock</span>
                    <span className="font-medium text-orange-500">0 (not counted)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}