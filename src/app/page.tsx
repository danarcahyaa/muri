"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import EcosystemSection from "@/components/home/EcosystemSection";
import TraceabilitySection from "@/components/home/TraceabilitySection";
import FloatingChatbotButton from "@/components/chatbot/FloatingChatbotButton";
import ChatbotModal from "@/components/chatbot/ChatbotModal";
import ImpactSection from "@/components/home/ImpactSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <HeroSection />
        <EcosystemSection />
        <TraceabilitySection />
        <ImpactSection />
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
