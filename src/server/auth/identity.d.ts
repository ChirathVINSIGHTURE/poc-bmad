export function extractIdentity(input: {
  credentials?: unknown;
  profile?: unknown;
  user?: unknown;
}): {
  employeeId?: string;
  displayName?: string;
  email?: string;
};

