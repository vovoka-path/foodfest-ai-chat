export interface RagResponse {
  response: string;
  sessionId: string; // Всегда возвращаем ID сессии
  sources: {
    content: string;
  }[];
}
