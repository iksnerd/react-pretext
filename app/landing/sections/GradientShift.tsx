"use client";

import { useState, useEffect, useRef } from "react";
import { useTextLines } from "@/lib/pretext";

const TEXT =
  "Watch the color gradient shift across the text as you scroll. The hue follows your scroll position, cycling through the spectrum. It's a visual progress indicator embedded in the text itself — you can literally see how far through the page you've traveled. The gradient slides smoothly, respecting the rhythm of your scroll.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;
const MAX_WIDTH = 720;

export function GradientShift() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, width || MAX_WIDTH, LINE_HEIGHT);

  // Track scroll progress
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!sectionRef.current) return;

        const scrollY = window.scrollY;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const viewH = window.innerHeight;

        const scrolled = Math.max(0, scrollY + viewH - sectionTop);
        const total = sectionHeight;
        const newProgress = Math.max(0, Math.min(1, scrolled / total));

        setProgress(newProgress);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);



  return (
    <section
      ref={sectionRef}
      id="gradient-shift"
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <div className="w-full max-w-5xl">
        <div className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">
            Gradient Shift
          </h2>
          <p className="text-lg text-zinc-500 mt-2 max-w-2xl">
            Scroll to watch the color gradient flow across the text. Your scroll position is the color map.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative max-w-3xl mx-auto rounded-2xl p-10"
          style={{
            font: FONT,
            lineHeight: `${LINE_HEIGHT}px`,
            minHeight: height || undefined,
            background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(56,189,248,0.06) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.04)",
          }}
        >
          {width > 0 &&
            lines.map((line, i) => {
              const lineProgress = (i / lines.length) * 0.3 + progress;
              const hue = (lineProgress * 360) % 360;
              return (
                <div
                  key={i}
                  style={{
                    lineHeight: `${LINE_HEIGHT}px`,
                    height: LINE_HEIGHT,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundImage: `linear-gradient(90deg, 
                      hsl(${(hue - 60) % 360}, 85%, 60%) 0%,
                      hsl(${hue}, 85%, 60%) 50%,
                      hsl(${(hue + 60) % 360}, 85%, 60%) 100%)`,
                    transition: "background-image 0.05s linear",
                  }}
                >
                  {line.text}
                </div>
              );
            })}
        </div>

        {/* Progress indicator */}
        <div className="mt-10 flex justify-center">
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, 
                  hsl(${(progress * 360) % 360}, 85%, 60%),
                  hsl(${((progress * 360) + 120) % 360}, 85%, 60%),
                  hsl(${((progress * 360) + 240) % 360}, 85%, 60%))`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
