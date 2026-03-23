import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import * as identityModule from "./identity";
import type { Role } from "@prisma/client";
import * as userProfileModule from "./userProfile";

/**
 * Auth baseline for Phase 1 scaffold.
 * Uses PrismaAdapter for user/account persistence.
 * NOTE: Local placeholder uses JWT sessions (required for CredentialsProvider in NextAuth v4);
 * production SSO integration can switch back to DB-backed sessions.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Placeholder: CredentialsProvider requires JWT sessions in NextAuth v4.
  // Once real corporate SSO (OAuth/SAML/OIDC) replaces this provider,
  // we can switch back to DB-backed sessions as required.
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * Persist/refresh user profile from identity claims.
     * For the placeholder credentials provider, we treat submitted fields as "claims".
     */
    async signIn({ user, credentials, profile }) {
      const { employeeId, displayName, email } = identityModule.extractIdentity({
        user,
        credentials: credentials as Record<string, unknown> | undefined,
        profile: profile as Record<string, unknown> | undefined,
      });
      const ok = await userProfileModule.persistUserProfile({
        prisma,
        identity: { employeeId, displayName, email },
      });

      // Make missing-identity failures deterministic for the UI:
      // NextAuth will surface `error=AccessDenied` to the callbackUrl.
      if (!ok) throw new Error("AccessDenied");
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const employeeId =
          (user as { employeeId?: string; id?: string }).employeeId ?? (user as { id?: string }).id;
        const displayName =
          (user as { displayName?: string; name?: string }).displayName ?? (user as { name?: string }).name;

        if (employeeId) (token as { employeeId?: string }).employeeId = employeeId;
        if (displayName) (token as { displayName?: string }).displayName = displayName;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { employeeId?: string; displayName?: string }).employeeId = (token as {
          employeeId?: string;
        }).employeeId;
        (session.user as { displayName?: string }).displayName = (token as { displayName?: string }).displayName;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "SSO (placeholder)",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        email: { label: "Email", type: "email" },
        displayName: { label: "Display name", type: "text" },
      },
      async authorize(credentials) {
        // Placeholder local identity mapping until real corporate SSO is wired.
        // Important: do NOT auto-fill required fields, so AC3 ("missing attrs") can
        // be exercised locally.
        const employeeId = String(credentials?.employeeId ?? "").trim();
        const email = String(credentials?.email ?? "").trim();
        const displayName = String(credentials?.displayName ?? "").trim();

        return {
          id: employeeId,
          employeeId: employeeId || undefined,
          email: email || undefined,
          name: displayName || undefined,
          displayName: displayName || undefined,
        };
      },
    }),
  ],
};

