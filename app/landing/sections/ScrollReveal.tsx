"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTextLines } from "@/lib/pretext";

const TEXT =
  "Every word you're reading right now was invisible a moment ago. As you scroll, each word emerges from the blur — measured and placed by pretext before you ever see it. The scroll position maps directly to a word index. No guessing. No estimating. The library knows exactly how many words fit on each line, where each line breaks, and how tall the result will be. So we can reveal text with surgical precision, one word at a time, synced perfectly to your scroll. This is the power of knowing your layout before it happens.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;
const MAX_WIDTH = 680;

type WordToken = {
  word: string;
  lineIndex: number;
  globalIndex: number;
  isSpace: boolean;
};

export function ScrollReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { lines } = useTextLines(TEXT, FONT, MAX_WIDTH, LINE_HEIGHT);

  const tokens = useMemo(() => {
    const result: WordToken[] = [];
    let globalIndex = 0;
    lines.forEach((line, lineIndex) => {
      line.text.split(/(\s+)/).forEach((token) => {
        const isSpace = !token.trim();
        result.push({
          word: token,
          lineIndex,
          globalIndex: isSpace ? -1 : globalIndex,
          isSpace,
        });
        if (!isSpace) globalIndex++;
      });
    });
    return result;
  }, [lines]);

  const totalWords = tokens.filter((t) => !t.isSpace).length;

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrolled = viewH - rect.top;
      const total = rect.height;
      setProgress(Math.max(0, Math.min(1, scrolled / total)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const revealedCount = Math.floor(progress * totalWords * 1.15);

  return (
    <section
      ref={sectionRef}
      id="scroll-reveal"
      className="min-h-[280vh] relative px-6"
    >
      <div className="sticky top-0 min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">
            Scroll Reveal
          </h2>
          <p className="text-lg text-zinc-500 mt-2 max-w-2xl">
            Scroll position maps to word index. Each word emerges as you scroll — measured precisely by pretext.
          </p>
        </div>

        <div style={{ font: FONT, maxWidth: MAX_WIDTH }} className="w-full max-w-5xl">
          {lines.map((line, lineIdx) => (
            <div
              key={lineIdx}
              style={{ lineHeight: `${LINE_HEIGHT}px`, height: LINE_HEIGHT }}
            >
              {tokens
                .filter((t) => t.lineIndex === lineIdx)
                .map((token, tokenIdx) => {
                  const isRevealed = token.isSpace || (token.globalIndex >= 0 && token.globalIndex < revealedCount);
                  const isJustRevealed = !token.isSpace && token.globalIndex >= 0 &&
                    token.globalIndex >= revealedCount - 3 && token.globalIndex < revealedCount;

                  return (
                    <span
                      key={tokenIdx}
                      style={{
                        opacity: isRevealed ? 1 : 0.06,
                        filter: isRevealed ? "blur(0px)" : "blur(5px)",
                        color: isJustRevealed ? "#a78bfa" : undefined,
                        textShadow: isJustRevealed ? "0 0 20px rgba(167,139,250,0.4)" : undefined,
                        transition: "opacity 0.4s ease, filter 0.4s ease, color 0.8s ease, text-shadow 0.8s ease",
                      }}
                    >
                      {token.word}
                    </span>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center gap-4">
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, progress * 115)}%`,
                background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <div className="text-xs font-mono text-zinc-600">
            {Math.min(revealedCount, totalWords)}/{totalWords}
          </div>
        </div>
      </div>
    </section>
  );
}
