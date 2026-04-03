/* =========================
   Testimonials slider
   - Desktop: 3 cards per view
   - Mobile: 1 card per view
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const viewports = document.querySelectorAll("[data-testimonials-viewport]");

  viewports.forEach((viewport) => {
    const section = viewport.closest(".testimonials-section");
    const track = section?.querySelector("[data-testimonials-track]");
    const prevBtn = section?.querySelector("[data-testimonials-prev]");
    const nextBtn = section?.querySelector("[data-testimonials-next]");
    const cards = track ? Array.from(track.children) : [];

    if (!track || !prevBtn || !nextBtn || cards.length === 0) return;

    let currentIndex = 0;

    /* Get how many cards are visible based on screen size */
    const getPerView = () => {
      return window.innerWidth <= 989 ? 1 : 3;
    };

    /* Move slider */
    const updateSlider = () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      const cardWidth = cards[0].getBoundingClientRect().width;
      const trackStyles = window.getComputedStyle(track);
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || 24);

      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    };

    /* Prev button */
    prevBtn.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    });

    /* Next button */
    nextBtn.addEventListener("click", () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateSlider();
    });

    /* Recalculate on resize */
    window.addEventListener("resize", updateSlider);

    updateSlider();
  });
});
