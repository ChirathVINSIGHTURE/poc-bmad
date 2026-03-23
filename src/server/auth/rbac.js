/**
 * CommonJS wrapper of RBAC helpers so Node's built-in test runner can require them.
 * (Project uses TS for runtime route handlers; tests run in pure Node.)
 */

function roleGuard(allowedRoles, role) {
  if (!role) return false;
  return allowedRoles.includes(role);
}

async function getUserRoleByEmployeeId(prisma, employeeId) {
  const user = await prisma.user.findUnique({
    where: { employeeId },
    select: { role: true },
  });

  return user?.role;
}

module.exports = {
  roleGuard,
  getUserRoleByEmployeeId,
};

