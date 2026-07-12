"use client";

import { useState } from "react";

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[150px] rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-900">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar() {
  // Local state for now; will drive server queries once the API is wired.
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");

  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        label="Vehicle Type"
        value={type}
        onChange={setType}
        options={["All", "Van", "Truck", "Mini", "Car", "Bus"]}
      />
      <Select
        label="Status"
        value={status}
        onChange={setStatus}
        options={["All", "Available", "On Trip", "In Shop", "Retired"]}
      />
      <Select
        label="Region"
        value={region}
        onChange={setRegion}
        options={["All", "North", "South", "East", "West"]}
      />
    </div>
  );
}
