export class AbstractChatConnector {
  constructor({ id, name, model, apiKey, endpoint }) {
    if (new.target === AbstractChatConnector) throw new TypeError("AbstractChatConnector não pode ser instanciado diretamente.");
    Object.assign(this, { id, name, model, apiKey, endpoint });
  }

  isConfigured() {
    return Boolean(this.apiKey?.trim() && this.model?.trim());
  }

  async chat() {
    throw new Error(`O connector ${this.name} precisa implementar chat(messages).`);
  }

  async request(url, options) {
    let response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      throw new Error(`Não foi possível acessar ${this.name}. Verifique a rede, CORS ou use um proxy seguro.`, { cause:error });
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload?.error?.message || payload?.message || `HTTP ${response.status}`;
      throw new Error(`${this.name}: ${detail}`);
    }
    return payload;
  }
}
