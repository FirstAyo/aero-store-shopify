/* =========================
   Footer accordion
   - Mobile only accordion behavior
========================= */

document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('[data-footer-trigger]');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.newsletter-footer__accordion-item');
      const panel = item?.querySelector('.newsletter-footer__accordion-panel');
      const expanded = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', String(!expanded));

      if (panel) {
        panel.hidden = expanded;
      }
    });
  });
});