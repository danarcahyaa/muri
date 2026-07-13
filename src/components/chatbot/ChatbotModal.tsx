"use client";

import { MessageSquareText, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "@/types/chat";
import {
  createBotReply,
  createInitialChatMessages,
  getCurrentTime,
  quickPrompts,
} from "@/lib/chatbot";

type ChatbotModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    createInitialChatMessages,
  );
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounterRef = useRef(0);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getNextMessageId() {
    messageIdCounterRef.current += 1;
    return messageIdCounterRef.current;
  }

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isTyping]);

  function handleResetChat() {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }

    setMessage("");
    setIsTyping(false);
    setMessages(createInitialChatMessages());
  }

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function sendMessage(value: string) {
    const cleanMessage = value.trim();
    if (!cleanMessage || isTyping) return;

    const userMessage: ChatMessage = {
      id: getNextMessageId(),
      role: "user",
      content: cleanMessage,
      time: getCurrentTime(),
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setIsTyping(true);

    replyTimeoutRef.current = setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: getNextMessageId(),
        role: "assistant",
        content: createBotReply(cleanMessage),
        time: getCurrentTime(),
      };
      setMessages((current) => [...current, assistantMessage]);
      setIsTyping(false);
    }, 800);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(message);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Tutup chatbot"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-brand-black/20 backdrop-blur-sm sm:hidden"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
        className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-canvas-pure shadow-md sm:inset-auto sm:bottom-6 sm:right-6 sm:h-3/4 sm:w-full sm:max-w-sm"
      >
        <header className="flex shrink-0 items-center justify-between bg-brand-forest px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest">
              <MessageSquareText className="size-5" strokeWidth={2} />
              <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-brand-forest bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <h2
                id="chatbot-title"
                className="truncate font-display text-xl font-medium leading-none"
              >
                Murai
              </h2>

              <p className="mt-1 text-xs text-white/60">
                Asisten virtual · selalu aktif
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Reset percakapan"
              title="Reset percakapan"
              onClick={handleResetChat}
              className="group flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
            </button>

            <button
              type="button"
              aria-label="Tutup chatbot"
              title="Tutup chatbot"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="muri-scrollbar min-h-0 flex-1 overflow-y-auto bg-canvas-pure px-4 py-4">
          <div className="space-y-4">
            {messages.map((chatMessage) => {
              const isAssistant = chatMessage.role === "assistant";

              return (
                <div
                  key={chatMessage.id}
                  className={`flex items-end gap-2 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest">
                      <span className="text-xs font-bold">M</span>
                    </div>
                  )}

                  <div
                    className={`max-w-xs px-4 py-3 ${
                      isAssistant
                        ? "rounded-2xl rounded-bl-md border border-brand-black/5 bg-white text-brand-black shadow-xs"
                        : "rounded-2xl rounded-br-md bg-brand-forest text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {chatMessage.content}
                    </p>

                    <p
                      className={`mt-2 text-xs ${
                        isAssistant ? "text-muted-moss/70" : "text-white/50"
                      }`}
                    >
                      {chatMessage.time}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest">
                  <span className="text-xs font-bold">M</span>
                </div>

                <div className="rounded-2xl rounded-bl-md border border-brand-black/5 bg-white px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
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

        <div className="shrink-0 border-t border-brand-black/5 bg-canvas-pure px-4 py-3">
          <div className="muri-scrollbar flex gap-2 overflow-x-auto pb-1">
            {quickPrompts.map((prompt, index) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                  index === 0
                    ? "border-brand-lime bg-brand-lime text-brand-black hover:bg-brand-lime/80"
                    : "border-brand-emerald/20 bg-white text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald hover:text-white"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-brand-black/5 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="chat-message" className="sr-only">
              Tulis pesan
            </label>

            <input
              id="chat-message"
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              autoComplete="off"
              placeholder="Tulis pertanyaan Anda..."
              className="h-12 min-w-0 flex-1 rounded-xl border border-brand-black/10 bg-canvas-pure px-4 text-sm text-brand-black outline-none transition placeholder:text-muted-moss/70 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
            />

            <button
              type="submit"
              aria-label="Kirim pesan"
              disabled={!message.trim() || isTyping}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-forest text-white transition-colors hover:bg-brand-emerald disabled:cursor-not-allowed disabled:bg-muted-moss/40"
            >
              <Send className="size-5" />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-muted-moss/70">
            Murai adalah simulasi chatbot dan tidak menggunakan data pribadi
            Anda.
          </p>
        </form>
      </section>
    </>
  );
}