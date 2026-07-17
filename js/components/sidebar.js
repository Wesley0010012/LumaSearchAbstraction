import { $ } from "../utils/dom.js";

export function createSidebar() {
  const shell = $(".app-shell");
  const sidebar = $("#sidebar");
  const backdrop = $("#sidebarBackdrop");
  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  function setOpen(open) {
    if (isMobile()) {
      sidebar.classList.toggle("open", open);
      backdrop.classList.toggle("open", open);
      return;
    }
    shell.classList.toggle("sidebar-closed", !open);
  }

  function bind() {
    $("#openSidebar").addEventListener("click", () => setOpen(true));
    $("#closeSidebar").addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
  }

  return { bind, open: () => setOpen(true), close: () => setOpen(false) };
}
