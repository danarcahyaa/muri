"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createBotReply,
  createInitialChatMessages,
  getCurrentTime,
} from "@/lib/chatbot";
import type { ChatMessage } from "@/types/chat";

const BOT_REPLY_DELAY_MS = 800;

export function useChatbot() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    createInitialChatMessages,
  );
  const [isTyping, setIsTyping] = useState(false);

  const messageIdRef = useRef(Date.now());
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNextMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  }, []);

  const clearPendingReply = useCallback(() => {
    if (!replyTimeoutRef.current) return;

    clearTimeout(replyTimeoutRef.current);
    replyTimeoutRef.current = null;
  }, []);

  const resetChat = useCallback(() => {
    clearPendingReply();
    setDraft("");
    setIsTyping(false);
    setMessages(createInitialChatMessages());
  }, [clearPendingReply]);

  const sendMessage = useCallback(
    (value: string) => {
      const cleanMessage = value.trim();
      if (!cleanMessage || isTyping || replyTimeoutRef.current) return;

      const userMessage: ChatMessage = {
        id: getNextMessageId(),
        role: "user",
        content: cleanMessage,
        time: getCurrentTime(),
      };

      setMessages((current) => [...current, userMessage]);
      setDraft("");
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
        replyTimeoutRef.current = null;
      }, BOT_REPLY_DELAY_MS);
    },
    [getNextMessageId, isTyping],
  );

  useEffect(() => clearPendingReply, [clearPendingReply]);

  return {
    draft,
    messages,
    isTyping,
    setDraft,
    sendMessage,
    resetChat,
  };
}
