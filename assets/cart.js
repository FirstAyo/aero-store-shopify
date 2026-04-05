/* =========================
   Global cart drawer
   - AJAX add / update / remove
   - Header count sync
   - Opens from cart icon and add-to-cart
   - Includes note + shipping mini panels
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;

  const drawerItems = drawer.querySelector("[data-cart-drawer-items]");
  const drawerSubtotal = drawer.querySelector("[data-cart-drawer-subtotal]");
  const closeButtons = drawer.querySelectorAll("[data-cart-drawer-close]");
  const cartCountEls = document.querySelectorAll("[data-cart-count]");

  const noteToggle = drawer.querySelector("[data-cart-note-toggle]");
  const shippingToggle = drawer.querySelector("[data-cart-shipping-toggle]");
  const notePanel = drawer.querySelector("[data-cart-note-panel]");
  const shippingPanel = drawer.querySelector("[data-cart-shipping-panel]");
  const noteInput = drawer.querySelector("[data-cart-note-input]");
  const noteSaveBtn = drawer.querySelector("[data-cart-note-save]");
  const shippingCalcBtn = drawer.querySelector("[data-cart-shipping-calc]");
  const shippingCountry = drawer.querySelector("[data-cart-shipping-country]");
  const shippingZip = drawer.querySelector("[data-cart-shipping-zip]");
  const shippingResult = drawer.querySelector("[data-cart-shipping-result]");

  const formatMoney = (cents) => {
    const value = Number(cents || 0) / 100;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "CAD",
    }).format(value);
  };

  const openDrawer = () => {
    drawer.hidden = false;
    document.body.classList.add("overflow-hidden");
  };

  const closeDrawer = () => {
    drawer.hidden = true;
    document.body.classList.remove("overflow-hidden");
  };

  const closeMetaPanels = () => {
    if (notePanel) notePanel.hidden = true;
    if (shippingPanel) shippingPanel.hidden = true;
    if (noteToggle) noteToggle.setAttribute("aria-expanded", "false");
    if (shippingToggle) shippingToggle.setAttribute("aria-expanded", "false");
  };

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeMetaPanels();
      closeDrawer();
    });
  });

  document.querySelectorAll("[data-cart-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      refreshDrawer(true);
    });
  });

  if (noteToggle) {
    noteToggle.addEventListener("click", () => {
      const isOpen = noteToggle.getAttribute("aria-expanded") === "true";
      if (shippingPanel) shippingPanel.hidden = true;
      if (shippingToggle) shippingToggle.setAttribute("aria-expanded", "false");

      if (notePanel) notePanel.hidden = isOpen;
      noteToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  if (shippingToggle) {
    shippingToggle.addEventListener("click", () => {
      const isOpen = shippingToggle.getAttribute("aria-expanded") === "true";
      if (notePanel) notePanel.hidden = true;
      if (noteToggle) noteToggle.setAttribute("aria-expanded", "false");

      if (shippingPanel) shippingPanel.hidden = isOpen;
      shippingToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  const updateHeaderCount = (cart) => {
    cartCountEls.forEach((el) => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count < 1;
    });
  };

  const buildVariantText = (item) => {
    if (!item.options_with_values || !item.options_with_values.length)
      return "";
    return item.options_with_values
      .map((opt) => `${opt.name}: ${opt.value}`)
      .join(" , ");
  };

  const renderItems = (cart) => {
    if (!drawerItems) return;

    if (!cart.items.length) {
      drawerItems.innerHTML = `<p class="cart-drawer__empty">Your cart is empty.</p>`;
      return;
    }

    drawerItems.innerHTML = cart.items
      .map((item) => {
        const image = item.image
          ? `<img src="${item.image}" alt="${item.product_title}" class="cart-drawer__image">`
          : "";
        const variantText = buildVariantText(item);

        return `
        <article class="cart-drawer__item" data-line-key="${item.key}">
          <div class="cart-drawer__image-wrap">
            ${image}
          </div>

          <div class="cart-drawer__item-content">
            <div class="cart-drawer__item-top">
              <div>
                ${item.vendor ? `<p class="cart-drawer__vendor">${item.vendor}</p>` : ""}
                <h3 class="cart-drawer__name">
                  <a href="${item.url}">${item.product_title}</a>
                </h3>
                ${variantText ? `<p class="cart-drawer__variant">${variantText}</p>` : ""}
                <p class="cart-drawer__price">${formatMoney(item.final_line_price)}</p>
              </div>
            </div>

            <div class="cart-drawer__item-actions">
              <div class="cart-drawer__qty">
                <button type="button" class="cart-drawer__qty-btn" data-cart-line-minus data-line-key="${item.key}">−</button>
                <span class="cart-drawer__qty-value">${item.quantity}</span>
                <button type="button" class="cart-drawer__qty-btn" data-cart-line-plus data-line-key="${item.key}">+</button>
              </div>

              <button type="button" class="cart-drawer__remove" data-cart-line-remove data-line-key="${item.key}">
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  };

  const renderDrawer = (cart) => {
    updateHeaderCount(cart);
    renderItems(cart);

    if (drawerSubtotal) {
      drawerSubtotal.textContent = formatMoney(cart.total_price);
    }

    if (noteInput) {
      noteInput.value = cart.note || "";
    }

    bindLineEvents();
  };

  const getCart = async () => {
    const response = await fetch("/cart.js");
    if (!response.ok) throw new Error("Failed to load cart");
    return response.json();
  };

  const changeLine = async (lineKey, quantity) => {
    const response = await fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lineKey,
        quantity,
      }),
    });

    if (!response.ok) throw new Error("Failed to update cart");
    return response.json();
  };

  const addToCart = async (variantId, quantity = 1) => {
    const response = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            id: Number(variantId),
            quantity: Number(quantity),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to add item");
    return response.json();
  };

  const saveCartNote = async (note) => {
    const response = await fetch("/cart/update.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) throw new Error("Failed to save note");
    return response.json();
  };

  const refreshDrawer = async (openAfter = false) => {
    try {
      const cart = await getCart();
      renderDrawer(cart);
      if (openAfter) openDrawer();
    } catch (error) {
      console.error(error);
    }
  };

  const bindLineEvents = () => {
    drawer.querySelectorAll("[data-cart-line-minus]").forEach((button) => {
      button.addEventListener("click", async () => {
        const key = button.getAttribute("data-line-key");
        const itemEl = button.closest("[data-line-key]");
        const qtyText = itemEl?.querySelector(".cart-drawer__qty-value");
        const currentQty = Number(qtyText?.textContent || 1);
        const nextQty = Math.max(0, currentQty - 1);

        try {
          const cart = await changeLine(key, nextQty);
          renderDrawer(cart);
        } catch (error) {
          console.error(error);
        }
      });
    });

    drawer.querySelectorAll("[data-cart-line-plus]").forEach((button) => {
      button.addEventListener("click", async () => {
        const key = button.getAttribute("data-line-key");
        const itemEl = button.closest("[data-line-key]");
        const qtyText = itemEl?.querySelector(".cart-drawer__qty-value");
        const currentQty = Number(qtyText?.textContent || 1);

        try {
          const cart = await changeLine(key, currentQty + 1);
          renderDrawer(cart);
        } catch (error) {
          console.error(error);
        }
      });
    });

    drawer.querySelectorAll("[data-cart-line-remove]").forEach((button) => {
      button.addEventListener("click", async () => {
        const key = button.getAttribute("data-line-key");

        try {
          const cart = await changeLine(key, 0);
          renderDrawer(cart);
        } catch (error) {
          console.error(error);
        }
      });
    });
  };

  if (noteSaveBtn && noteInput) {
    noteSaveBtn.addEventListener("click", async () => {
      try {
        await saveCartNote(noteInput.value);
        await refreshDrawer(false);
      } catch (error) {
        console.error(error);
      }
    });
  }

  if (shippingCalcBtn && shippingCountry && shippingZip && shippingResult) {
    shippingCalcBtn.addEventListener("click", () => {
      const country = shippingCountry.value.trim();
      const zip = shippingZip.value.trim();

      shippingResult.hidden = false;

      if (!country || !zip) {
        shippingResult.textContent = "Enter a country and postal / ZIP code.";
        return;
      }

      shippingResult.textContent = `Estimated shipping to ${country} (${zip}) will be calculated at checkout.`;
    });
  }

  /* Product forms -> AJAX add -> open drawer */
  document
    .querySelectorAll("[data-product-form], [data-sticky-product-form]")
    .forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const variantIdInput = form.querySelector('input[name="id"]');
        const qtyInput = form.querySelector('input[name="quantity"]');

        if (!variantIdInput) return;

        const variantId = variantIdInput.value;
        const quantity = qtyInput ? qtyInput.value : 1;

        try {
          await addToCart(variantId, quantity);
          await refreshDrawer(true);
        } catch (error) {
          console.error(error);
        }
      });
    });

  refreshDrawer(false);
});

/* =========================
   Cart page quantity logic
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const cartPageMinusButtons = document.querySelectorAll(
    "[data-cart-page-minus]",
  );
  const cartPagePlusButtons = document.querySelectorAll(
    "[data-cart-page-plus]",
  );
  const cartPageRemoveButtons = document.querySelectorAll(
    "[data-cart-page-remove]",
  );

  if (
    !cartPageMinusButtons.length &&
    !cartPagePlusButtons.length &&
    !cartPageRemoveButtons.length
  )
    return;

  const updateCartPageLine = async (line, quantity) => {
    const response = await fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line: Number(line),
        quantity: Number(quantity),
      }),
    });

    if (!response.ok) throw new Error("Failed to update cart");
    return response.json();
  };

  const bindCartPageEvents = () => {
    cartPageMinusButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const line = button.getAttribute("data-line-index");
        const input = document.querySelector(
          `[data-cart-page-qty][data-line-index="${line}"]`,
        );
        const currentQty = Number(input?.value || 1);
        const nextQty = Math.max(0, currentQty - 1);

        try {
          await updateCartPageLine(line, nextQty);
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      });
    });

    cartPagePlusButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const line = button.getAttribute("data-line-index");
        const input = document.querySelector(
          `[data-cart-page-qty][data-line-index="${line}"]`,
        );
        const currentQty = Number(input?.value || 1);

        try {
          await updateCartPageLine(line, currentQty + 1);
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      });
    });

    cartPageRemoveButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const line = button.getAttribute("data-line-index");

        try {
          await updateCartPageLine(line, 0);
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      });
    });
  };

  bindCartPageEvents();
});
