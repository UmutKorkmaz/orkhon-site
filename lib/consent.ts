// Server-side seam for KVKK/GDPR consent + signed-in user resolution.
//
// Single source of truth the consent and conversation API routes import. The
// NextAuth session is JWT-only, so it carries the user's email but NOT a
// database id. To get the relational User.id (cuid) we upsert the User by email
// here, then scope every downstream query by that id.
//
// Throws an UNAUTHORIZED sentinel error when there is no signed-in session;
// route handlers catch it and return HTTP 401. No DB query runs for anonymous
// callers beyond the upsert-and-gate.

import { auth } from "@/auth";
import type { PrismaClient, User } from "@prisma/client";
import { POLICY_VERSION } from "@/lib/policy";

export const UNAUTHORIZED = "UNAUTHORIZED" as const;

export interface CurrentUser {
  user: User;
  hasAccepted: boolean;
}

/**
 * Resolve the signed-in session to a persisted Prisma User + consent state.
 *
 * 1. Reads the Auth.js session; throws UNAUTHORIZED if there is no email.
 * 2. Upserts the User by email (idempotent) so we have the relational cuid.
 * 3. Reports hasAccepted by checking for a ConsentRecord on the current
 *    POLICY_VERSION for that user.
 */
export async function getCurrentUser(db: PrismaClient): Promise<CurrentUser> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    throw new Error(UNAUTHORIZED);
  }

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: session.user?.name ?? null,
      image: session.user?.image ?? null,
    },
  });

  const hasAccepted =
    (await db.consentRecord.count({
      where: { userId: user.id, policyVersion: POLICY_VERSION },
    })) > 0;

  return { user, hasAccepted };
}

/** True when an error thrown by getCurrentUser is the UNAUTHORIZED sentinel. */
export function isUnauthorizedError(e: unknown): boolean {
  return e instanceof Error && e.message === UNAUTHORIZED;
}
