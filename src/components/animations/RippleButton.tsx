import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * Button with material-style ripple on click.
 * Drop-in replacement for `<button>`; styling is left to the consumer.
 */
export const RippleButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function RippleButton({ className, children, onClick, ...rest }, ref) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    function handleClick(e: MouseEvent<HTMLButtonElement>) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const id = Date.now() + Math.random();
      const ripple: Ripple = {
        id,
        x: e.clientX - rect.left - size / 2,
        y: e.clientY - rect.top - size / 2,
        size,
      };
      setRipples((rs) => [...rs, ripple]);
      setTimeout(() => {
        setRipples((rs) => rs.filter((r) => r.id !== id));
      }, 600);
      onClick?.(e);
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn("relative overflow-hidden", className)}
        {...rest}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-current opacity-30 animate-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
            }}
          />
        ))}
      </button>
    );
  },
);
