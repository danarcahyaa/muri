"use client";

import { Check, CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";

interface OrderProgressBarProps {
  status: string; // "pending" | "processing" | "shipped" | "complete" | "completed" | "cancelled" | "rejected" | "paid_waiting_verification" | "pending_payment"
}

export function OrderProgressBar({ status }: OrderProgressBarProps) {
  const isCancelled = status === "cancelled" || status === "rejected";

  const getStepIndex = (st: string) => {
    switch (st) {
      case "complete":
      case "completed":
        return 4;
      case "shipped":
        return 3;
      case "processing":
        return 2;
      case "pending":
      case "pending_payment":
      case "paid_waiting_verification":
      default:
        return 1;
    }
  };

  const currentStep = isCancelled ? -1 : getStepIndex(status);

  const steps = [
    { number: 1, label: "Pesanan Dibuat", icon: Clock },
    { number: 2, label: "Diproses", icon: Package },
    { number: 3, label: "Dikirim", icon: Truck },
    { number: 4, label: "Selesai", icon: CheckCircle2 },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <XCircle className="size-5 shrink-0" />
        <div>
          <p className="text-xs font-bold">Pesanan Dibatalkan</p>
          <p className="text-[11px] text-red-600">
            Transaksi pesanan ini telah dibatalkan atau ditolak.
          </p>
        </div>
      </div>
    );
  }

  // Active line width calculation relative to 75% total line span
  // Step 1: 0% | Step 2: 25% | Step 3: 50% | Step 4: 75%
  const progressPercent = Math.min(75, Math.max(0, ((currentStep - 1) / 3) * 75));

  return (
    <div className="rounded-lg border border-line-trace bg-canvas-warm/50 p-4 sm:p-5">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-muted-moss">
        Status & Progres Pesanan
      </p>

      <div className="relative w-full">
        {/* Background Connecting Line (constrained from center of Step 1 to center of Step 4) */}
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 -translate-y-1/2 bg-line-trace/80" />

        {/* Active Filled Progress Line */}
        <div
          className="absolute left-[12.5%] top-4 h-0.5 -translate-y-1/2 bg-brand-forest transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />

        {/* 4 Step Nodes */}
        <div className="grid grid-cols-4 w-full">
          {steps.map((step) => {
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center px-1"
              >
                {/* Step Circle Icon */}
                <div
                  className={`
                    flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                    ${
                      isDone
                        ? "bg-brand-forest text-white ring-4 ring-brand-forest/15"
                        : isCurrent
                          ? "bg-brand-lime text-brand-forest ring-4 ring-brand-lime/40"
                          : "border border-line-trace bg-canvas-pure text-muted-moss"
                    }
                  `}
                >
                  {isDone ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`
                    mt-2 text-[10px] font-bold leading-tight transition-colors sm:text-xs
                    ${
                      isDone || isCurrent
                        ? "text-brand-black"
                        : "text-muted-moss/60"
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
