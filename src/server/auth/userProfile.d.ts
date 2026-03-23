export function persistUserProfile(input: {
  prisma: any;
  identity: { employeeId?: string; displayName?: string; email?: string };
}): Promise<boolean>;

