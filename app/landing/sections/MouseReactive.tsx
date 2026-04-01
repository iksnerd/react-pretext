"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Move your cursor over this text and watch each line respond to your presence. The closer you get, the more each line reacts — shifting, scaling, glowing. All of this happens without a single DOM measurement. Pretext knows each line's position through pure arithmetic, so we can compute proximity in a requestAnimationFrame loop without triggering layout reflow. Hover anywhere. The text knows where you are.";

const FONT = "24px sans-serif";
const LINE_HEIGHT = 38;
const INFLUENCE_RADIUS = 220;

export function MouseReactive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number>(0);
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

  const { lines, height } = useTextLines(TEXT, FONT, width, LINE_HEIGHT);

  useEffect(() => {
    function animate() {
      const container = containerRef.current;
      if (!container) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      const rect = container.getBoundingClientRect();
      const { x: mx, y: my, active } = mouseRef.current;

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const lineCenterY = rect.top + i * LINE_HEIGHT + LINE_HEIGHT / 2;
        const lineCenterX = rect.left + rect.width / 2;

        if (!active) {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.filter = "";
          el.style.letterSpacing = "";
          el.style.textShadow = "";
          return;
        }

        const dy = my - lineCenterY;
        const dx = mx - lineCenterX;
        const dist = Math.sqrt(dy * dy + dx * dx * 0.15);
        const p = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
        const p2 = p * p; // quadratic for snappier falloff

        // Push lines away from cursor on Y axis, attract on X
        const pushY = dy > 0 ? -p2 * 8 : p2 * 8;
        const pullX = p2 * 30 * Math.sign(dx);

        el.style.transform = `translateX(${pullX}px) translateY(${pushY}px) scale(${1 + p2 * 0.08}) skewX(${p2 * -2 * Math.sign(dx)}deg)`;
        el.style.opacity = `${0.25 + p * 0.75}`;
        el.style.letterSpacing = `${p2 * 3}px`;
        el.style.filter = p > 0.1 ? `brightness(${1 + p2 * 0.6})` : "";

        if (p2 > 0.15) {
          const violet = Math.round(167 + p2 * 88);
          const blue = Math.round(139 + p2 * 116);
          el.style.textShadow = `0 0 ${p2 * 30}px rgba(${violet}, ${blue}, 250, ${p2 * 0.7})`;
        } else {
          el.style.textShadow = "";
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { ...mouseRef.current, active: false };
    lineRefs.current.forEach((el) => {
      if (el) {
        el.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        setTimeout(() => {
          if (el) el.style.transition = "";
        }, 600);
      }
    });
  }, []);

  return (
    <SectionWrapper
      id="mouse"
      title="Mouse-Reactive Text"
      description="Lines respond to cursor proximity. No DOM queries — positions are pure math from pretext."
    >
      <div
        ref={containerRef}
        className="relative max-w-3xl mx-auto cursor-crosshair"
        style={{ height: height || undefined, font: FONT }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {width > 0 &&
          lines.map((line, i) => (
            <div
              key={i}
              ref={(el) => { lineRefs.current[i] = el; }}
              className="absolute left-0 right-0 will-change-transform"
              style={{
                top: i * LINE_HEIGHT,
                lineHeight: `${LINE_HEIGHT}px`,
                opacity: 0.25,
                transition: "none",
              }}
            >
              {line.text}
            </div>
          ))}
        {/* Hint overlay when no mouse interaction */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.4 }}
        >
          <div className="text-sm text-zinc-600 bg-zinc-950/80 px-4 py-2 rounded-full backdrop-blur-sm">
            hover to interact
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
