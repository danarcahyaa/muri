"use client";

import type { FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ChatComposerProps = {
  value: string;
  isTyping: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function ChatComposer({
  value,
  isTyping,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-brand-black/5 bg-white px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Tulis pesan
        </label>

        <Input
          id="chat-message"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          autoFocus
          placeholder="Tulis pertanyaan Anda..."
          wrapperClassName="min-w-0 flex-1"
          className="rounded-xl bg-canvas-pure text-sm"
        />

        <Button
          type="submit"
          size="icon"
          variant="solid-black"
          loading={isTyping}
          disabled={!value.trim()}
          aria-label="Kirim pesan"
          className="rounded-xl bg-brand-forest text-white hover:bg-brand-emerald"
        >
          <Send className="size-5" />
        </Button>
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-moss/70">
        Murai adalah simulasi chatbot dan tidak menggunakan data pribadi Anda.
      </p>
    </form>
  );
}
