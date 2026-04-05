/* =========================
   Product recommendations
   - Lazy-loads Shopify recommendations section
   - Slider arrows
   - Counter updates
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(
    "[data-product-recommendations-section]",
  );
  if (!section) return;

  const root = section.querySelector("[data-recommendations-root]");
  const url = root?.getAttribute("data-url");
  if (!root || !url) return;

  fetch(url)
    .then((response) => response.text())
    .then((text) => {
      const html = document.createElement("div");
      html.innerHTML = text;

      const inner = html.querySelector(
        ".product-recommendations-custom__content",
      );
      if (!inner) return;

      root.innerHTML = inner.innerHTML;
      initRecommendationsSlider(section);
    })
    .catch((error) => {
      console.error("Failed to load product recommendations", error);
    });

  function initRecommendationsSlider(scope) {
    const viewport = scope.querySelector("[data-recommendations-viewport]");
    const track = scope.querySelector("[data-recommendations-track]");
    const prevBtn = scope.querySelector("[data-recommendations-prev]");
    const nextBtn = scope.querySelector("[data-recommendations-next]");
    const counter = scope.querySelector("[data-recommendations-counter]");

    if (!viewport || !track || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.children);
    if (!cards.length) return;

    let currentIndex = 0;

    const getPerView = () => {
      if (window.innerWidth <= 749) return 2;
      if (window.innerWidth <= 989) return 2;
      return 4;
    };

    const updateSlider = () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);

      if (currentIndex > maxIndex) currentIndex = maxIndex;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || 18);
      const offset = currentIndex * (cardWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      if (counter) {
        counter.textContent = `${Math.min(currentIndex + 1, cards.length)} / ${cards.length}`;
      }

      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    };

    prevBtn.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    });

    nextBtn.addEventListener("click", () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateSlider();
    });

    window.addEventListener("resize", updateSlider);
    updateSlider();
  }
});
