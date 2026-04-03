"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Lines appear one by one, each fading in with a blur and scale. The staggered animation creates a sense of depth — each line feels like it's emerging from the distance. Earlier lines fade slightly as later ones arrive, creating a visual stack that feels dimensional despite being 2D text. The effect suggests layering without any actual 3D transforms.";

const FONT = "28px sans-serif";
const LINE_HEIGHT = 44;

type RevealLineProps = {
  line: string;
  index: number;
  isVisible: boolean;
};

const RevealLine = memo(({ line, index, isVisible }: RevealLineProps) => {
  const opacity = isVisible ? 1 : 0;
  const scale = isVisible ? 1 : 0.85;
  const blur = isVisible ? 0 : 10;
  const y = isVisible ? 0 : -16;

  return (
    <div
      style={{
        lineHeight: `${LINE_HEIGHT}px`,
        height: LINE_HEIGHT,
        opacity: 0.35 + opacity * 0.65,
        transform: `translateY(${y}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${index * 0.12}s`,
        transformOrigin: "center",
      }}
    >
      {line}
    </div>
  );
});

export function FadeStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    obs.observe(el);

    const intObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    intObs.observe(el);

    return () => {
      obs.disconnect();
      intObs.disconnect();
    };
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, width, LINE_HEIGHT);

  return (
    <SectionWrapper
      id="fade-stack"
      title="Fade Stack"
      description="Lines fade in sequentially, creating the illusion of depth as each emerges from blur."
    >
      <div
        ref={containerRef}
        className="relative max-w-3xl mx-auto rounded-2xl p-10"
        style={{
          height: height || undefined,
          font: FONT,
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(56,189,248,0.06) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(139,92,246,0.04)",
        }}
      >
        {width > 0 &&
          lines.map((line, i) => (
            <RevealLine
              key={i}
              line={line.text}
              index={i}
              isVisible={isVisible}
            />
          ))}
      </div>
    </SectionWrapper>
  );
}
