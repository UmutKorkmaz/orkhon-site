// KVKK / GDPR consent status + acceptance for the signed-in user.
//
// GET  /api/consent -> { version, text, accepted }   (401 if not signed in)
// POST /api/consent -> create ConsentRecord(userId, policyVersion) -> { accepted: true }
//
// Re-accepting is idempotent: a second ConsentRecord row is harmless and the
// count-based check in getCurrentUser stays > 0. We do not dedupe because an
// audit trail of when each acceptance happened is desirable for accountability.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getCurrentUser,
  isUnauthorizedError,
} from "@/lib/consent";
import { POLICY_TEXT, POLICY_VERSION } from "@/lib/policy";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  let accepted: boolean;
  try {
    ({ hasAccepted: accepted } = await getCurrentUser(db));
  } catch (e) {
    if (isUnauthorizedError(e)) {
      return NextResponse.json(
        { error: "unauthorized", message: "Sign in required." },
        { status: 401 },
      );
    }
    throw e;
  }

  return NextResponse.json({
    version: POLICY_VERSION,
    text: POLICY_TEXT,
    accepted,
  });
}

export async function POST(): Promise<NextResponse> {
  let userId: string;
  try {
    ({ user: { id: userId } } = await getCurrentUser(db));
  } catch (e) {
    if (isUnauthorizedError(e)) {
      return NextResponse.json(
        { error: "unauthorized", message: "Sign in required." },
        { status: 401 },
      );
    }
    throw e;
  }

  await db.consentRecord.create({
    data: { userId, policyVersion: POLICY_VERSION },
  });

  return NextResponse.json({ accepted: true });
}
