"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis */
  max?: number;
  /** Scale applied while hovering */
  scale?: number;
  /** Show a moving light glare over the surface */
  glare?: boolean;
}

const REST: CSSProperties = {
  transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)",
};

export function Tilt({ children, className, max = 9, scale = 1.02, glare = true }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>(REST);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, o: 0 });

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * max;
    const ry = (px - 0.5) * 2 * max;
    setStyle({
      transform: `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`,
    });
    setGlarePos({ x: px * 100, y: py * 100, o: 0.18 });
  };

  const reset = () => {
    setStyle(REST);
    setGlarePos((p) => ({ ...p, o: 0 }));
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={style}
      className={cn(
        "relative transition-transform duration-200 ease-out [transform-style:preserve-3d] will-change-transform",
        className
      )}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
          style={{
            opacity: glarePos.o,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6), transparent 45%)`,
          }}
        />
      )}
    </div>
  );
}
