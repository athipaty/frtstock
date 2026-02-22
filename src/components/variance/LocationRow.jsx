import SwipeRow from "./SwipeRow";
import { formatNumber } from "../../utils/number";

export default function LocationRow({ partNo, data, onEdit }) {
  const { location, qtyPerBox, boxes, openBoxQty, totalQty } = data;

  return (
    <SwipeRow onEdit={() => onEdit(partNo, location)}>
      <div className="text-xs text-gray-500 border-b last:border-b-0 pb-1">
        <div className="flex justify-between">
          <div className="font-medium text-gray-700 flex-1">
            {location}
          </div>

          <div className="flex-1 text-[11px]">
            {boxes > 0 && <span>{qtyPerBox} × {boxes}</span>}
            {openBoxQty > 0 && <span>{boxes > 0 && " + "}{openBoxQty}</span>}
            {boxes === 0 && openBoxQty === 0 && (
              <span className="text-gray-400">—</span>
            )}
          </div>

          <div className="font-semibold text-gray-800 flex-1 text-right">
            {formatNumber(totalQty)}
          </div>
        </div>
      </div>
    </SwipeRow>
  );
}