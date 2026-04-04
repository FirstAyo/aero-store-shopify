/* =========================
   Collection mobile drawer
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.querySelector("[data-filter-open]");
  const drawer = document.querySelector("[data-filter-drawer]");
  const closeBtns = document.querySelectorAll("[data-filter-close]");

  if (!openBtn || !drawer) return;

  openBtn.addEventListener("click", () => {
    drawer.hidden = false;
    document.body.classList.add("overflow-hidden");
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      drawer.hidden = true;
      document.body.classList.remove("overflow-hidden");
    });
  });
});
