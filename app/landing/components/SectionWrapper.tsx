"use client";

import type { ReactNode } from "react";

type SectionWrapperProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  tall?: boolean;
};

export function SectionWrapper({
  id,
  title,
  description,
  children,
  className = "",
  tall = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`${tall ? "min-h-[300vh]" : "min-h-screen"} flex flex-col items-center justify-center px-6 py-20 ${className}`}
    >
      <div className="w-full max-w-5xl">
        <div className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">
            {title}
          </h2>
          <p className="text-lg text-zinc-500 mt-2 max-w-2xl">
            {description}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
