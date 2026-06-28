"use client";

import { cn } from "@/lib/utils";

interface PlantProps {
  streak: number;
  wilted?: boolean;
  className?: string;
  animated?: boolean;
  phaseOffset?: number;
  perkAnimation?: boolean;
  shakeAnimation?: boolean;
}

function getStage(streak: number): number {
  if (streak <= 0) return 0;
  if (streak <= 3) return 1;
  if (streak <= 7) return 2;
  if (streak <= 14) return 3;
  if (streak <= 29) return 4;
  return 5;
}

export function Plant({ streak, wilted = false, className, animated = true, phaseOffset = 0, perkAnimation = false, shakeAnimation = false }: PlantProps) {
  const stage = getStage(streak);
  const green = wilted ? "hsl(var(--drought))" : "hsl(var(--primary))";
  const soil = "hsl(var(--muted-foreground) / 0.2)";
  const bloom = "hsl(var(--bloom))";

  return (
    <div
      className={cn(
        "relative inline-flex",
        animated && !wilted && stage > 0 && "animate-sway",
        wilted && "plant-wilted",
        perkAnimation && "plant-perk",
        shakeAnimation && "plant-shake",
        className
      )}
      style={animated && phaseOffset ? { animationDelay: `${phaseOffset}s` } : undefined}
    >
      <svg
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Soil mound */}
        <ellipse cx="32" cy="74" rx="20" ry="4" fill={soil} />

        {/* Stage 0 — seed */}
        {stage === 0 && (
          <circle cx="32" cy="72" r="2.5" fill={green} opacity={0.4} />
        )}

        {/* Stem — grows taller with stage */}
        {stage >= 1 && (
          <path
            d={
              stage === 1
                ? "M 32 74 Q 31 66 32 58"
                : stage === 2
                ? "M 32 74 C 31 64 30 54 32 46"
                : stage === 3
                ? "M 32 74 C 30 62 31 48 32 36"
                : "M 32 74 C 29 60 31 44 32 28"
            }
            stroke={green}
            strokeWidth={stage <= 2 ? 2 : 2.5}
            strokeLinecap="round"
          />
        )}

        {/* Leaf pair 1 — cotyledons (y ≈ 58) */}
        {stage >= 1 && (
          <>
            <path
              d="M 32 58 C 28 56 22 54 20 57 C 22 60 28 60 32 58"
              fill={green}
            />
            <path
              d="M 32 58 C 36 56 42 54 44 57 C 42 60 36 60 32 58"
              fill={green}
            />
          </>
        )}

        {/* Leaf pair 2 (y ≈ 50) */}
        {stage >= 2 && (
          <>
            <path
              d="M 32 50 C 27 47 19 45 16 49 C 19 53 27 52 32 50"
              fill={green}
            />
            <path
              d="M 32 50 C 37 47 45 45 48 49 C 45 53 37 52 32 50"
              fill={green}
            />
          </>
        )}

        {/* Leaf pair 3 + small upper pair (y ≈ 42, 37) */}
        {stage >= 3 && (
          <>
            <path
              d="M 32 42 C 26 38 17 37 14 41 C 17 45 26 44 32 42"
              fill={green}
              opacity={0.9}
            />
            <path
              d="M 32 42 C 38 38 47 37 50 41 C 47 45 38 44 32 42"
              fill={green}
              opacity={0.9}
            />
            <path
              d="M 32 37 C 29 35 24 34 23 36 C 25 39 29 38 32 37"
              fill={green}
              opacity={0.85}
            />
            <path
              d="M 32 37 C 35 35 40 34 41 36 C 39 39 35 38 32 37"
              fill={green}
              opacity={0.85}
            />
          </>
        )}

        {/* Leaf pair 4 + upper pair (y ≈ 34, 30) */}
        {stage >= 4 && (
          <>
            <path
              d="M 32 34 C 27 31 20 30 18 33 C 20 36 27 36 32 34"
              fill={green}
              opacity={0.9}
            />
            <path
              d="M 32 34 C 37 31 44 30 46 33 C 44 36 37 36 32 34"
              fill={green}
              opacity={0.9}
            />
            <path
              d="M 32 30 C 29 28 25 27 24 29 C 26 32 29 31 32 30"
              fill={green}
              opacity={0.8}
            />
            <path
              d="M 32 30 C 35 28 39 27 40 29 C 38 32 35 31 32 30"
              fill={green}
              opacity={0.8}
            />

            {/* Bud (stage 4 only) */}
            {stage === 4 && (
              <ellipse
                cx="32"
                cy="24"
                rx="3.5"
                ry="5"
                fill={green}
                opacity={0.6}
              />
            )}
          </>
        )}

        {/* Flower (stage 5) */}
        {stage >= 5 && (
          <g className={animated ? "animate-bloom-open" : undefined}>
            <circle cx="32" cy="13" r="4.5" fill={bloom} opacity={0.85} />
            <circle cx="27" cy="16" r="4" fill={bloom} opacity={0.7} />
            <circle cx="37" cy="16" r="4" fill={bloom} opacity={0.7} />
            <circle cx="28" cy="10" r="3.5" fill={bloom} opacity={0.7} />
            <circle cx="36" cy="10" r="3.5" fill={bloom} opacity={0.7} />
            <circle cx="32" cy="13" r="2.5" fill={bloom} />
          </g>
        )}
      </svg>

      {/* Pollen particles for blooming plants */}
      {stage >= 5 && animated && !wilted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none">
          <span
            className="absolute w-1 h-1 rounded-full bg-amber-300/60 animate-pollen"
            style={{ left: 0 }}
          />
          <span
            className="absolute w-1 h-1 rounded-full bg-amber-200/60 animate-pollen"
            style={{ left: 8, animationDelay: "0.7s" }}
          />
          <span
            className="absolute w-0.5 h-0.5 rounded-full bg-amber-300/40 animate-pollen"
            style={{ left: -4, animationDelay: "1.4s" }}
          />
        </div>
      )}
    </div>
  );
}

export function getGrowthLabel(streak: number): string {
  if (streak <= 0) return "Seed";
  if (streak <= 3) return "Sprout";
  if (streak <= 7) return "Seedling";
  if (streak <= 14) return "Growing";
  if (streak <= 29) return "Mature";
  return "In Bloom";
}
