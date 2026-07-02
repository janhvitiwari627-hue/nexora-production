import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/customer_/location")({
  head: () => ({ meta: [{ title: "Enable location — Nexora" }] }),
  component: LocationPermissionPage,
});

function LocationPermissionPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "requesting" | "denied">("idle");

  const requestLocation = () => {
    setStatus("requesting");
    if (!("geolocation" in navigator)) {
      navigate({ to: "/customer/home" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => navigate({ to: "/customer/home" }),
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

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
        <Button onClick={requestLocation} disabled={status === "requesting"} className="w-full">
          {status === "requesting" ? "Requesting…" : "Enable location"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate({ to: "/customer/home" })}>
          Not now
        </Button>
      </div>
      {status === "denied" && (
        <p className="text-xs text-destructive">
          Location denied. You can still browse — enable later from Settings.
        </p>
      )}
    </main>
  );
}
