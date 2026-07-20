import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { FilterSidebar } from "./FilterSidebar";
import type { Filters } from "./filters";

interface Props {
  open: boolean;
  onClose: () => void;
  draft: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterBottomSheet({ open, onClose, draft, onChange, onApply, onReset }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-3xl bg-card shadow-2xl md:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pt-3 pb-3">
              <div className="flex-1">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
                <h2 className="text-base font-bold text-heading">Filters</h2>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 text-heading" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar
                draft={draft}
                onChange={onChange}
                onApply={() => {
                  onApply();
                  onClose();
                }}
                onReset={onReset}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
