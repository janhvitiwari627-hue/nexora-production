import { AlertTriangle } from "lucide-react";

/**
 * Detect Supabase auth errors that indicate the Phone (SMS) provider is
 * not configured, disabled, or the SMS gateway credentials are missing or
 * invalid. These come back as generic "Error sending sms"-style messages
 * or explicit "sms provider ... not enabled" strings from GoTrue.
 */
export function isSmsProviderConfigError(message?: string | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("error sending sms") ||
    m.includes("error sending confirmation sms") ||
    m.includes("sms provider") ||
    m.includes("sms otp") ||
    m.includes("phone provider") ||
    m.includes("phone_provider_disabled") ||
    m.includes("sms_send_failed") ||
    m.includes("unsupported phone provider") ||
    (m.includes("phone") && m.includes("not enabled")) ||
    (m.includes("sms") && m.includes("not configured")) ||
    (m.includes("sms") && m.includes("disabled"))
  );
}

export function SmsNotConfiguredAlert({ originalMessage }: { originalMessage?: string | null }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-destructive">SMS sending isn't configured yet</p>
          <p className="text-muted-foreground">
            Nexora couldn't deliver the one-time code because the Phone (SMS) provider hasn't been
            set up on the backend.
          </p>
          <div className="text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">To fix this:</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Open the backend Users → Auth Settings.</li>
              <li>
                Enable the <span className="font-medium">Phone</span> provider.
              </li>
              <li>
                Add SMS gateway credentials (e.g. Twilio Account SID, Auth Token, and Message
                Service SID or From number).
              </li>
              <li>Save, then try sending the OTP again.</li>
            </ol>
          </div>
          {originalMessage && (
            <details className="pt-1 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Technical details</summary>
              <p className="mt-1 break-words font-mono">{originalMessage}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
