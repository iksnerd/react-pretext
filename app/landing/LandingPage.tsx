"use client";

import { Nav } from "./components/Nav";
import { KineticReveal } from "./sections/KineticReveal";
import { MouseReactive } from "./sections/MouseReactive";
import { FluidReflow } from "./sections/FluidReflow";
import { CanvasEffects } from "./sections/CanvasEffects";
import { BalancedHero } from "./sections/BalancedHero";
import { ShapedText } from "./sections/ShapedText";
import { ScrollReveal } from "./sections/ScrollReveal";
import { SplitScreen } from "./sections/SplitScreen";

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 text-zinc-100">
      <Nav />

      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-12">
        <div className="text-center max-w-3xl">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
            react-pretext
          </h1>
          <p className="text-xl text-zinc-500 mt-4">
            8 creative text effects powered by DOM-free measurement
          </p>
          <p className="text-sm text-zinc-600 mt-2">
            Built with{" "}
            <code className="text-violet-400/70">@chenglou/pretext</code>
            {" "}· no animation libraries · pure CSS + rAF
          </p>
          <div className="mt-12 text-zinc-700 animate-bounce text-sm">
            scroll to explore ↓
          </div>
        </div>
      </div>

      <KineticReveal />
      <MouseReactive />
      <FluidReflow />
      <CanvasEffects />
      <BalancedHero />
      <ShapedText />
      <ScrollReveal />
      <SplitScreen />

      {/* Footer */}
      <div className="py-20 text-center text-sm text-zinc-700">
        Powered by{" "}
        <a
          href="https://github.com/chenglou/pretext"
          className="text-violet-400/50 hover:text-violet-400 transition-colors"
        >
          @chenglou/pretext
        </a>
      </div>
    </div>
  );
}
