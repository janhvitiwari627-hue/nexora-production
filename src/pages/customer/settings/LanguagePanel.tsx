import { useState } from "react";
import { TIMEZONES } from "./mockSettings";
import { Field, inputCls, PanelShell, SaveBar } from "./PersonalInfoPanel";

export function LanguagePanel() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [tz, setTz] = useState(TIMEZONES[0]);

  return (
    <PanelShell title="Language & region" subtitle="Choose how content and dates appear.">
      <Field label="Language">
        <div className="flex gap-3 pt-1">
          {[
            { v: "en", l: "English" },
            { v: "hi", l: "हिन्दी (Hindi)" },
          ].map((o) => (
            <label
              key={o.v}
              className="border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition"
            >
              <input
                type="radio"
                name="lang"
                checked={lang === o.v}
                onChange={() => setLang(o.v as "en" | "hi")}
                className="accent-primary h-4 w-4"
              />
              {o.l}
            </label>
          ))}
        </div>
      </Field>
      <div className="mt-4">
        <Field label="Timezone">
          <select value={tz} onChange={(e) => setTz(e.target.value)} className={inputCls}>
            {TIMEZONES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <SaveBar />
    </PanelShell>
  );
}
