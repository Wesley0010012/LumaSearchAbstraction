import { AbstractChatConnector } from "../abstract-chat-connector.js";

export class PerplexityConnector extends AbstractChatConnector {
  constructor(config) { super({ id:"perplexity", name:"Perplexity", endpoint:"https://api.perplexity.ai/v1/sonar", ...config }); }
  async chat(messages) {
    const payload = await this.request(this.endpoint, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${this.apiKey}` },
      body:JSON.stringify({ model:this.model, messages })
    });
    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error("Perplexity retornou uma resposta sem texto.");
    return text;
  }
}
