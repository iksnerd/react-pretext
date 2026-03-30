"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";
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

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const top = e.currentTarget.scrollTop;
      setScrollTop(top);
      if (onVisibleRangeChange && lines.length > 0) {
        const start = Math.floor(top / lineHeight);
        const end = Math.min(
          Math.ceil((top + viewportHeight) / lineHeight),
          lines.length
        );
        onVisibleRangeChange(start, end, lines.length);
      }
    },
    [lineHeight, viewportHeight, lines.length, onVisibleRangeChange]
  );

  useEffect(() => {
    if (onVisibleRangeChange && lines.length > 0) {
      const start = Math.floor(scrollTop / lineHeight);
      const end = Math.min(
        Math.ceil((scrollTop + viewportHeight) / lineHeight),
        lines.length
      );
      onVisibleRangeChange(start, end, lines.length);
    }
  }, [lines.length, scrollTop, lineHeight, viewportHeight, onVisibleRangeChange]);

  const startIdx = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
  const endIdx = Math.min(
    lines.length,
    Math.ceil((scrollTop + viewportHeight) / lineHeight) + overscan
  );
  const offsetY = startIdx * lineHeight;

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
            lines.slice(startIdx, endIdx).map((line, i) => {
              const idx = startIdx + i;
              const info: LineInfo = {
                text: line.text,
                width: line.width,
                index: idx,
                isFirst: idx === 0,
                isLast: idx === lines.length - 1,
              };
              if (renderLine) return <div key={idx}>{renderLine(info)}</div>;
              return (
                <div
                  key={idx}
                  style={{ lineHeight: `${lineHeight}px`, height: lineHeight }}
                >
                  {line.text}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
