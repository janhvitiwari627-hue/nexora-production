import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, PanelShell, SaveBar } from "./PersonalInfoPanel";

export function PrivacyPanel() {
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("friends");
  const [activity, setActivity] = useState(true);
  const [aiReco, setAiReco] = useState(true);
  const [consent, setConsent] = useState({
    marketing: true,
    analytics: true,
    personalised: false,
    thirdParty: false,
  });

  return (
    <PanelShell title="Privacy" subtitle="Control your visibility and how we use your data.">
      <Field label="Profile visibility">
        <div className="grid gap-2 pt-1 md:grid-cols-3">
          {[
            { v: "public", l: "Public", d: "Anyone can find you" },
            { v: "friends", l: "Friends only", d: "People you've referred" },
            { v: "private", l: "Private", d: "Hidden from everyone" },
          ].map((o) => (
            <label
              key={o.v}
              className="border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition"
            >
              <input
                type="radio"
                name="vis"
                checked={visibility === o.v}
                onChange={() => setVisibility(o.v as typeof visibility)}
                className="accent-primary mt-0.5 h-4 w-4"
              />
              <div>
                <p className="text-heading text-sm font-bold">{o.l}</p>
                <p className="text-muted-foreground text-xs">{o.d}</p>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <div className="mt-6 space-y-3">
        <ToggleRow
          label="Show my activity"
          desc="Reviews and visits appear on your public profile."
          checked={activity}
          onChange={setActivity}
        />
        <ToggleRow
          label="AI recommendations"
          desc="Use my booking history to personalise shop suggestions."
          checked={aiReco}
          onChange={setAiReco}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-heading mb-2 text-xs font-black uppercase tracking-wide">
          Data consent
        </h3>
        <div className="space-y-2">
          {[
            { k: "marketing", l: "Receive marketing emails and offers" },
            { k: "analytics", l: "Share anonymous usage analytics" },
            { k: "personalised", l: "Personalised ads based on activity" },
            { k: "thirdParty", l: "Allow data sharing with partner shops" },
          ].map((o) => (
            <label
              key={o.k}
              className="border-border bg-background flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={consent[o.k as keyof typeof consent]}
                onChange={(e) => setConsent({ ...consent, [o.k]: e.target.checked })}
                className="accent-primary mt-0.5 h-4 w-4"
              />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </div>
      <SaveBar />
    </PanelShell>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4">
      <div>
        <p className="text-heading text-sm font-bold">{label}</p>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
