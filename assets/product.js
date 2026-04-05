/* =========================
   Product page interactions
   - Media thumbnail switching
   - Variant selection
   - Price updates
   - Quantity
   - Inquiry modal
   - Sticky product bar
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const productSection = document.querySelector("[data-product-section]");
  if (!productSection) return;

  const productJsonEl = productSection.querySelector("[data-product-json]");
  if (!productJsonEl) return;

  let productData;

  try {
    productData = JSON.parse(productJsonEl.textContent);
  } catch (error) {
    console.error("Failed to parse product JSON", error);
    return;
  }

  const mainMediaWrap = productSection.querySelector(
    "[data-product-main-media]",
  );
  const thumbButtons = productSection.querySelectorAll("[data-media-thumb]");
  const optionButtons = productSection.querySelectorAll("[data-option-value]");
  const variantIdInput = productSection.querySelector(
    "[data-variant-id-input]",
  );
  const priceEl = productSection.querySelector("[data-product-price]");
  const comparePriceEl = productSection.querySelector(
    "[data-product-compare-price]",
  );
  const discountEl = productSection.querySelector("[data-product-discount]");
  const addToCartBtn = productSection.querySelector("[data-add-to-cart-btn]");
  const qtyInput = productSection.querySelector("[data-qty-input]");
  const qtyMinus = productSection.querySelector("[data-qty-minus]");
  const qtyPlus = productSection.querySelector("[data-qty-plus]");

  /* Sticky bar elements */
  const stickyBar = document.querySelector("[data-product-sticky-bar]");
  const stickyVariantId = document.querySelector("[data-sticky-variant-id]");
  const stickyTitle = document.querySelector("[data-sticky-title]");
  const stickyVariantSummary = document.querySelector(
    "[data-sticky-variant-summary]",
  );
  const stickyAddToCart = document.querySelector("[data-sticky-add-to-cart]");
  const stickyQtyInput = document.querySelector("[data-sticky-qty-input]");
  const stickyQtyMinus = document.querySelector("[data-sticky-qty-minus]");
  const stickyQtyPlus = document.querySelector("[data-sticky-qty-plus]");

  const getCurrentSelections = () => {
    const groups = [
      ...productSection.querySelectorAll("[data-product-option-group]"),
    ];
    return groups.map((group) => {
      const active = group.querySelector("[data-option-value].is-active");
      return active ? active.getAttribute("data-option-value-text") : null;
    });
  };

  const findVariant = () => {
    const selectedOptions = getCurrentSelections();
    return productData.variants.find((variant) => {
      return variant.options.every(
        (optionValue, index) => optionValue === selectedOptions[index],
      );
    });
  };

  const formatMoney = (cents) => {
    const value = Number(cents || 0) / 100;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const updateMedia = (variant) => {
    if (!mainMediaWrap) return;

    let mediaSrc = null;
    let mediaId = null;

    if (variant?.featured_media?.src) {
      mediaSrc = variant.featured_media.src;
      mediaId = String(variant.featured_media.id || "");
    } else if (variant?.featured_image?.src) {
      mediaSrc = variant.featured_image.src;
    }

    if (!mediaSrc) return;

    mainMediaWrap.innerHTML = `<img src="${mediaSrc}" alt="${productData.title}" class="product-media-main__image">`;

    thumbButtons.forEach((btn) => {
      const btnMediaId = btn.getAttribute("data-media-id");
      btn.classList.toggle("is-active", mediaId && btnMediaId === mediaId);
    });
  };

  const updatePrices = (variant) => {
    if (!variant || !priceEl) return;

    priceEl.textContent = formatMoney(variant.price);

    if (comparePriceEl) {
      if (
        variant.compare_at_price &&
        variant.compare_at_price > variant.price
      ) {
        comparePriceEl.hidden = false;
        comparePriceEl.textContent = formatMoney(variant.compare_at_price);
      } else {
        comparePriceEl.hidden = true;
        comparePriceEl.textContent = "";
      }
    }

    if (discountEl) {
      if (
        variant.compare_at_price &&
        variant.compare_at_price > variant.price
      ) {
        const savings = Math.round(
          ((variant.compare_at_price - variant.price) /
            variant.compare_at_price) *
            100,
        );
        discountEl.hidden = false;
        discountEl.textContent = `-${savings}%`;
      } else {
        discountEl.hidden = true;
        discountEl.textContent = "";
      }
    }
  };

  const updateStickyBar = (variant) => {
    if (!stickyBar || !variant) return;

    if (stickyTitle) {
      stickyTitle.textContent = productData.title;
    }

    if (stickyVariantSummary) {
      const variantText = `${variant.title} - ${formatMoney(variant.price)}`;
      stickyVariantSummary.textContent = variantText;
    }

    if (stickyVariantId) {
      stickyVariantId.value = variant.id;
    }

    if (stickyAddToCart) {
      stickyAddToCart.disabled = !variant.available;
      stickyAddToCart.textContent = variant.available
        ? "Add To Cart"
        : "Sold Out";
    }
  };

  const updateVariant = () => {
    const variant = findVariant();
    if (!variant) return;

    if (variantIdInput) variantIdInput.value = variant.id;

    if (addToCartBtn) {
      addToCartBtn.disabled = !variant.available;
      addToCartBtn.textContent = variant.available ? "Add To Cart" : "Sold Out";
    }

    updatePrices(variant);
    updateMedia(variant);
    updateStickyBar(variant);
  };

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest("[data-product-option-group]");
      if (!group) return;

      group
        .querySelectorAll("[data-option-value]")
        .forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      const selectedLabel = group.querySelector("[data-option-selected]");
      if (selectedLabel) {
        selectedLabel.textContent =
          button.getAttribute("data-option-value-text") || "";
      }

      updateVariant();
    });
  });

  thumbButtons.forEach((button) => {
    button.addEventListener("click", () => {
      thumbButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      const src = button.getAttribute("data-media-src");
      if (src && mainMediaWrap) {
        mainMediaWrap.innerHTML = `<img src="${src}" alt="${productData.title}" class="product-media-main__image">`;
      }
    });
  });

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener("click", () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
      if (stickyQtyInput) stickyQtyInput.value = qtyInput.value;
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener("click", () => {
      qtyInput.value = Number(qtyInput.value || 1) + 1;
      if (stickyQtyInput) stickyQtyInput.value = qtyInput.value;
    });
  }

  if (stickyQtyMinus && stickyQtyInput) {
    stickyQtyMinus.addEventListener("click", () => {
      stickyQtyInput.value = Math.max(1, Number(stickyQtyInput.value || 1) - 1);
      if (qtyInput) qtyInput.value = stickyQtyInput.value;
    });
  }

  if (stickyQtyPlus && stickyQtyInput) {
    stickyQtyPlus.addEventListener("click", () => {
      stickyQtyInput.value = Number(stickyQtyInput.value || 1) + 1;
      if (qtyInput) qtyInput.value = stickyQtyInput.value;
    });
  }

  if (stickyQtyInput && qtyInput) {
    stickyQtyInput.addEventListener("input", () => {
      qtyInput.value = Math.max(1, Number(stickyQtyInput.value || 1));
      stickyQtyInput.value = qtyInput.value;
    });

    qtyInput.addEventListener("input", () => {
      stickyQtyInput.value = Math.max(1, Number(qtyInput.value || 1));
      qtyInput.value = stickyQtyInput.value;
    });
  }

  /* Ask about product modal */
  const inquiryModal = document.querySelector("[data-product-inquiry-modal]");
  const inquiryOpen = document.querySelector("[data-product-inquiry-open]");
  const inquiryClose = document.querySelectorAll(
    "[data-product-inquiry-close]",
  );
  const inquiryUrlInput = document.querySelector("[data-product-inquiry-url]");

  if (inquiryOpen && inquiryModal) {
    inquiryOpen.addEventListener("click", () => {
      inquiryModal.hidden = false;
      document.body.classList.add("overflow-hidden");

      if (inquiryUrlInput) {
        inquiryUrlInput.value =
          inquiryOpen.getAttribute("data-product-url") || window.location.href;
      }
    });
  }

  inquiryClose.forEach((button) => {
    button.addEventListener("click", () => {
      if (inquiryModal) inquiryModal.hidden = true;
      document.body.classList.remove("overflow-hidden");
    });
  });

  /* Share more */
  const shareMoreBtn = document.querySelector("[data-share-more]");
  if (shareMoreBtn && navigator.share) {
    shareMoreBtn.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: productData.title,
          url: window.location.href,
        });
      } catch (error) {
        /* ignore */
      }
    });
  }

  /* Sticky bar show/hide */
  const handleStickyVisibility = () => {
    if (!stickyBar) return;

    const triggerPoint = window.innerWidth <= 749 ? 420 : 520;
    if (window.scrollY > triggerPoint) {
      stickyBar.hidden = false;
    } else {
      stickyBar.hidden = true;
    }
  };

  window.addEventListener("scroll", handleStickyVisibility, { passive: true });
  window.addEventListener("resize", handleStickyVisibility);

  updateVariant();
  handleStickyVisibility();
});
