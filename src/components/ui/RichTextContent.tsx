import { cn } from "@/lib/utils";
import {
  sanitizeRichTextAsPlainHtml,
  sanitizeRichTextHtml,
} from "@/lib/richText";

interface RichTextContentProps {
  html: string | null | undefined;
  className?: string;
  mode?: "rich" | "plain";
}

export default function RichTextContent({
  html,
  className,
  mode = "rich",
}: RichTextContentProps) {
  const safeHtml =
    mode === "plain"
      ? sanitizeRichTextAsPlainHtml(html)
      : sanitizeRichTextHtml(html);

  if (!safeHtml) {
    return null;
  }

  if (mode === "plain") {
    return (
      <p
        className={className}
        dangerouslySetInnerHTML={{
          __html: safeHtml,
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        `
          text-sm leading-7 text-muted-moss

          [&_p]:my-3
          [&_p:first-child]:mt-0
          [&_p:last-child]:mb-0

          [&_strong]:font-bold
          [&_strong]:text-brand-black

          [&_b]:font-bold
          [&_b]:text-brand-black

          [&_em]:italic
          [&_i]:italic
          [&_u]:underline

          [&_ul]:my-4
          [&_ul]:list-disc
          [&_ul]:space-y-2
          [&_ul]:pl-6

          [&_ol]:my-4
          [&_ol]:list-decimal
          [&_ol]:space-y-2
          [&_ol]:pl-6

          [&_li]:pl-1
        `,
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}