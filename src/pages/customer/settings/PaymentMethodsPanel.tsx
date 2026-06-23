import { useState } from "react";
import { CreditCard, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SAVED_CARDS, UPI_IDS, type SavedCard, type UpiId } from "./mockSettings";
import { PanelShell, Field, inputCls } from "./PersonalInfoPanel";

type PreferredKey = string; // `upi:id` or `card:id`

export function PaymentMethodsPanel() {
  const [upis, setUpis] = useState<UpiId[]>(UPI_IDS);
  const [cards, setCards] = useState<SavedCard[]>(SAVED_CARDS);
  const initial: PreferredKey = upis.find((u) => u.preferred) ? `upi:${upis.find((u) => u.preferred)!.id}` : "";
  const [preferred, setPreferred] = useState<PreferredKey>(initial);
  const [editingUpi, setEditingUpi] = useState<string | null>(null);
  const [upiDraft, setUpiDraft] = useState("");
  const [addingUpi, setAddingUpi] = useState(false);
  const [newUpi, setNewUpi] = useState("");
  const [addingCard, setAddingCard] = useState(false);

  function makePreferred(key: PreferredKey) {
    setPreferred(key);
    setUpis((prev) => prev.map((u) => ({ ...u, preferred: key === `upi:${u.id}` })));
    setCards((prev) => prev.map((c) => ({ ...c, preferred: key === `card:${c.id}` })));
  }

  function validateUpi(v: string) {
    return /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());
  }

  function saveUpiEdit(id: string) {
    if (!validateUpi(upiDraft)) {
      toast.error("Enter a valid UPI ID (e.g. name@bank)");
      return;
    }
    setUpis((prev) => prev.map((u) => (u.id === id ? { ...u, vpa: upiDraft.trim() } : u)));
    setEditingUpi(null);
    toast.success("UPI ID updated");
  }

  function addUpi() {
    if (!validateUpi(newUpi)) {
      toast.error("Enter a valid UPI ID (e.g. name@bank)");
      return;
    }
    setUpis((prev) => [...prev, { id: `u${Date.now()}`, vpa: newUpi.trim(), preferred: false }]);
    setNewUpi("");
    setAddingUpi(false);
    toast.success("UPI ID added");
  }

  function addCard(card: SavedCard) {
    setCards((prev) => [...prev, card]);
    setAddingCard(false);
    toast.success("Card added");
  }

  return (
    <PanelShell title="Payment methods" subtitle="Manage UPI IDs and saved cards.">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-heading text-xs font-black uppercase tracking-wide">UPI IDs</h3>
          <button
            onClick={() => setAddingUpi(true)}
            className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add UPI
          </button>
        </div>
        {addingUpi && (
          <div className="border-border bg-background mb-2 flex items-center gap-2 rounded-xl border p-3">
            <input
              autoFocus
              value={newUpi}
              onChange={(e) => setNewUpi(e.target.value)}
              placeholder="yourname@bank"
              className={inputCls}
            />
            <button onClick={addUpi} className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-xs font-bold">Save</button>
            <button onClick={() => { setAddingUpi(false); setNewUpi(""); }} className="border-border rounded-md border px-3 py-2 text-xs font-semibold">Cancel</button>
          </div>
        )}
        <div className="space-y-2">
          {upis.map((u) => {
            const key = `upi:${u.id}`;
            const isEditing = editingUpi === u.id;
            return (
              <div key={u.id} className="border-border bg-background has-[:checked]:border-primary flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="flex flex-1 items-center gap-3">
                  <input type="radio" name="preferred" checked={preferred === key} onChange={() => makePreferred(key)} className="accent-primary h-4 w-4" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={upiDraft}
                        onChange={(e) => setUpiDraft(e.target.value)}
                        className={inputCls}
                      />
                    ) : (
                      <>
                        <p className="text-heading text-sm font-bold">{u.vpa}</p>
                        <p className="text-muted-foreground text-xs">UPI ID</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveUpiEdit(u.id)} className="text-primary hover:bg-primary/10 rounded-md px-2 py-1 text-xs font-bold">Save</button>
                      <button onClick={() => setEditingUpi(null)} className="text-muted-foreground hover:bg-accent rounded-md px-2 py-1 text-xs font-semibold">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingUpi(u.id); setUpiDraft(u.vpa); }} className="text-primary hover:bg-primary/10 rounded-md px-2 py-1 text-xs font-bold">Edit</button>
                      <button onClick={() => setUpis((p) => p.filter((x) => x.id !== u.id))} className="text-destructive hover:bg-destructive/10 rounded-md p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-heading text-xs font-black uppercase tracking-wide">Saved cards</h3>
          <button
            onClick={() => setAddingCard(true)}
            className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add card
          </button>
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

      {addingCard && <AddCardModal onClose={() => setAddingCard(false)} onSave={addCard} />}
    </PanelShell>
  );
}

function detectBrand(num: string): SavedCard["brand"] {
  const n = num.replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "RuPay";
}

function AddCardModal({ onClose, onSave }: { onClose: () => void; onSave: (c: SavedCard) => void }) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  function submit() {
    const clean = number.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(clean)) return toast.error("Enter a valid card number");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return toast.error("Expiry must be MM/YY");
    if (!/^\d{3,4}$/.test(cvv)) return toast.error("Invalid CVV");
    if (!name.trim()) return toast.error("Cardholder name required");
    onSave({
      id: `c${Date.now()}`,
      brand: detectBrand(clean),
      last4: clean.slice(-4),
      expiry,
      preferred: false,
    });
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border-border w-full max-w-md space-y-3 rounded-2xl border p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-base font-black">Add new card</h3>
          <button onClick={onClose} aria-label="Close"><X className="text-muted-foreground hover:text-foreground h-4 w-4" /></button>
        </div>
        <Field label="Card number">
          <input
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
            placeholder="4242 4242 4242 4242"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry (MM/YY)">
            <input
              value={expiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                setExpiry(v);
              }}
              placeholder="08/27"
              className={inputCls}
            />
          </Field>
          <Field label="CVV">
            <input
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Name on card">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <button onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full rounded-md py-2 text-sm font-bold">
          Save card
        </button>
      </div>
    </div>
  );
}
