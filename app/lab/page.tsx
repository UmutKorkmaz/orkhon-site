import { ChatProviders } from "@/app/chat/providers";
import { ChatShell } from "@/components/chat/chat-shell";

export default function LabPage() {
  return (
    <ChatProviders>
      <ChatShell />
    </ChatProviders>
  );
}
