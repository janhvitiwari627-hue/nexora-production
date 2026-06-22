import { useMemo, useState } from "react";
import { Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ACTIVE_DEVICES, LOGIN_HISTORY, type ActiveDevice } from "./mockSettings";
import { Field, inputCls, PanelShell } from "./PersonalInfoPanel";
import { ModalShell } from "./ContactInfoPanel";
import { LiveActiveSessionsPanel } from "./LiveActiveSessionsPanel";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
const STRENGTH_COLOR = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function SecurityPanel() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [tfa, setTfa] = useState(false);
  const [tfaModal, setTfaModal] = useState(false);
  const [devices, setDevices] = useState<ActiveDevice[]>(ACTIVE_DEVICES);
  const s = useMemo(() => strength(pw.next), [pw.next]);

  return (
    <div className="space-y-5">
      <PanelShell title="Password" subtitle="Use 8+ chars with a mix of letters, numbers and symbols.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Current password"><input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inputCls} /></Field>
          <Field label="New password"><input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputCls} /></Field>
          <Field label="Confirm new"><input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inputCls} /></Field>
        </div>
        {pw.next && (
          <div className="mt-3">
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div className={`${STRENGTH_COLOR[s]} h-full transition-all`} style={{ width: `${(s / 4) * 100}%` }} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Strength: <span className="text-heading font-semibold">{STRENGTH_LABEL[s]}</span></p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-bold">Update password</button>
        </div>
      </PanelShell>

      <PanelShell title="Two-factor authentication" subtitle="Add an extra layer of security at sign-in.">
        <div className="border-border bg-background flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 grid h-10 w-10 place-items-center rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-heading text-sm font-bold">Authenticator app</p>
              <p className="text-muted-foreground text-xs">{tfa ? "Enabled — codes via Google Authenticator" : "Not enabled"}</p>
            </div>
          </div>
          <Switch
            checked={tfa}
            onCheckedChange={(v) => {
              if (v) setTfaModal(true);
              else setTfa(false);
            }}
          />
        </div>
      </PanelShell>

      <LiveActiveSessionsPanel />

      <PanelShell title="Active devices" subtitle="Where you're currently signed in.">

        <div className="space-y-3">
          {devices.map((d) => (
            <div key={d.id} className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted text-muted-foreground grid h-10 w-10 place-items-center rounded-xl">
                  {/Phone|Pixel|iPhone/i.test(d.device) ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-heading text-sm font-bold">
                    {d.device}
                    {d.current && <span className="bg-emerald-500/15 ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">This device</span>}
                  </p>
                  <p className="text-muted-foreground text-xs">{d.browser} · {d.location} · Last active {fmt(d.lastSeen)}</p>
                </div>
              </div>
              {!d.current && (
                <button
                  onClick={() => setDevices((prev) => prev.filter((x) => x.id !== d.id))}
                  className="text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setDevices((prev) => prev.filter((d) => d.current))}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 rounded-md border px-4 py-2 text-sm font-bold"
          >
            Sign out all other devices
          </button>
        </div>
      </PanelShell>

      <PanelShell title="Login history" subtitle="Recent sign-in attempts on your account.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase tracking-wide">
              <tr><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Device</th><th className="py-2 pr-3">Location</th><th className="py-2 pr-3">IP</th><th className="py-2">Status</th></tr>
            </thead>
            <tbody>
              {LOGIN_HISTORY.map((l) => (
                <tr key={l.id} className="border-border border-b last:border-0">
                  <td className="py-2 pr-3">{fmt(l.at)}</td>
                  <td className="py-2 pr-3">{l.device}</td>
                  <td className="py-2 pr-3">{l.location}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{l.ip}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${l.status === "success" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"}`}>
                      {l.status === "success" ? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelShell>

      {tfaModal && (
        <ModalShell title="Set up two-factor auth" onClose={() => setTfaModal(false)}>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
            <li>Install Google Authenticator or 1Password.</li>
            <li>Scan the QR code below.</li>
            <li>Enter the 6-digit code to confirm.</li>
          </ol>
          <div className="bg-muted/30 border-border my-2 grid h-40 place-items-center rounded-xl border border-dashed">
            <span className="text-muted-foreground text-xs">[QR code]</span>
          </div>
          <Field label="6-digit code"><input className={inputCls + " font-mono tracking-[0.5em]"} placeholder="······" /></Field>
          <button onClick={() => { setTfa(true); setTfaModal(false); }} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full rounded-md py-2 text-sm font-bold">
            Enable 2FA
          </button>
        </ModalShell>
      )}
    </div>
  );
}
