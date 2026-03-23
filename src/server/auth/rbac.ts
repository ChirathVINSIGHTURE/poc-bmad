export type Role = "employee" | "support" | "admin";

/**
 * RBAC helper based on the DB `user.role` field.
 *
 * Keep it testable by injecting a prisma-like client in helper functions.
 */
export function roleGuard(allowedRoles: Role[], role: Role | undefined) {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export async function getUserRoleByEmployeeId(
  prisma: any,
  employeeId: string
): Promise<Role | undefined> {
  const user = await prisma.user.findUnique({
    where: { employeeId },
    select: { role: true },
  });

  return user?.role as Role | undefined;
}

