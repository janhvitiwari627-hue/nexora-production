import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Check, LoaderCircle, LocateFixed, MapPinned, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  reverseGeocodeLocation,
  searchCustomerLocations,
  type CustomerLocation,
} from "@/lib/customer-location";

const DEFAULT_CENTER: [number, number] = [26.9124, 75.7873];
const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function CustomerLocationDialog({
  open,
  onOpenChange,
  initialLocation,
  onSave,
  autoLocate = false,
  required = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocation: CustomerLocation | null;
  onSave: (location: CustomerLocation) => Promise<unknown>;
  autoLocate?: boolean;
  required?: boolean;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const autoLocateRequestedRef = useRef(false);
  const [selected, setSelected] = useState<CustomerLocation | null>(initialLocation);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationIssue, setLocationIssue] = useState<"denied" | "unavailable" | null>(null);

  const movePin = useCallback((location: CustomerLocation, zoom = 16) => {
    setSelected(location);
    mapRef.current?.setView([location.latitude, location.longitude], zoom);
    markerRef.current?.setLatLng([location.latitude, location.longitude]);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelected(initialLocation);
    setResults([]);
    setQuery("");
    let cancelled = false;

    void import("leaflet").then((leafletModule) => {
      if (cancelled || !mapElementRef.current) return;
      const L = leafletModule.default;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
      });

      mapRef.current?.remove();
      const center: [number, number] = initialLocation
        ? [initialLocation.latitude, initialLocation.longitude]
        : DEFAULT_CENTER;
      const map = L.map(mapElementRef.current, {
        center,
        zoom: initialLocation ? 16 : 11,
        zoomControl: true,
      });
      L.tileLayer(TILE_URL, {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);
      const selectPin = (latitude: number, longitude: number) => {
        const pinLocation: CustomerLocation = {
          latitude,
          longitude,
          label: "Pin selected",
          displayName: "Confirm below to convert this pin into an address.",
          block: null,
          city: null,
          district: null,
          state: null,
          pincode: null,
          country: "India",
          capturedAt: new Date().toISOString(),
        };
        marker.setLatLng([latitude, longitude]);
        setSelected(pinLocation);
      };
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        selectPin(position.lat, position.lng);
      });
      map.on("click", (event) => selectPin(event.latlng.lat, event.latlng.lng));
      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 50);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialLocation, open]);

  const focusManualSearch = useCallback(() => {
    window.setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleDeviceLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setLocationIssue("unavailable");
      focusManualSearch();
      return;
    }

    try {
      const permission = await navigator.permissions?.query({
        name: "geolocation" as PermissionName,
      });
      if (permission?.state === "denied") {
        setLocationIssue("denied");
        focusManualSearch();
        return;
      }
    } catch {
      // Some browsers expose geolocation without the Permissions API.
    }

    setLocationIssue(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = await reverseGeocodeLocation(coords.latitude, coords.longitude);
          setLocationIssue(null);
          movePin(location, 17);
          toast.success("Current location found. Confirm the map pin to save it.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Address could not be found.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        setLocationIssue(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
        focusManualSearch();
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, [focusManualSearch, movePin]);

  useEffect(() => {
    if (!open) {
      autoLocateRequestedRef.current = false;
      return;
    }
    if (!autoLocate || autoLocateRequestedRef.current) return;
    autoLocateRequestedRef.current = true;
    const timer = window.setTimeout(() => void handleDeviceLocation(), 300);
    return () => window.clearTimeout(timer);
  }, [autoLocate, handleDeviceLocation, open]);

  const searchAddress = async () => {
    setSearching(true);
    try {
      const nextResults = await searchCustomerLocations(query);
      setResults(nextResults);
      if (!nextResults.length) toast.message("No matching location found in India.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Location search failed.");
    } finally {
      setSearching(false);
    }
  };

  const confirmLocation = async () => {
    if (!selected) {
      toast.error("Choose a location first.");
      return;
    }
    setSaving(true);
    try {
      const resolved =
        selected.block || selected.city
          ? selected
          : await reverseGeocodeLocation(selected.latitude, selected.longitude);
      await onSave({ ...resolved, capturedAt: new Date().toISOString() });
      toast.success(`${resolved.label} saved as your location.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Location could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && required) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => required && event.preventDefault()}
        onPointerDownOutside={(event) => required && event.preventDefault()}
        onInteractOutside={(event) => required && event.preventDefault()}
        className={`customer-brand-surface max-h-[92dvh] overflow-y-auto border-[#d9c38a] bg-[#fffaf0] sm:max-w-3xl ${
          required ? "[&>button.absolute]:hidden" : ""
        }`}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b0a08] text-[#f3cf70]">
              <MapPinned className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-left text-xl font-black">
                {required ? "Enable location to continue" : "Set your location"}
              </DialogTitle>
              <DialogDescription className="text-left">
                {required
                  ? "Nexora uses your confirmed location to show the nearest salons and accurate distance. Allow GPS, then verify the map pin."
                  : "Use GPS, search an address, or move the map pin before confirming."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <Button
              type="button"
              onClick={() => void handleDeviceLocation()}
              disabled={locating}
              className="h-12 w-full rounded-2xl bg-[#0b0a08] font-bold text-[#f3cf70] hover:bg-[#241b0d]"
            >
              {locating ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
              )}
              {locating
                ? "Finding precise location…"
                : locationIssue === "denied"
                  ? "Try GPS again"
                  : "Use current location"}
            </Button>

            {locationIssue ? (
              <div
                role="status"
                className="rounded-2xl border border-[#e4c164] bg-[#fff4d2] p-3 text-sm text-[#6d4a10]"
              >
                <p className="font-black">
                  {locationIssue === "denied"
                    ? "Location permission is turned off"
                    : "GPS location is not available right now"}
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  {locationIssue === "denied"
                    ? "Enable Location for this site in your browser or app settings, then tap Try GPS again. You can also search your area or pincode below."
                    : "Check that device Location is on and try again, or search your area or pincode below."}
                </p>
              </div>
            ) : null}

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void searchAddress();
              }}
            >
              <label className="relative min-w-0 flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8c857a]" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Area, city or pincode"
                  className="h-12 w-full rounded-2xl border border-[#e4d7b5] bg-white pr-3 pl-10 text-sm outline-none focus:border-[#d7a93b] focus:ring-2 focus:ring-[#d7a93b]/20"
                />
              </label>
              <Button
                type="submit"
                variant="outline"
                disabled={searching || query.trim().length < 3}
                className="h-12 rounded-2xl border-[#d7a93b]"
              >
                {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </form>

            {results.length ? (
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {results.map((result) => (
                  <button
                    key={`${result.latitude}:${result.longitude}`}
                    type="button"
                    onClick={() => movePin(result)}
                    className="w-full rounded-2xl border border-[#e4d7b5] bg-white p-3 text-left transition hover:border-[#d7a93b]"
                  >
                    <span className="block text-sm font-bold">{result.label}</span>
                    <span className="mt-1 line-clamp-2 block text-xs text-[#7a746a]">
                      {result.displayName}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-[#ead49b] bg-[#fff4d2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a6116]">
                Selected location
              </p>
              <p className="mt-2 font-black">{selected?.label ?? "No location selected"}</p>
              <p className="mt-1 line-clamp-3 text-sm text-[#6f685e]">
                {selected?.displayName ?? "Use GPS, search, or tap the map."}
              </p>
              {selected ? (
                <p className="mt-2 text-xs text-[#8a8174]">
                  {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <div
              ref={mapElementRef}
              aria-label="Map for confirming your location"
              className="h-[320px] overflow-hidden rounded-3xl border border-[#d9c38a] bg-[#eee5d2] sm:h-[390px]"
            />
            <p className="mt-2 text-center text-[11px] text-[#7a746a]">
              Tap or drag the marker. Map and address lookup use OpenStreetMap only after your
              action; Nexora saves the confirmed result.
            </p>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {required ? (
            <p className="max-w-sm text-center text-xs text-[#7a746a] sm:text-left">
              GPS denied? Search your area or pincode above and confirm the map pin manually.
            </p>
          ) : (
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void confirmLocation()}
            disabled={!selected || saving}
            className="min-w-44 rounded-xl bg-[#d7a93b] font-black text-[#0b0a08] hover:bg-[#c79b31]"
          >
            {saving ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving location…" : "Confirm & save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
