import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Field, inputCls, PanelShell } from "./PersonalInfoPanel";
import { ModalShell } from "./ContactInfoPanel";

const DATA_WARNINGS = [
  "All bookings, reviews and reward points will be permanently deleted.",
  "Active memberships will be cancelled without refund.",
  "Wallet balance must be withdrawn before deletion.",
  "Your username will be released and may be claimed by others.",
  "This action cannot be undone after 30 days.",
];

export function DangerZonePanel() {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <PanelShell title="Danger zone" subtitle="Irreversible and destructive actions.">
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-heading text-sm font-bold">Deactivate account</p>
              <p className="text-muted-foreground mt-0.5 text-xs">Hide your profile and pause notifications. You can reactivate by signing in again.</p>
            </div>
            <button onClick={() => setDeactivateOpen(true)} className="rounded-md border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-500/10 dark:text-amber-300">
              Deactivate
            </button>
          </div>
        </div>

        <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <Trash2 className="text-destructive mt-0.5 h-5 w-5" />
            <div className="flex-1">
              <p className="text-heading text-sm font-bold">Delete account</p>
              <p className="text-muted-foreground mt-0.5 text-xs">Permanently remove your account and all associated data after 30 days.</p>
            </div>
            <button onClick={() => setDeleteOpen(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-3 py-1.5 text-xs font-bold">
              Delete account
            </button>
          </div>
        </div>
      </div>

      {deactivateOpen && (
        <ModalShell title="Deactivate account?" onClose={() => setDeactivateOpen(false)}>
          <p className="text-muted-foreground text-sm">Your profile will be hidden and you'll be signed out. Sign in anytime to restore.</p>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setDeactivateOpen(false)} className="border-border rounded-md border px-3 py-2 text-sm font-semibold">Cancel</button>
            <button onClick={() => setDeactivateOpen(false)} className="rounded-md bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600">Deactivate</button>
          </div>
        </ModalShell>
      )}

      {deleteOpen && <DeleteFlowModal onClose={() => setDeleteOpen(false)} />}
    </PanelShell>
  );
}

function DeleteFlowModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <ModalShell title="Delete account" onClose={onClose}>
      {step === 1 && (
        <>
          <p className="text-heading text-sm font-bold">Please review what will happen:</p>
          <ul className="border-destructive/30 bg-destructive/5 text-foreground space-y-1.5 rounded-xl border p-3 text-sm">
            {DATA_WARNINGS.map((w) => (
              <li key={w} className="flex items-start gap-2"><span className="text-destructive">•</span><span>{w}</span></li>
            ))}
          </ul>
          <button onClick={() => setStep(2)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-2 w-full rounded-md py-2 text-sm font-bold">I understand, continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <p className="text-muted-foreground text-sm">For your security, we've sent a 6-digit OTP to your registered mobile.</p>
          <Field label="Enter OTP">
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputCls + " font-mono tracking-[0.5em]"} placeholder="······" />
          </Field>
          <button disabled={otp.length !== 6} onClick={() => setStep(3)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 mt-2 w-full rounded-md py-2 text-sm font-bold">
            Verify
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <Field label='Type "DELETE" to confirm'>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} placeholder="DELETE" />
          </Field>
          <button disabled={confirm !== "DELETE"} onClick={onClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 mt-2 w-full rounded-md py-2 text-sm font-bold">
            Permanently delete my account
          </button>
        </>
      )}
    </ModalShell>
  );
}
