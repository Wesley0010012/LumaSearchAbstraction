import { AbstractChatConnector } from "../abstract-chat-connector.js";

export class AnthropicConnector extends AbstractChatConnector {
  constructor(config) { super({ id:"anthropic", name:"Anthropic", endpoint:"https://api.anthropic.com/v1/messages", ...config }); }
  async chat(messages) {
    const payload = await this.request(this.endpoint, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-api-key":this.apiKey, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
      body:JSON.stringify({ model:this.model, max_tokens:1200, messages })
    });
    const text = payload.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n");
    if (!text) throw new Error("Anthropic retornou uma resposta sem texto.");
    return text;
  }
}
