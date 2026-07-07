---
name: verify
description: How to build, launch and drive the Gute-Laune-Oase page to verify changes end-to-end.
---

# Verifying the Gute-Laune-Oase

Static HTML/CSS/JS one-pager, no build step.

## Launch

```bash
python3 -m http.server 8642   # from the repo root, then open http://localhost:8642
```

(`node` is NOT installed on this machine; use `python3` from anaconda.)

## Drive headlessly

Google Chrome is installed; Playwright/Selenium are not, but the Python
package `websocket-client` is. Drive Chrome via CDP:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9333 --remote-allow-origins=* \
  --user-data-dir=<tmpdir> --window-size=1280,950
```

then connect `websocket-client` to `webSocketDebuggerUrl` from
`http://localhost:9333/json` and use `Page.navigate`, `Runtime.evaluate`,
`Input.dispatchMouseEvent`, `Page.captureScreenshot`.

Gotchas learned the hard way:

- `Page.captureScreenshot` with `captureBeyondViewport: true` **resets the
  scroll position** — re-scroll (`scrollIntoView`) and recompute element
  coordinates before any subsequent `Input.dispatchMouseEvent` click.
- To simulate the animal-image APIs being down, use
  `--host-resolver-rules=MAP dog.ceo ~NOTFOUND, MAP images.dog.ceo ~NOTFOUND, MAP randomfox.ca ~NOTFOUND, MAP cataas.com ~NOTFOUND`.
  Do NOT use `MAP * ~NOTFOUND, EXCLUDE localhost` — it breaks localhost
  navigation too (ERR_ABORTED).
- dog.ceo can be unreachable from this network (TLS handshake failure);
  a fox/cat image instead of a dog is the fallback working, not a bug.

## Flows worth driving

1. Page load: greeting matches time of day, quote shown, 3 news items
   (DE/EU/Welt), animal image visible (or emoji placeholder if all APIs down).
2. Breathe exercise: click "Übung starten" → label cycles Einatmen (4s) →
   Halten (7s) → Ausatmen (8s) with countdown; second click resets to
   "Bereit?" / "Übung starten".
3. Mobile (390×844): cards stack vertically, no horizontal scroll
   (`document.documentElement.scrollWidth <= clientWidth`).
