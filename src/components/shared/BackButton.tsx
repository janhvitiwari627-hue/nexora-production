import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
}

export function BackButton({
  to,
  label = "Back",
  variant = "outline",
  size = "sm",
  className,
  onClick,
}: BackButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      window.location.href = to;
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("gap-1.5", className)}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {size !== "icon" && label}
    </Button>
  );
}
