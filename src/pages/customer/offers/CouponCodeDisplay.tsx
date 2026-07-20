import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  code: string;
  disabled?: boolean;
}

export function CouponCodeDisplay({ code, disabled }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className={`group flex items-center justify-between gap-3 w-full rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-left transition ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-muted hover:border-primary"
      }`}
      aria-label={`Copy coupon code ${code}`}
    >
      <span className="font-mono text-sm tracking-widest text-foreground">{code}</span>
      <span className="flex items-center gap-1 text-xs font-medium text-primary">
        {copied ? (
          <>
            <Check className="size-3.5" /> Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" /> Copy
          </>
        )}
      </span>
    </button>
  );
}
