import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { TIMEZONES } from "./mockSettings";
import { Field, inputCls, PanelShell, SaveBar } from "./PersonalInfoPanel";

type LanguageCode = "en" | "hi";

const DEFAULT_LANGUAGE: LanguageCode = "en";
const DEFAULT_TIMEZONE = "Asia/Kolkata";

function normalizeLanguage(value: string | null | undefined): LanguageCode {
  return value === "hi" ? "hi" : DEFAULT_LANGUAGE;
}

function normalizeTimezone(value: string | null | undefined) {
  return TIMEZONES.some((timezone) => timezone.value === value) ? value! : DEFAULT_TIMEZONE;
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message || "").trim();
    if (message) return message;
  }
  return "Language and region could not be saved. Please try again.";
}

export function LanguagePanel() {
  const { user, profile, refreshProfile, setProfile } = useAuthStore();
  const [lang, setLang] = useState<LanguageCode>(
    normalizeLanguage(profile?.preferred_language),
  );
  const [timezone, setTimezone] = useState(normalizeTimezone(profile?.timezone));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hydratedProfileId = useRef<string | null>(null);
  const savedSnapshot = useRef(`${lang}:${timezone}`);

  useEffect(() => {
    if (user && !profile) void refreshProfile();
  }, [profile, refreshProfile, user]);

  useEffect(() => {
    if (!profile || hydratedProfileId.current === profile.id) return;
    hydratedProfileId.current = profile.id;
    const nextLanguage = normalizeLanguage(profile.preferred_language);
    const nextTimezone = normalizeTimezone(profile.timezone);
    setLang(nextLanguage);
    setTimezone(nextTimezone);
    savedSnapshot.current = `${nextLanguage}:${nextTimezone}`;
    document.documentElement.lang = nextLanguage;
  }, [profile]);

  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const copy =
    lang === "hi"
      ? {
          title: "भाषा और क्षेत्र",
          subtitle: "कंटेंट, तारीख और समय का स्वरूप चुनें।",
          language: "भाषा",
          timezone: "समय क्षेत्र / रीजन",
          preview: "तारीख और समय का नमूना",
          saving: "प्राथमिकताएँ सहेजी जा रही हैं…",
          dirty: "बदलाव अभी सहेजे नहीं गए हैं",
          saved: "प्राथमिकताएँ सहेजी गई हैं",
          save: "बदलाव सहेजें",
          cancel: "रद्द करें",
        }
      : {
          title: "Language & region",
          subtitle: "Choose how content, dates and times appear.",
          language: "Language",
          timezone: "Timezone / region",
          preview: "Date & time preview",
          saving: "Saving preferences…",
          dirty: "Unsaved changes",
          saved: "Preferences are saved",
          save: "Save changes",
          cancel: "Cancel",
        };
  const regionalPreview = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: timezone,
      }).format(new Date()),
    [locale, timezone],
  );
  const isDirty = savedSnapshot.current !== `${lang}:${timezone}`;

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const activeUser = authData.user;
      if (authError || !activeUser || (user && activeUser.id !== user.id)) {
        throw new Error("Please sign in again to save your preferences.");
      }

      const { data: savedProfile, error } = await supabase
        .from("profiles")
        .update({
          preferred_language: lang,
          timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeUser.id)
        .select("*")
        .single();
      if (error) throw error;

      setProfile(savedProfile);
      savedSnapshot.current = `${lang}:${timezone}`;
      document.documentElement.lang = lang;
      toast.success(lang === "hi" ? "भाषा और क्षेत्र सहेजे गए" : "Language and region saved");
    } catch (error) {
      const message = errorMessage(error);
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    const nextLanguage = normalizeLanguage(profile?.preferred_language);
    const nextTimezone = normalizeTimezone(profile?.timezone);
    setLang(nextLanguage);
    setTimezone(nextTimezone);
    setSaveError(null);
    document.documentElement.lang = nextLanguage;
  }

  return (
    <PanelShell title={copy.title} subtitle={copy.subtitle}>
      <Field label={copy.language}>
        <div className="flex gap-3 pt-1">
          {[
            { value: "en" as const, label: "English" },
            { value: "hi" as const, label: "हिन्दी (Hindi)" },
          ].map((option) => (
            <label
              key={option.value}
              className="border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition"
            >
              <input
                type="radio"
                name="lang"
                checked={lang === option.value}
                onChange={() => setLang(option.value)}
                className="accent-primary h-4 w-4"
              />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="mt-4">
        <Field label={copy.timezone}>
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className={inputCls}
          >
            {TIMEZONES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="border-border bg-background mt-4 rounded-xl border p-4">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
          {copy.preview}
        </p>
        <p className="text-heading mt-1 text-sm font-semibold" aria-live="polite">
          {regionalPreview}
        </p>
      </div>

      {saveError ? (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {saveError}
        </p>
      ) : null}

      <p className="text-muted-foreground mt-3 text-xs" aria-live="polite">
        {saving ? copy.saving : isDirty ? copy.dirty : copy.saved}
      </p>

      <SaveBar
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
        saveLabel={copy.save}
        cancelLabel={copy.cancel}
      />
    </PanelShell>
  );
}
