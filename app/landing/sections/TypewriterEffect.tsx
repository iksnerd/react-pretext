"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Words appear one at a time, as if being typed. The cursor blinks at the end of the revealed text. Each word emerges with a slight pop and glow, then settles into place. This creates a deliberate, contemplative pace — letting each word breathe before the next arrives.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;
const WORDS_PER_SECOND = 2.5;

type WordTokenProps = {
  word: string;
  index: number;
  revealedCount: number;
};

const WordToken = memo(({ word, index, revealedCount }: WordTokenProps) => {
  const isRevealed = index < revealedCount;
  const isActive = index === revealedCount - 1;

  return (
    <span
      style={{
        display: "inline-block",
        opacity: isRevealed ? 1 : 0.05,
        transform: isRevealed
          ? "scale(1) translateY(0)"
          : "scale(0.8) translateY(8px)",
        filter: isRevealed ? "blur(0px)" : "blur(6px)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: "0s",
        color: isRevealed ? "inherit" : "rgba(161,161,170,0.2)",
        textShadow: isActive 
          ? "0 0 20px rgba(167,139,250,0.6), 0 0 10px rgba(56,189,248,0.4), 0 0 40px rgba(139,92,246,0.2)" 
          : "none",
      }}
    >
      {word}
    </span>
  );
});
WordToken.displayName = "WordToken";

export function TypewriterEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { lines } = useTextLines(TEXT, FONT, width, LINE_HEIGHT);

  // Build word map: flatten all words with their global indices
  const wordMap = useMemo(() => {
    const map: { word: string; globalIndex: number; lineIndex: number; tokenIndex: number }[] = [];
    let globalIndex = 0;
    lines.forEach((line, lineIdx) => {
      const tokens = line.text.split(/(\s+)/);
      tokens.forEach((token, tokenIdx) => {
        const isSpace = !token.trim();
        if (!isSpace) {
          map.push({ word: token, globalIndex, lineIndex: lineIdx, tokenIndex: tokenIdx });
          globalIndex++;
        }
      });
    });
    return map;
  }, [lines]);

  const totalWords = wordMap.length;

  // Auto-reveal words over time
  useEffect(() => {
    if (revealedCount >= totalWords) return;

    const interval = setInterval(() => {
      setRevealedCount((prev) => Math.min(prev + 1, totalWords));
    }, 1000 / WORDS_PER_SECOND);

    return () => clearInterval(interval);
  }, [revealedCount, totalWords]);

  return (
    <SectionWrapper
      id="typewriter"
      title="Typewriter Effect"
      description="Words reveal one at a time with a pop and glow, creating a deliberate reading pace."
    >
      <div
        ref={containerRef}
        className="relative max-w-3xl mx-auto rounded-2xl p-10"
        style={{
          font: FONT,
          lineHeight: `${LINE_HEIGHT}px`,
          minHeight: lines.length * LINE_HEIGHT,
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(56,189,248,0.06) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.04)",
        }}
      >
        {width > 0 && (
          <div>
            {lines.map((line, lineIdx) => (
              <div key={lineIdx} style={{ lineHeight: `${LINE_HEIGHT}px`, height: LINE_HEIGHT }}>
                {line.text.split(/(\s+)/).map((token, tokenIdx) => {
                  const isSpace = !token.trim();
                  if (isSpace) return <span key={tokenIdx}>{token}</span>;
                  const wordEntry = wordMap.find(
                    (w) => w.lineIndex === lineIdx && w.word === token && w.tokenIndex === tokenIdx
                  );
                  return (
                    <WordToken
                      key={tokenIdx}
                      word={token}
                      index={wordEntry?.globalIndex ?? -1}
                      revealedCount={revealedCount}
                    />
                  );
                })}
              </div>
            ))}
            {/* Blinking cursor */}
            {revealedCount < totalWords && (
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1em",
                  background: "linear-gradient(180deg, rgba(167,139,250,1), rgba(56,189,248,0.6))",
                  marginLeft: "6px",
                  animation: "blink 0.8s step-end infinite",
                  verticalAlign: "middle",
                  boxShadow: "0 0 12px rgba(167,139,250,0.8)",
                }}
              />
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </SectionWrapper>
  );
}
