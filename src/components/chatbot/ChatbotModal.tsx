"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChatbot } from "@/hooks/chatbot/useChatbot";

import { ChatComposer } from "./ChatComposer";
import { ChatMessageList } from "./ChatMessageList";
import { ChatQuickPrompts } from "./ChatQuickPrompts";
import { ChatbotHeader } from "./ChatbotHeader";

type ChatbotModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatbotModal({
  isOpen,
  onClose,
}: ChatbotModalProps) {
  const {
    draft,
    messages,
    isTyping,
    setDraft,
    sendMessage,
    resetChat,
  } = useChatbot();

  return (
    <Dialog
      open={isOpen}
      modal={false}
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        showOverlay={false}
        className="inset-4 flex h-auto max-h-none w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-3xl border border-white/20 bg-canvas-pure p-0 shadow-md ring-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(75dvh,720px)] sm:w-full sm:max-w-sm"
      >
        <ChatbotHeader onReset={resetChat} />

        <ChatMessageList
          isOpen={isOpen}
          isTyping={isTyping}
          messages={messages}
        />

        <ChatQuickPrompts
          disabled={isTyping}
          onSelect={sendMessage}
        />

        <ChatComposer
          value={draft}
          isTyping={isTyping}
          onChange={setDraft}
          onSubmit={sendMessage}
        />
      </DialogContent>
    </Dialog>
  );
}