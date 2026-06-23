import { useState } from "react";
import { toast } from "sonner";
import { CONNECTED_ACCOUNTS } from "./mockSettings";
import { PanelShell } from "./PersonalInfoPanel";

type Account = { id: string; name: string; connected: boolean; email: string };

const EXTRA_ACCOUNTS: Account[] = [
  { id: "instagram", name: "Instagram", connected: false, email: "" },
  { id: "x", name: "X (Twitter)", connected: false, email: "" },
];

const ICONS: Record<string, string> = {
  google: "G",
  apple: "",
  facebook: "f",
  instagram: "IG",
  x: "𝕏",
};

const TINT: Record<string, string> = {
  google: "bg-white text-slate-900 border-slate-300",
  apple: "bg-black text-white",
  facebook: "bg-[#1877F2] text-white",
  instagram: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white",
  x: "bg-black text-white",
};

export function ConnectedAccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([...CONNECTED_ACCOUNTS, ...EXTRA_ACCOUNTS]);

  function toggle(id: string) {
    setAccounts((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, connected: !x.connected, email: x.connected ? "" : `you@${id}.com` }
          : x,
      ),
    );
    const acct = accounts.find((a) => a.id === id);
    toast.success(acct?.connected ? `${acct.name} disconnected` : `${acct?.name ?? "Account"} connected`);
  }

  return (
    <PanelShell title="Connected accounts" subtitle="Sign in faster and share to your social profiles.">
      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${TINT[a.id] || "bg-muted text-foreground"}`}>{ICONS[a.id] || a.name[0]}</div>
              <div>
                <p className="text-heading text-sm font-bold">{a.name}</p>
                <p className="text-muted-foreground text-xs">
                  {a.connected ? `Connected · ${a.email}` : "Not connected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle(a.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${a.connected ? "border-destructive/40 text-destructive border hover:bg-destructive/10" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {a.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}
