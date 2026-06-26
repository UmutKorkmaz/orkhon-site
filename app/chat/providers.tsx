"use client";

// Client-side providers for the /chat route.
//
// `useSession` (from next-auth/react) requires a <SessionProvider> ancestor,
// otherwise it throws in development. This component wraps children in
// SessionProvider WITHOUT configuring auth — it simply makes the hook
// resolvable. When no session endpoint is wired, status resolves to
// "unauthenticated", which the SessionStatus strip renders as the free-tier
// (anonymous) state.
//
// The auth route + session strategy are owned by a different agent; this
// file intentionally does not import any auth config or secrets.

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function ChatProviders({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
