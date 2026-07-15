import * as React from "react"
import { cn } from "@/lib/utils"
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  // Initialize content on mount
  React.useEffect(() => {
    if (editorRef.current && !isMounted) {
      editorRef.current.innerHTML = value || ""
      setIsMounted(true)
    }
  }, [value, isMounted])

  // Update content if external value changes (e.g. form reset/edit mode loaded)
  React.useEffect(() => {
    if (editorRef.current && isMounted && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value, isMounted])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg)
    handleInput()
    editorRef.current?.focus()
  }

  return (
    <div className={cn("flex flex-col border border-line-trace rounded-sm bg-transparent w-full overflow-hidden text-sm focus-within:border-brand-emerald focus-within:ring-2 focus-within:ring-brand-emerald/10 transition-all", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-line-trace/60 bg-canvas-warm/30">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 rounded-sm hover:bg-canvas-warm text-brand-black/70 hover:text-brand-black transition-colors"
          title="Tebal (Bold)"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 rounded-sm hover:bg-canvas-warm text-brand-black/70 hover:text-brand-black transition-colors"
          title="Miring (Italic)"
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-1.5 rounded-sm hover:bg-canvas-warm text-brand-black/70 hover:text-brand-black transition-colors"
          title="Garis Bawah (Underline)"
        >
          <Underline className="size-4" />
        </button>
        <div className="w-px h-4 bg-line-trace/60 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 rounded-sm hover:bg-canvas-warm text-brand-black/70 hover:text-brand-black transition-colors"
          title="Daftar Simbol (Bullet List)"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 rounded-sm hover:bg-canvas-warm text-brand-black/70 hover:text-brand-black transition-colors"
          title="Daftar Angka (Numbered List)"
        >
          <ListOrdered className="size-4" />
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="px-5 py-4 min-h-45 outline-none bg-canvas-pure prose prose-sm max-w-none overflow-y-auto cursor-text text-brand-black text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-moss/60"
        data-placeholder={placeholder}
      />
    </div>
  )
}
