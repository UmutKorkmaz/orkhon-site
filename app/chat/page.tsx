"use client";

// /chat — the Orkhon chat surface.
//
// Composition:
//   <ChatProviders>           (SessionProvider so useSession resolves)
//     <ChatShell>             (owns session/consent/history orchestration and
//                              composes ChatSurface + ConsentGate +
//                              HistorySidebar)
//
// ChatShell holds all chat-facing state (session, consent, active
// conversation) so ChatSurface stays presentational. SessionProvider is the
// outermost seam so useSession resolves inside the shell.

import { ChatProviders } from "./providers";
import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatPage() {
  return (
    <ChatProviders>
      <ChatShell />
    </ChatProviders>
  );
}

