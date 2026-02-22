import LocationRow from "./LocationRow";
import { formatNumber } from "../../utils/number";

export default function VarianceList({
  variances,
  openPart,
  togglePart,
  onEditLocation,
}) {
  return (
    <div className="space-y-2">
      {variances.map((v) => {
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
              <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2">

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
                    v.locations.map((l, i) => (
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}