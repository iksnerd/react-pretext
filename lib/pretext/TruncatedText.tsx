"use client";

import { useRef, useState } from "react";
import { useContainerWidth, useTextLines } from "./hooks";
import type { FontSpec } from "./types";
import type { PrepareOptions } from "@chenglou/pretext";

type TruncatedTextProps = {
  text: string;
  font: FontSpec;
  lineHeight: number;
  maxLines: number;
  maxWidth?: number;
  options?: PrepareOptions;
  ellipsis?: string;
  expandable?: boolean;
  className?: string;
};

export function TruncatedText({
  text,
  font,
  lineHeight,
  maxLines,
  maxWidth: explicitWidth,
  options,
  ellipsis = "\u2026",
  expandable = false,
  className,
}: TruncatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observedWidth = useContainerWidth(ref);
  const width = explicitWidth ?? observedWidth;
  const { lines } = useTextLines(text, font, width, lineHeight, options);
  const [expanded, setExpanded] = useState(false);

  const isTruncated = lines.length > maxLines && !expanded;
  const visibleLines = isTruncated ? lines.slice(0, maxLines) : lines;

  return (
    <div ref={ref} className={className}>
      {width > 0 && (
        <>
          <div style={{ lineHeight: `${lineHeight}px` }}>
            {visibleLines.map((line, i) => {
              const isLastVisible = i === visibleLines.length - 1;
              const showEllipsis = isTruncated && isLastVisible;
              return (
                <div key={i} style={{ height: lineHeight }}>
                  {showEllipsis
                    ? line.text.trimEnd() + ellipsis
                    : line.text}
                </div>
              );
            })}
          </div>
          {expandable && lines.length > maxLines && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-violet-400 hover:text-violet-300 mt-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
