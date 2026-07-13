import { MessageSquareText } from "lucide-react";

type FloatingChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function FloatingChatbotButton({
  isOpen,
  onClick,
}: FloatingChatbotButtonProps) {
  return (
    <button
      type="button"
      aria-label="Buka chatbot Muri"
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
      onClick={onClick}
      className={`group fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-brand-lime text-brand-forest shadow-xl transition-all duration-300 sm:bottom-6 sm:right-6 sm:size-16 ${
        isOpen
          ? "pointer-events-none scale-75 opacity-0"
          : "scale-100 opacity-100 hover:-translate-y-1 hover:bg-brand-forest hover:text-brand-lime"
      }`}
    >
      <MessageSquareText
        className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7"
        strokeWidth={2}
      />

      <span className="absolute right-1 top-1">
        <span className="absolute block size-3 animate-ping rounded-full bg-orange-400 opacity-70" />
        <span className="relative block size-3 rounded-full border-2 border-canvas-pure bg-orange-400" />
      </span>
    </button>
  );
}