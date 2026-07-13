import type { ChatMessage } from "@/types/chat";

export const quickPrompts = [
  "Apa itu AI Matching?",
  "Tiga lapis ekosistem",
  "Coba buat listing",
];

export function getCurrentTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createInitialChatMessages(): ChatMessage[] {
  return [
    {
      id: 0,
      role: "assistant",
      content:
        "Halo! Senang bertemu dengan Anda. Saya bisa membantu menjelaskan Muri, memilih layanan, atau memandu proses kerja sama.",
      time: getCurrentTime(),
    },
  ];
}

export function createBotReply(userMessage: string): string {
  const normalizedMessage = userMessage.toLowerCase();

  if (
    normalizedMessage.includes("matching") ||
    normalizedMessage.includes("ai")
  ) {
    return "AI Matching membantu mencocokkan limbah tekstil, aggregator, dan kebutuhan brand agar proses distribusi menjadi lebih cepat, tepat, dan efisien.";
  }

  if (
    normalizedMessage.includes("ekosistem") ||
    normalizedMessage.includes("tiga lapis")
  ) {
    return "Ekosistem Muri terdiri dari produsen limbah, aggregator, dan brand demand yang saling terhubung dalam satu alur digital.";
  }

  if (
    normalizedMessage.includes("listing") ||
    normalizedMessage.includes("buat")
  ) {
    return "Anda dapat membuat listing material dengan mengisi jenis kain, volume, kondisi material, dan lokasi. Setelah itu data akan diverifikasi oleh sistem.";
  }

  if (
    normalizedMessage.includes("mitra") ||
    normalizedMessage.includes("kerja sama")
  ) {
    return "Untuk menjadi mitra, Anda hanya perlu mendaftarkan bisnis, melengkapi profil, lalu tim Muri akan membantu proses verifikasi dan onboarding.";
  }

  return "Terima kasih. Saya bisa membantu menjelaskan AI Matching, alur ekosistem Muri, proses listing material, dan mekanisme kerja sama.";
}
