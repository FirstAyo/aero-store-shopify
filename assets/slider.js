document.addEventListener("DOMContentLoaded", () => {
  const heroSliders = document.querySelectorAll("[data-hero-slider]");

  heroSliders.forEach((hero) => {
    const track = hero.querySelector("[data-hero-track]");
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const prevButton = hero.querySelector("[data-hero-prev]");
    const nextButton = hero.querySelector("[data-hero-next]");

    if (!track || slides.length === 0) return;

    let currentIndex = 0;

    const updateSlider = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    if (slides.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      return;
    }

    nextButton?.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    });

    prevButton?.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    });

    updateSlider();
  });
});
