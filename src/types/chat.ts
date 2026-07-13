export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
};