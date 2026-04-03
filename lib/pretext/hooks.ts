"use client";

import { useMemo, useState, useEffect, type RefObject } from "react";
import {
  prepareWithSegments,
  layoutWithLines,
  clearCache,
  setLocale,
  type PrepareOptions,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";
import type { FontSpec, TextLayoutResult, TextLinesResult } from "./types";

export function useContainerWidth(
  ref: RefObject<HTMLElement | null>
): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentBoxSize[0].inlineSize);
    });
    observer.observe(el);
    return () => observer.disconnect();
    // ref is a stable RefObject — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return width;
}

export function usePreparedText(
  text: string,
  font: FontSpec,
  options?: PrepareOptions
): PreparedTextWithSegments {
  // Intentionally watching only options.whiteSpace — other PrepareOptions fields don't affect layout
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => prepareWithSegments(text, font, options), [text, font, options?.whiteSpace]);
}

export function useTextLayout(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number
): TextLayoutResult {
  return useMemo(() => {
    if (maxWidth <= 0) return { height: 0, lineCount: 0 };
    const result = layoutWithLines(prepared, maxWidth, lineHeight);
    return { height: result.height, lineCount: result.lineCount };
  }, [prepared, maxWidth, lineHeight]);
}

export function useTextLines(
  text: string,
  font: FontSpec,
  maxWidth: number,
  lineHeight: number,
  options?: PrepareOptions
): TextLinesResult {
  const prepared = usePreparedText(text, font, options);
  return useMemo(() => {
    if (maxWidth <= 0)
      return { height: 0, lineCount: 0, lines: [], prepared };
    const result = layoutWithLines(prepared, maxWidth, lineHeight);
    return {
      height: result.height,
      lineCount: result.lineCount,
      lines: result.lines.map((l) => ({ text: l.text, width: l.width })),
      prepared,
    };
  }, [prepared, maxWidth, lineHeight]);
}

/**
 * Clear Pretext's internal canvas measurement cache.
 * Useful when cycling through many different fonts or text variants.
 * Automatically called by setTextLocale().
 */
export function useClearCache() {
  return clearCache;
}

/**
 * Set the locale for text measurement (affects bidi, segmentation, line-break behavior).
 * Automatically clears the cache.
 */
export function useSetLocale() {
  return setLocale;
}
