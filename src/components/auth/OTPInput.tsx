import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onResend?: () => void | Promise<void>;
  resendSeconds?: number;
  disabled?: boolean;
}

/**
 * Reusable 6-digit OTP input with auto-focus, paste support,
 * and a resend countdown. Wire to any OTP provider (SMS, WhatsApp, email).
 */
export function OTPInput({
  length = 6,
  onComplete,
  onResend,
  resendSeconds = 60,
  disabled = false,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(""));
  const [seconds, setSeconds] = useState(resendSeconds);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    if (values.every((v) => v.length === 1)) {
      onComplete(values.join(""));
    }
  }, [values, onComplete]);

  const setAt = (i: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setAt(i, digit);
    if (digit && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setValues(next);
    const focusIdx = Math.min(text.length, length - 1);
    inputs.current[focusIdx]?.focus();
  };

  const handleResend = async () => {
    if (seconds > 0 || !onResend) return;
    await onResend();
    setValues(Array(length).fill(""));
    setSeconds(resendSeconds);
    inputs.current[0]?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {values.map((v, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={v}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            className="h-12 w-12 text-center text-lg font-semibold"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {onResend && (
        <div className="text-center text-sm text-muted-foreground">
          {seconds > 0 ? (
            <span>Resend code in {seconds}s</span>
          ) : (
            <Button type="button" variant="link" className="h-auto p-0" onClick={handleResend}>
              Resend code
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
