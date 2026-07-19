import { chatT } from "../translation.js";

export class ChatService {
  constructor(connectors = []) {
    this.connectors = new Map(connectors.map((connector) => [connector.id, connector]));
    this.histories = new Map(connectors.map((connector) => [connector.id, []]));
  }

  getConnector(id) { return this.connectors.get(id); }
  isConfigured(id) { return this.getConnector(id)?.isConfigured() || false; }
  clear() { this.histories.forEach((history) => history.splice(0)); }

  async send(ids, content) {
    return Promise.all(ids.map(async (id) => {
      const connector = this.getConnector(id);
      if (!connector) return { id, status:"rejected", error:chatT("aiConnectorMissing") };
      if (!connector.isConfigured()) return { id, status:"rejected", error:chatT("aiProviderSetup") };
      const history = this.histories.get(id);
      const messages = [...history, { role:"user", content }];
      try {
        const answer = await connector.chat(messages);
        history.push({ role:"user", content }, { role:"assistant", content:answer });
        return { id, status:"fulfilled", content:answer };
      } catch (error) {
        return { id, status:"rejected", error:error.message || chatT("aiUnknownFailure") };
      }
    }));
  }
}
