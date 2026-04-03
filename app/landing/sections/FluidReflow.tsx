"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "This paragraph is alive. Its container width is animating continuously, and on every single frame, pretext recalculates the line breaks using pure arithmetic. No DOM measurement. No layout reflow. The text just flows, like water finding its shape. Watch the lines merge and split as the width oscillates between narrow and wide.";

const FONT = "22px sans-serif";
const LINE_HEIGHT = 34;
const MIN_WIDTH = 240;
const MAX_WIDTH = 720;

export function FluidReflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetWidth, setTargetWidth] = useState(MAX_WIDTH);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-oscillate disabled to prevent layout shifts affecting scroll calculations
  // Users can manually control width via buttons instead
  /* 
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetWidth((w) => (w === MAX_WIDTH ? MIN_WIDTH : MAX_WIDTH));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setCurrentWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, currentWidth, LINE_HEIGHT);

  // Compute fill ratio for each line
  const lineData = useMemo(() => {
    return lines.map((line) => ({
      ...line,
      fill: currentWidth > 0 ? line.width / currentWidth : 0,
    }));
  }, [lines, currentWidth]);

  const widthPct = ((currentWidth - MIN_WIDTH) / (MAX_WIDTH - MIN_WIDTH)) * 100;

  return (
    <SectionWrapper
      id="reflow"
      title="Fluid Reflow"
      description="Width animates via CSS transition. Pretext recalculates line breaks on every frame — pure arithmetic, no reflow."
    >
      <div className="flex flex-col items-center gap-6">
        {/* Width progress bar */}
        <div className="w-full max-w-3xl">
          <div className="flex justify-between text-xs font-mono text-zinc-600 mb-2">
            <span>{MIN_WIDTH}px</span>
            <span className="text-violet-400">{Math.round(currentWidth)}px · {lines.length} lines</span>
            <span>{MAX_WIDTH}px</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${widthPct}%`,
                background: `linear-gradient(90deg, #a78bfa, #38bdf8)`,
              }}
            />
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            width: targetWidth,
            transition: "width 2.8s cubic-bezier(0.4, 0, 0.2, 1)",
            minHeight: height ? height + 64 : undefined,
            font: FONT,
            background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(56,189,248,0.04) 100%)",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {currentWidth > 0 &&
            lineData.map((line, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  lineHeight: `${LINE_HEIGHT}px`,
                  height: LINE_HEIGHT,
                }}
              >
                {/* Fill indicator behind text */}
                <div
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{
                    width: `${line.fill * 100}%`,
                    background: `rgba(139, 92, 246, ${isHovered ? 0.08 : 0.04})`,
                    transition: "background 0.3s ease",
                  }}
                />
                <span className="relative">{line.text}</span>
              </div>
            ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTargetWidth(MIN_WIDTH)}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 transition-colors"
          >
            Narrow
          </button>
          <button
            onClick={() => setTargetWidth(Math.round((MIN_WIDTH + MAX_WIDTH) / 2))}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 transition-colors"
          >
            Medium
          </button>
          <button
            onClick={() => setTargetWidth(MAX_WIDTH)}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 transition-colors"
          >
            Wide
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
