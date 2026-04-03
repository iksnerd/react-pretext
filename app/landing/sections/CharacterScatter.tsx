"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Letters fly in from all directions, spinning and scaling, before settling into their final positions. Each character gets its own transform animation with staggered timing. The result is controlled chaos — visually striking but still readable. Hover to reset and watch the scatter happen again.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;

type CharProps = {
  char: string;
  index: number;
  isScattered: boolean;
};

const Character = memo(({ char, index, isScattered }: CharProps) => {
  const randomRotation = Math.sin(index * 0.7) * 360;
  const randomX = Math.cos(index * 1.3) * 140;
  const randomY = Math.sin(index * 0.9) * 140;

  return (
    <span
      style={{
        display: "inline-block",
        opacity: isScattered ? 0.04 : 1,
        transform: isScattered
          ? `translateX(${randomX}px) translateY(${randomY}px) rotate(${randomRotation}deg) scale(0.15)`
          : "translateX(0) translateY(0) rotate(0deg) scale(1)",
        filter: isScattered ? "blur(14px)" : "blur(0px)",
        transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${index * 0.04}s`,
      }}
    >
      {char}
    </span>
  );
});

export function CharacterScatter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(700);
  const [isScattered, setIsScattered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const newWidth = entry.contentBoxSize[0].inlineSize;
      if (newWidth > 0) setWidth(newWidth);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, width || 700, LINE_HEIGHT);

  const handleMouseEnter = () => {
    setIsScattered(true);
  };

  const handleMouseLeave = () => {
    setIsScattered(false);
  };

  return (
    <SectionWrapper
      id="scatter"
      title="Character Scatter"
      description="Letters scatter outward when you hover, then settle back. Each character animates with rotation and blur."
    >
      <div className="flex flex-col items-center gap-6">
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl mx-auto cursor-pointer select-none rounded-2xl p-10"
          style={{
            height: height || undefined,
            font: FONT,
            lineHeight: `${LINE_HEIGHT}px`,
            background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(56,189,248,0.06) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.04)",
            transition: "all 0.4s ease",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {lines.length > 0 &&
            lines.map((line, lineIdx) => (
              <div
                key={lineIdx}
                style={{
                  lineHeight: `${LINE_HEIGHT}px`,
                  height: LINE_HEIGHT,
                }}
              >
                {line.text.split("").map((char, charIdx) => {
                  const globalIndex = lines
                    .slice(0, lineIdx)
                    .reduce((sum, l) => sum + l.text.length, 0) + charIdx;
                  return (
                    <Character
                      key={charIdx}
                      char={char}
                      index={globalIndex}
                      isScattered={isScattered}
                    />
                  );
                })}
              </div>
            ))}
        </div>
        <p className="text-sm text-zinc-600">Hover to scatter letters</p>
      </div>
    </SectionWrapper>
  );
}
