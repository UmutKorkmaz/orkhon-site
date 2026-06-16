// Read + delete a single conversation owned by the signed-in user.
//
// GET    /api/conversations/[id] -> { conversation } including messages (asc)   (404 if missing/not owned)
// DELETE /api/conversations/[id] -> { deleted: true }                            (404 if missing/not owned)
//
// Ownership model (non-negotiable): a conversation must belong to the session
// user. Both handlers filter by { id, userId } together; a row owned by another
// user is indistinguishable from a non-existent one (404), so the API leaks no
// information about other users' data. Message rows cascade on delete per the
// Prisma schema (Message.conversation onDelete: Cascade) — this route is the
// KVKK Art 11 / GDPR Art 17 right-to-erasure path.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getCurrentUser,
  isUnauthorizedError,
} from "@/lib/consent";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: Request,
  ctx: RouteContext,
): Promise<NextResponse> {
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

  const { id } = await ctx.params;

  // Scope by BOTH id AND userId so a foreign user's row resolves to null. The
  // Conversation model has no @@unique([id, userId]) (only @@index([userId])),
  // so we use findFirst instead of findUnique with a compound key. The effect
  // is identical: a row owned by another user is indistinguishable from a
  // non-existent one — no information leak.
  const conversation = await db.conversation.findFirst({
    where: { id, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "not_found", message: "Conversation not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ conversation });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext,
): Promise<NextResponse> {
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

  const { id } = await ctx.params;

  // Existence + ownership in one shot. findFirst by { id, userId } returns null
  // for rows owned by anyone else, which we map to 404 (no leak). Same rationale
  // as GET: no compound unique exists, so findFirst is the type-safe choice.
  const conversation = await db.conversation.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "not_found", message: "Conversation not found." },
      { status: 404 },
    );
  }

  // Delete by the row's primary key. Cascading Message delete is declared in the
  // schema (Message.conversation onDelete: Cascade); no manual cleanup needed.
  await db.conversation.delete({ where: { id: conversation.id } });

  return NextResponse.json({ deleted: true });
}
