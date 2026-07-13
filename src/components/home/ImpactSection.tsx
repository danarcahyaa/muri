"use client";

import { Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { impactMetrics } from "@/data/impact";

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShouldAnimate(true);
        observer.disconnect();
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dampak"
      className="relative isolate overflow-hidden bg-brand-black text-white"
    >
      <ImpactBackground />

      <div className="relative z-10 mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(78px,9vw,135px)]">
        <ImpactHeader />

        <div className="mt-16 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.025] backdrop-blur-[2px]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {impactMetrics.map((metric, index) => (
              <ImpactCard
                key={metric.label}
                label={metric.label}
                target={metric.target}
                prefix={metric.prefix}
                suffix={metric.suffix}
                decimals={metric.decimals}
                description={metric.description}
                animate={shouldAnimate}
                delayMs={index * 160}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactHeader() {
  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:items-end lg:gap-12">
      <div className="lg:col-span-3">
        <div className="mb-5 flex items-center gap-3 text-brand-lime">
          <Leaf className="size-4" strokeWidth={2} />

          <span className="text-sm font-bold uppercase">
            Bukti Nyata, Bukan Janji Manis
          </span>
        </div>

        <h2 className="font-display text-5xl font-light leading-18 tracking-tighter text-white sm:text-6xl lg:text-7xl">
          <span className="block">Dampak Nyata, Kita</span>
          <span className="block">Ciptakan Bersama.</span>
        </h2>
      </div>

      <div className="lg:col-span-2 lg:pb-2">
        <p className="max-w-xl text-base leading-relaxed text-white/55 sm:text-sm 2xl:text-base">
          Setiap kolaborasi di Muri tercatat secara digital untuk menghitung
          kontribusi nyata terhadap kelestarian bumi.
        </p>
      </div>
    </div>
  );
}

type ImpactCardProps = {
  label: string;
  target: number;
  description: string;
  animate: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delayMs?: number;
};

function ImpactCard({
  label,
  target,
  description,
  animate,
  prefix = "",
  suffix = "",
  decimals = 0,
  delayMs = 0,
}: ImpactCardProps) {
  return (
    <article
      className="
        group flex min-h-[250px] flex-col border-b border-white/15 p-7
        transition-colors duration-300 last:border-b-0 hover:bg-white/[0.04]
        sm:p-8
        md:[&:nth-child(odd)]:border-r
        md:[&:nth-child(n+3)]:border-b-0
        xl:border-b-0 xl:border-r xl:last:border-r-0
      "
    >
      <p className="text-sm font-medium uppercase text-white/55">{label}</p>

      <div className="mt-auto pt-12">
        <AnimatedImpactValue
          target={target}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          animate={animate}
          delayMs={delayMs}
        />

        <p className="mt-5 text-sm leading-relaxed text-white/50">
          {description}
        </p>
      </div>
    </article>
  );
}

type AnimatedImpactValueProps = {
  target: number;
  animate: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delayMs?: number;
};

function AnimatedImpactValue({
  target,
  animate,
  prefix = "",
  suffix = "",
  decimals = 0,
  delayMs = 0,
}: AnimatedImpactValueProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!animate) {
      setCurrentValue(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setCurrentValue(target);
      return;
    }

    let frameId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const duration = 1400;
    const decimalMultiplier = 10 ** decimals;

    timeoutId = setTimeout(() => {
      const animationStart = performance.now();

      function updateValue(timestamp: number) {
        const elapsed = timestamp - animationStart;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth ease-out animation.
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        const nextValue =
          Math.round(target * easedProgress * decimalMultiplier) /
          decimalMultiplier;

        setCurrentValue(nextValue);

        if (progress < 1) {
          frameId = requestAnimationFrame(updateValue);
        } else {
          setCurrentValue(target);
        }
      }

      frameId = requestAnimationFrame(updateValue);
    }, delayMs);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [animate, target, decimals, delayMs]);

  const formattedCurrentValue = formatImpactNumber(currentValue, decimals);
  const formattedTargetValue = formatImpactNumber(target, decimals);

  return (
    <p
      aria-label={`${prefix}${formattedTargetValue}${suffix}`}
      className="font-display text-5xl font-normal leading-none tracking-tighter text-brand-lime tabular-nums sm:text-6xl"
    >
      <span aria-hidden="true">
        {prefix}
        {formattedCurrentValue}
        {suffix}
      </span>
    </p>
  );
}

function formatImpactNumber(value: number, decimals: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function ImpactBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-black/40 via-brand-forest to-brand-emerald/25" />

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-forest/20 to-brand-black/25" />

      <div className="absolute inset-0 opacity-20 blur-3xl">
        <svg
          viewBox="0 0 1440 720"
          preserveAspectRatio="xMidYMid slice"
          className="size-full"
          fill="none"
        >
          <path
            d="M-220 790C100 550 370 720 650 620C940 515 1120 210 1640 40"
            stroke="#C8F169"
            strokeWidth="120"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-[0.06]">
        <svg
          viewBox="0 0 1440 720"
          preserveAspectRatio="xMidYMid slice"
          className="size-full"
          fill="none"
        >
          <path
            d="M-220 790C100 550 370 720 650 620C940 515 1120 210 1640 40"
            stroke="#C8F169"
            strokeWidth="72"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute -bottom-80 -left-64 size-[44rem] rounded-full bg-brand-lime/15 blur-[150px]" />

      <div className="absolute -right-64 -top-80 size-[44rem] rounded-full bg-brand-lime/15 blur-[150px]" />

      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-gradient-to-r from-transparent via-brand-lime/[0.04] to-transparent blur-3xl" />

      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/5 via-transparent to-brand-black/20" />
    </div>
  );
}
