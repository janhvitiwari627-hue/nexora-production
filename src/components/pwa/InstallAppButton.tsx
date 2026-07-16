import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { activateRoleManifest, type NexoraAppKind } from "@/lib/role-pwa";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({
  kind,
  fallbackHref,
}: {
  kind: NexoraAppKind;
  fallbackHref: string;
}) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    activateRoleManifest(kind);
    const capture = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, [kind]);

  const install = async () => {
    if (!promptEvent) {
      window.location.assign(fallbackHref);
      return;
    }
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return (
    <button
      type="button"
      onClick={install}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
    >
      {promptEvent ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
      {promptEvent ? "Install app" : "Open app"}
    </button>
  );
}
