const LOCATE_URL = "https://locate.measurementlab.net/v2/nearest/ndt/ndt7";
const SUBPROTOCOL = "net.measurementlab.ndt.v7";
const mbps = (bytes, ms) => ms > 0 ? bytes * 8 / ms / 1000 : 0;
const sizeOf = (data) => data?.byteLength ?? data?.size ?? 0;

function readLatency(data) {
  const tcp = data?.TCPInfo || data?.BBRInfo;
  const value = tcp?.MinRTT ?? tcp?.RTT;
  return Number.isFinite(value) ? value / 1000 : null;
}

export class Ndt7SpeedTest {
  constructor({ locateUrl = LOCATE_URL, onUpdate = () => {} } = {}) {
    this.locateUrl = locateUrl; this.onUpdate = onUpdate; this.socket = null; this.cancelled = false;
  }
  emit(detail) { this.onUpdate(detail); }
  cancel() {
    this.cancelled = true;
    if (this.socket?.readyState < WebSocket.CLOSING) this.socket.close(1000, "cancelled");
    this.socket = null;
  }
  async discover() {
    const url = new URL(this.locateUrl);
    url.searchParams.set("client_name", "luma-search-abstraction");
    url.searchParams.set("client_version", "1.0.0");
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`O serviço de localização respondeu com ${response.status}.`);
    const server = (await response.json()).results?.[0];
    if (!server?.urls) throw new Error("Nenhum servidor M-Lab está disponível agora.");
    return { server, download: server.urls["wss:///ndt/v7/download"], upload: server.urls["wss:///ndt/v7/upload"] };
  }
  async run() {
    this.cancelled = false; this.emit({ phase: "discovering", progress: 4 });
    const endpoints = await this.discover();
    if (this.cancelled) throw new DOMException("Teste cancelado", "AbortError");
    this.emit({ phase: "download", progress: 10, server: endpoints.server });
    const download = await this.runDownload(endpoints.download);
    this.emit({ phase: "upload", progress: 55, download, server: endpoints.server });
    const upload = await this.runUpload(endpoints.upload);
    const result = { download, upload, server: endpoints.server };
    this.emit({ phase: "complete", progress: 100, ...result }); return result;
  }
  runDownload(url) {
    return new Promise((resolve, reject) => {
      const socket = this.socket = new WebSocket(url, SUBPROTOCOL); socket.binaryType = "arraybuffer";
      let start = 0, bytes = 0, latency = null, settled = false;
      const fail = (error) => { if (!settled) { settled = true; reject(error); } };
      const timeout = setTimeout(() => { fail(new Error("Tempo limite excedido no download.")); socket.close(); }, 15000);
      socket.onopen = () => { start = performance.now(); };
      socket.onmessage = (event) => {
        if (typeof event.data === "string") { try { latency ??= readLatency(JSON.parse(event.data)); } catch { /* non-JSON */ } return; }
        bytes += sizeOf(event.data); const elapsed = performance.now() - start;
        this.emit({ phase: "download", progress: Math.min(54, 10 + elapsed / 10000 * 44), download: { mbps: mbps(bytes, elapsed), latency } });
      };
      socket.onerror = () => fail(new Error("Não foi possível conectar ao servidor de download."));
      socket.onclose = () => {
        clearTimeout(timeout); this.socket = null;
        if (this.cancelled) return fail(new DOMException("Teste cancelado", "AbortError"));
        if (!settled) { settled = true; const elapsed = performance.now() - start; resolve({ mbps: mbps(bytes, elapsed), bytes, elapsed, latency }); }
      };
    });
  }
  runUpload(url) {
    return new Promise((resolve, reject) => {
      const socket = this.socket = new WebSocket(url, SUBPROTOCOL);
      let start = 0, queued = 0, last = 0, latency = null, timer, settled = false, sample = new Uint8Array(8192);
      const fail = (error) => { if (!settled) { settled = true; reject(error); } };
      const finish = () => {
        if (settled) return; settled = true; clearTimeout(timer);
        const elapsed = performance.now() - start, sent = Math.max(0, queued - socket.bufferedAmount);
        if (socket.readyState < WebSocket.CLOSING) socket.close(); resolve({ mbps: mbps(sent, elapsed), bytes: sent, elapsed, latency });
      };
      const pump = () => {
        if (this.cancelled || socket.readyState !== WebSocket.OPEN) return;
        const elapsed = performance.now() - start; if (elapsed >= 10000) return finish();
        if (queued - socket.bufferedAmount >= sample.length * 16 && sample.length < 8388608) sample = new Uint8Array(sample.length * 2);
        if (socket.bufferedAmount < sample.length * 7) { socket.send(sample); queued += sample.length; }
        if (elapsed - last >= 250) { last = elapsed; const sent = Math.max(0, queued - socket.bufferedAmount); this.emit({ phase: "upload", progress: Math.min(99, 55 + elapsed / 10000 * 44), upload: { mbps: mbps(sent, elapsed), latency } }); }
        timer = setTimeout(pump, 0);
      };
      socket.onopen = () => { start = performance.now(); pump(); };
      socket.onmessage = (event) => { if (typeof event.data === "string") try { latency ??= readLatency(JSON.parse(event.data)); } catch { /* non-JSON */ } };
      socket.onerror = () => { clearTimeout(timer); fail(new Error("Não foi possível conectar ao servidor de upload.")); };
      socket.onclose = () => { clearTimeout(timer); this.socket = null; if (this.cancelled) fail(new DOMException("Teste cancelado", "AbortError")); };
    });
  }
}

export { LOCATE_URL };
