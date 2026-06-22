import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { PROFILE, ADDRESSES, type Address } from "./mockSettings";
import { PanelShell, Field, inputCls } from "./PersonalInfoPanel";

export function ContactInfoPanel() {
  const [email, setEmail] = useState(PROFILE.email);
  const [phone, setPhone] = useState(PROFILE.phone);
  const [addresses, setAddresses] = useState<Address[]>(ADDRESSES);
  const [emailModal, setEmailModal] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [addingAddr, setAddingAddr] = useState(false);

  function saveAddress(a: Address) {
    setAddresses((prev) => {
      const exists = prev.some((x) => x.id === a.id);
      return exists ? prev.map((x) => (x.id === a.id ? a : x)) : [...prev, a];
    });
    setEditAddr(null);
    setAddingAddr(false);
  }

  return (
    <PanelShell title="Contact information" subtitle="Email, phone and saved addresses.">
      <div className="space-y-4">
        <ContactRow
          icon={Mail}
          label="Email address"
          value={email}
          verified={PROFILE.emailVerified}
          onChange={() => setEmailModal(true)}
        />
        <ContactRow
          icon={Phone}
          label="Mobile number"
          value={phone}
          verified={PROFILE.phoneVerified}
          onChange={() => setPhoneModal(true)}
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-heading text-sm font-black uppercase tracking-wide">Saved addresses</h3>
          <button
            onClick={() => setAddingAddr(true)}
            className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add address
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="border-border bg-background rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-heading text-sm font-bold">{a.label}</span>
                    {a.isDefault && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">Default</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {a.line1}, {a.city}, {a.state} - {a.pincode}
                  </p>
                </div>
                <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditAddr(a)}
                  className="border-border hover:bg-accent inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {emailModal && (
        <OtpFlowModal
          title="Change email address"
          fieldLabel="New email"
          currentValue={email}
          type="email"
          onClose={() => setEmailModal(false)}
          onConfirm={(v) => { setEmail(v); setEmailModal(false); }}
        />
      )}
      {phoneModal && (
        <OtpFlowModal
          title="Change mobile number"
          fieldLabel="New mobile"
          currentValue={phone}
          type="tel"
          onClose={() => setPhoneModal(false)}
          onConfirm={(v) => { setPhone(v); setPhoneModal(false); }}
        />
      )}
      {(editAddr || addingAddr) && (
        <AddressModal
          initial={editAddr ?? undefined}
          onClose={() => { setEditAddr(null); setAddingAddr(false); }}
          onSave={saveAddress}
        />
      )}
    </PanelShell>
  );
}

function ContactRow({
  icon: Icon, label, value, verified, onChange,
}: { icon: typeof Mail; label: string; value: string; verified: boolean; onChange: () => void }) {
  return (
    <div className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className="bg-muted text-muted-foreground grid h-10 w-10 place-items-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-heading text-sm font-bold">{value}</span>
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>
      <button onClick={onChange} className="text-primary hover:bg-primary/10 rounded-md px-3 py-1 text-xs font-bold">
        Change
      </button>
    </div>
  );
}

function OtpFlowModal({
  title, fieldLabel, currentValue, type, onClose, onConfirm,
}: {
  title: string; fieldLabel: string; currentValue: string; type: "email" | "tel";
  onClose: () => void; onConfirm: (v: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [val, setVal] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <ModalShell title={title} onClose={onClose}>
      {step === 1 ? (
        <>
          <p className="text-muted-foreground text-xs">Current: <span className="font-semibold">{currentValue}</span></p>
          <Field label={fieldLabel}>
            <input type={type} value={val} onChange={(e) => setVal(e.target.value)} className={inputCls} />
          </Field>
          <button
            disabled={!val}
            onClick={() => setStep(2)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 mt-2 w-full rounded-md py-2 text-sm font-bold"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">We sent a 6-digit code to <span className="font-semibold">{val}</span></p>
          <Field label="Enter OTP">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={inputCls + " font-mono tracking-[0.5em]"}
              placeholder="······"
            />
          </Field>
          <button
            disabled={otp.length !== 6}
            onClick={() => onConfirm(val)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 mt-2 w-full rounded-md py-2 text-sm font-bold"
          >
            Verify & update
          </button>
        </>
      )}
    </ModalShell>
  );
}

function AddressModal({
  initial, onClose, onSave,
}: { initial?: Address; onClose: () => void; onSave: (a: Address) => void }) {
  const [a, setA] = useState<Address>(
    initial ?? { id: `a${Date.now()}`, label: "Home", line1: "", city: "", state: "", pincode: "", isDefault: false },
  );
  return (
    <ModalShell title={initial ? "Edit address" : "Add address"} onClose={onClose}>
      <Field label="Label"><input value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} className={inputCls} /></Field>
      <Field label="Address line"><input value={a.line1} onChange={(e) => setA({ ...a, line1: e.target.value })} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City"><input value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} className={inputCls} /></Field>
        <Field label="Pincode"><input value={a.pincode} onChange={(e) => setA({ ...a, pincode: e.target.value })} className={inputCls} /></Field>
      </div>
      <Field label="State"><input value={a.state} onChange={(e) => setA({ ...a, state: e.target.value })} className={inputCls} /></Field>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={a.isDefault} onChange={(e) => setA({ ...a, isDefault: e.target.checked })} className="accent-primary" />
        Set as default address
      </label>
      <button
        onClick={() => onSave(a)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full rounded-md py-2 text-sm font-bold"
      >
        Save address
      </button>
    </ModalShell>
  );
}

export function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div className="bg-card border-border w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-base font-black">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {children}
      </div>
    </div>
  );
}
