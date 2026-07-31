// popup.js — Element-Class-ID-Inspector
// Developed by XpertsWP | info@xpertswp.com | +923111765486
//
// Responsibilities:
//   1. Read/write chrome.storage.local ("active") to drive the ON/OFF toggle.
//   2. Stay in sync in real time (storage.onChanged) if state changes from
//      elsewhere while the popup happens to be open.
//   3. Reliably open external links in a new tab via chrome.tabs.create —
//      more robust inside a popup than plain target="_blank", which can get
//      swallowed if the popup loses focus/closes before the tab opens.

const STORAGE_KEY = "active";

const toggleEl = document.getElementById("toggle-active");
const statusEl = document.getElementById("status-text");
const yearEl = document.getElementById("year");

// ---------------------------------------------------------------------
// Toggle: initial state + user interaction + live sync
// ---------------------------------------------------------------------

function renderStatus(isActive) {
  toggleEl.checked = !!isActive;
  statusEl.textContent = isActive ? "Inspector is ON" : "Inspector is OFF";
  statusEl.classList.toggle("popup__status--on", !!isActive);
}

// Load current state on popup open.
chrome.storage.local.get(STORAGE_KEY).then((data) => {
  renderStatus(!!data[STORAGE_KEY]);
});

// Write new state when the user flips the switch.
toggleEl.addEventListener("change", async () => {
  const newState = toggleEl.checked;
  await chrome.storage.local.set({ [STORAGE_KEY]: newState });
  renderStatus(newState);
});

// Keep the popup's own UI accurate if "active" changes from elsewhere
// (e.g. a future keyboard shortcut, or another popup instance).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !(STORAGE_KEY in changes)) return;
  renderStatus(!!changes[STORAGE_KEY].newValue);
});

// ---------------------------------------------------------------------
// Links: always open in a new tab, reliably
// ---------------------------------------------------------------------

function openInNewTab(url, event) {
  event.preventDefault();
  chrome.tabs.create({ url });
}

document.getElementById("link-website").addEventListener("click", (e) => {
  openInNewTab("https://xpertswp.com/", e);
});

document.getElementById("link-email").addEventListener("click", (e) => {
  openInNewTab("mailto:info@xpertswp.com", e);
});

document.getElementById("link-phone").addEventListener("click", (e) => {
  openInNewTab("tel:+923111765486", e);
});

// ---------------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------------

yearEl.textContent = new Date().getFullYear();
