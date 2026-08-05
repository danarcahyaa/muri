"use client";

import { useState, Suspense } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import EcosystemSection from "@/components/home/EcosystemSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TraceabilitySection from "@/components/home/TraceabilitySection";
import ImpactSection from "@/components/home/ImpactSection";
import AIMaterialSection from "@/components/home/AIMaterialSection";
import Footer from "@/components/layout/Footer";
import FloatingChatbotButton from "@/components/chatbot/FloatingChatbotButton";
import ChatbotModal from "@/components/chatbot/ChatbotModal";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <HeroSection />
        <EcosystemSection />
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-emerald border-t-transparent" />
            </div>
          }
        >
          <TraceabilitySection />
        </Suspense>
        <ImpactSection />
        <HowItWorksSection />
        <AIMaterialSection />
      </main>

      <Footer />

      <FloatingChatbotButton
        isOpen={chatOpen}
        onClick={() => setChatOpen(true)}
      />

      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
