"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Factory, Leaf } from "lucide-react";

import {
  howItWorksMetrics,
  howItWorksSteps,
  type HowItWorksStep,
} from "@/data/howItWorks";

export default function HowItWorksSection() {
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
      id="cara-kerja"
      className="overflow-hidden bg-canvas-warm text-brand-black"
    >
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(78px,9vw,135px)]">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-stretch lg:gap-12">
          <ProcessPanel />

          <div className="flex flex-col lg:col-span-3 lg:py-8">
            <SectionContent shouldAnimate={shouldAnimate} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessPanel() {
  return (
    <article className="flex min-h-[650px] flex-col rounded-3xl bg-brand-forest p-6 text-white sm:p-8 lg:col-span-2">
      <p className="text-xs font-bold uppercase text-brand-lime">
        01 · Produsen Limbah
      </p>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center py-10">
          <Factory
            className="size-28 text-brand-lime sm:size-32"
            strokeWidth={1.35}
          />
        </div>

        <h3 className="font-display text-3xl font-normal leading-tight tracking-tighter text-white sm:text-3xl">
          Memilah dan Menyetorkan.
        </h3>

        <div className="mt-5 space-y-3">
          {howItWorksSteps.map((step) => (
            <ProcessStep key={step.number} step={step} />
          ))}
        </div>
      </div>
    </article>
  );
}

type ProcessStepProps = {
  step: HowItWorksStep;
};

function ProcessStep({ step }: ProcessStepProps) {
  const Icon = step.icon;

  return (
    <div className="group grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-white/15 bg-white/[0.025] p-4 transition duration-300 hover:border-brand-lime/30 hover:bg-white/[0.05] sm:p-5">
      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-sm font-bold text-brand-lime">
          {step.number}
        </span>

        <Icon
          className="size-4 text-brand-lime/60 opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={1.8}
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-white">{step.title}</p>

        <p className="mt-1 text-xs leading-relaxed text-white/50">
          {step.description}
        </p>
      </div>
    </div>
  );
}

type SectionContentProps = {
  shouldAnimate: boolean;
};

function SectionContent({ shouldAnimate }: SectionContentProps) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />

        <span className="text-sm font-bold uppercase">Cara Kerja Sistem</span>
      </div>

      <h2 className="mt-4 font-display text-5xl font-normal leading-[1.04] tracking-tighter text-brand-black sm:text-6xl lg:text-7xl">
        <span className="block">Mengubah Limbah</span>
        <span className="block">Menjadi Berkah</span>
        <span className="block">dengan Mudah.</span>
      </h2>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-moss sm:text-base">
        Dari pencatatan awal hingga produk siap pakai, semua proses di ekosistem
        Muri berjalan secara transparan dan terautomasi.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {howItWorksMetrics.map((metric, index) => (
          <div key={metric.label}>
            <AnimatedMetricValue
              target={metric.target}
              prefix={metric.prefix}
              suffix={metric.suffix}
              decimals={metric.decimals}
              animate={shouldAnimate}
              delayMs={index * 180}
            />

            <p className="mt-5 text-sm leading-relaxed text-muted-moss">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/register"
        className="group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-black px-6 py-5 text-xs font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-brand-forest"
      >
        Mulai Gabung Ekosistem
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </>
  );
}

type AnimatedMetricValueProps = {
  target: number;
  animate: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delayMs?: number;
};

function AnimatedMetricValue({
  target,
  animate,
  prefix = "",
  suffix = "",
  decimals = 0,
  delayMs = 0,
}: AnimatedMetricValueProps) {
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
    const multiplier = 10 ** decimals;

    timeoutId = setTimeout(() => {
      const startTime = performance.now();

      function updateValue(timestamp: number) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out agar cepat di awal dan lembut menjelang selesai.
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        const nextValue =
          Math.round(target * easedProgress * multiplier) / multiplier;

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

  const formattedCurrentValue = formatMetricNumber(currentValue, decimals);

  const formattedTargetValue = formatMetricNumber(target, decimals);

  return (
    <p
      aria-label={`${prefix}${formattedTargetValue}${suffix}`}
      className="font-display text-5xl font-normal leading-none tracking-tighter text-brand-black tabular-nums sm:text-5xl xl:text-6xl"
    >
      <span aria-hidden="true">
        {prefix}
        {formattedCurrentValue}
        {suffix}
      </span>
    </p>
  );
}

function formatMetricNumber(value: number, decimals: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
