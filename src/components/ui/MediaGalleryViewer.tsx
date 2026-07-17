import * as React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaGalleryItem } from "@/types/common";


interface MediaGalleryViewerProps {
  media: string | MediaGalleryItem[] | null | undefined;
  className?: string;
}

const parseMedia = (rawMedia: string | MediaGalleryItem[] | null | undefined): MediaGalleryItem[] => {
  if (!rawMedia) return [];
  
  let parsed: any = rawMedia;
  if (typeof rawMedia === "string") {
    try {
      parsed = JSON.parse(rawMedia);
    } catch {
      const isVideo = /\.(mp4|webm|ogg|mov|avi|m4v)($|\?)/i.test(rawMedia);
      return [{ url: rawMedia, type: isVideo ? ("video" as const) : ("image" as const) }];
    }
  }
  
  if (!Array.isArray(parsed)) return [];
  
  return parsed.map((item: any) => {
    if (typeof item === "string") {
      const isVideo = /\.(mp4|webm|ogg|mov|avi|m4v)($|\?)/i.test(item);
      return {
        url: item,
        type: isVideo ? ("video" as const) : ("image" as const)
      };
    }
    if (item && typeof item === "object" && item.url) {
      return {
        url: item.url,
        type: item.type === "video" ? ("video" as const) : ("image" as const)
      };
    }
    return null;
  }).filter(Boolean) as MediaGalleryItem[];
};

export function MediaGalleryViewer({ media, className }: MediaGalleryViewerProps) {
  const mediaItems = parseMedia(media);
  const [isOpen, setIsOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaGalleryItem | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (mediaItems.length > 0) {
      setActiveMedia(mediaItems[0]);
    } else {
      setActiveMedia(null);
    }
  }, [media]);

  const scrollToCenter = () => {
    if (containerRef.current && activeMedia?.type !== "video") {
      const container = containerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToCenter, 100);
    }
  }, [activeMedia, isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeMedia?.type === "video" || !containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || activeMedia?.type === "video") return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  if (mediaItems.length === 0) {
    return <span className="text-muted-moss text-xs font-medium">-</span>;
  }

  const firstMedia = mediaItems[0];
  const totalCount = mediaItems.length;
  const hasMore = totalCount > 1;

  return (
    <div className={cn("inline-block", className)}>
      {/* Thumbnail Trigger Box */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-12 h-12 aspect-square rounded overflow-hidden border border-line-trace/60 bg-canvas-warm/50 flex items-center justify-center cursor-pointer hover:border-brand-emerald/80 hover:ring-1 hover:ring-brand-emerald/20 transition-all"
        title={`Lihat lampiran media (${totalCount} file)`}
      >
        {firstMedia.type === "video" ? (
          <div className="relative size-full">
            <video 
              src={firstMedia.url} 
              className="size-full object-cover" 
              muted 
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <Film className="size-4 text-white" />
            </div>
          </div>
        ) : (
          <img 
            src={firstMedia.url} 
            alt="Lampiran Media" 
            className="size-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80";
            }}
          />
        )}

        {/* Overlay total count if there are multiple media files */}
        {hasMore && (
          <div className="absolute inset-0 bg-black/50 text-white font-bold text-xs flex items-center justify-center select-none">
            +{totalCount - 1}
          </div>
        )}
      </div>

      {/* Modal Dialog Viewer */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl bg-canvas-pure border border-line-trace max-h-[90vh] overflow-y-auto p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-brand-black pr-6">
              Lampiran Media ({totalCount})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-2">
            
            {activeMedia && (
              <div 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                className={cn(
                  "relative w-full h-[320px] md:h-[400px] rounded-sm border border-line-trace/60 bg-canvas-warm/30 overflow-auto select-none",
                  activeMedia.type === "video" 
                    ? "flex items-center justify-center cursor-default" 
                    : isDragging 
                      ? "cursor-grabbing" 
                      : "cursor-grab"
                )}
              >
                {activeMedia.type === "video" ? (
                  <video 
                    src={activeMedia.url} 
                    key={activeMedia.url} 
                    controls 
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={activeMedia.url} 
                    alt="Pratinjau Lampiran Besar" 
                    className="w-[150%] h-[150%] max-w-none object-cover rounded-sm pointer-events-none"
                    onLoad={scrollToCenter}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                )}
              </div>
            )}

            
            <div className="flex flex-wrap gap-2 pt-2">
                {mediaItems.map((item, index) => {
                  const isActive = activeMedia?.url === item.url;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setActiveMedia(item)}
                      className={cn(
                        "relative w-12 h-12 aspect-square rounded overflow-hidden cursor-pointer bg-canvas-warm/50 flex items-center justify-center transition-all",
                        isActive 
                          ? "border-brand-emerald border ring-1 ring-brand-emerald/35" 
                          : "border-line-trace/60 hover:border-brand-emerald/50"
                      )}
                    >
                      {item.type === "video" ? (
                        <div className="relative size-full">
                          <video 
                            src={item.url} 
                            className="size-full object-cover" 
                            muted 
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <Film className="size-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.url} 
                          alt={`Thumbnail Lampiran ${index + 1}`} 
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
