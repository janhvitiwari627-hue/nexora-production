import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight password strength scorer. Returns a 0–4 score and feedback.
 * Avoids the 70KB zxcvbn dependency.
 *
 * Also runs a HaveIBeenPwned k-anonymity check in the background to detect
 * passwords that appear in known breach corpora. The HIBP result is advisory
 * only — it never blocks signup, and any network failure is treated as
 * "unknown" so the UI degrades gracefully.
 */
export function scorePassword(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tips: string[];
} {
  let score = 0;
  const tips: string[] = [];
  if (pw.length >= 8) score++;
  else tips.push("Use at least 8 characters");
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  else tips.push("Mix upper- and lower-case letters");
  if (/\d/.test(pw)) score++;
  else tips.push("Include a number");
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  else tips.push("Add a symbol (!@#$…)");
  // Common-password penalty (prefix match)
  if (/^(password|qwerty|123456|111111|abc123)/i.test(pw)) score = Math.min(score, 1);
  const finalScore = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const label = ["Very weak", "Weak", "Fair", "Good", "Strong"][finalScore];
  return { score: finalScore, label, tips };
}

async function sha1Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-1", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * K-anonymity check against HaveIBeenPwned. Returns:
 *   - true  : password appears in breach corpus
 *   - false : password not found
 *   - null  : check could not be completed (network/CORS/timeout) — caller
 *             should treat this as "unknown" and NOT block the user.
 */
async function checkPwned(password: string, signal: AbortSignal): Promise<boolean | null> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: "GET",
      signal,
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    for (const line of text.split("\n")) {
      const [s, count] = line.trim().split(":");
      if (s === suffix && Number(count) > 0) return true;
    }
    return false;
  } catch {
    return null;
  }
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const local = useMemo(() => scorePassword(password), [password]);
  const [pwned, setPwned] = useState<boolean | null>(null);

  useEffect(() => {
    // Reset when password is cleared
    if (!password) {
      setPwned(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      // 3s hard timeout so a slow/blocked HIBP endpoint never stalls the UI
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const result = await checkPwned(password, controller.signal);
      clearTimeout(timeoutId);
      if (!cancelled) setPwned(result);
    }, 1500); // debounce: don't hit HIBP on every keystroke
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [password]);

  if (!password) return null;

  const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const baseScore = local.score;
  const cappedByPwned = pwned === true && baseScore > 3;
  const score = (cappedByPwned ? 3 : baseScore) as 0 | 1 | 2 | 3 | 4;
  const label = cappedByPwned ? "Good" : local.label;
  const tips = [...local.tips];
  if (pwned === true) tips.push("Found in known data breaches — choose a different password");
  if (pwned === null && score >= 2)
    tips.push("Breach check unavailable — pick a unique password to be safe");

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors",
              i < score && colors[score],
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-body">{label}</span>
        {tips[0] && score < 3 && <span className="text-muted-foreground">{tips[0]}</span>}
      </div>
    </div>
  );
}
