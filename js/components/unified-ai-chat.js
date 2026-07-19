import { $, escapeHtml } from "../utils/dom.js";
import { ChatService } from "../services/chat/chat-service.js";
import { OpenAIConnector } from "../services/chat/connectors/openai-connector.js";
import { AnthropicConnector } from "../services/chat/connectors/anthropic-connector.js";
import { GeminiConnector } from "../services/chat/connectors/gemini-connector.js";
import { PerplexityConnector } from "../services/chat/connectors/perplexity-connector.js";
import { chatT } from "../services/translation.js";

const SETTINGS_KEY = "luma-ai-connectors-v1";
const PROVIDERS = [
  { id:"chatgpt", name:"OpenAI", display:"ChatGPT", mark:"G", color:"#74d6b0", model:"gpt-5.6-luna", Connector:OpenAIConnector, legacyId:"openai" },
  { id:"claude", name:"Anthropic", display:"Claude", mark:"C", color:"#e6a777", model:"claude-sonnet-4-5", Connector:AnthropicConnector, legacyId:"anthropic" },
  { id:"gemini", name:"Google", display:"Gemini", mark:"✦", color:"#7ba7ff", model:"gemini-3.5-flash", Connector:GeminiConnector },
  { id:"perplexity", name:"Perplexity", display:"Perplexity", mark:"P", color:"#5dd1d5", model:"sonar", Connector:PerplexityConnector }
];

function loadSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; } }
function renderText(value) { return escapeHtml(value).replace(/\n/g, "<br>"); }

export function createUnifiedAiChat() {
  const dialog = $("#aiChatDialog"), feed = $("#aiChatFeed"), input = $("#aiChatInput"), form = $("#aiChatForm"), picker = $("#aiModelPicker"), settingsPanel = $("#aiSettings"), settingsGrid = $("#aiSettingsGrid");
  let settings = loadSettings();
  let selected = new Set(PROVIDERS.map(({ id }) => id));
  let service = buildService();

  function applyTranslations() {
    const text = (selector, key) => { const element = $(selector); if (element) element.textContent = chatT(key); };
    text("#aiChatTriggerLabel", "aiTrigger"); text("#aiEyebrow", "aiEyebrow"); text("#aiChatTitle", "aiTitle");
    text("#aiSubtitle", "aiSubtitle"); text("#aiSettingsTitle", "aiSettingsTitle"); text("#aiSettingsWarning", "aiSettingsWarning");
    text("#cancelAiSettings", "aiCancel"); text("#saveAiSettings", "aiSave"); text("#aiEmptyTitle", "aiEmptyTitle");
    text("#aiEmptyDescription", "aiEmptyDescription"); text("#sendAiChat", "aiSend"); text("#aiNotice", "aiNotice");
    picker.setAttribute("aria-label", chatT("aiParticipants")); input.placeholder = chatT("aiPlaceholder");
    document.querySelector(`label[for="aiChatInput"]`).textContent = chatT("aiInputLabel");
    $("#openAiSettings").setAttribute("aria-label", chatT("aiOpenSettings")); $("#openAiSettings").title = chatT("aiOpenSettings");
    $("#closeAiChat").setAttribute("aria-label", chatT("aiClose"));
    const suggestionKeys = ["aiSuggestionLaunch", "aiSuggestionConcept", "aiSuggestionExperience"];
    feed.querySelectorAll("[data-ai-suggestion]").forEach((button, index) => { if (suggestionKeys[index]) button.textContent = chatT(suggestionKeys[index]); });
    renderPicker(); if (!settingsPanel.hidden) renderSettings();
  }

  function buildService() {
    return new ChatService(PROVIDERS.map((provider) => {
      const saved = settings[provider.id] || settings[provider.legacyId] || {};
      return new provider.Connector({ id:provider.id, name:provider.display, model:saved.model || provider.model, apiKey:saved.apiKey || "" });
    }));
  }

  function renderPicker() {
    picker.innerHTML = PROVIDERS.map((provider) => {
      const configured = service.isConfigured(provider.id), status = configured ? chatT("aiConfigured") : chatT("aiMissingKey");
      return `<button class="ai-model-chip ${selected.has(provider.id) ? "active" : ""}" type="button" data-ai-model="${provider.id}" aria-pressed="${selected.has(provider.id)}" title="${status}"><span style="--model-color:${provider.color}">${provider.mark}</span>${provider.display}<i class="ai-connection-dot ${configured ? "connected" : ""}"></i></button>`;
    }).join("");
  }

  function renderSettings() {
    settingsGrid.innerHTML = PROVIDERS.map((provider) => { const saved = settings[provider.id] || settings[provider.legacyId] || {}; return `<fieldset class="ai-provider-settings"><legend><span style="--model-color:${provider.color}">${provider.mark}</span>${provider.name}</legend>${provider.noApiKey ? `<p class="ai-provider-note">${escapeHtml(chatT(provider.noKeyMessage))}</p>` : `<label>${escapeHtml(chatT("aiApiKey"))}<input type="password" autocomplete="off" data-ai-key="${provider.id}" value="${escapeHtml(saved.apiKey || "")}" placeholder="${escapeHtml(chatT("aiApiKeyPlaceholder"))}"></label>`}<label>${escapeHtml(chatT("aiModel"))}<input type="text" data-ai-model-name="${provider.id}" value="${escapeHtml(saved.model || provider.model)}"></label></fieldset>`; }).join("");
  }

  function toggleSettings(show) { settingsPanel.hidden = !show; picker.hidden = show; feed.hidden = show; form.hidden = show; $(".ai-demo-notice").hidden = show; if (show) renderSettings(); }
  function resizeInput() { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 130)}px`; }

  async function addTurn(question) {
    $("#aiChatEmpty")?.remove();
    const active = PROVIDERS.filter((provider) => selected.has(provider.id));
    const turn = document.createElement("article"); turn.className = "ai-turn";
    turn.innerHTML = `<div class="ai-user-message"><span>${escapeHtml(chatT("aiYou"))}</span><p>${escapeHtml(question)}</p></div><div class="ai-response-grid">${active.map((provider) => `<article class="ai-response-card is-loading" data-response-provider="${provider.id}" style="--model-color:${provider.color}"><header><span class="ai-model-mark">${provider.mark}</span><div><strong>${provider.display}</strong><small>${escapeHtml(service.getConnector(provider.id).model)}</small></div></header><div class="ai-loading"><i></i><i></i><i></i></div></article>`).join("")}</div>`;
    feed.append(turn); feed.scrollTop = feed.scrollHeight;
    const results = await service.send(active.map(({ id }) => id), question);
    results.forEach((result) => {
      const provider = PROVIDERS.find(({ id }) => id === result.id), card = turn.querySelector(`[data-response-provider="${result.id}"]`);
      card.classList.remove("is-loading"); card.classList.toggle("has-error", result.status === "rejected");
      card.innerHTML = `<header><span class="ai-model-mark">${provider.mark}</span><div><strong>${provider.display}</strong><small>${escapeHtml(service.getConnector(provider.id).model)}</small></div></header><div class="ai-response-copy">${result.status === "fulfilled" ? `<p>${renderText(result.content)}</p>` : `<p class="ai-response-error">${escapeHtml(result.error)}</p><button class="text-button" type="button" data-open-settings>${escapeHtml(chatT("aiConfigure"))}</button>`}</div>`;
    });
    feed.scrollTop = feed.scrollHeight;
  }

  function submit() { const question = input.value.trim(); if (!question || !selected.size) return; input.value = ""; resizeInput(); addTurn(question); input.focus(); }

  return { bind() {
    applyTranslations();
    window.addEventListener("luma:language-change", applyTranslations);
    $("#openAiChat").addEventListener("click", () => { dialog.showModal(); requestAnimationFrame(() => input.focus()); });
    $("#closeAiChat").addEventListener("click", () => dialog.close());
    $("#openAiSettings").addEventListener("click", () => toggleSettings(true));
    $("#cancelAiSettings").addEventListener("click", () => toggleSettings(false));
    $("#saveAiSettings").addEventListener("click", () => {
      PROVIDERS.forEach(({ id, model }) => { settings[id] = { apiKey:settingsGrid.querySelector(`[data-ai-key="${id}"]`)?.value.trim() || "", model:settingsGrid.querySelector(`[data-ai-model-name="${id}"]`).value.trim() || model }; });
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); service = buildService(); renderPicker(); toggleSettings(false);
    });
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    picker.addEventListener("click", (event) => { const button = event.target.closest("[data-ai-model]"); if (!button) return; const id = button.dataset.aiModel; if (selected.has(id) && selected.size === 1) return; selected.has(id) ? selected.delete(id) : selected.add(id); renderPicker(); });
    feed.addEventListener("click", (event) => { const suggestion = event.target.closest("[data-ai-suggestion]"); if (suggestion) { input.value = suggestion.dataset.aiSuggestion; resizeInput(); input.focus(); } if (event.target.closest("[data-open-settings]")) toggleSettings(true); });
    input.addEventListener("input", resizeInput); input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }); form.addEventListener("submit", (event) => { event.preventDefault(); submit(); });
  } };
}
