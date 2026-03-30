"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { useContainerWidth, useTextLines } from "./hooks";
import type { FontSpec, MeasuredTextInfo } from "./types";
import type { PrepareOptions } from "@chenglou/pretext";

type MeasuredTextProps = {
  text: string;
  font: FontSpec;
  lineHeight: number;
  options?: PrepareOptions;
  children: (info: MeasuredTextInfo) => ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function MeasuredText({
  text,
  font,
  lineHeight,
  options,
  children,
  className,
  style,
}: MeasuredTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(ref);
  const { height, lineCount } = useTextLines(
    text,
    font,
    width,
    lineHeight,
    options
  );

  return (
    <div ref={ref} className={className} style={style}>
      {width > 0 &&
        children({ height, lineCount, measuredWidth: width })}
    </div>
  );
}
