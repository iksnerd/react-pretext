"use client";

import { useState, useMemo } from "react";
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from "@chenglou/pretext";
import { SectionWrapper } from "../components/SectionWrapper";

const TEXT =
  "Text can take any shape you imagine. A circle, a diamond, a wave — pretext makes it possible by laying out one line at a time with a different maximum width for each row. Because layout is pure arithmetic, we can binary-search hundreds of widths instantly to find the perfect fit. The text flows into the shape like water filling a vessel. Each line is measured, positioned, and centered independently. No CSS tricks. No clip-path hacks. Just math and measurement, working together to bend text to your will. This is what becomes possible when you separate measurement from rendering.";

const FONT = "15px sans-serif";
const LINE_HEIGHT = 22;
const MAX_SHAPE_WIDTH = 520;
const MAX_ROWS = 40;

type Shape = "circle" | "diamond" | "wave";

const SHAPES: { id: Shape; label: string; icon: string }[] = [
  { id: "circle", label: "Circle", icon: "○" },
  { id: "diamond", label: "Diamond", icon: "◇" },
  { id: "wave", label: "Wave", icon: "∿" },
];

function shapeWidthFn(shape: Shape, row: number, totalRows: number): number {
  const t = row / (totalRows - 1);
  switch (shape) {
    case "circle": {
      const r = totalRows * LINE_HEIGHT / 2;
      const y = (row - (totalRows - 1) / 2) * LINE_HEIGHT;
      return Math.max(40, 2 * Math.sqrt(Math.max(0, r * r - y * y)));
    }
    case "diamond": {
      return Math.max(40, MAX_SHAPE_WIDTH * (1 - Math.abs(2 * t - 1)));
    }
    case "wave": {
      const base = MAX_SHAPE_WIDTH * 0.5;
      const amp = MAX_SHAPE_WIDTH * 0.38;
      return Math.max(40, base + amp * Math.sin(t * Math.PI * 2.5));
    }
  }
}

function computeShapedLines(shape: Shape) {
  const prepared = prepareWithSegments(TEXT, FONT);
  const lines: Array<{ text: string; width: number; maxWidth: number; offsetX: number }> = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };

  for (let row = 0; row < MAX_ROWS; row++) {
    const maxWidth = shapeWidthFn(shape, row, MAX_ROWS);
    const line = layoutNextLine(prepared, cursor, maxWidth);
    if (!line) break;
    const offsetX = (MAX_SHAPE_WIDTH - maxWidth) / 2 + (maxWidth - line.width) / 2;
    lines.push({ text: line.text, width: line.width, maxWidth, offsetX });
    cursor = line.end;
  }

  return lines;
}

export function ShapedText() {
  const [shape, setShape] = useState<Shape>("circle");

  const lines = useMemo(() => computeShapedLines(shape), [shape]);

  // Compute the shape outline for the ghost guide
  const outlinePoints = useMemo(() => {
    const points: string[] = [];
    for (let row = 0; row < MAX_ROWS; row++) {
      const w = shapeWidthFn(shape, row, MAX_ROWS);
      const x = (MAX_SHAPE_WIDTH - w) / 2;
      const y = row * LINE_HEIGHT;
      if (row === 0) points.push(`M ${x} ${y}`);
      else points.push(`L ${x} ${y}`);
    }
    for (let row = MAX_ROWS - 1; row >= 0; row--) {
      const w = shapeWidthFn(shape, row, MAX_ROWS);
      const x = (MAX_SHAPE_WIDTH + w) / 2;
      const y = row * LINE_HEIGHT;
      points.push(`L ${x} ${y}`);
    }
    points.push("Z");
    return points.join(" ");
  }, [shape]);

  const totalHeight = lines.length * LINE_HEIGHT;

  return (
    <SectionWrapper
      id="shaped"
      title="Shaped Text"
      description="Text fills any geometric shape. Each line gets a different max-width computed from the shape function."
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setShape(s.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                shape === s.id
                  ? "bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10"
                  : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div
          className="relative"
          style={{
            width: MAX_SHAPE_WIDTH,
            height: totalHeight,
            font: FONT,
          }}
        >
          {/* Shape outline guide */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={MAX_SHAPE_WIDTH}
            height={MAX_ROWS * LINE_HEIGHT}
            style={{ opacity: 0.08 }}
          >
            <path d={outlinePoints} fill="none" stroke="#a78bfa" strokeWidth="1" />
          </svg>

          {/* Text lines */}
          {lines.map((line, i) => {
            const t = lines.length > 1 ? i / (lines.length - 1) : 0;
            return (
              <div
                key={`${shape}-${i}`}
                className="absolute whitespace-nowrap"
                style={{
                  top: i * LINE_HEIGHT,
                  left: line.offsetX,
                  lineHeight: `${LINE_HEIGHT}px`,
                  transition: "left 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
                  transitionDelay: `${i * 0.015}s`,
                  opacity: 0.5 + t * 0.5,
                  color: `hsl(${260 + t * 40}, 60%, ${70 + t * 10}%)`,
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
