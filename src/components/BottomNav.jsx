import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUpload,
  FiEdit,
  FiBarChart2,
} from "react-icons/fi";

export default function BottomNav() {
  const location = useLocation();

  const items = [
    { to: "/", label: "Dashboard", icon: <FiHome /> },
    { to: "/upload", label: "Upload", icon: <FiUpload /> },
    { to: "/count", label: "Count", icon: <FiEdit /> },
    { to: "/variance", label: "Result", icon: <FiBarChart2 /> },
    { to: "/upload-stocktake", label: "Add", icon: <FiUpload /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm">
      <div className="flex justify-around text-xs">
        {items.map((item) => {
          const active =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-2 ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              <div>{item.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}