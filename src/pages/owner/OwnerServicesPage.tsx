import { useMemo, useState } from "react";
import { FolderCog, Plus, Search } from "lucide-react";
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
} from "@dnd-kit/sortable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  initialCategories,
  initialServices,
  type OwnerService,
  type ServiceCategory,
} from "./services/mockServices";
import { ServiceManagementCard } from "./services/ServiceManagementCard";
import { AddServiceModal } from "./services/AddServiceModal";
import { ManageCategoriesModal } from "./services/ManageCategoriesModal";

export function OwnerServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [services, setServices] = useState<OwnerService[]>(initialServices);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<OwnerService | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map: Record<string, OwnerService[]> = {};
    for (const s of services) {
      if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) continue;
      map[s.categoryId] = map[s.categoryId] || [];
      map[s.categoryId].push(s);
    }
    return map;
  }, [services, query]);

  const handleDragEnd = (categoryId: string) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setServices((prev) => {
      const inCat = prev.filter((s) => s.categoryId === categoryId);
      const others = prev.filter((s) => s.categoryId !== categoryId);
      const oldIdx = inCat.findIndex((s) => s.id === active.id);
      const newIdx = inCat.findIndex((s) => s.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return prev;
      const reordered = arrayMove(inCat, oldIdx, newIdx);
      return [...others, ...reordered];
    });
  };

  const saveService = (s: OwnerService) => {
    setServices((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
  };

  const deleteService = (id: string) => {
    if (!confirm("Delete this service?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleFeatured = (id: string) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s)));
  const toggleActive = (id: string) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));

  const openEdit = (s: OwnerService) => {
    setEditing(s);
    setAddOpen(true);
  };
  const openAdd = () => {
    setEditing(null);
    setAddOpen(true);
  };

  const totalActive = services.filter((s) => s.active).length;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-heading text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground text-sm">
              {services.length} services across {categories.length} categories · {totalActive} active
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCatOpen(true)}>
              <FolderCog className="h-4 w-4" /> Manage Categories
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
        </header>

        <div className="bg-card border-border rounded-xl border p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services by name or description"
              className="pl-9"
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-3">
          {categories.map((cat) => {
            const list = grouped[cat.id] || [];
            return (
              <AccordionItem
                key={cat.id}
                value={cat.id}
                className="bg-card border-border overflow-hidden rounded-xl border"
              >
                <AccordionTrigger className="hover:bg-muted/40 px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-2">
                    <span className="text-heading text-base font-semibold">{cat.name}</span>
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                      {list.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-border space-y-2 border-t p-4">
                  {list.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      No services in this category. Click "Add Service" to create one.
                    </p>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd(cat.id)}
                    >
                      <SortableContext items={list.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {list.map((s) => (
                            <ServiceManagementCard
                              key={s.id}
                              service={s}
                              category={cat}
                              onToggleFeatured={toggleFeatured}
                              onToggleActive={toggleActive}
                              onEdit={openEdit}
                              onDelete={deleteService}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <AddServiceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={saveService}
        categories={categories}
        initial={editing}
      />
      <ManageCategoriesModal
        open={catOpen}
        onClose={() => setCatOpen(false)}
        categories={categories}
        onChange={setCategories}
        countFor={(id) => services.filter((s) => s.categoryId === id).length}
      />
    </div>
  );
}
