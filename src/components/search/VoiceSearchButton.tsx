import { useEffect, useRef, useState } from "react";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
};

interface Props {
  onTranscript: (text: string) => void;
  lang?: string;
}

export function VoiceSearchButton({ onTranscript, lang = "en-IN" }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) setSupported(true);
  }, []);

  const start = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice search isn't supported in this browser");
      return;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    recRef.current = rec;
    startedAtRef.current = Date.now();

    rec.onresult = async (e) => {
      const first = e.results[0]?.[0];
      const transcript = (first?.transcript ?? "").trim();
      const confidence = first?.confidence ?? 0;
      if (!transcript) return;

      onTranscript(transcript);
      toast.success(`Heard: "${transcript}"`);

      // Log (best-effort, requires auth — silently ignore if not signed in)
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
          await supabase.from("voice_searches").insert({
            user_id: auth.user.id,
            transcribed_text: transcript,
            confidence_score: Math.min(1, Math.max(0, confidence)),
            audio_duration_seconds: duration,
          });
        }
      } catch {
        /* swallow */
      }
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error(`Voice error: ${event.error}`);
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);

    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop voice search" : "Start voice search"}
      title={listening ? "Listening… click to stop" : "Search by voice"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full transition-colors",
        listening
          ? "bg-rose-500/15 text-rose-600 ring-2 ring-rose-500/40"
          : "text-muted-foreground hover:bg-muted hover:text-heading",
      )}
    >
      {listening ? <Loader2 className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
