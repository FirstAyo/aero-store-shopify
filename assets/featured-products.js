/* =========================
   Featured products interactions
   - Wishlist / compare local state
   - Quick view from embedded product JSON
   - Add to cart from modal
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const storageKeys = {
    wishlist: "aero_wishlist",
    compare: "aero_compare",
  };

  /* -------------------------
     Local storage helpers
  ------------------------- */
  const getStoredIds = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const setStoredIds = (key, ids) => {
    localStorage.setItem(key, JSON.stringify(ids));
  };

  const toggleStoredId = (key, id) => {
    const ids = getStoredIds(key);
    const exists = ids.includes(id);
    const updated = exists ? ids.filter((x) => x !== id) : [...ids, id];
    setStoredIds(key, updated);
    return updated;
  };

  const updateCountBadge = (selector, count) => {
    const badge = document.querySelector(selector);
    if (badge) badge.textContent = String(count);
  };

  const syncHeaderCounts = () => {
    updateCountBadge(
      "[data-wishlist-count]",
      getStoredIds(storageKeys.wishlist).length,
    );
    updateCountBadge(
      "[data-compare-count]",
      getStoredIds(storageKeys.compare).length,
    );
  };

  /* -------------------------
     Wishlist / compare toggles
  ------------------------- */
  document.addEventListener("click", (event) => {
    const wishlistBtn = event.target.closest("[data-wishlist-toggle]");
    const compareBtn = event.target.closest("[data-compare-toggle]");

    if (wishlistBtn) {
      const id = wishlistBtn.getAttribute("data-product-id");
      toggleStoredId(storageKeys.wishlist, id);
      syncHeaderCounts();
    }

    if (compareBtn) {
      const id = compareBtn.getAttribute("data-product-id");
      toggleStoredId(storageKeys.compare, id);
      syncHeaderCounts();
    }
  });

  /* -------------------------
     Quick view modal refs
  ------------------------- */
  const quickView = document.querySelector("[data-quick-view]");
  const quickViewBody = document.querySelector("[data-quick-view-body]");

  /* Money formatting fallback */
  const formatMoney = (cents) => {
    const amount = Number(cents || 0) / 100;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  /* Build quick view HTML */
  const renderQuickView = (product) => {
    const variant = product.variants?.[0];
    const image = product.featured_image || product.images?.[0] || "";

    const comparePrice = variant?.compare_at_price
      ? formatMoney(variant.compare_at_price)
      : "";

    const price = variant ? formatMoney(variant.price) : "";

    const optionsMarkup = (product.options || [])
      .map((option, index) => {
        const values = [
          ...new Set(
            (product.variants || [])
              .map((variantItem) => variantItem.options?.[index])
              .filter(Boolean),
          ),
        ];

        const selectedValue = values[0] || "";

        return `
          <div class="quick-view-product__option-group">
            <label class="quick-view-product__option-label">${option.name}: ${selectedValue}</label>
            <div class="quick-view-product__option-values">
              ${values
                .map(
                  (value, valueIndex) => `
                    <button
                      type="button"
                      class="quick-view-product__option-button ${valueIndex === 0 ? "is-active" : ""}"
                    >
                      ${value}
                    </button>
                  `,
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");

    quickViewBody.innerHTML = `
      <div class="quick-view-product">
        <div class="quick-view-product__media">
          ${image ? `<img src="${image}" alt="${product.title}">` : ""}
        </div>

        <div class="quick-view-product__info">
          <h3 class="quick-view-product__title">${product.title}</h3>

          <div class="quick-view-product__price-row">
            ${price ? `<span class="quick-view-product__price">${price}</span>` : ""}
            ${comparePrice ? `<span class="quick-view-product__compare">${comparePrice}</span>` : ""}
            ${comparePrice ? `<span class="quick-view-product__badge">SALE</span>` : ""}
          </div>

          ${optionsMarkup}

          <div class="quick-view-product__actions">
            <div class="quick-view-product__purchase-row">
              <div class="quick-view-product__qty">
                <button type="button" class="quick-view-product__qty-btn" data-qty-minus>-</button>
                <span data-qty-value>1</span>
                <button type="button" class="quick-view-product__qty-btn" data-qty-plus>+</button>
              </div>

              <button
                type="button"
                class="quick-view-product__cta"
                data-add-to-cart
                data-variant-id="${variant?.id || ""}"
              >
                Add To Cart
              </button>
            </div>

            <button type="button" class="quick-view-product__buy-now">Buy It Now</button>
            <a href="${product.url || "#"}" class="quick-view-product__details-link">View full details →</a>
          </div>
        </div>
      </div>
    `;
  };

  /* -------------------------
     Open / close quick view
  ------------------------- */
  document.addEventListener("click", (event) => {
    const openBtn = event.target.closest("[data-quick-view-open]");
    const closeBtn = event.target.closest("[data-quick-view-close]");

    if (closeBtn && quickView) {
      quickView.hidden = true;
      return;
    }

    if (!openBtn || !quickView || !quickViewBody) return;

    const card = openBtn.closest("[data-product-card]");
    const jsonScript = card?.querySelector(".product-card-featured__json");

    if (!jsonScript) {
      quickView.hidden = false;
      quickViewBody.innerHTML =
        '<div class="quick-view__loading">Product data not found.</div>';
      return;
    }

    try {
      const product = JSON.parse(jsonScript.textContent);
      quickView.hidden = false;
      renderQuickView(product);
    } catch (error) {
      console.error("Quick view JSON parse failed:", error);
      quickView.hidden = false;
      quickViewBody.innerHTML =
        '<div class="quick-view__loading">Failed to load product.</div>';
    }
  });

  /* -------------------------
     Add to cart
  ------------------------- */
  document.addEventListener("click", async (event) => {
    const addToCartBtn = event.target.closest("[data-add-to-cart]");
    if (!addToCartBtn) return;

    const variantId = addToCartBtn.getAttribute("data-variant-id");
    const qtyValue = document.querySelector("[data-qty-value]");
    const quantity = qtyValue ? Number(qtyValue.textContent) : 1;

    if (!variantId) {
      console.error("Missing variant id for add to cart");
      return;
    }

    try {
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: variantId, quantity }),
      });

      window.location.href = "/cart";
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  });

  /* -------------------------
     Quantity controls
  ------------------------- */
  document.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-qty-plus]");
    const minus = event.target.closest("[data-qty-minus]");
    const qtyValue = document.querySelector("[data-qty-value]");

    if (!qtyValue) return;

    const quantity = Number(qtyValue.textContent);

    if (plus) {
      qtyValue.textContent = String(quantity + 1);
    }

    if (minus) {
      qtyValue.textContent = String(Math.max(1, quantity - 1));
    }
  });

  syncHeaderCounts();
});
