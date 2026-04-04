/* =========================
   Team slider
   - Desktop: 4 per view
   - Mobile: 1 per view
   - Auto scroll + arrows
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("[data-team-slider]");

  sections.forEach((section) => {
    const viewport = section.querySelector("[data-team-viewport]");
    const track = section.querySelector("[data-team-track]");
    const prevBtn = section.querySelector("[data-team-prev]");
    const nextBtn = section.querySelector("[data-team-next]");
    const cards = track ? Array.from(track.children) : [];

    if (!viewport || !track || !prevBtn || !nextBtn || cards.length === 0)
      return;

    let currentIndex = 0;
    let autoTimer;

    const getPerView = () => (window.innerWidth <= 989 ? 1 : 4);

    const updateSlider = () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);

      if (currentIndex > maxIndex) currentIndex = 0;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || 18);
      const offset = currentIndex * (cardWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;
    };

    const nextSlide = () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateSlider();
    };

    const prevSlide = () => {
      const perView = getPerView();
      const maxIndex = Math.max(0, cards.length - perView);
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateSlider();
    };

    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(nextSlide, 3000);
    };

    const stopAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
    };

    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAuto();
    });

    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAuto();
    });

    section.addEventListener("mouseenter", stopAuto);
    section.addEventListener("mouseleave", startAuto);

    window.addEventListener("resize", updateSlider);

    updateSlider();
    startAuto();
  });
});
