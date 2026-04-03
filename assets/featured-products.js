document.addEventListener("DOMContentLoaded", () => {
  const storageKeys = {
    wishlist: "aero_wishlist",
    compare: "aero_compare",
  };

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

  const quickView = document.querySelector("[data-quick-view]");
  const quickViewBody = document.querySelector("[data-quick-view-body]");

  const renderQuickView = (product) => {
    const variant = product.variants[0];
    const image = product.featured_image || product.images[0];
    const comparePrice = variant.compare_at_price
      ? Shopify.formatMoney(variant.compare_at_price)
      : "";
    const price = Shopify.formatMoney(variant.price);

    const optionsMarkup = (product.options || [])
      .map((option, index) => {
        const values = [
          ...new Set(
            product.variants
              .map((variantItem) => variantItem.options[index])
              .filter(Boolean),
          ),
        ];
        return `
          <div class="quick-view-product__option-group">
            <label class="quick-view-product__option-label">${option.name}: ${values[0] || ""}</label>
            <div class="quick-view-product__option-values">
              ${values
                .map(
                  (value, valueIndex) => `
                <button type="button" class="quick-view-product__option-button ${valueIndex === 0 ? "is-active" : ""}">
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
          <img src="${image}" alt="${product.title}">
        </div>

        <div class="quick-view-product__info">
          <h3 class="quick-view-product__title">${product.title}</h3>

          <div class="quick-view-product__price-row">
            <span class="quick-view-product__price">${price}</span>
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
                data-variant-id="${variant.id}"
              >
                Add To Cart
              </button>
            </div>

            <button type="button" class="quick-view-product__buy-now">Buy It Now</button>
            <a href="${product.url}" class="quick-view-product__details-link">View full details →</a>
          </div>
        </div>
      </div>
    `;
  };

  document.addEventListener("click", async (event) => {
    const openBtn = event.target.closest("[data-quick-view-open]");
    const closeBtn = event.target.closest("[data-quick-view-close]");

    if (closeBtn && quickView) {
      quickView.hidden = true;
      return;
    }

    if (!openBtn || !quickView || !quickViewBody) return;

    const handle = openBtn.getAttribute("data-product-handle");
    quickView.hidden = false;
    quickViewBody.innerHTML =
      '<div class="quick-view__loading">Loading...</div>';

    try {
      const response = await fetch(`/products/${handle}.js`);
      const product = await response.json();
      renderQuickView(product);
    } catch (error) {
      quickViewBody.innerHTML =
        '<div class="quick-view__loading">Failed to load product.</div>';
    }
  });

  document.addEventListener("click", async (event) => {
    const addToCartBtn = event.target.closest("[data-add-to-cart]");
    if (!addToCartBtn) return;

    const variantId = addToCartBtn.getAttribute("data-variant-id");
    const qtyValue = document.querySelector("[data-qty-value]");
    const quantity = qtyValue ? Number(qtyValue.textContent) : 1;

    try {
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: variantId, quantity }),
      });

      window.location.href = "/cart";
    } catch (error) {
      console.error("Add to cart failed", error);
    }
  });

  document.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-qty-plus]");
    const minus = event.target.closest("[data-qty-minus]");
    const qtyValue = document.querySelector("[data-qty-value]");

    if (!qtyValue) return;

    let quantity = Number(qtyValue.textContent);

    if (plus) {
      qtyValue.textContent = String(quantity + 1);
    }

    if (minus) {
      qtyValue.textContent = String(Math.max(1, quantity - 1));
    }
  });

  syncHeaderCounts();
});
