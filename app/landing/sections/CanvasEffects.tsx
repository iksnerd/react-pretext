"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTextLines } from "@/lib/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "This text is not rendered by the DOM. Every letter you see is drawn on a Canvas element, positioned using pretext's line-break data. The gradient shifts. The glow pulses. But the measurement — the knowledge of where each line begins and ends — that comes from pure arithmetic. No getBoundingClientRect. No offsetHeight. Just math.";

const FONT = "26px sans-serif";
const LINE_HEIGHT = 42;
const CANVAS_WIDTH = 720;

export function CanvasEffects() {
  const rafRef = useRef<number>(0);

  const { lines, height } = useTextLines(TEXT, FONT, CANVAS_WIDTH, LINE_HEIGHT);

  const canvasCallback = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      cancelAnimationFrame(rafRef.current);
      if (!canvas || lines.length === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const totalHeight = height + 20; // extra padding for glow bleed
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = totalHeight * dpr;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${totalHeight}px`;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      const draw = (time: number) => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, totalHeight);

        // Subtle background scanlines
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < totalHeight; y += 3) {
          ctx.fillStyle = "#a78bfa";
          ctx.fillRect(0, y, CANVAS_WIDTH, 1);
        }
        ctx.globalAlpha = 1;

        lines.forEach((line, i) => {
          const y = i * LINE_HEIGHT + 10; // offset for glow room
          const baselineY = y + LINE_HEIGHT * 0.72;
          const phase = time * 0.001 + i * 0.8;
          const pulse = 0.7 + Math.sin(phase) * 0.3;

          // Outer glow (drawn first, bigger blur)
          ctx.save();
          ctx.shadowBlur = 35 * pulse;
          ctx.shadowColor = `hsla(${260 + i * 12}, 85%, 65%, ${0.4 * pulse})`;
          ctx.font = FONT;
          ctx.fillStyle = "transparent";
          ctx.fillText(line.text, 0, baselineY);
          ctx.restore();

          // Inner glow
          ctx.save();
          ctx.shadowBlur = 12 * pulse;
          ctx.shadowColor = `hsla(${220 + i * 15}, 90%, 70%, ${0.5 * pulse})`;

          // Gradient fill per line — animated hue
          const grad = ctx.createLinearGradient(0, y, line.width, y + LINE_HEIGHT);
          const hShift = Math.sin(time * 0.0008 + i * 0.5) * 30;
          grad.addColorStop(0, `hsl(${265 + hShift}, 85%, ${72 + pulse * 8}%)`);
          grad.addColorStop(0.5, `hsl(${230 + hShift}, 80%, ${75 + pulse * 8}%)`);
          grad.addColorStop(1, `hsl(${200 + hShift}, 85%, ${70 + pulse * 8}%)`);

          ctx.font = FONT;
          ctx.fillStyle = grad;
          ctx.fillText(line.text, 0, baselineY);
          ctx.restore();

          // Underline accent on each line
          const underlineY = baselineY + 4;
          const underGrad = ctx.createLinearGradient(0, underlineY, line.width, underlineY);
          underGrad.addColorStop(0, `hsla(${265 + hShift}, 80%, 65%, ${0.3 * pulse})`);
          underGrad.addColorStop(1, `hsla(${200 + hShift}, 80%, 65%, 0)`);
          ctx.fillStyle = underGrad;
          ctx.fillRect(0, underlineY, line.width, 1.5);
        });

        rafRef.current = requestAnimationFrame(draw);
      };

      rafRef.current = requestAnimationFrame(draw);
    },
    [lines, height]
  );

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <SectionWrapper
      id="canvas"
      title="Canvas Effects"
      description="Text rendered on Canvas with animated gradients and glow. Pretext measures, Canvas draws."
    >
      <div className="flex justify-center">
        <div
          className="rounded-2xl overflow-hidden p-8"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, rgba(9,9,11,1) 70%)",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
        >
          <canvas
            ref={canvasCallback}
            style={{ width: CANVAS_WIDTH, height: height ? height + 20 : 0 }}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
