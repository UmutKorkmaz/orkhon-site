"use client";

// /chat — the Orkhon chat surface.
//
// Composition:
//   <ChatProviders>           (SessionProvider so useSession resolves)
//     <ChatSurface>           (the actual UI; kept separate so the provider
//                              boundary is explicit and the surface stays a
//                              pure consumer of hooks/components)
//
// All chat-facing state lives in useChat(); this file is layout + glue.

import { useState } from "react";
import { ChatProviders } from "./providers";
import { ChatSurface } from "@/components/chat/chat-surface";
import { ModelSelector } from "@/components/chat/model-selector";
import { useChat } from "@/components/chat/use-chat";

export default function ChatPage() {
  return (
    <ChatProviders>
      <ChatPageInner />
    </ChatProviders>
  );
}

function ChatPageInner() {
  // Default to Kül Tigin — the flagship instruct model — so first-time
  // visitors land on a model that actually answers (a base model would only
  // continue their text, which is surprising without the selector's
  // explanation). The selector still explains every kind.
  const [model, setModel] = useState("kultigin");
  const {
    messages,
    sending,
    awaitingFirstToken,
    error,
    send,
    clearError,
    reset,
  } = useChat();

  return (
    <ChatSurface
      modelSelector={<ModelSelector value={model} onChange={setModel} />}
      messages={messages}
      sending={sending}
      awaitingFirstToken={awaitingFirstToken}
      error={error}
      onDismissError={clearError}
      onSend={(text) => send(model, text)}
      onReset={reset}
    />
  );
}
