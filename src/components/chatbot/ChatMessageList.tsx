"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/types/chat";

import { ChatbotAvatar } from "./ChatbotAvatar";
import { ChatMessageBubble } from "./ChatMessageBubble";

type ChatMessageListProps = {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
};

export function ChatMessageList({
  isOpen,
  isTyping,
  messages,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, isTyping, messages]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Percakapan dengan Murai"
      className="muri-scrollbar min-h-0 flex-1 overflow-y-auto bg-canvas-pure px-4 py-4"
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2" aria-label="Murai sedang mengetik">
            <ChatbotAvatar compact />

            <div className="rounded-2xl rounded-bl-md border border-brand-black/15 bg-white px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-1 animate-bounce rounded-full bg-brand-emerald/30" />
                <span className="size-1 animate-bounce rounded-full bg-brand-emerald/30 delay-100" />
                <span className="size-1 animate-bounce rounded-full bg-brand-emerald/30 delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
