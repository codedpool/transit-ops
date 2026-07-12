// Seed: the four PDF roles + one demo login per role.
// Idempotent — safe to run repeatedly (upserts by unique keys).
//
//   npm run seed
//
// Demo credentials (development only):
//   fleet@transitops.local     / Passw0rd!   (Fleet Manager)
//   dispatch@transitops.local  / Passw0rd!   (Driver / dispatcher)
//   safety@transitops.local    / Passw0rd!   (Safety Officer)
//   finance@transitops.local   / Passw0rd!   (Financial Analyst)
const prisma = require('../src/lib/prisma');
const { hashPassword } = require('../src/modules/auth/auth.service');
const { ROLES, ROLE_META } = require('../src/constants/roles');

const DEMO_PASSWORD = 'Passw0rd!';

const DEMO_USERS = [
  { name: 'Fleet Manager', email: 'fleet@transitops.local', role: ROLES.FLEET_MANAGER },
  { name: 'Dispatcher', email: 'dispatch@transitops.local', role: ROLES.DRIVER },
  { name: 'Safety Officer', email: 'safety@transitops.local', role: ROLES.SAFETY_OFFICER },
  { name: 'Financial Analyst', email: 'finance@transitops.local', role: ROLES.FINANCIAL_ANALYST },
];

async function main() {
  // 1. Roles
  const roleIdByName = {};
  for (const name of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description: ROLE_META[name].description },
      create: { name, description: ROLE_META[name].description },
    });
    roleIdByName[name] = role.id;
  }
  console.log(`Seeded ${Object.keys(roleIdByName).length} roles.`);

  // 2. Demo users
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, roleId: roleIdByName[u.role], isActive: true },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        roleId: roleIdByName[u.role],
      },
    });
  }
  console.log(`Seeded ${DEMO_USERS.length} demo users (password: ${DEMO_PASSWORD}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
