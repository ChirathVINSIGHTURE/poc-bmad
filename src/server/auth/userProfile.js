/**
 * Business logic for identity -> persisted user profile.
 *
 * Kept in JS so we can unit-test it with Node's built-in test runner
 * without introducing a new TypeScript test harness.
 */

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * @param {object} input
 * @param {any} input.prisma - PrismaClient-like object (user.upsert, auditEvent.create).
 * @param {{ employeeId?: string, displayName?: string, email?: string }} input.identity
 * @returns {Promise<boolean>} true when sign-in should proceed
 */
async function persistUserProfile({ prisma, identity }) {
  const employeeId = identity?.employeeId;
  const displayName = identity?.displayName;
  const email = identity?.email;

  // Required attributes for stable mapping (FR13).
  const hasEmployeeId = isNonEmptyString(employeeId);
  const hasDisplayName = isNonEmptyString(displayName);

  if (!hasEmployeeId || !hasDisplayName) {
    await prisma.auditEvent.create({
      data: {
        actorType: "employee",
        // actorId is optional for missing-identity failures; avoid polluting users table.
        actorId: hasEmployeeId ? employeeId : undefined,
        action: "AUTH_MISSING_IDENTITY_ATTRIBUTES",
        reason: "Missing required identity attributes from SSO/IdP claims",
        metadata: {
          hasEmployeeId: Boolean(hasEmployeeId),
          hasDisplayName: Boolean(hasDisplayName),
        },
      },
    });

    return false;
  }

  await prisma.user.upsert({
    where: { employeeId },
    create: {
      employeeId,
      displayName,
      email,
      role: "employee",
    },
    update: {
      displayName,
      // Only overwrite email if the claim provides it; otherwise keep existing.
      email: email ?? undefined,
    },
  });

  return true;
}

module.exports = {
  persistUserProfile,
};

