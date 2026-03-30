"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "The same words, two different worlds. Drag the divider and watch both sides reflow in real-time. Serif on the left, monospace on the right. Each side measures its text independently using pretext — pure arithmetic, no layout reflow. The browser doesn't even know we're doing this. While traditional approaches would trigger expensive recalculations on every pixel of drag, pretext computes each layout in under 0.1 milliseconds.";

const FONT_LEFT = "21px Georgia, serif";
const FONT_RIGHT = "16px monospace";
const LINE_HEIGHT = 33;

export function SplitScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dividerRatio, setDividerRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const padding = 32;
  const leftWidth = Math.max(80, containerWidth * dividerRatio - padding);
  const rightWidth = Math.max(80, containerWidth * (1 - dividerRatio) - padding);

  const leftLayout = useTextLines(TEXT, FONT_LEFT, leftWidth, LINE_HEIGHT);
  const rightLayout = useTextLines(TEXT, FONT_RIGHT, leftWidth > 0 ? rightWidth : 0, LINE_HEIGHT);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setDividerRatio(Math.max(0.15, Math.min(0.85, ratio)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const maxHeight = Math.max(leftLayout.height, rightLayout.height);

  return (
    <SectionWrapper
      id="split"
      title="Split-Screen Comparison"
      description="Drag the divider. Both sides reflow in real-time — layout is pure arithmetic, no jank."
    >
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          height: maxHeight ? maxHeight + 80 : 400,
          border: "1px solid rgba(63,63,70,0.5)",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {containerWidth > 0 && (
          <>
            {/* Left panel */}
            <div
              className="absolute top-0 bottom-0 left-0 overflow-hidden p-8"
              style={{
                width: `${dividerRatio * 100}%`,
                background: "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(9,9,11,1) 100%)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-violet-500/50" />
                <span className="text-xs font-mono text-violet-400/60">
                  Georgia Serif
                </span>
                <span className="text-[10px] font-mono text-violet-400/30 ml-auto">
                  {leftLayout.lineCount} lines · {Math.round(leftWidth)}px
                </span>
              </div>
              <div style={{ font: FONT_LEFT, width: leftWidth }}>
                {leftLayout.lines.map((line, i) => (
                  <div key={i} style={{ lineHeight: `${LINE_HEIGHT}px`, height: LINE_HEIGHT, whiteSpace: "nowrap" }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div
              className="absolute top-0 bottom-0 right-0 overflow-hidden p-8"
              style={{
                width: `${(1 - dividerRatio) * 100}%`,
                background: "linear-gradient(225deg, rgba(56,189,248,0.04) 0%, rgba(9,9,11,1) 100%)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-sky-500/50" />
                <span className="text-xs font-mono text-sky-400/60">
                  Monospace
                </span>
                <span className="text-[10px] font-mono text-sky-400/30 ml-auto">
                  {rightLayout.lineCount} lines · {Math.round(rightWidth)}px
                </span>
              </div>
              <div style={{ font: FONT_RIGHT, width: rightWidth }}>
                {rightLayout.lines.map((line, i) => (
                  <div key={i} style={{ lineHeight: `${LINE_HEIGHT}px`, height: LINE_HEIGHT, whiteSpace: "nowrap" }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="absolute top-0 bottom-0 z-10 flex items-center justify-center"
              style={{
                left: `${dividerRatio * 100}%`,
                transform: "translateX(-50%)",
                width: 32,
                cursor: "col-resize",
              }}
              onPointerDown={handlePointerDown}
            >
              <div
                className="w-0.5 h-full"
                style={{
                  background: isDragging
                    ? "linear-gradient(180deg, #a78bfa, #38bdf8)"
                    : "rgba(113,113,122,0.4)",
                  transition: "background 0.3s ease",
                }}
              />
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  width: 36,
                  height: 36,
                  background: isDragging ? "rgba(139,92,246,0.2)" : "rgba(39,39,42,0.9)",
                  border: `1px solid ${isDragging ? "rgba(139,92,246,0.4)" : "rgba(63,63,70,0.6)"}`,
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s ease",
                  boxShadow: isDragging ? "0 0 20px rgba(139,92,246,0.2)" : "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 5L2 7L4 9M10 5L12 7L10 9"
                    stroke={isDragging ? "#a78bfa" : "#71717a"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
