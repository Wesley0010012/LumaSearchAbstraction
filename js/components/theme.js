import { $ } from "../utils/dom.js";

export function applyTheme(preferences) {
  document.documentElement.style.setProperty("--accent", preferences.accent);
  document.documentElement.style.setProperty("--accent2", preferences.secondary);
  document.body.style.backgroundImage = preferences.background
    ? `linear-gradient(rgba(4,9,18,.66),rgba(4,9,18,.82)), url("${preferences.background.replace(/["\\\n\r]/g, "")}")`
    : "";
  document.body.style.backgroundSize = preferences.background ? "cover" : "";
  document.body.style.backgroundAttachment = preferences.background ? "fixed" : "";
  $("#clock").hidden = !preferences.showClock;
}

export function fillThemeForm(preferences) {
  $("#displayName").value = preferences.name;
  $("#accentColor").value = preferences.accent;
  $("#secondaryColor").value = preferences.secondary;
  $("#backgroundUrl").value = preferences.background.startsWith("data:") ? "" : preferences.background;
  $("#showClock").checked = preferences.showClock;
}
