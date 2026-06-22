import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight password strength scorer. Returns a 0–4 score and feedback.
 * Avoids the 70KB zxcvbn dependency.
 */
export function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; tips: string[] } {
  let score = 0;
  const tips: string[] = [];
  if (pw.length >= 8) score++; else tips.push("Use at least 8 characters");
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++; else tips.push("Mix upper- and lower-case letters");
  if (/\d/.test(pw)) score++; else tips.push("Include a number");
  if (/[^A-Za-z0-9]/.test(pw)) score++; else tips.push("Add a symbol (!@#$…)");
  // Common-password penalty
  if (/^(password|qwerty|123456|111111|abc123)/i.test(pw)) score = Math.min(score, 1);
  const finalScore = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const label = ["Very weak", "Weak", "Fair", "Good", "Strong"][finalScore];
  return { score: finalScore, label, tips };
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const { score, label, tips } = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;
  const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-warning", "bg-success"];
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
