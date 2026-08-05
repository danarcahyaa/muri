"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml } from "@/lib/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef =
    React.useRef<HTMLDivElement>(null);

  const initializedRef =
    React.useRef(false);

  /*
   * Set initial value.
   */
  React.useEffect(() => {
    if (
      !editorRef.current ||
      initializedRef.current
    ) {
      return;
    }

    const safeValue =
      sanitizeRichTextHtml(value);

    editorRef.current.innerHTML =
      safeValue;

    initializedRef.current = true;

    if (safeValue !== value) {
      onChange(safeValue);
    }
  }, [onChange, value]);

  /*
   * Menangani perubahan eksternal:
   * - edit data selesai loading
   * - form reset
   * - berpindah record
   */
  React.useEffect(() => {
    if (
      !editorRef.current ||
      !initializedRef.current
    ) {
      return;
    }

    const safeValue =
      sanitizeRichTextHtml(value);

    if (
      editorRef.current.innerHTML !==
      safeValue
    ) {
      editorRef.current.innerHTML =
        safeValue;
    }
  }, [value]);

  function handleInput() {
    if (!editorRef.current) {
      return;
    }

    /*
     * Jangan mengganti innerHTML saat user mengetik,
     * karena bisa memindahkan caret/cursor.
     *
     * Paste sudah disanitasi melalui handlePaste.
     * Nilai akan disanitasi lagi ketika blur dan submit.
     */
    onChange(editorRef.current.innerHTML);
  }

  function handleBlur() {
    if (!editorRef.current) {
      return;
    }

    const safeValue =
      sanitizeRichTextHtml(
        editorRef.current.innerHTML,
      );

    if (
      editorRef.current.innerHTML !==
      safeValue
    ) {
      editorRef.current.innerHTML =
        safeValue;
    }

    onChange(safeValue);
  }

  function handlePaste(
    event: React.ClipboardEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const clipboardHtml =
      event.clipboardData.getData(
        "text/html",
      );

    const clipboardText =
      event.clipboardData.getData(
        "text/plain",
      );

    const sourceHtml = clipboardHtml
      ? clipboardHtml
      : plainTextToHtml(clipboardText);

    const safeHtml =
      sanitizeRichTextHtml(sourceHtml);

    insertHtmlAtCursor(safeHtml);

    window.requestAnimationFrame(() => {
      handleInput();
    });
  }

  function execCommand(
    command: string,
    argument = "",
  ) {
    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      argument,
    );

    handleInput();
  }

  return (
    <div
      className={cn(
        `
          flex w-full flex-col
          overflow-hidden rounded-md
          border border-brand-black/20
          bg-canvas-pure text-sm
          transition-all

          focus-within:border-brand-emerald
          focus-within:ring-2
          focus-within:ring-brand-emerald/10
        `,
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-brand-black/20 bg-canvas-warm/40 p-1.5">
        <ToolbarButton
          title="Tebal (Bold)"
          onClick={() =>
            execCommand("bold")
          }
        >
          <Bold className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Miring (Italic)"
          onClick={() =>
            execCommand("italic")
          }
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Garis Bawah (Underline)"
          onClick={() =>
            execCommand("underline")
          }
        >
          <Underline className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-brand-black/20" />

        <ToolbarButton
          title="Daftar Simbol (Bullet List)"
          onClick={() =>
            execCommand(
              "insertUnorderedList",
            )
          }
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Daftar Angka (Numbered List)"
          onClick={() =>
            execCommand(
              "insertOrderedList",
            )
          }
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={
          placeholder ||
          "Rich text editor"
        }
        onInput={handleInput}
        onBlur={handleBlur}
        onPaste={handlePaste}
        className="
          min-h-45 cursor-text
          overflow-y-auto
          bg-canvas-pure
          px-5 py-4
          text-xs text-brand-black
          outline-none

          empty:before:pointer-events-none
          empty:before:text-muted-moss/60
          empty:before:content-[attr(data-placeholder)]

          [&_p]:my-2

          [&_ul]:my-2
          [&_ul]:list-disc
          [&_ul]:pl-5

          [&_ol]:my-2
          [&_ol]:list-decimal
          [&_ol]:pl-5

          [&_li]:my-1
        "
        data-placeholder={placeholder}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  title,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => {
        /*
         * Mencegah selection editor hilang
         * ketika tombol toolbar ditekan.
         */
        event.preventDefault();
      }}
      onClick={onClick}
      className="
        rounded-sm p-1.5
        text-brand-black/70
        transition-colors
        hover:bg-canvas-warm
        hover:text-brand-black
      "
    >
      {children}
    </button>
  );
}

function plainTextToHtml(
  text: string,
): string {
  return escapeHtml(text)
    .replace(
      /\r\n|\r|\n/g,
      "<br>",
    );
}

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function insertHtmlAtCursor(
  html: string,
) {
  const selection =
    window.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0
  ) {
    return;
  }

  const range =
    selection.getRangeAt(0);

  range.deleteContents();

  const template =
    document.createElement("template");

  template.innerHTML = html;

  const fragment =
    template.content;

  const lastNode =
    fragment.lastChild;

  range.insertNode(fragment);

  if (!lastNode) {
    return;
  }

  range.setStartAfter(lastNode);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}