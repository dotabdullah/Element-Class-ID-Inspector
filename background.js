// background.js — Element-Class-ID-Inspector
// Developed by XpertsWP | info@xpertswp.com | +923111765486
//
// NOTE: Now that manifest.json declares "default_popup", Chrome no longer
// fires chrome.action.onClicked when the toolbar icon is clicked — it opens
// the popup instead. So this service worker's only job now is to:
//   1. Set sane defaults on install.
//   2. Keep the toolbar badge in sync whenever "active" changes in storage,
//      regardless of what changed it (popup.js is now the source of truth
//      for toggling, but this listener works no matter where a future
//      change might originate from — e.g. a keyboard shortcut you add later).

const STORAGE_KEY = "active";

function updateBadge(isActive) {
  chrome.action.setBadgeText({ text: isActive ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: isActive ? "#22c55e" : "#71717a" });
  chrome.action.setTitle({
    title: isActive
      ? "Element-Class-ID-Inspector: ON — by XpertsWP"
      : "Element-Class-ID-Inspector: OFF — by XpertsWP"
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { [STORAGE_KEY]: active } = await chrome.storage.local.get(STORAGE_KEY);
  if (active === undefined) {
    await chrome.storage.local.set({ [STORAGE_KEY]: false });
  }
  updateBadge(!!active);
});

chrome.runtime.onStartup.addListener(async () => {
  const { [STORAGE_KEY]: active } = await chrome.storage.local.get(STORAGE_KEY);
  updateBadge(!!active);
});

// Single source of truth for the badge: react to storage changes from
// anywhere (popup toggle, future keyboard command, etc.) rather than
// only updating badge state inside a click handler.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !(STORAGE_KEY in changes)) return;
  updateBadge(!!changes[STORAGE_KEY].newValue);
});
