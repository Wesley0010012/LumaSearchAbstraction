import { AI_CATEGORY, DEFAULT_PREFERENCES, DEFAULT_SITE_ID, STORAGE_KEYS } from "./js/config.js";
import { createSidebar } from "./js/components/sidebar.js";
import { applyTheme, fillThemeForm } from "./js/components/theme.js";
import { bindDialog } from "./js/components/dialog.js";
import { $, escapeHtml, fileToDataUrl } from "./js/utils/dom.js";
import { safeParse } from "./js/services/storage.js";
import { getGreeting, getLocale, label, language, languageNames, setLanguage, t } from "./js/services/translation.js";
import { createDefaultSites } from "./js/services/catalog.js";
import { createUnifiedAiChat } from "./js/components/unified-ai-chat.js";
import { createSpeedTest } from "./js/components/speed-test.js";

const { sites: STORAGE_KEY, batch: BATCH_KEY, preferences: PREFS_KEY, categories: CATEGORIES_KEY } = STORAGE_KEYS;
const defaultSites = createDefaultSites();


const legacyPrefix = "or" + "bit";
let customSites = safeParse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(`${legacyPrefix}-custom-sites-v1`), []).map((site) => {
  const normalized = { category: "Outros", ...site, auth: Boolean(site.auth), custom: true };
  normalized.shortcut = normalized.category !== AI_CATEGORY && (Boolean(site.shortcut) || !normalized.searchUrl);
  return normalized;
});
let sites = [...defaultSites, ...customSites];
let customCategories = safeParse(localStorage.getItem(CATEGORIES_KEY), []);
let activeId = DEFAULT_SITE_ID;
let batchIds = new Set(safeParse(localStorage.getItem(BATCH_KEY) || localStorage.getItem(`${legacyPrefix}-batch-selection-v1`), ["google", "duckduckgo"]));
let activeCategory = "Todos";
let shortcutsOnly = false;
let toolNameFilter = "";
let preferences = { ...DEFAULT_PREFERENCES, ...safeParse(localStorage.getItem(PREFS_KEY) || localStorage.getItem(`${legacyPrefix}-preferences-v1`), {}) };

function normalizeSearchText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function getScopedSites() {
  const categorySites = activeCategory === "Todos" ? sites : sites.filter((site) => site.category === activeCategory);
  const shortcutSites = shortcutsOnly ? categorySites.filter((site) => site.shortcut) : categorySites;
  const normalizedFilter = normalizeSearchText(toolNameFilter.trim());
  return normalizedFilter ? shortcutSites.filter((site) => normalizeSearchText(site.name).includes(normalizedFilter)) : shortcutSites;
}

function renderCategories() {
  const categories = ["Todos", ...new Set([...sites.map((site) => site.category), ...customCategories])];
  if (!categories.includes(activeCategory)) activeCategory = "Todos";
  $("#categoryFilters").innerHTML = categories.map((category) => `<button class="category-chip ${category === activeCategory ? "active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
  const previousCategory = $("#siteCategory").value;
  $("#siteCategory").innerHTML = categories.filter((category) => category !== "Todos").map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  $("#siteCategory").value = categories.includes(previousCategory) ? previousCategory : "Pesquisa";
}

function renderSites() {
  if (!sites.some((site) => site.id === activeId)) activeId = sites[0].id;
  const visibleSites = getScopedSites();
  $("#siteList").innerHTML = visibleSites.length ? visibleSites.map((site) => `
    <div class="site-item ${site.id === activeId ? "active" : ""}" data-id="${escapeHtml(site.id)}" role="button" tabindex="0" aria-label="Usar ${escapeHtml(site.name)}">
      <span class="site-logo">${site.icon ? `<img src="${escapeHtml(site.icon)}" alt="" referrerpolicy="no-referrer" data-fallback="${escapeHtml(site.name[0].toUpperCase())}">` : escapeHtml(site.name[0].toUpperCase())}</span>
      <span class="site-name">${escapeHtml(site.name)}${site.auth ? `<span class="auth-tag" title="${escapeHtml(t("auth"))}">${escapeHtml(t("auth"))}</span>` : ""}<small>${site.category === AI_CATEGORY ? t("assistant") : site.searchUrl ? (site.id === activeId ? t("primary") : t("search")) : t("shortcut")}</small></span>
      <span class="site-actions">${site.custom ? `<button class="delete-site" type="button" data-delete="${escapeHtml(site.id)}" aria-label="Excluir ${escapeHtml(site.name)}">×</button>` : ""}${site.shortcut ? "" : `<input class="batch-check" type="checkbox" data-check="${escapeHtml(site.id)}" ${batchIds.has(site.id) ? "checked" : ""} aria-label="Incluir ${escapeHtml(site.name)} no lote">`}</span>
    </div>`).join("") : `<p class="site-list-empty" role="status">Nenhuma ferramenta encontrada.</p>`;
  document.querySelectorAll(".site-logo img").forEach((image) => image.addEventListener("error", () => { image.parentNode.textContent = image.dataset.fallback; }, { once: true }));
  const active = sites.find((site) => site.id === activeId);
  $("#activeSiteLabel").innerHTML = `${active.category === AI_CATEGORY ? t("assistant") : active.searchUrl ? t("search") : t("shortcut")}: <strong>${escapeHtml(active.name)}</strong>`;
  const isShortcut = active.shortcut;
  $("#searchInput").disabled = isShortcut;
  $("#searchInput").placeholder = isShortcut ? `${t("shortcut")} — ${active.name}` : t("placeholder");
  $("#primarySearch").innerHTML = isShortcut ? `${escapeHtml(label("openSite"))} <span aria-hidden="true">↗</span>` : `${escapeHtml(t("search"))} <span aria-hidden="true">→</span>`;
  $("#primarySearch").disabled = false;
  $("#batchSearch").disabled = isShortcut;
  updateBatchCount(); renderCategories();
}

function updateBatchCount() {
  batchIds = new Set([...batchIds].filter((id) => sites.some((site) => site.id === id && !site.shortcut)));
  const count = batchIds.size;
  const scopedSites = getScopedSites().filter((site) => !site.shortcut);
  const selectedInScope = scopedSites.filter((site) => batchIds.has(site.id)).length;
  $("#batchCount").textContent = `${count} ${count === 1 ? t("site") : t("sites")}`;
  $("#batchBadge").textContent = count;
  $("#clearBatch").disabled = count === 0;
  $("#selectAll").textContent = scopedSites.length > 0 && selectedInScope === scopedSites.length ? t("none") : t("all");
  $("#selectAll").hidden = shortcutsOnly;
  localStorage.setItem(BATCH_KEY, JSON.stringify([...batchIds]));
}

function getQuery() {
  const query = $("#searchInput").value.trim();
  if (!query) { $("#feedback").textContent = "Digite algo para pesquisar."; $("#searchInput").focus(); return null; }
  return query;
}

function openSite(site, query) {
  const isAi = site.category === AI_CATEGORY;
  if (isAi) navigator.clipboard?.writeText(query).catch(() => { });
  const target = !isAi && site.searchUrl ? site.searchUrl.replace("{query}", encodeURIComponent(query)) : site.url;
  return window.open(target, "_blank", "noopener,noreferrer");
}

let pendingBatchSearch = null;
function launchBatchSearch(targets, query) {
  targets.forEach((site) => openSite(site, query));
  $("#feedback").textContent = `Abrindo ${targets.length} ${targets.length === 1 ? "site" : "sites"}. Se alguma aba não abrir, autorize pop-ups nas configurações do navegador.`;
}

function performSearch(isBatch = false) {
  if (!isBatch) {
    const active = sites.find((site) => site.id === activeId);
    if (active.shortcut) {
      openSite(active, "");
      $("#feedback").textContent = "";
      return;
    }
  }
  const query = getQuery(); if (!query) return;
  const targets = isBatch ? sites.filter((site) => batchIds.has(site.id)) : sites.filter((site) => site.id === activeId);
  if (!targets.length) { $("#feedback").textContent = t("empty"); return; }
  if (isBatch) {
    if (localStorage.getItem("luma-popup-permission") === "accepted") launchBatchSearch(targets, query);
    else { pendingBatchSearch = { targets, query }; $("#popupDialog").showModal(); }
    return;
  }
  openSite(targets[0], query);
}

const popupDialog = $("#popupDialog");
function cancelPopupRequest() { pendingBatchSearch = null; $("#rememberPopupPermission").checked = false; popupDialog.close(); }
$("#closePopupDialog").addEventListener("click", cancelPopupRequest);
$("#cancelPopupDialog").addEventListener("click", cancelPopupRequest);
popupDialog.addEventListener("click", (event) => { if (event.target === popupDialog) cancelPopupRequest(); });
$("#popupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if ($("#rememberPopupPermission").checked) localStorage.setItem("luma-popup-permission", "accepted");
  const request = pendingBatchSearch;
  pendingBatchSearch = null;
  popupDialog.close();
  if (request) launchBatchSearch(request.targets, request.query);
});

$("#categoryFilters").addEventListener("click", (event) => { const button = event.target.closest("[data-category]"); if (button) { activeCategory = button.dataset.category; renderSites(); } });
$("#shortcutFilter").addEventListener("change", (event) => { shortcutsOnly = event.target.checked; renderSites(); });
$("#toolNameFilter").addEventListener("input", (event) => { toolNameFilter = event.target.value; renderSites(); });
$("#siteList").addEventListener("click", (event) => {
  const checkbox = event.target.closest("[data-check]"); const deleteButton = event.target.closest("[data-delete]");
  if (checkbox) { checkbox.checked ? batchIds.add(checkbox.dataset.check) : batchIds.delete(checkbox.dataset.check); updateBatchCount(); return; }
  if (deleteButton) { const id = deleteButton.dataset.delete; customSites = customSites.filter((site) => site.id !== id); sites = [...defaultSites, ...customSites]; batchIds.delete(id); localStorage.setItem(STORAGE_KEY, JSON.stringify(customSites)); renderSites(); return; }
  const item = event.target.closest("[data-id]");
  if (item && item.dataset.id === activeId) {
    const site = sites.find((candidate) => candidate.id === item.dataset.id);
    if (site?.url) window.open(site.url, "_blank", "noopener,noreferrer");
    return;
  }
  if (item) { activeId = item.dataset.id; localStorage.setItem("luma-active-site", activeId); renderSites(); }
});
$("#siteList").addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.matches("input,button")) event.target.click(); });
$("#searchForm").addEventListener("submit", (event) => { event.preventDefault(); performSearch(false); });
$("#batchSearch").addEventListener("click", () => performSearch(true));
$("#selectAll").addEventListener("click", () => {
  const scopedSites = getScopedSites().filter((site) => !site.shortcut);
  const allScopedSelected = scopedSites.length > 0 && scopedSites.every((site) => batchIds.has(site.id));
  scopedSites.forEach((site) => allScopedSelected ? batchIds.delete(site.id) : batchIds.add(site.id));
  renderSites();
});
$("#clearBatch").addEventListener("click", () => { batchIds.clear(); renderSites(); });

const siteDialog = $("#siteDialog");
function updateShortcutFields(shortcut) {
  $("#siteUrlLabel").textContent = shortcut ? "URL do site" : "URL de pesquisa";
  $("#siteUrlHint").innerHTML = shortcut ? "Informe a página que será aberta pelo atalho." : "Use <code>{query}</code> no ponto em que a pesquisa deve aparecer.";
  $("#siteSearchUrl").placeholder = shortcut ? "https://exemplo.com/" : "https://exemplo.com/search?q={query}";
}
bindDialog({ dialog:siteDialog, openButton:$("#openSiteDialog"), closeButtons:[$("#closeSiteDialog"), $("#cancelSiteDialog")], onOpen:() => { $("#formError").textContent = ""; $("#siteIsShortcut").checked = false; updateShortcutFields(false); requestAnimationFrame(() => $("#siteName").focus()); } });
$("#siteIsShortcut").addEventListener("change", (event) => {
  updateShortcutFields(event.target.checked);
});
$("#siteForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const data = new FormData(event.currentTarget); const name = data.get("name").trim(); const enteredUrl = data.get("searchUrl").trim(); let icon = data.get("icon").trim(); const category = data.get("category").trim(); const auth = data.get("auth") === "on"; const shortcut = data.get("shortcut") === "on"; const iconFile = $("#siteIconFile").files[0];
  if (iconFile) {
    if (!iconFile.type.match(/^image\/(png|jpeg)$/) || iconFile.size > 1024 * 1024) { $("#formError").textContent = "Escolha um ícone PNG/JPG/JPEG de até 1 MB."; return; }
    icon = await fileToDataUrl(iconFile);
  }
  if (!shortcut && category !== AI_CATEGORY && !enteredUrl.includes("{query}")) { $("#formError").textContent = "A URL de pesquisa precisa conter {query}."; return; }
  if (sites.some((site) => site.name.toLowerCase() === name.toLowerCase())) { $("#formError").textContent = "Já existe um site com esse nome."; return; }
  const site = { id: `custom-${Date.now()}`, name, searchUrl: shortcut || category === AI_CATEGORY ? undefined : enteredUrl, url: shortcut || category === AI_CATEGORY ? enteredUrl : enteredUrl.split("/").slice(0, 3).join("/"), icon, category, auth, shortcut: category === AI_CATEGORY ? false : shortcut, custom: true };
  customSites.push(site); sites.push(site); if (!site.shortcut) batchIds.add(site.id); activeId = site.id; activeCategory = category;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(customSites)); } catch { customSites.pop(); sites.pop(); batchIds.delete(site.id); activeId = "google"; $("#formError").textContent = "O ícone é grande demais para o armazenamento deste navegador."; return; }
  localStorage.setItem("luma-active-site", activeId); event.currentTarget.reset(); siteDialog.close(); renderSites();
});

const categoryDialog = $("#categoryDialog");
bindDialog({ dialog:categoryDialog, openButton:$("#openCategoryDialog"), closeButtons:[$("#closeCategoryDialog"), $("#cancelCategoryDialog")], onOpen:() => { $("#categoryError").textContent = ""; requestAnimationFrame(() => $("#categoryName").focus()); } });
$("#categoryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#categoryName").value.trim();
  const categories = [...new Set([...sites.map((site) => site.category), ...customCategories])];
  if (categories.some((category) => category.toLocaleLowerCase() === name.toLocaleLowerCase())) { $("#categoryError").textContent = "Essa categoria já existe."; return; }
  customCategories.push(name);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
  renderCategories();
  $("#siteCategory").value = name;
  event.currentTarget.reset();
  categoryDialog.close();
});

function applyPreferences() {
  applyTheme(preferences);
  fillThemeForm(preferences);
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.title = label("pageTitle");
  $("#languageSelect").innerHTML = Object.entries(languageNames).map(([code, name]) => `<option value="${code}" ${code === language ? "selected" : ""}>${name}</option>`).join("");
  $("#languageLabel").textContent = label("language");
  $("#shortcutFilterLabel").textContent = label("shortcuts");
  $("#clearBatch").textContent = label("clear");
  $("#creatorCredit").textContent = `${label("creator")} Wesley0010012`;
  $("#enginesLabel").textContent = t("engines");
  $("#whereSearchLabel").textContent = t("where");
  $("#selectionHint").innerHTML = `<span class="hint-dot"></span> ${escapeHtml(t("hint"))}`;
  $("#heroTitle").textContent = t("title");
  $("#heroDescription").textContent = t("desc");
  $("#storageNotice").textContent = t("storage");
  $("#searchInput").placeholder = t("placeholder");
  $("#batchSearch").innerHTML = `<span aria-hidden="true">⊞</span> ${escapeHtml(t("batch"))} <small id="batchBadge">${batchIds.size}</small>`;
  $("#primarySearch").innerHTML = `${escapeHtml(t("search"))} <span aria-hidden="true">→</span>`;
  $("#removeBackground").textContent = label("removeImage");
  renderSites(); updateTime();
  window.dispatchEvent(new CustomEvent("luma:language-change"));
}

$("#languageSelect").addEventListener("change", (event) => {
  setLanguage(event.target.value);
  applyLanguage();
});

const preferencesDialog = $("#preferencesDialog");
bindDialog({ dialog:preferencesDialog, openButton:$("#openPreferences"), closeButtons:[$("#closePreferences")], onOpen:() => { $("#preferencesError").textContent = ""; applyPreferences(); } });
$("#preferencesForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const file = $("#backgroundFile").files[0]; let background = $("#backgroundUrl").value.trim() || preferences.background;
  if (file) {
    if (!file.type.match(/^image\/(png|jpeg)$/) || file.size > 4 * 1024 * 1024) { $("#preferencesError").textContent = "Escolha um PNG/JPG/JPEG de até 4 MB."; return; }
    background = await fileToDataUrl(file);
  }
  preferences = { name: $("#displayName").value.trim(), accent: $("#accentColor").value, secondary: $("#secondaryColor").value, background, showClock: $("#showClock").checked };
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(preferences)); } catch { $("#preferencesError").textContent = "A imagem é grande demais para o armazenamento deste navegador."; return; }
  applyPreferences(); updateTime(); preferencesDialog.close();
});
$("#removeBackground").addEventListener("click", () => {
  preferences = { ...preferences, background: "" };
  $("#backgroundUrl").value = "";
  $("#backgroundFile").value = "";
  localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  applyPreferences();
});
$("#resetPreferences").addEventListener("click", () => { preferences = { ...DEFAULT_PREFERENCES }; localStorage.removeItem(PREFS_KEY); $("#backgroundFile").value = ""; applyPreferences(); updateTime(); });

createSidebar().bind();
createUnifiedAiChat().bind();
createSpeedTest().bind();

function updateTime() {
  const now = new Date(); const hour = now.getHours();
  const greeting = getGreeting(hour);
  const locale = getLocale();
  $("#greeting").textContent = preferences.name ? `${greeting}, ${preferences.name}` : greeting;
  $("#currentDate").textContent = new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "long" }).format(now);
  $("#clock").textContent = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(now);
}

applyPreferences(); applyLanguage(); setInterval(updateTime, 1000);
// Opening a page with the software keyboard already visible is especially
// disruptive on iPhone. Keep the desktop convenience without forcing it on touch.
if (window.matchMedia("(min-width: 901px) and (pointer: fine)").matches) $("#searchInput").focus();
