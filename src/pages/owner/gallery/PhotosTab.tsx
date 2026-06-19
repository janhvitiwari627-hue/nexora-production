import { useRef, useState } from "react";
import { Crown, Trash2, Upload } from "lucide-react";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_PHOTOS, PHOTO_CATEGORIES, type GalleryPhoto } from "./mockGallery";

export function PhotosTab({
  photos,
  setPhotos,
}: {
  photos: GalleryPhoto[];
  setPhotos: (p: GalleryPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const slice = Array.from(files).slice(0, remaining);
    const next = [...photos];
    slice.forEach((file) => {
      next.push({
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(file),
        category: PHOTO_CATEGORIES[0],
        isCover: next.length === 0,
      });
    });
    setPhotos(next);
  };

  const setCover = (id: string) => {
    setPhotos(photos.map((p) => ({ ...p, isCover: p.id === id })));
  };

  const remove = (id: string) => {
    const next = photos.filter((p) => p.id !== id);
    if (!next.some((p) => p.isCover) && next[0]) next[0].isCover = true;
    setPhotos(next);
  };

  const setCategory = (id: string, category: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, category } : p)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    setPhotos(arrayMove(photos, oldIndex, newIndex));
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-heading font-semibold">Drag photos here or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-heading">{photos.length}</span> of {MAX_PHOTOS} photos uploaded
        </span>
        <span className="text-muted-foreground">5MB limit per photo</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onSetCover={() => setCover(photo.id)}
                onDelete={() => remove(photo.id)}
                onCategory={(c) => setCategory(photo.id, c)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePhoto({
  photo,
  onSetCover,
  onDelete,
  onCategory,
}: {
  photo: GalleryPhoto;
  onSetCover: () => void;
  onDelete: () => void;
  onCategory: (c: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-square cursor-grab active:cursor-grabbing"
      >
        <img src={photo.url} alt="" className="h-full w-full object-cover" />
        {photo.isCover && (
          <Badge className="absolute left-2 top-2 bg-amber-500 text-white border-0 gap-1">
            <Crown className="h-3 w-3" /> Cover
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          {!photo.isCover && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetCover();
              }}
              className="rounded-full bg-white/90 p-2 hover:bg-white"
              aria-label="Set as cover"
            >
              <Crown className="h-4 w-4 text-amber-600" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-full bg-white/90 p-2 hover:bg-white"
            aria-label="Delete photo"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <Select value={photo.category} onValueChange={onCategory}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHOTO_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
