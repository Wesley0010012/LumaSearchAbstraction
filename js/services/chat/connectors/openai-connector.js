import { AbstractChatConnector } from "../abstract-chat-connector.js";

export class OpenAIConnector extends AbstractChatConnector {
  constructor(config) { super({ id:"openai", name:"OpenAI", endpoint:"https://api.openai.com/v1/responses", ...config }); }
  async chat(messages) {
    const payload = await this.request(this.endpoint, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${this.apiKey}` },
      body:JSON.stringify({ model:this.model, input:messages.map(({ role, content }) => ({ role, content })) })
    });
    const text = payload.output_text || payload.output?.flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text).join("\n");
    if (!text) throw new Error("OpenAI retornou uma resposta sem texto.");
    return text;
  }
}
