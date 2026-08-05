"use client";

import { Suspense, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TraceabilitySection from "@/components/home/TraceabilitySection";
import FloatingChatbotButton from "@/components/chatbot/FloatingChatbotButton";
import ChatbotModal from "@/components/chatbot/ChatbotModal";

function TraceabilityPageContent() {
  return <TraceabilitySection />;
}

export default function TraceabilityPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-emerald border-t-transparent" />
            </div>
          }
        >
          <TraceabilityPageContent />
        </Suspense>
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
