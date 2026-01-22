"use client";

import Aurora from "./ui/aurora/Aurora";

export default function PageLayoutBackground() {
  return (
    <div className="absolute inset-0 -z-50 opacity-50">
      <Aurora amplitude={1} colorStops={["#0f5105", "#B19EEF", "#5227FF"]} blend={0.5} />
    </div>
  );
}