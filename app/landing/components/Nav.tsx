"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "kinetic", label: "Kinetic" },
  { id: "mouse", label: "Mouse" },
  { id: "typewriter", label: "Typewriter" },
  { id: "scatter", label: "Scatter" },
  { id: "reflow", label: "Reflow" },
  { id: "gradient-shift", label: "Gradient" },
  { id: "fade-stack", label: "Fade" },
  { id: "pulse", label: "Pulse" },
  { id: "canvas", label: "Canvas" },
  { id: "balanced", label: "Balanced" },
  { id: "shaped", label: "Shaped" },
  { id: "scroll-reveal", label: "Scroll" },
  { id: "split", label: "Split" },
];

export function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
          let maxRatio = 0;
          let maxId = "";
          visibleSections.forEach((ratio, sId) => {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = sId;
            }
          });
          if (maxId) setActive(maxId);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-center gap-1 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50">
      {SECTIONS.map(({ id, label }, i) => (
        <span key={id} className="flex items-center">
          {i > 0 && <span className="text-zinc-700 mx-1">·</span>}
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`text-sm px-2 py-1 rounded transition-colors ${
              active === id
                ? "text-violet-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </a>
        </span>
      ))}
    </nav>
  );
}
