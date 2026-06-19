import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, Pencil, Star, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OwnerService, ServiceCategory } from "./mockServices";

export function ServiceManagementCard({
  service,
  category,
  onToggleFeatured,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  service: OwnerService;
  category?: ServiceCategory;
  onToggleFeatured: (id: string) => void;
  onToggleActive: (id: string) => void;
  onEdit: (s: OwnerService) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasOffer = typeof service.offerPrice === "number" && service.offerPrice < service.price;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border-border flex items-center gap-3 rounded-xl border p-4 shadow-sm",
        !service.active && "opacity-60",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-heading cursor-grab touch-none active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="bg-primary/10 text-primary hidden h-12 w-12 shrink-0 place-items-center rounded-lg sm:grid">
        <span className="text-xs font-semibold uppercase">
          {service.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-heading truncate font-semibold">{service.name}</h4>
          {service.featured && (
            <span className="bg-warning/15 text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
              <Star className="h-3 w-3 fill-current" /> Featured
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {category && <span>{category.name}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {service.durationMin} min
          </span>
          <span className="capitalize">For: {service.gender === "all" ? "All" : service.gender}</span>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        {hasOffer ? (
          <>
            <div className="text-heading font-bold">₹{service.offerPrice!.toLocaleString()}</div>
            <div className="text-muted-foreground text-xs line-through">₹{service.price.toLocaleString()}</div>
          </>
        ) : (
          <div className="text-heading font-bold">₹{service.price.toLocaleString()}</div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <label className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
          <Switch
            checked={service.featured}
            onCheckedChange={() => onToggleFeatured(service.id)}
            aria-label="Toggle featured"
          />
          Featured
        </label>
        <label className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
          <Switch
            checked={service.active}
            onCheckedChange={() => onToggleActive(service.id)}
            aria-label="Toggle active"
          />
          Active
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <Button size="icon" variant="ghost" onClick={() => onEdit(service)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-danger hover:bg-danger/10"
          onClick={() => onDelete(service.id)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
