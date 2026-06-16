// Server-side session reader — the single seam the chat backend (app/api/chat)
// calls to decide anonymous vs logged-in rate limits. Backed by the real
// NextAuth v5 session via auth() from @/auth. Never throws.

import { auth } from "@/auth";

export interface ChatUser {
  id: string;
}

export async function getSessionUser(): Promise<ChatUser | null> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (email) return { id: email };
    return null;
  } catch {
    // Defensive: never let session lookup break a chat request.
    return null;
  }
}
