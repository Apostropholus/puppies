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

## Tier des Tages (Pexels + Claude)

The hero is a daily-animal feature. With API keys in `config.js` (gitignored;
`config.template.js` is the template) it fetches one Pexels photo per day
(day-of-year seeds the search term + photo index → same for everyone that day)
plus a Claude-generated quote (`claude-sonnet-4-6`, called from the browser
with the `anthropic-dangerous-direct-browser-access: true` header). Result is
cached in `localStorage` under `glo-daily-<YYYY-MM-DD>` so reloads make no API
calls. Without `config.js` (e.g. on GitHub Pages, where it's gitignored) it
falls back to the free keyless image APIs + curated `QUOTES`.

To verify without real keys, inject via CDP `Page.addScriptToEvaluateOnNewDocument`:
set `window.CONFIG` and override `window.fetch` to mock `api.pexels.com` and
`api.anthropic.com` responses (see scratchpad `check_daily.py` in session
history). Assert: heading "Tier des Tages", photo credit shown, cache key
written, a **reload makes zero API calls**, "🔄 Neuer Spruch" fires a fresh
Claude call. For the fallback path, don't inject CONFIG → heading flips to
"Dein Tiermoment", curated quote, credit hidden.

## Flows worth driving

1. Page load: greeting matches time of day, Tier-des-Tages photo (Pexels with
   keys, else free-API animal / emoji placeholder), quote shown, 3 news items
   (DE/EU/Welt).
2. Breathe exercise: click "Übung starten" → label cycles Einatmen (3s) →
   Halten (4s) → Ausatmen (5s) with countdown; second click resets to
   "Bereit?" / "Übung starten".
3. Compliment generator: click "Ich brauche ein Kompliment" → text from
   COMPLIMENTS appears with pop animation; consecutive clicks never repeat
   the same compliment twice in a row.
4. Bubble wrap: 20 bubbles (5x4) at ≥900px viewport, 9 (3x3) below; click
   bubbles → .popped class + pop sound (WebAudio; check
   `audioContext.state === 'running'`); re-clicking a popped bubble does
   nothing; after all popped → status message, grid regenerates after ~1.6s.
   Headless needs `--autoplay-policy=no-user-gesture-required`.
5. Desktop column alignment: bottom of .bubblewrap (left col) and .breathe
   (right col) must match (`getBoundingClientRect().bottom` equal ±2px).
6. Mobile (390×844): cards stack vertically in order hero → news → breathe →
   compliment → bubblewrap (flex `order`), no horizontal scroll
   (`document.documentElement.scrollWidth <= clientWidth`).

More driver gotchas:

- The page uses `scroll-behavior: smooth` — before computing click
  coordinates, scroll with `behavior:'instant'` (or wait ~600ms), otherwise
  the click lands on stale coordinates mid-scroll.
- Filter the CDP target list to `type === "page"` and non-`chrome-extension`
  URLs; headless Chrome sometimes lists an extension background page first.
- Pace dispatched clicks ≥0.3s apart; faster sequences silently drop some.
- `Page.captureScreenshot` with `captureBeyondViewport` can render stale
  class-based styles (popped bubbles shown intact) — for visual-state checks
  use a plain viewport capture instead.
