import { useRef, useState } from "react";

export default function SwipeRow({ onEdit, children }) {
  const startRef = useRef({ x: 0, active: false });
  const [dx, setDx] = useState(0);

  const THRESHOLD = 70;
  const MAX = 110;

  const onTouchStart = (e) => {
    startRef.current.x = e.touches[0].clientX;
    startRef.current.active = true;
    setDx(0);
  };

  const onTouchMove = (e) => {
    if (!startRef.current.active) return;
    const delta = e.touches[0].clientX - startRef.current.x;
    setDx(Math.max(0, Math.min(MAX, delta)));
  };

  const onTouchEnd = () => {
    if (!startRef.current.active) return;
    startRef.current.active = false;

    if (dx >= THRESHOLD) onEdit?.();
    setDx(0);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center pl-3 bg-blue-50 text-blue-700 text-xs font-semibold">
        Edit
      </div>

      <div
        className="relative bg-white"
        style={{ transform: `translateX(${dx}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}