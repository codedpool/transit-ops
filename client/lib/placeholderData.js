// PLACEHOLDER data for the dashboard UI only.
// Replace every export here with live calls to the Express API once endpoints land.

export const kpis = [
  { label: "Active Vehicles", value: 53, accent: "sky" },
  { label: "Available Vehicles", value: 42, accent: "emerald" },
  { label: "Vehicles in Maintenance", value: 5, accent: "amber" },
  { label: "Active Trips", value: 18, accent: "sky" },
  { label: "Pending Trips", value: 9, accent: "sky" },
  { label: "Drivers on Duty", value: 26, accent: "sky" },
  { label: "Fleet Utilization", value: "81%", accent: "emerald" },
];

export const recentTrips = [
  { id: "TR0012", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
  { id: "TR0011", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "—" },
  { id: "TR0010", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "1h 10m" },
  { id: "TR0009", vehicle: "—", driver: "—", status: "Draft", eta: "Awaiting vehicle" },
];

export const vehicleStatus = [
  { label: "Available", value: 42, color: "emerald" },
  { label: "On Trip", value: 18, color: "sky" },
  { label: "In Shop", value: 5, color: "amber" },
  { label: "Retired", value: 3, color: "rose" },
];
