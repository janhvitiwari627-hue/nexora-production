import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { SAVED_CARDS, UPI_IDS, type SavedCard, type UpiId } from "./mockSettings";
import { PanelShell } from "./PersonalInfoPanel";

type PreferredKey = string; // `upi:id` or `card:id`

export function PaymentMethodsPanel() {
  const [upis, setUpis] = useState<UpiId[]>(UPI_IDS);
  const [cards, setCards] = useState<SavedCard[]>(SAVED_CARDS);
  const initial: PreferredKey = upis.find((u) => u.preferred) ? `upi:${upis.find((u) => u.preferred)!.id}` : "";
  const [preferred, setPreferred] = useState<PreferredKey>(initial);

  function makePreferred(key: PreferredKey) {
    setPreferred(key);
    setUpis((prev) => prev.map((u) => ({ ...u, preferred: key === `upi:${u.id}` })));
    setCards((prev) => prev.map((c) => ({ ...c, preferred: key === `card:${c.id}` })));
  }

  return (
    <PanelShell title="Payment methods" subtitle="Manage UPI IDs and saved cards.">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-heading text-xs font-black uppercase tracking-wide">UPI IDs</h3>
          <button className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"><Plus className="h-3.5 w-3.5" /> Add UPI</button>
        </div>
        <div className="space-y-2">
          {upis.map((u) => {
            const key = `upi:${u.id}`;
            return (
              <label key={u.id} className="border-border bg-background has-[:checked]:border-primary flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <input type="radio" name="preferred" checked={preferred === key} onChange={() => makePreferred(key)} className="accent-primary h-4 w-4" />
                  <div>
                    <p className="text-heading text-sm font-bold">{u.vpa}</p>
                    <p className="text-muted-foreground text-xs">UPI ID</p>
                  </div>
                </div>
                <button onClick={() => setUpis((p) => p.filter((x) => x.id !== u.id))} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-heading text-xs font-black uppercase tracking-wide">Saved cards</h3>
          <button className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"><Plus className="h-3.5 w-3.5" /> Add card</button>
        </div>
        <div className="space-y-2">
          {cards.map((c) => {
            const key = `card:${c.id}`;
            return (
              <label key={c.id} className="border-border bg-background has-[:checked]:border-primary flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <input type="radio" name="preferred" checked={preferred === key} onChange={() => makePreferred(key)} className="accent-primary h-4 w-4" />
                  <div className="bg-muted text-muted-foreground grid h-9 w-12 place-items-center rounded-md"><CreditCard className="h-4 w-4" /></div>
                  <div>
                    <p className="text-heading text-sm font-bold">{c.brand} •••• {c.last4}</p>
                    <p className="text-muted-foreground text-xs">Expires {c.expiry}</p>
                  </div>
                </div>
                <button onClick={() => setCards((p) => p.filter((x) => x.id !== c.id))} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
              </label>
            );
          })}
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-xs">Preferred method is used by default at checkout. You can always change it before paying.</p>
    </PanelShell>
  );
}
