import { useState } from "react";
import { CONNECTED_ACCOUNTS } from "./mockSettings";
import { PanelShell } from "./PersonalInfoPanel";

const ICONS: Record<string, string> = {
  google: "G",
  apple: "",
  facebook: "f",
};

const TINT: Record<string, string> = {
  google: "bg-white text-slate-900 border-slate-300",
  apple: "bg-black text-white",
  facebook: "bg-[#1877F2] text-white",
};

export function ConnectedAccountsPanel() {
  const [accounts, setAccounts] = useState(CONNECTED_ACCOUNTS);

  return (
    <PanelShell title="Connected accounts" subtitle="Use these to sign in faster.">
      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${TINT[a.id]}`}>{ICONS[a.id]}</div>
              <div>
                <p className="text-heading text-sm font-bold">{a.name}</p>
                <p className="text-muted-foreground text-xs">
                  {a.connected ? `Connected · ${a.email}` : "Not connected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAccounts((prev) => prev.map((x) => x.id === a.id ? { ...x, connected: !x.connected, email: x.connected ? "" : `you@${a.id}.com` } : x))}
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
