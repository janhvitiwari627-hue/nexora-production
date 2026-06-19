import { useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { TICKET_CATEGORIES } from "./mockSupport";

export function RaiseTicketForm() {
  const [category, setCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...list].slice(0, 3));
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !subject.trim() || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setCategory("");
      setSubject("");
      setDescription("");
      setFiles([]);
      setSubmitted(false);
    }, 2500);
  }

  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5 md:p-6">
      <h2 className="text-heading text-xl font-black">Raise a ticket</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Can't find an answer? Send us the details and we'll respond within 24 hours.
      </p>

      {submitted ? (
        <div className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mt-4 rounded-xl border p-4 text-sm font-semibold">
          ✓ Ticket submitted. We've emailed you a copy with the reference ID.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-heading mb-1 block text-xs font-bold uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="">Select a category…</option>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-heading mb-1 block text-xs font-bold uppercase tracking-wide">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              required
              placeholder="A short summary"
              className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>

          <div>
            <label className="text-heading mb-1 block text-xs font-bold uppercase tracking-wide">
              Describe the issue
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              required
              rows={5}
              placeholder="Steps to reproduce, error messages, booking ID…"
              className="border-border bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
            />
            <div className="text-muted-foreground mt-1 text-right text-xs">
              {description.length}/1000
            </div>
          </div>

          <div>
            <label className="text-heading mb-2 block text-xs font-bold uppercase tracking-wide">
              Attachments (up to 3)
            </label>
            <label className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs font-semibold transition">
              <Paperclip className="h-4 w-4" />
              Add file
              <input
                type="file"
                multiple
                onChange={handleFiles}
                className="hidden"
                accept="image/*,.pdf"
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="border-border bg-muted/30 flex items-center justify-between rounded-md border px-3 py-1.5 text-xs"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition md:w-auto"
          >
            <Send className="h-4 w-4" />
            Submit ticket
          </button>
        </form>
      )}
    </section>
  );
}
