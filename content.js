// content.js — Element-Class-ID-Inspector
// Developed by XpertsWP | info@xpertswp.com | +923111765486
// Hover inspection logic: highlighting + floating info overlay with branded footer.
//
// NOTE: The ON/OFF toggle now lives in the popup (popup.js), but no changes
// were needed here — this script already treats chrome.storage.local as the
// single source of truth via storage.onChanged, so it stays in sync no
// matter which UI (popup, background, or a future options page) flips
// the "active" flag.

(function () {
  const STORAGE_KEY = "active";
  const OVERLAY_ID = "__eci_overlay__";
  const HIGHLIGHT_CLASS = "__eci_highlight__";
  const CURSOR_OFFSET = 16;

  // Company/branding info — edit here if it ever changes.
  const BRAND = {
    name: "XpertsWP",
    email: "info@xpertswp.com",
    phone: "+923111765486",
    logo: chrome.runtime.getURL("icons/logo.png")
  };

  let isActive = false;
  let overlayEl = null;
  let highlightedEl = null;
  let rafPending = false;
  let lastX = 0;
  let lastY = 0;

  // ---------------------------------------------------------------------
  // Init: read current state, then stay in sync via storage.onChanged
  // ---------------------------------------------------------------------

  chrome.storage.local.get(STORAGE_KEY).then((data) => {
    if (data[STORAGE_KEY]) enable();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !("active" in changes)) return;
    if (changes.active.newValue) {
      enable();
    } else {
      disable();
    }
  });

  // ---------------------------------------------------------------------
  // Enable / disable
  // ---------------------------------------------------------------------

  function enable() {
    if (isActive) return;
    isActive = true;
    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll, true);
  }

  function disable() {
    isActive = false;
    document.removeEventListener("mouseover", onMouseOver, true);
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll, true);
    clearHighlight();
    destroyOverlay();
  }

  // ---------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------

  function onMouseOver(e) {
    const el = e.target;
    if (!isValidTarget(el)) return;

    highlight(el);
    ensureOverlay();
    renderOverlayContent(el);
    lastX = e.clientX;
    lastY = e.clientY;
    positionOverlay(lastX, lastY);
  }

  function onMouseMove(e) {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!overlayEl || overlayEl.style.display === "none") return;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        positionOverlay(lastX, lastY);
        rafPending = false;
      });
    }
  }

  function onScroll() {
    destroyOverlay();
    clearHighlight();
  }

  function isValidTarget(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.id === OVERLAY_ID) return false;
    if (overlayEl && overlayEl.contains(el)) return false;
    return true;
  }

  // ---------------------------------------------------------------------
  // Highlighting
  // ---------------------------------------------------------------------

  function highlight(el) {
    if (highlightedEl === el) return;
    clearHighlight();
    highlightedEl = el;
    el.classList.add(HIGHLIGHT_CLASS);
  }

  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove(HIGHLIGHT_CLASS);
      highlightedEl = null;
    }
  }

  // ---------------------------------------------------------------------
  // Overlay: creation, content, positioning
  // ---------------------------------------------------------------------

  function ensureOverlay() {
    if (overlayEl) return;
    overlayEl = document.createElement("div");
    overlayEl.id = OVERLAY_ID;
    document.documentElement.appendChild(overlayEl);
  }

  function destroyOverlay() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  function renderOverlayContent(el) {
    if (!overlayEl) return;

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const classNames = el.classList
      ? Array.from(el.classList).filter((c) => c !== HIGHLIGHT_CLASS)
      : [];
    const classesStr = classNames.map((c) => `.${c}`).join(" ");

    overlayEl.innerHTML = "";
    overlayEl.style.display = "block";

    // --- Main info section -------------------------------------------------
    const body = document.createElement("div");
    body.className = "__eci_body__";

    const tagRow = document.createElement("div");
    tagRow.className = "__eci_row__ __eci_tag__";
    tagRow.textContent = `<${tag}>`;
    body.appendChild(tagRow);

    if (id) {
      const idRow = document.createElement("div");
      idRow.className = "__eci_row__ __eci_id__";
      idRow.textContent = id;
      body.appendChild(idRow);
    }

    if (classesStr) {
      const classRow = document.createElement("div");
      classRow.className = "__eci_row__ __eci_classes__";
      classRow.textContent = classesStr;
      body.appendChild(classRow);
    }

    if (!id && !classesStr) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "__eci_row__ __eci_meta__";
      emptyRow.textContent = "no id or class";
      body.appendChild(emptyRow);
    }

    overlayEl.appendChild(body);

    // --- Branded footer ------------------------------------------------
    overlayEl.appendChild(buildFooter());
  }

  function buildFooter() {
    const footer = document.createElement("div");
    footer.className = "__eci_footer__";

    const logo = document.createElement("img");
    logo.className = "__eci_footer_logo__";
    logo.src = BRAND.logo;
    logo.alt = BRAND.name;
    // If the logo fails to load for any reason, don't leave a broken icon.
    logo.onerror = () => { logo.style.display = "none"; };
    footer.appendChild(logo);

    const info = document.createElement("div");
    info.className = "__eci_footer_info__";

    const devRow = document.createElement("div");
    devRow.className = "__eci_footer_dev__";
    devRow.textContent = `Developed by ${BRAND.name}`;
    info.appendChild(devRow);

    const contactRow = document.createElement("div");
    contactRow.className = "__eci_footer_contact__";
    contactRow.textContent = `${BRAND.email}  ·  ${BRAND.phone}`;
    info.appendChild(contactRow);

    footer.appendChild(info);
    return footer;
  }

  function positionOverlay(x, y) {
    if (!overlayEl) return;

    overlayEl.style.left = "0px";
    overlayEl.style.top = "0px";

    const rect = overlayEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + CURSOR_OFFSET;
    let top = y + CURSOR_OFFSET;

    if (left + rect.width > vw) {
      left = x - rect.width - CURSOR_OFFSET;
    }
    if (top + rect.height > vh) {
      top = y - rect.height - CURSOR_OFFSET;
    }
    left = Math.max(4, Math.min(left, vw - rect.width - 4));
    top = Math.max(4, Math.min(top, vh - rect.height - 4));

    overlayEl.style.left = `${left}px`;
    overlayEl.style.top = `${top}px`;
  }
})();
