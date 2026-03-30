"use client";

import { useRef, type ReactNode } from "react";
import { useContainerWidth, useTextLines } from "./hooks";
import type { FontSpec, LineInfo } from "./types";
import type { PrepareOptions } from "@chenglou/pretext";

type TextLinesProps = {
  text: string;
  font: FontSpec;
  lineHeight: number;
  maxWidth?: number;
  options?: PrepareOptions;
  renderLine?: (info: LineInfo) => ReactNode;
  className?: string;
};

export function TextLines({
  text,
  font,
  lineHeight,
  maxWidth: explicitWidth,
  options,
  renderLine,
  className,
}: TextLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observedWidth = useContainerWidth(ref);
  const width = explicitWidth ?? observedWidth;
  const { lines, height } = useTextLines(text, font, width, lineHeight, options);

  return (
    <div ref={ref} className={className} style={{ height: width > 0 ? height : undefined }}>
      {width > 0 &&
        lines.map((line, i) => {
          const info: LineInfo = {
            text: line.text,
            width: line.width,
            index: i,
            isFirst: i === 0,
            isLast: i === lines.length - 1,
          };
          if (renderLine) return <div key={i}>{renderLine(info)}</div>;
          return (
            <div key={i} style={{ lineHeight: `${lineHeight}px`, height: lineHeight }}>
              {line.text}
            </div>
          );
        })}
    </div>
  );
}
