export function bindDialog({ dialog, openButton, closeButtons = [], onOpen, onClose }) {
  const close = () => {
    onClose?.();
    dialog.close();
  };
  openButton?.addEventListener("click", () => {
    onOpen?.();
    dialog.showModal();
  });
  closeButtons.forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  return { open: () => dialog.showModal(), close };
}
