import { Button } from "@/components/ui/Button";
import { quickPrompts } from "@/lib/chatbot";

type ChatQuickPromptsProps = {
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

export function ChatQuickPrompts({
  disabled = false,
  onSelect,
}: ChatQuickPromptsProps) {
  return (
    <div className="shrink-0 border-t border-brand-black/5 bg-canvas-pure px-4 py-3">
      <div className="muri-scrollbar flex gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((prompt, index) => (
          <Button
            key={prompt}
            type="button"
            size="xs"
            variant={index === 0 ? "solid-lime" : "outline"}
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className={
              index === 0
                ? "shrink-0 rounded-full"
                : "shrink-0 rounded-full border-brand-emerald/20 bg-white text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald hover:text-white"
            }
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
