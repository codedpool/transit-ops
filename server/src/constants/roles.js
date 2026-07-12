// The four roles named in the PDF (Section 2). These strings match the
// Prisma `RoleName` enum exactly, so they are the single source of truth for
// role identity across the DB, tokens, and the permission matrix.
const ROLES = Object.freeze({
  FLEET_MANAGER: 'FLEET_MANAGER',
  DRIVER: 'DRIVER', // trip-dispatching user, NOT the Driver profile entity
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST',
});

const ROLE_LIST = Object.values(ROLES);

// Human-readable labels + descriptions for seeding and the UI.
const ROLE_META = Object.freeze({
  [ROLES.FLEET_MANAGER]: {
    label: 'Fleet Manager',
    description: 'Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.',
  },
  [ROLES.DRIVER]: {
    label: 'Driver',
    description: 'Creates trips, assigns vehicles and drivers, and monitors active deliveries.',
  },
  [ROLES.SAFETY_OFFICER]: {
    label: 'Safety Officer',
    description: 'Ensures driver compliance, tracks license validity, and monitors safety scores.',
  },
  [ROLES.FINANCIAL_ANALYST]: {
    label: 'Financial Analyst',
    description: 'Reviews expenses, fuel, maintenance costs, revenue, and profitability/ROI.',
  },
});

module.exports = { ROLES, ROLE_LIST, ROLE_META };
