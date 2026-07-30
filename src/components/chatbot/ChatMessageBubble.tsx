import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

import { ChatbotAvatar } from "./ChatbotAvatar";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant && <ChatbotAvatar compact />}

      <article
        className={cn(
          "max-w-[85%] px-4 py-3",
          isAssistant
            ? "rounded-2xl rounded-bl-md border border-brand-black/15 bg-white text-brand-black shadow-xs"
            : "rounded-2xl rounded-br-md bg-brand-forest text-white",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <time
          className={cn(
            "mt-2 block text-xs",
            isAssistant ? "text-muted-moss/70" : "text-white/50",
          )}
        >
          {message.time}
        </time>
      </article>
    </div>
  );
}
