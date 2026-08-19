// One-time bootstrap for the very first admin account — there's no invite
// chain to create it otherwise, since invites can only be sent by an
// existing AdminUser. Run once, then use the invite flow for everyone else.
//
// Usage: pnpm --filter @luxe/admin seed:owner -- "Full Name" owner@email.com "a-strong-password"

import { prisma } from "@luxe/database";
import { auth } from "../src/lib/auth";

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error(
      'Usage: pnpm --filter @luxe/admin seed:owner -- "Full Name" owner@email.com "a-strong-password"',
    );
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error(`An AdminUser with email ${email} already exists.`);
    process.exit(1);
  }

  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: false,
  });

  if (!signUpResult?.user) {
    console.error("Could not create the Better-Auth account.");
    process.exit(1);
  }

  await prisma.adminUser.create({
    data: {
      name,
      email,
      role: "OWNER",
      authUserId: signUpResult.user.id,
    },
  });

  console.log(`OWNER account created for ${email}. You can now log in at /login.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
