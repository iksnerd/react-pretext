"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "The text breathes. Each line pulses with a different rhythm, creating a wave of opacity that flows through the paragraph. Some lines are bright while others dim, and the pattern shifts continuously. It's like watching the text inhale and exhale, a gentle animation that suggests life and presence without being distracting. The effect is calming and hypnotic.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;

export function TextPulse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, width, LINE_HEIGHT);

  // Animate time for pulse effect
  useEffect(() => {
    let rafId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTime(elapsed);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Pre-compute opacity for each line with smoother pulse
  const lineOpacities = useMemo(() => {
    return lines.map((_, i) => {
      const phase = i * 0.2 + time * 0.5;
      const pulse = 0.5 + Math.sin(phase) * 0.5;
      const opacity = 0.3 + pulse * 0.7;
      return opacity;
    });
  }, [lines, time]);

  return (
    <SectionWrapper
      id="pulse"
      title="Text Pulse"
      description="Lines breathe with staggered sine-wave opacity, creating a gentle wave of visibility."
    >
      <div
        ref={containerRef}
        className="relative max-w-3xl mx-auto rounded-2xl p-10"
        style={{
          height: height || undefined,
          font: FONT,
          lineHeight: `${LINE_HEIGHT}px`,
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(56,189,248,0.06) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.04)",
        }}
      >
        {width > 0 &&
          lines.map((line, i) => (
            <div
              key={i}
              style={{
                lineHeight: `${LINE_HEIGHT}px`,
                height: LINE_HEIGHT,
                opacity: lineOpacities[i],
                textShadow: `0 0 ${12 * Math.max(0, lineOpacities[i] - 0.3)}px rgba(167,139,250,${Math.max(0, lineOpacities[i] - 0.3) * 0.6}), 0 0 ${6 * Math.max(0, lineOpacities[i] - 0.3)}px rgba(56,189,248,${Math.max(0, lineOpacities[i] - 0.3) * 0.3})`,
                transition: "none",
              }}
            >
              {line.text}
            </div>
          ))}
      </div>
    </SectionWrapper>
  );
}
