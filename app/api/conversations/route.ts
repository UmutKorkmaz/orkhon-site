// Conversation history list for the signed-in user.
//
// GET /api/conversations -> the caller's conversations, newest first.
// Returns only metadata (id, title, model, updatedAt) — never messages.
//
// Security: every query is scoped by the session user's relational id from the
// upsert in getCurrentUser. No userId is ever read from the client.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getCurrentUser,
  isUnauthorizedError,
} from "@/lib/consent";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
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

  const conversations = await db.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      model: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ conversations });
}
