import { useState } from "react";
import { Send, Smile, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EMOJIS = ["😊", "🎉", "💇‍♀️", "💆‍♀️", "✨", "🎂", "💝", "🌸", "💅", "🙌", "🔥", "🌟"];

const TEMPLATES = [
  "Hi {name}! ✨ It's been a while — we'd love to pamper you again. Book now and enjoy 20% off your next service.",
  "Happy birthday, {name}! 🎂 Celebrate with us — your special-day surprise is waiting at the salon.",
  "Hi {name}! Our new {service} is here and you're on our VIP list — try it first with a complimentary upgrade.",
];

export function WhatsAppComposer({
  defaultName = "there",
  onSend,
}: {
  defaultName?: string;
  onSend?: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const aiWrite = () => {
    setGenerating(true);
    setTimeout(() => {
      const pick = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      setText(pick.replace("{name}", defaultName).replace("{service}", "signature facial"));
      setGenerating(false);
    }, 700);
  };

  const insertEmoji = (e: string) => {
    setText((t) => t + e);
    setShowEmojis(false);
  };

  const send = () => {
    if (!text.trim()) return;
    onSend?.(text);
    setText("");
  };

  return (
    <div className="bg-card border-border space-y-2 rounded-lg border p-3">
      <Textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your WhatsApp message…"
        maxLength={1000}
      />
      {showEmojis && (
        <div className="bg-muted/40 flex flex-wrap gap-1 rounded-md p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => insertEmoji(e)}
              className="hover:bg-card rounded p-1 text-lg"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowEmojis((s) => !s)}>
            <Smile className="h-4 w-4" /> Emoji
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-primary"
            onClick={aiWrite}
            disabled={generating}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Writing…" : "AI Write"}
          </Button>
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span>{text.length}/1000</span>
          <Button
            type="button"
            size="sm"
            disabled={!text.trim()}
            className="bg-success hover:bg-success/90 text-white"
            onClick={send}
          >
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}
