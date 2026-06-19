import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ServiceCategory } from "./mockServices";

export function ManageCategoriesModal({
  open,
  onClose,
  categories,
  onChange,
  countFor,
}: {
  open: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  onChange: (next: ServiceCategory[]) => void;
  countFor: (id: string) => number;
}) {
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    onChange([
      ...categories,
      { id: `c${Date.now()}`, name },
    ]);
    setNewName("");
  };

  const saveRename = () => {
    if (!editing) return;
    onChange(categories.map((c) => (c.id === editing.id ? { ...c, name: editing.name.trim() || c.name } : c)));
    setEditing(null);
  };

  const remove = (id: string) => {
    if (countFor(id) > 0) {
      if (!confirm("This category has services. Delete anyway? Services will become uncategorized.")) return;
    }
    onChange(categories.filter((c) => c.id !== id));
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage Categories" size="md">
      <div className="space-y-4 p-6">
        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          />
          <Button onClick={add} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <ul className="divide-border border-border divide-y rounded-lg border">
          {categories.length === 0 && (
            <li className="text-muted-foreground p-4 text-sm">No categories yet.</li>
          )}
          {categories.map((c) => {
            const isEditing = editing?.id === c.id;
            return (
              <li key={c.id} className="flex items-center gap-2 p-3">
                {isEditing ? (
                  <>
                    <Input
                      value={editing!.name}
                      onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                      autoFocus
                    />
                    <Button size="sm" onClick={saveRename}>Save</Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="text-heading font-medium">{c.name}</div>
                      <div className="text-muted-foreground text-xs">{countFor(c.id)} services</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setEditing({ id: c.id, name: c.name })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
