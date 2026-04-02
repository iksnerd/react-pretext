"use client";

import { useRef, useState, useCallback, useEffect, useMemo, memo, type ReactNode } from "react";
import { useContainerWidth, useTextLines } from "./hooks";
import type { FontSpec, LineInfo } from "./types";
import type { PrepareOptions } from "@chenglou/pretext";

type VirtualTextProps = {
  text: string;
  font: FontSpec;
  lineHeight: number;
  viewportHeight: number;
  maxWidth?: number;
  options?: PrepareOptions;
  overscan?: number;
  renderLine?: (info: LineInfo) => ReactNode;
  className?: string;
  onVisibleRangeChange?: (start: number, end: number, total: number) => void;
};

type VirtualLineProps = {
  lineInfo: LineInfo;
  renderLine?: (info: LineInfo) => ReactNode;
  lineHeight: number;
};

const VirtualLine = memo(function VirtualLine({
  lineInfo,
  renderLine,
  lineHeight,
}: VirtualLineProps) {
  if (renderLine) return <div>{renderLine(lineInfo)}</div>;
  return (
    <div
      style={{ lineHeight: `${lineHeight}px`, height: lineHeight }}
    >
      {lineInfo.text}
    </div>
  );
});

export function VirtualText({
  text,
  font,
  lineHeight,
  viewportHeight,
  maxWidth: explicitWidth,
  options,
  overscan = 3,
  renderLine,
  className,
  onVisibleRangeChange,
}: VirtualTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observedWidth = useContainerWidth(ref);
  const width = explicitWidth ?? observedWidth;
  const { lines, height: totalHeight } = useTextLines(
    text,
    font,
    width,
    lineHeight,
    options
  );
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Memoize visible range calculation to avoid unnecessary updates
  const visibleRange = useMemo(() => {
    if (lines.length === 0) return { start: 0, end: 0 };
    const start = Math.floor(scrollTop / lineHeight);
    const end = Math.min(
      Math.ceil((scrollTop + viewportHeight) / lineHeight),
      lines.length
    );
    return { start, end };
  }, [scrollTop, lineHeight, viewportHeight, lines.length]);

  // Call onVisibleRangeChange only when the visible range actually changes
  useEffect(() => {
    if (onVisibleRangeChange && lines.length > 0) {
      onVisibleRangeChange(visibleRange.start, visibleRange.end, lines.length);
    }
  }, [visibleRange.start, visibleRange.end, lines.length, onVisibleRangeChange]);

  const startIdx = Math.max(0, visibleRange.start - overscan);
  const endIdx = Math.min(lines.length, visibleRange.end + overscan);
  const offsetY = startIdx * lineHeight;

  const visibleLines = useMemo(
    () => lines.slice(startIdx, endIdx),
    [lines, startIdx, endIdx]
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{ height: viewportHeight, overflowY: "auto" }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {width > 0 &&
            visibleLines.map((line, i) => {
              const idx = startIdx + i;
              const info: LineInfo = {
                text: line.text,
                width: line.width,
                index: idx,
                isFirst: idx === 0,
                isLast: idx === lines.length - 1,
              };
              return (
                <VirtualLine
                  key={idx}
                  lineInfo={info}
                  renderLine={renderLine}
                  lineHeight={lineHeight}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
