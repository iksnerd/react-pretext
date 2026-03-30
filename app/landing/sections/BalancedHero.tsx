"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Design is not just what it looks like and feels like. Design is how it works.";

const FONT = "44px sans-serif";
const LINE_HEIGHT = 58;

function findBalancedWidth(text: string, font: string, maxWidth: number, lineHeight: number): number {
  const prepared = prepareWithSegments(text, font);
  const baseline = layoutWithLines(prepared, maxWidth, lineHeight);
  if (baseline.lineCount <= 1) return maxWidth;

  let lo = 0;
  let hi = maxWidth;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const test = layoutWithLines(prepared, mid, lineHeight);
    if (test.lineCount > baseline.lineCount) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi);
}

export function BalancedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showBalanced, setShowBalanced] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const halfWidth = Math.floor((containerWidth - 48) / 2);
  const balancedWidth = useMemo(() => {
    if (halfWidth <= 0) return 0;
    return findBalancedWidth(TEXT, FONT, halfWidth, LINE_HEIGHT);
  }, [halfWidth]);

  const unbalanced = useTextLines(TEXT, FONT, halfWidth, LINE_HEIGHT);
  const balanced = useTextLines(TEXT, FONT, balancedWidth, LINE_HEIGHT);

  const maxLineWidth = halfWidth;

  return (
    <SectionWrapper
      id="balanced"
      title="Balanced Headlines"
      description="Binary-search for the narrowest width that keeps the same line count. No more orphan words."
    >
      <div ref={containerRef} className="grid grid-cols-2 gap-12">
        {halfWidth > 0 && (
          <>
            {/* Unbalanced */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="text-xs text-zinc-600 uppercase tracking-wider font-mono">
                  Unbalanced
                </div>
                <div className="text-xs text-zinc-700 font-mono">
                  {halfWidth}px
                </div>
              </div>
              <div
                className="rounded-2xl p-8"
                style={{
                  font: FONT,
                  lineHeight: `${LINE_HEIGHT}px`,
                  border: "1px solid rgba(63,63,70,0.5)",
                  background: "rgba(24,24,27,0.5)",
                }}
              >
                {TEXT}
              </div>
              {/* Width bars */}
              <div className="mt-4 space-y-1.5">
                {unbalanced.lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 rounded-full bg-zinc-800 flex-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-600"
                        style={{ width: `${(line.width / maxLineWidth) * 100}%`, transition: "width 0.5s ease" }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-700 w-12 text-right">
                      {Math.round(line.width)}px
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balanced */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="text-xs text-violet-400/80 uppercase tracking-wider font-mono">
                  Balanced
                </div>
                <div className="text-xs text-violet-400/50 font-mono">
                  {balancedWidth}px
                </div>
                <div className="text-[10px] text-violet-400/30 font-mono">
                  saved {halfWidth - balancedWidth}px
                </div>
              </div>
              <div
                className="rounded-2xl p-8"
                style={{
                  maxWidth: balancedWidth,
                  font: FONT,
                  lineHeight: `${LINE_HEIGHT}px`,
                  border: "1px solid rgba(139,92,246,0.2)",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(56,189,248,0.03) 100%)",
                }}
              >
                {TEXT}
              </div>
              {/* Width bars */}
              <div className="mt-4 space-y-1.5" style={{ maxWidth: balancedWidth }}>
                {balanced.lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 rounded-full bg-zinc-800 flex-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(line.width / balancedWidth) * 100}%`,
                          background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-violet-400/50 w-12 text-right">
                      {Math.round(line.width)}px
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
