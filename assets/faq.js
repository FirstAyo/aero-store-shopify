/* =========================
   FAQ accordion
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll("[data-faq-trigger]");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-accordion__item");
      const panel = item?.querySelector(".faq-accordion__panel");
      const icon = trigger.querySelector(".faq-accordion__icon");
      const expanded = trigger.getAttribute("aria-expanded") === "true";

      trigger.setAttribute("aria-expanded", String(!expanded));

      if (panel) {
        panel.hidden = expanded;
      }

      if (icon) {
        icon.textContent = expanded ? "+" : "−";
      }
    });
  });
});
