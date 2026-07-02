import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/location")({
  head: () => ({ meta: [{ title: "Enable location — Nexora" }] }),
  component: LocationPermissionPage,
});

type Status = "idle" | "requesting" | "denied" | "unsupported";

function LocationPermissionPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = () => {
    setErrorMessage(null);
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setErrorMessage("This browser doesn't expose location. You can browse without it.");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("idle");
        toast.success("Location enabled", {
          description: "Showing salons closest to you.",
        });
        navigate({ to: "/customer/home" });
      },
      (err) => {
        setStatus("denied");
        setErrorMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can enable it later from Settings."
            : "We couldn't get your location. You can try again or skip.",
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const skip = () => {
    toast("Skipped for now", { description: "You can enable location later in Settings." });
    navigate({ to: "/customer/home" });
  };

  const requesting = status === "requesting";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <MapPin className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Find salons near you</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Allow location access so we can show verified salons in your area.
        </p>
      </div>
      <div className="space-y-2">
        <Button onClick={requestLocation} disabled={requesting} className="w-full">
          {requesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {requesting ? "Requesting…" : "Enable location"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={skip} disabled={requesting}>
          Not now
        </Button>
      </div>
      {errorMessage && (
        <p className="text-xs text-destructive" role="alert">{errorMessage}</p>
      )}
    </main>
  );
}
