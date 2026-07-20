import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CheckCircle2, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type FormValues = {
  fullName: string;
  mobile: string;
  whatsappNumber: string;
  email: string;
  state: string;
  district: string;
  city: string;
  currentWorkType: string;
  beautyIndustryExperience: string;
  salonsInNetwork: string;
};

const initialValues: FormValues = {
  fullName: "",
  mobile: "",
  whatsappNumber: "",
  email: "",
  state: "",
  district: "",
  city: "",
  currentWorkType: "",
  beautyIndustryExperience: "",
  salonsInNetwork: "0",
};

export function GrowthPartnerApplicationForm() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    setValues((current) => ({
      ...current,
      fullName: current.fullName || profile?.full_name || user.user_metadata?.full_name || "",
      mobile: current.mobile || profile?.mobile || user.user_metadata?.mobile || "",
      whatsappNumber: current.whatsappNumber || profile?.mobile || user.user_metadata?.mobile || "",
      email: current.email || user.email || "",
      state: current.state || profile?.state || "",
      district: current.district || profile?.district || "",
      city: current.city || profile?.city || "",
    }));
  }, [profile, user]);

  const update = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const chooseKyc = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      toast.error("KYC file PDF, JPG, PNG or WebP format me aur 5 MB se kam honi chahiye.");
      event.target.value = "";
      return;
    }
    setKycFile(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error("Application submit karne ke liye pehle login karein.");
      return;
    }
    if (!kycFile || !acceptedTerms) {
      toast.error(
        !kycFile ? "Apna KYC document upload karein." : "Agreement accept karna zaroori hai.",
      );
      return;
    }
    if (Object.values(values).some((value) => !String(value).trim())) {
      toast.error("Kripya saari required details bharein.");
      return;
    }

    setIsSubmitting(true);
    const safeName = kycFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const kycPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from("partner-kyc")
        .upload(kycPath, kycFile, {
          contentType: kycFile.type,
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // The table is introduced by the accompanying migration. Keep the client
      // tolerant of generated types that have not refreshed in Lovable yet.
      const applications = supabase.from("growth_partner_applications" as never) as any;
      const { error: insertError } = await applications.insert({
        user_id: user.id,
        full_name: values.fullName.trim(),
        mobile: values.mobile.trim(),
        whatsapp_number: values.whatsappNumber.trim(),
        email: values.email.trim(),
        state: values.state.trim(),
        district: values.district.trim(),
        city: values.city.trim(),
        current_work_type: values.currentWorkType.trim(),
        beauty_industry_experience: values.beautyIndustryExperience.trim(),
        salons_in_network: Number(values.salonsInNetwork),
        kyc_path: kycPath,
      });
      if (insertError) {
        await supabase.storage.from("partner-kyc").remove([kycPath]);
        throw insertError;
      }
      setSubmitted(true);
      toast.success("Application submit ho gayi. Verification ke baad dashboard activate hoga.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Application submit nahi ho paayi.";
      toast.error(
        message.includes("duplicate") ? "Aapki application pehle se submitted hai." : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted)
    return (
      <div
        id="partner-application"
        className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-[0_30px_60px_-30px_rgba(11,19,48,0.25)]"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-[#0B1330]">
          Application submitted successfully
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Nexora team KYC verify karke aapka Growth Partner dashboard activate karegi.
        </p>
      </div>
    );

  const fields: Array<[keyof FormValues, string, string]> = [
    ["fullName", "Full name", "Your name"],
    ["mobile", "Mobile number", "10-digit mobile"],
    ["whatsappNumber", "WhatsApp number", "WhatsApp number"],
    ["email", "Email", "name@email.com"],
    ["state", "State", "Your state"],
    ["district", "District", "Your district"],
    ["city", "City", "Your city"],
    ["currentWorkType", "Current work type", "e.g. Beauty sales executive"],
    ["beautyIndustryExperience", "Beauty industry experience", "e.g. 3 years in salon products"],
    ["salonsInNetwork", "Salons in network", "0"],
  ];

  return (
    <form
      id="partner-application"
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(11,19,48,0.25)] sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-[#0B1330]">Growth Partner Application</div>
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
          Free
        </span>
      </div>
      {!user && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Secure KYC upload ke liye{" "}
          <a className="font-bold underline" href="/login">
            login
          </a>{" "}
          zaroori hai.
        </p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {label}
            </span>
            <input
              required
              type={key === "email" ? "email" : key === "salonsInNetwork" ? "number" : "text"}
              min={key === "salonsInNetwork" ? 0 : undefined}
              max={key === "salonsInNetwork" ? 100000 : undefined}
              value={values[key]}
              onChange={update(key)}
              placeholder={placeholder}
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#FAFBFF] px-3 text-sm outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
            />
          </label>
        ))}
        <label className="sm:col-span-2 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-300 bg-[#FAFBFF] px-4 py-5 text-center transition hover:border-[#4F46E5]">
          <FileUp className="h-5 w-5 text-[#4F46E5]" />
          <span className="mt-2 text-xs font-bold text-[#0B1330]">ID / KYC upload</span>
          <span className="mt-1 text-xs text-slate-500">
            Aadhaar / PAN / business proof · PDF, JPG, PNG or WebP · max 5 MB
          </span>
          <span className="mt-2 text-xs font-semibold text-[#4F46E5]">
            {kycFile?.name || "Choose document"}
          </span>
          <input
            required
            onChange={chooseKyc}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
          />
        </label>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-xl bg-[#FAFBFF] p-4 ring-1 ring-slate-200/70">
          <input
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4F46E5]"
          />
          <span className="text-xs text-slate-600">
            Main Nexora Growth Partner Agreement ke terms accept karta/karti hoon.
          </span>
        </label>
      </div>
      <button
        disabled={isSubmitting}
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1330] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#17214a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Application"
        )}
      </button>
      <p className="mt-3 text-center text-[11px] text-slate-500">
        Your KYC document is private and visible only to authorised Nexora reviewers.
      </p>
    </form>
  );
}
