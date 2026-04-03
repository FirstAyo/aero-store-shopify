document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.querySelector("[data-nav-drawer]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const closeButtons = document.querySelectorAll("[data-nav-close]");
  const submenuToggles = document.querySelectorAll("[data-submenu-toggle]");

  if (!drawer || !toggle) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("overflow-hidden");
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overflow-hidden");

    submenuToggles.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      const submenu = button
        .closest(".nav-drawer__item")
        ?.querySelector(".nav-drawer__submenu");
      if (submenu) submenu.hidden = true;
    });
  };

  toggle.addEventListener("click", openDrawer);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeDrawer);
  });

  submenuToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const item = button.closest(".nav-drawer__item");
      const submenu = item?.querySelector(".nav-drawer__submenu");

      button.setAttribute("aria-expanded", String(!isExpanded));

      if (submenu) {
        submenu.hidden = isExpanded;
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
});
