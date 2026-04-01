import type { PreparedTextWithSegments } from "@chenglou/pretext";

export type FontSpec = string;

export type TextLayoutResult = {
  height: number;
  lineCount: number;
};

export type TextLinesResult = TextLayoutResult & {
  lines: Array<{ text: string; width: number }>;
  prepared: PreparedTextWithSegments;
};

export type MeasuredTextInfo = {
  height: number;
  lineCount: number;
  measuredWidth: number;
};

export type LineInfo = {
  text: string;
  width: number;
  index: number;
  isFirst: boolean;
  isLast: boolean;
};
