"use client";

import { useState, useCallback } from "react";
import {
  MeasuredText,
  TextLines,
  VirtualText,
  BalancedText,
  TruncatedText,
} from "@/lib/pretext";
import type { LineInfo } from "@/lib/pretext";

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. AGI 春天到了. بدأت الرحلة 🚀 Meanwhile, the cosmos expands at an accelerating rate, galaxies drift apart like thoughts in a daydream, and somewhere a mass of particles assembles itself into something that wonders why it exists at all.";

const LONG_TEXT = Array.from(
  { length: 50 },
  (_, i) =>
    `[${i + 1}] ${SAMPLE_TEXT}`
).join(" ");

const FONTS = [
  { label: "Sans-serif 16px", value: "16px sans-serif" },
  { label: "Serif 18px", value: "18px Georgia, serif" },
  { label: "Monospace 14px", value: "14px monospace" },
  { label: "Sans-serif 24px", value: "24px sans-serif" },
];

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg px-3 py-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-sm font-mono text-violet-400">{String(value)}</div>
    </div>
  );
}

export default function Playground() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [font, setFont] = useState(FONTS[0].value);
  const [maxWidth, setMaxWidth] = useState(400);
  const [lineHeight, setLineHeight] = useState(24);
  const [maxLines, setMaxLines] = useState(3);
  const [virtualRange, setVirtualRange] = useState("0-0 of 0");

  const handleVisibleRange = useCallback(
    (start: number, end: number, total: number) => {
      setVirtualRange(`${start + 1}-${end} of ${total}`);
    },
    []
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            react-pretext playground
          </h1>
          <p className="text-zinc-500 mt-1">
            React primitives for{" "}
            <code className="text-violet-400">@chenglou/pretext</code> — text
            measurement without DOM reflow
          </p>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-zinc-400 block mb-1">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Font</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                Max Width: {maxWidth}px
              </label>
              <input
                type="range"
                min={100}
                max={800}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                Line Height: {lineHeight}px
              </label>
              <input
                type="range"
                min={12}
                max={60}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                Max Lines (truncation): {maxLines}
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={maxLines}
                onChange={(e) => setMaxLines(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MeasuredText */}
          <Card
            title="MeasuredText"
            description="Measures text height and line count via render prop — no DOM reflow"
          >
            <MeasuredText
              text={text}
              font={font}
              lineHeight={lineHeight}
              className="border border-zinc-700 rounded-lg p-4"
              style={{ maxWidth }}
            >
              {(info) => (
                <>
                  <div
                    style={{
                      font,
                      lineHeight: `${lineHeight}px`,
                    }}
                  >
                    {text}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Stat label="Height" value={`${info.height}px`} />
                    <Stat label="Lines" value={info.lineCount} />
                    <Stat label="Width" value={`${Math.round(info.measuredWidth)}px`} />
                  </div>
                </>
              )}
            </MeasuredText>
          </Card>

          {/* TextLines */}
          <Card
            title="TextLines"
            description="Each line rendered separately with per-line styling"
          >
            <div
              className="border border-zinc-700 rounded-lg p-4 overflow-hidden"
              style={{ maxWidth }}
            >
              <TextLines
                text={text}
                font={font}
                lineHeight={lineHeight}
                renderLine={(info: LineInfo) => (
                  <div
                    className="relative"
                    style={{
                      font,
                      lineHeight: `${lineHeight}px`,
                      height: lineHeight,
                    }}
                  >
                    <div
                      className={`absolute inset-0 ${
                        info.index % 2 === 0
                          ? "bg-violet-500/10"
                          : "bg-sky-500/10"
                      }`}
                      style={{
                        width: `${(info.width / maxWidth) * 100}%`,
                      }}
                    />
                    <span className="relative">{info.text}</span>
                    <span className="absolute right-0 top-0 text-xs text-zinc-600 font-mono">
                      {Math.round(info.width)}px
                    </span>
                  </div>
                )}
              />
            </div>
          </Card>

          {/* BalancedText */}
          <Card
            title="BalancedText"
            description="Binary-searches for the narrowest width that preserves line count"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-zinc-500 mb-2">Normal</div>
                <div
                  className="border border-zinc-700 rounded-lg p-3"
                  style={{ maxWidth: maxWidth / 2 }}
                >
                  <div style={{ font, lineHeight: `${lineHeight}px` }}>
                    {text}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-2">Balanced</div>
                <BalancedText
                  text={text}
                  font={font}
                  lineHeight={lineHeight}
                  maxWidth={maxWidth / 2}
                  className="border border-violet-500/30 rounded-lg p-3"
                />
              </div>
            </div>
          </Card>

          {/* TruncatedText */}
          <Card
            title="TruncatedText"
            description={`Truncated to ${maxLines} line${maxLines === 1 ? "" : "s"} with ellipsis`}
          >
            <div
              className="border border-zinc-700 rounded-lg p-4"
              style={{ maxWidth, font }}
            >
              <TruncatedText
                text={text}
                font={font}
                lineHeight={lineHeight}
                maxLines={maxLines}
                expandable
              />
            </div>
          </Card>

          {/* VirtualText */}
          <Card
            title="VirtualText"
            description="Virtualized scrolling — only visible lines are in the DOM"
          >
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-500">
                Visible: {virtualRange}
              </div>
              <VirtualText
                text={LONG_TEXT}
                font={font}
                lineHeight={lineHeight}
                viewportHeight={200}
                maxWidth={maxWidth}
                overscan={3}
                onVisibleRangeChange={handleVisibleRange}
                className="border border-zinc-700 rounded-lg"
                renderLine={(info: LineInfo) => (
                  <div
                    style={{
                      font,
                      lineHeight: `${lineHeight}px`,
                      height: lineHeight,
                      paddingLeft: 8,
                      paddingRight: 8,
                    }}
                    className={
                      info.index % 2 === 0 ? "bg-zinc-800/50" : ""
                    }
                  >
                    {info.text}
                  </div>
                )}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
