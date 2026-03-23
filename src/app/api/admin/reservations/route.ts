import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { apiError } from "@/server/api/errors";
import { getUserRoleByEmployeeId, roleGuard } from "@/server/auth/rbac";

const allowedRoles = ["support", "admin"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  const role = await getUserRoleByEmployeeId(prisma, employeeId);
  if (!roleGuard([...allowedRoles], role)) {
    return NextResponse.json(apiError("FORBIDDEN", "Access denied"), { status: 403 });
  }

  // Placeholder scaffold for admin/support search.
  return NextResponse.json({ data: { results: [] } });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  const role = await getUserRoleByEmployeeId(prisma, employeeId);
  if (!roleGuard([...allowedRoles], role)) {
    return NextResponse.json(apiError("FORBIDDEN", "Access denied"), { status: 403 });
  }

  // Placeholder scaffold for corrective actions (cancel/reassign).
  return NextResponse.json(
    { data: { ok: false, message: "Not implemented" } },
    { status: 501 }
  );
}

