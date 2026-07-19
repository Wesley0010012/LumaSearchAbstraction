import { AbstractChatConnector } from "../abstract-chat-connector.js";

export class GeminiConnector extends AbstractChatConnector {
  constructor(config) { super({ id:"gemini", name:"Google Gemini", endpoint:"https://generativelanguage.googleapis.com/v1beta/models", ...config }); }
  async chat(messages) {
    const contents = messages.map(({ role, content }) => ({ role:role === "assistant" ? "model" : "user", parts:[{ text:content }] }));
    const payload = await this.request(`${this.endpoint}/${encodeURIComponent(this.model)}:generateContent`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-goog-api-key":this.apiKey },
      body:JSON.stringify({ contents })
    });
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n");
    if (!text) throw new Error(payload.promptFeedback?.blockReason ? `Gemini bloqueou a solicitação: ${payload.promptFeedback.blockReason}` : "Gemini retornou uma resposta sem texto.");
    return text;
  }
}
