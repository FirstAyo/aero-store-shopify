document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("[data-countdown-offer]");

  sections.forEach((section) => {
    const endDate = section.getAttribute("data-end-date");
    if (!endDate) return;

    const daysEl = section.querySelector("[data-days]");
    const hoursEl = section.querySelector("[data-hours]");
    const minutesEl = section.querySelector("[data-minutes]");
    const secondsEl = section.querySelector("[data-seconds]");

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(endDate).getTime();
      const distance = target - now;

      if (distance <= 0) {
        if (daysEl) daysEl.textContent = "0";
        if (hoursEl) hoursEl.textContent = "00";
        if (minutesEl) minutesEl.textContent = "00";
        if (secondsEl) secondsEl.textContent = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      if (daysEl) daysEl.textContent = String(days);
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
});
