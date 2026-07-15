import * as React from "react"
import { cn } from "@/lib/utils"
import { UploadCloud, X, Image as ImageIcon, Film } from "lucide-react"
import { MediaItem } from "@/types/common"
import { MediaType } from "@/enums/enum"
import { toast } from "sonner"

interface MediaUploadProps {
  value: MediaItem[]
  onChange: (value: MediaItem[]) => void
  maxFiles?: number
  maxImageSizeMB?: number
  maxVideoSizeMB?: number
  className?: string
}

export function MediaUpload({
  value,
  onChange,
  maxFiles = 5,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 20,
  className
}: MediaUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      addFiles(filesArray)
    }
  }

  const addFiles = (files: File[]) => {
    const newItems: MediaItem[] = []
    
    // Filter to avoid exceeding max files
    const remainingSlots = maxFiles - value.length
    const filesToAdd = files.slice(0, remainingSlots)

    filesToAdd.forEach((file) => {
      const type = file.type.startsWith("video/") ? MediaType.VIDEO : MediaType.IMAGE
      const maxBytes = type === MediaType.VIDEO 
        ? maxVideoSizeMB * 1024 * 1024 
        : maxImageSizeMB * 1024 * 1024

      if (file.size > maxBytes) {
        toast.error(`File "${file.name}" melebihi batas ukuran (${type === MediaType.VIDEO ? maxVideoSizeMB : maxImageSizeMB}MB)`);
        return
      }

      const url = URL.createObjectURL(file)
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        url,
        file,
        type,
        name: file.name,
      })
    })

    if (newItems.length > 0) {
      onChange([...value, ...newItems])
    }
  }

  const removeFile = (id: string) => {
    const itemToRemove = value.find((item) => item.id === id)
    if (itemToRemove && itemToRemove.file) {
      URL.revokeObjectURL(itemToRemove.url)
    }
    onChange(value.filter((item) => item.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files)
      // Filter for images and videos only
      const validFiles = filesArray.filter(
        (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
      )
      addFiles(validFiles)
    }
  }

  return (
    <div className={cn("space-y-3 w-full", className)}>
      <label className="text-xs font-semibold text-brand-black/70">Foto & Video Limbah</label>
      
      {/* Upload Zone */}
      {value.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-input rounded-sm p-5 min-h-[150px] flex flex-col items-center justify-center gap-2 cursor-pointer bg-canvas-pure hover:bg-muted/10 hover:border-brand-emerald/50 transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
          <UploadCloud className="size-6 text-muted-moss" />
          <div className="text-center">
            <p className="text-xs font-semibold text-brand-black">Klik untuk unggah atau seret file</p>
            <p className="text-[9px] text-muted-moss mt-0.5">Mendukung Gambar & Video (Maks. {maxFiles} file)</p>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {value.map((item) => (
            <div
              key={item.id}
              className="relative group border border-line-trace/60 rounded-sm overflow-hidden bg-muted/20 aspect-square flex items-center justify-center"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="relative size-full">
                  <video src={item.url} className="size-full object-cover" muted />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <Film className="size-5 text-white" />
                  </div>
                </div>
              )}
              
              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(item.id)
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-brand-black/80 hover:bg-error-rust text-white shadow-md transition-colors"
                title="Hapus media"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
