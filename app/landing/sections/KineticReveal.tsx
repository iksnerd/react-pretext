"use client";

import { useState, useEffect, useRef } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Text is the oldest interface. Before buttons, before screens, before electricity — there were words. And yet we still struggle to measure them. Every time you ask the browser how tall a paragraph is, it stops everything to figure it out. Layout reflow. The silent performance killer. But what if you could know the answer before you even asked the question?";

const FONT = "30px sans-serif";
const LINE_HEIGHT = 46;

export function KineticReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    resizeObs.observe(el);

    const intObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    intObs.observe(el);

    return () => {
      resizeObs.disconnect();
      intObs.disconnect();
    };
  }, []);

  const { lines, height } = useTextLines(TEXT, FONT, width, LINE_HEIGHT);

  return (
    <SectionWrapper
      id="kinetic"
      title="Kinetic Reveal"
      description="Lines stagger in on scroll with precise positioning. No layout shift — heights are known before rendering."
    >
      <div
        ref={containerRef}
        className="relative max-w-3xl mx-auto"
        style={{ height: height || undefined, font: FONT }}
      >
        {width > 0 &&
          lines.map((line, i) => {
            // Alternate direction: even lines from left, odd from right
            const fromRight = i % 2 === 1;
            const xOffset = fromRight ? 60 : -60;

            return (
              <div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: i * LINE_HEIGHT,
                  lineHeight: `${LINE_HEIGHT}px`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateY(0) translateX(0) scale(1) rotate(0deg)"
                    : `translateY(40px) translateX(${xOffset}px) scale(0.95) rotate(${fromRight ? 1.5 : -1.5}deg)`,
                  filter: isVisible ? "blur(0px)" : "blur(6px)",
                  transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1)`,
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                <span
                  style={{
                    background: isVisible
                      ? `linear-gradient(90deg, rgba(167,139,250,${0.9 - i * 0.08}) 0%, rgba(56,189,248,${0.9 - i * 0.08}) 100%)`
                      : "none",
                    WebkitBackgroundClip: isVisible ? "text" : undefined,
                    WebkitTextFillColor: isVisible && i < 3 ? "transparent" : undefined,
                    transition: "all 1.2s ease",
                    transitionDelay: `${i * 0.1 + 0.3}s`,
                  }}
                >
                  {line.text}
                </span>
              </div>
            );
          })}
      </div>
    </SectionWrapper>
  );
}
