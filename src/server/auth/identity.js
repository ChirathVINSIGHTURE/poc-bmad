/**
 * Identity extraction helper used by Auth.js callbacks.
 *
 * The mapping logic is intentionally tolerant to different claim shapes so we can
 * reuse it for the real SSO provider later (OAuth/OIDC) and for the current
 * local placeholder (CredentialsProvider inputs).
 */

function pickFirstDefined(value) {
  return value === undefined || value === null ? undefined : value;
}

/**
 * @param {object} input
 * @param {object|undefined} input.credentials - Credentials provider inputs (local placeholder).
 * @param {object|undefined} input.profile - OAuth/OIDC profile claims (future real SSO).
 * @param {object|undefined} input.user - The NextAuth `user` returned from `authorize()`.
 * @returns {{ employeeId: string | undefined, displayName: string | undefined, email: string | undefined }}
 */
function extractIdentity(input) {
  const credentials = input?.credentials;
  const profile = input?.profile;
  const user = input?.user;

  // Stable identifier: use IdP subject/identifier first.
  // Fallback to credentials-based identity only when SSO profile isn't present.
  const employeeId =
    pickFirstDefined(profile?.sub) ??
    pickFirstDefined(profile?.subject) ??
    pickFirstDefined(profile?.employeeId) ??
    pickFirstDefined(profile?.employee_id) ??
    pickFirstDefined(credentials?.employeeId) ??
    pickFirstDefined(user?.employeeId) ??
    pickFirstDefined(user?.id);

  const displayName =
    pickFirstDefined(credentials?.displayName) ??
    pickFirstDefined(profile?.displayName) ??
    pickFirstDefined(profile?.display_name) ??
    pickFirstDefined(profile?.name) ??
    (profile?.given_name || profile?.family_name
      ? [profile?.given_name, profile?.family_name].filter((x) => x != null && String(x).trim().length > 0).join(" ")
      : undefined) ??
    pickFirstDefined(user?.displayName) ??
    pickFirstDefined(user?.name);

  const email =
    pickFirstDefined(credentials?.email) ??
    pickFirstDefined(profile?.email) ??
    pickFirstDefined(user?.email);

  // Normalize strings: trim, and drop empty-string values.
  const trimOrUndef = (v) => (typeof v === "string" ? (v.trim().length ? v.trim() : undefined) : v);
  return {
    employeeId: trimOrUndef(employeeId),
    displayName: trimOrUndef(displayName),
    email: trimOrUndef(email),
  };
}

module.exports = {
  extractIdentity,
};

