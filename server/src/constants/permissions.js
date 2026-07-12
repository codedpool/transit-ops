// Server-side permission matrix (PDF Section 2 responsibilities).
//
// This is the authoritative access-control table. The UI may mirror it to
// show/hide menus, but enforcement happens on the backend via the `authorize`
// middleware — never trust the client.
//
// Modules map to API resource groups. Actions are CRUD plus a few domain verbs
// for the trip lifecycle. A role's entry lists exactly the actions it may take
// on that module; anything absent is denied.
const { ROLES } = require('./roles');

const MODULES = Object.freeze({
  DASHBOARD: 'dashboard',
  VEHICLES: 'vehicles',
  DRIVERS: 'drivers',
  TRIPS: 'trips',
  MAINTENANCE: 'maintenance',
  FUEL: 'fuel',
  EXPENSES: 'expenses',
  REPORTS: 'reports',
  USERS: 'users',
});

const ACTIONS = Object.freeze({
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  // Trip lifecycle verbs (state transitions guarded separately from generic update)
  DISPATCH: 'dispatch',
  COMPLETE: 'complete',
  CANCEL: 'cancel',
});

const CRUD = [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE];
const R = [ACTIONS.READ];
const CR = [ACTIONS.CREATE, ACTIONS.READ];

// PERMISSIONS[role][module] = array of allowed actions.
const PERMISSIONS = Object.freeze({
  // Fleet Manager — full access to vehicles + maintenance and user management;
  // read visibility across operations. [PDF 2]
  [ROLES.FLEET_MANAGER]: {
    [MODULES.DASHBOARD]: R,
    [MODULES.VEHICLES]: CRUD,
    [MODULES.MAINTENANCE]: CRUD,
    [MODULES.DRIVERS]: R,
    [MODULES.TRIPS]: R,
    [MODULES.FUEL]: R,
    [MODULES.EXPENSES]: R,
    [MODULES.REPORTS]: R,
    [MODULES.USERS]: CRUD,
  },

  // Driver (dispatcher) — owns the trip lifecycle; reads the assets it dispatches. [PDF 2]
  [ROLES.DRIVER]: {
    [MODULES.DASHBOARD]: R,
    [MODULES.TRIPS]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DISPATCH,
      ACTIONS.COMPLETE,
      ACTIONS.CANCEL,
    ],
    [MODULES.VEHICLES]: R,
    [MODULES.DRIVERS]: R,
    [MODULES.FUEL]: CR,
    [MODULES.EXPENSES]: CR,
    [MODULES.REPORTS]: R,
  },

  // Safety Officer — owns driver compliance, licenses, and safety scores. [PDF 2]
  [ROLES.SAFETY_OFFICER]: {
    [MODULES.DASHBOARD]: R,
    [MODULES.DRIVERS]: CRUD,
    [MODULES.VEHICLES]: R,
    [MODULES.TRIPS]: R,
    [MODULES.REPORTS]: R,
  },

  // Financial Analyst — owns fuel/expense records and cost & ROI reporting. [PDF 2]
  [ROLES.FINANCIAL_ANALYST]: {
    [MODULES.DASHBOARD]: R,
    [MODULES.FUEL]: CRUD,
    [MODULES.EXPENSES]: CRUD,
    [MODULES.MAINTENANCE]: R,
    [MODULES.VEHICLES]: R,
    [MODULES.TRIPS]: R,
    [MODULES.REPORTS]: R,
  },
});

// Central authorization check. Returns true if `role` may perform `action` on `module`.
function hasPermission(role, module, action) {
  const modulePerms = PERMISSIONS[role] && PERMISSIONS[role][module];
  return Array.isArray(modulePerms) && modulePerms.includes(action);
}

module.exports = { MODULES, ACTIONS, PERMISSIONS, hasPermission };
