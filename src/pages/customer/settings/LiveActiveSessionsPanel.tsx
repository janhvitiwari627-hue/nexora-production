import { useEffect, useState } from "react";
import { Laptop, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { listMyLoginEvents, revokeLoginEvent } from "@/lib/security.functions";
import { toast } from "sonner";

type Row = Awaited<ReturnType<typeof listMyLoginEvents>>[number];

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveActiveSessionsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await listMyLoginEvents();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRevoke = async (id: string) => {
    setBusyId(id);
    try {
      await revokeLoginEvent({ data: { id } });
      toast.success("Session revoked");
      await load();
    } catch (e) {
      toast.error("Couldn't revoke session");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5 md:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-heading text-lg font-black">Sign-in activity</h3>
          <p className="text-muted-foreground text-xs">
            Recent sign-ins to your account. Revoke anything you don't recognise.
          </p>
        </div>
        <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
      </header>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading sign-in history…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No sign-in events recorded yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted text-muted-foreground grid h-10 w-10 place-items-center rounded-xl">
                  <Laptop className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-heading text-sm font-bold">
                    {r.device_label ?? "Unknown device"}
                    {r.is_active ? (
                      <span className="bg-emerald-500/15 ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        Revoked
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {fmt(r.created_at)}
                    {r.user_agent ? ` · ${r.user_agent.slice(0, 60)}` : ""}
                  </p>
                </div>
              </div>
              {r.is_active && (
                <button
                  onClick={() => handleRevoke(r.id)}
                  disabled={busyId === r.id}
                  className="text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold disabled:opacity-50"
                >
                  {busyId === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
