import LocationRow from "./LocationRow";
import { formatNumber } from "../../utils/number";

export default function VarianceList({
  variances,
  openPart,
  togglePart,
  onEditLocation,
}) {
  return variances.map((v) => {
    const diff = v.actual - v.system;
    const isOpen = openPart === v.partNo;

    return (
      <div key={v.partNo} className="border rounded-md px-3 py-2">
        <button
          onClick={() => togglePart(v.partNo)}
          className="w-full flex justify-between text-xs"
        >
          <span>{v.partNo}</span>
          <span className={diff < 0 ? "text-red-600" : "text-green-600"}>
            {diff === 0 ? "Matched" : formatNumber(diff)}
          </span>
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1">
            {v.locations.map((l, i) => (
              <LocationRow
                key={i}
                partNo={v.partNo}
                data={l}
                onEdit={onEditLocation}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
}