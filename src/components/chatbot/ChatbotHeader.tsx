import { RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChatbotAvatar } from "./ChatbotAvatar";

type ChatbotHeaderProps = {
  onReset: () => void;
};

export function ChatbotHeader({ onReset }: ChatbotHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between bg-brand-forest px-4 py-3 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <ChatbotAvatar showStatus />

        <div className="min-w-0">
          <DialogTitle className="truncate font-display text-xl leading-none font-medium text-white">
            Murai
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-white/60">
            Asisten virtual · selalu aktif
          </DialogDescription>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline-white"
          size="icon-sm"
          aria-label="Reset percakapan"
          title="Reset percakapan"
          onClick={onReset}
          className="group size-8 rounded-full border-transparent text-white/60 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="transition-transform duration-300 group-hover:-rotate-45" />
        </Button>

        <DialogClose
          render={
            <Button
              type="button"
              variant="outline-white"
              size="icon-sm"
              aria-label="Tutup chatbot"
              title="Tutup chatbot"
              className="size-8 rounded-full border-transparent text-white/60 hover:bg-white/10 hover:text-white"
            />
          }
        >
          <X />
        </DialogClose>
      </div>
    </header>
  );
}
