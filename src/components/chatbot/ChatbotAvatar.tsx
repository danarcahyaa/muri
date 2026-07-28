import { MessageSquareText } from "lucide-react";

import { cn } from "@/lib/utils";

type ChatbotAvatarProps = {
  compact?: boolean;
  showStatus?: boolean;
  className?: string;
};

export function ChatbotAvatar({
  compact = false,
  showStatus = false,
  className,
}: ChatbotAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest",
        compact ? "size-8" : "size-10",
        className,
      )}
    >
      {compact ? (
        <span className="text-xs font-bold">M</span>
      ) : (
        <MessageSquareText className="size-5" strokeWidth={2} />
      )}

      {showStatus && (
        <span className="absolute -right-1 -bottom-1 size-3 rounded-full border-2 border-brand-forest bg-emerald-400" />
      )}
    </div>
  );
}
