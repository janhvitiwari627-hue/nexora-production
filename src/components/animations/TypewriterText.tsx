import { useEffect, useState } from "react";

interface TypewriterTextProps {
  /** Words/phrases to cycle through. */
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
  className?: string;
  cursorClassName?: string;
}

/**
 * Animated headline that types each word, pauses, deletes, then types the
 * next. Pure setState/setTimeout loop — no Framer dependency needed.
 */
export function TypewriterText({
  words,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseMs = 1400,
  className,
  cursorClassName,
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[index % words.length];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting
            ? current.slice(0, prev.length - 1)
            : current.slice(0, prev.length + 1),
        );
      },
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pauseMs]);

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className={
          cursorClassName ??
          "ml-0.5 inline-block w-[2px] animate-pulse bg-current align-middle"
        }
        style={{ height: "0.9em" }}
      />
    </span>
  );
}
