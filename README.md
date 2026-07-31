# Element-Class-ID-Inspector

A lightweight Chrome extension (Manifest V3) that lets you instantly
inspect the **tag name, ID, and CSS classes** of any element on a webpage
just by hovering over it — no DevTools required.

Developed by [XpertsWP](https://xpertswp.com/).

## Features

- 🖱️ **Hover to inspect** — a floating tooltip shows tag, `#id`, and
  `.class` names as you move your cursor over the page.
- 🎯 **Live element highlighting** — a subtle outline marks exactly which
  element is currently being inspected.
- 🔘 **One-click toggle** — turn the inspector on/off from the toolbar
  popup; state stays in sync across every open tab.
- 🧭 **Smart positioning** — the tooltip always stays inside the visible
  viewport, flipping to avoid screen edges.
- 🎨 **Clean, dark UI** — crisp monospace styling designed to be legible
  without getting in the way of the page underneath.

## Screenshots

*(Add a screenshot of the hover tooltip and the popup here — drag images
into this section on GitHub, or reference `docs/screenshot-*.png` once
added to the repo.)*

## Installation (from source)

1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/element-class-id-inspector.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the cloned `element-class-id-inspector`
   folder.
5. Click the extension icon in the toolbar, flip the toggle ON, and
   hover over any element on a webpage.

## Project structure

```
element-class-id-inspector/
├── manifest.json     # Manifest V3 configuration
├── background.js     # Service worker — badge state sync
├── content.js         # Hover detection, highlighting, tooltip rendering
├── styles.css         # Overlay & highlight styling
├── popup.html          # Toolbar popup markup
├── popup.js             # Popup toggle logic + link handling
├── popup.css             # Popup styling
└── icons/                 # Extension icons + branding logo
```

## How it works

State (`active: true/false`) lives in `chrome.storage.local` and is the
single source of truth. The popup toggle writes to it; `content.js` and
`background.js` both listen via `chrome.storage.onChanged` and react
instantly — so the inspector stays in sync across every tab without any
manual message-passing.

## License

MIT — see [LICENSE](LICENSE).

## Contact

Built by **XpertsWP**
🌐 [xpertswp.com](https://xpertswp.com/) · ✉️ info@xpertswp.com · ☎️ +92 311 1765486
