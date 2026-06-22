import { useMemo } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import { Button } from "@/components/ui/button";

/**
 * Compact header chip: shows current location or a "Set location" CTA.
 * Uses GPS on click; falls back to a "Jaipur" manual default if denied.
 */
export function LocationChip({ className }: { className?: string }) {
  const { location, status, requestGps, setManual } = useUserLocation();

  const label = useMemo(() => {
    if (!location) return "Set location";
    if (location.label) return location.label;
    return location.source === "gps" ? "Near you" : "Saved location";
  }, [location]);

  const handleClick = () => {
    if (location) {
      // Re-prompt to refresh
      requestGps();
      return;
    }
    requestGps();
  };

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold text-body hover:text-heading"
        aria-label="Set location"
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin className="h-3.5 w-3.5 text-primary" />
        )}
        <span className="max-w-[120px] truncate">{label}</span>
      </Button>
      {status === "denied" && !location ? (
        <button
          type="button"
          onClick={() => setManual({ lat: 26.9124, lng: 75.7873, label: "Jaipur" })}
          className="ml-1 text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          Use Jaipur
        </button>
      ) : null}
    </div>
  );
}
