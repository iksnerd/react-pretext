"use client";

import { createContext, useContext } from "react";

type PretextDefaults = {
  font: string;
  lineHeight: number;
};

const PretextContext = createContext<PretextDefaults>({
  font: "16px sans-serif",
  lineHeight: 24,
});

export const PretextProvider = PretextContext.Provider;
export const usePretextDefaults = () => useContext(PretextContext);
