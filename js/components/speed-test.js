import { Ndt7SpeedTest } from "../services/speed-test.js";
const $ = (selector) => document.querySelector(selector);
const speed = (value) => Number.isFinite(value) ? value.toFixed(value >= 100 ? 0 : 1) : "—";

export function createSpeedTest() {
  const dialog = $("#speedTestDialog"), startButton = $("#startSpeedTest"), consent = $("#speedTestConsent");
  let runner, running = false;
  function reset() {
    $("#speedTestProgress").style.setProperty("--progress", "0deg"); $("#speedTestGaugeValue").textContent = "Pronto";
    $("#speedTestStatus").textContent = "Autorize e inicie a medição.";
    $("#speedDownload").textContent = $("#speedUpload").textContent = $("#speedLatency").textContent = "—";
    $("#speedTestServer").textContent = "Servidor será escolhido automaticamente"; $("#speedTestError").textContent = "";
    startButton.textContent = "Iniciar teste"; startButton.disabled = !consent.checked;
  }
  function update(data) {
    $("#speedTestProgress").style.setProperty("--progress", `${data.progress * 3.6}deg`);
    const labels = { discovering: "Localizando o melhor servidor…", download: "Medindo download…", upload: "Medindo upload…", complete: "Teste concluído" };
    $("#speedTestStatus").textContent = labels[data.phase] || "Preparando…";
    $("#speedTestGaugeValue").textContent = data.phase === "complete" ? "Concluído" : `${Math.round(data.progress)}%`;
    if (data.server) { const location = data.server.location; $("#speedTestServer").textContent = [location?.city, location?.country, data.server.machine].filter(Boolean).join(" · "); }
    if (data.download) $("#speedDownload").textContent = speed(data.download.mbps);
    if (data.upload) $("#speedUpload").textContent = speed(data.upload.mbps);
    const latency = data.download?.latency ?? data.upload?.latency; if (Number.isFinite(latency)) $("#speedLatency").textContent = latency.toFixed(0);
  }
  async function run() {
    if (running) return runner.cancel(); if (!consent.checked) return;
    reset(); running = true; consent.disabled = true; startButton.disabled = false; startButton.textContent = "Cancelar teste";
    runner = new Ndt7SpeedTest({ onUpdate: update });
    try { await runner.run(); } catch (error) {
      if (error.name !== "AbortError") $("#speedTestError").textContent = error.message || "Não foi possível concluir o teste.";
      $("#speedTestStatus").textContent = error.name === "AbortError" ? "Teste cancelado." : "O teste encontrou um erro.";
      $("#speedTestGaugeValue").textContent = error.name === "AbortError" ? "Cancelado" : "Erro";
    } finally { running = false; consent.disabled = false; startButton.textContent = "Testar novamente"; startButton.disabled = !consent.checked; }
  }
  function close() { if (running) runner.cancel(); dialog.close(); }
  return { bind() {
    $("#openSpeedTest").addEventListener("click", () => { reset(); dialog.showModal(); }); $("#closeSpeedTest").addEventListener("click", close);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    consent.addEventListener("change", () => { startButton.disabled = !consent.checked; }); startButton.addEventListener("click", run); reset();
  } };
}
