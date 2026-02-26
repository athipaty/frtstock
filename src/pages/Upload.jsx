import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Upload() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab"); // "system" | "tags" | "locations"

  // auto scroll to the right section
  useEffect(() => {
    if (tab) {
      const el = document.getElementById(tab);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tab]);

  // ... rest of your existing code

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 animate-fade-in">
        
        {/* System Stock */}
        <div id="system" className="space-y-1 scroll-mt-4">  {/* ✅ add id */}
          ...
        </div>

        {/* Tag List */}
        <div id="tags" className="space-y-1 scroll-mt-4">  {/* ✅ add id */}
          ...
        </div>

        {/* Location List */}
        <div id="locations" className="space-y-1 scroll-mt-4">  {/* ✅ add id */}
          ...
        </div>

      </div>
    </div>
  );
}