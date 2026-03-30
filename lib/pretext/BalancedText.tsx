"use client";

import { useRef, useMemo } from "react";
import { layoutWithLines, type PrepareOptions, type PreparedTextWithSegments } from "@chenglou/pretext";
import { useContainerWidth, usePreparedText } from "./hooks";
import type { FontSpec } from "./types";

type BalancedTextProps = {
  text: string;
  font: FontSpec;
  lineHeight: number;
  maxWidth?: number;
  options?: PrepareOptions;
  className?: string;
};

function findBalancedWidth(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number
): number {
  const baseline = layoutWithLines(prepared, maxWidth, lineHeight);
  if (baseline.lineCount <= 1) return maxWidth;

  let lo = 0;
  let hi = maxWidth;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const test = layoutWithLines(prepared, mid, lineHeight);
    if (test.lineCount > baseline.lineCount) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.ceil(hi);
}

export function BalancedText({
  text,
  font,
  lineHeight,
  maxWidth: explicitWidth,
  options,
  className,
}: BalancedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observedWidth = useContainerWidth(ref);
  const width = explicitWidth ?? observedWidth;
  const prepared = usePreparedText(text, font, options);

  const balancedWidth = useMemo(() => {
    if (width <= 0) return 0;
    return findBalancedWidth(prepared, width, lineHeight);
  }, [prepared, width, lineHeight]);

  return (
    <div ref={ref} className={className}>
      {balancedWidth > 0 && (
        <div style={{ maxWidth: balancedWidth, lineHeight: `${lineHeight}px`, font }}>
          {text}
        </div>
      )}
    </div>
  );
}
