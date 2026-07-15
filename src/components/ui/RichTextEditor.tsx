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
    <div className={cn("flex flex-col border border-input rounded-sm bg-transparent w-full overflow-hidden text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-input/60 bg-muted/20">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 rounded-sm hover:bg-muted text-brand-black/70 hover:text-brand-black transition-colors"
          title="Tebal (Bold)"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 rounded-sm hover:bg-muted text-brand-black/70 hover:text-brand-black transition-colors"
          title="Miring (Italic)"
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-1.5 rounded-sm hover:bg-muted text-brand-black/70 hover:text-brand-black transition-colors"
          title="Garis Bawah (Underline)"
        >
          <Underline className="size-4" />
        </button>
        <div className="w-px h-4 bg-input/60 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 rounded-sm hover:bg-muted text-brand-black/70 hover:text-brand-black transition-colors"
          title="Daftar Simbol (Bullet List)"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 rounded-sm hover:bg-muted text-brand-black/70 hover:text-brand-black transition-colors"
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
        className="p-3 min-h-45 outline-none bg-canvas-pure prose prose-sm max-w-none overflow-y-auto cursor-text text-brand-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
        data-placeholder={placeholder}
      />
    </div>
  )
}
