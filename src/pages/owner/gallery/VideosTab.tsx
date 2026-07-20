import { useState } from "react";
import { GripVertical, Info, Plus, Trash2, Youtube } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MAX_VIDEOS, extractYouTubeId, type GalleryVideo } from "./mockGallery";

export function VideosTab({
  videos,
  setVideos,
}: {
  videos: GalleryVideo[];
  setVideos: (v: GalleryVideo[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    setVideos(arrayMove(videos, oldIndex, newIndex));
  };

  const removeVideo = (id: string) => setVideos(videos.filter((v) => v.id !== id));

  const addVideo = (url: string, title: string, ytId: string) => {
    setVideos([
      ...videos,
      {
        id: `v-${Date.now()}`,
        url,
        title,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-heading">{videos.length}</span> of {MAX_VIDEOS}{" "}
            videos added
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>Drag the handle on each row to reorder videos.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={videos.length >= MAX_VIDEOS}>
          <Plus className="h-4 w-4 mr-1" /> Add YouTube Video
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {videos.map((v) => (
              <SortableVideoRow key={v.id} video={v} onDelete={() => removeVideo(v.id)} />
            ))}
            {videos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                <Youtube className="mx-auto h-10 w-10 mb-2" />
                No videos yet. Add your first YouTube video.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <AddVideoModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addVideo} />
    </div>
  );
}

function SortableVideoRow({ video, onDelete }: { video: GalleryVideo; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground hover:text-heading"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <img src={video.thumbnail} alt="" className="h-16 w-28 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-heading truncate">{video.title}</p>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary truncate block"
        >
          {video.url}
        </a>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete video">
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

function AddVideoModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (url: string, title: string, ytId: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const ytId = extractYouTubeId(url);

  const reset = () => {
    setUrl("");
    setTitle("");
  };

  const submit = () => {
    if (!ytId) return;
    onAdd(url, title.trim() || "Untitled video", ytId);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add YouTube Video" size="md">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>YouTube URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {url && !ytId && <p className="text-xs text-red-600">Invalid YouTube URL.</p>}
        </div>
        {ytId && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt="Preview"
              className="w-full"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Salon tour, customer testimonial..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!ytId}>
            Add Video
          </Button>
        </div>
      </div>
    </Modal>
  );
}
