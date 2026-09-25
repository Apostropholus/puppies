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
- All animal photos come from the Pexels CDN (`images.pexels.com`). To
  simulate it being down, use `--host-resolver-rules=MAP images.pexels.com ~NOTFOUND`.
  Do NOT use `MAP * ~NOTFOUND, EXCLUDE localhost` — it breaks localhost
  navigation too (ERR_ABORTED).
- In sandboxed/cloud sessions the image hosts may be blocked entirely; with
  Playwright, `page.route("https://images.pexels.com/**")` and fulfill with a
  local JPEG. Mocked `api.pexels.com` / `api.anthropic.com` responses need an
  `access-control-allow-origin: *` header or the page's `fetch` rejects them.

## Tier des Tages (Pexels + Claude)

The hero is a daily-animal feature driven by `BABY_ANIMALS` in `js/data.js`
(one entry per species: `name`, `query`, `words`, `photos`).

- **With `PEXELS_API_KEY`** in `config.js` (gitignored; `config.template.js`
  is the template): species = `BABY_ANIMALS[dayNumber % n]` (continuous local
  day number → every species equally often, same for everyone that day).
  Pexels search (`per_page=80`, landscape) → `isGoodCandidate` filter
  (width ≥ 2400, ratio 1.2–2, alt/slug must contain a species word AND a
  `BABY_WORDS` entry and no `EXCLUDE_WORDS` entry). Candidates are reviewed
  in windows of 6; the window rotates per cycle so a species shows a
  different photo next time.
- **With `ANTHROPIC_API_KEY` too:** `reviewWithClaude` sends the window as
  URL image blocks (`w=800`) to `claude-sonnet-4-6` (browser call with
  `anthropic-dangerous-direct-browser-access: true`) and gets JSON
  `{index, quote}`; `-1` → next window / next species, max 3 reviews/day, then
  fallback. If the review call itself fails: first candidate + text-only
  `generateQuote`, then curated quote.
- Result cached in `localStorage` under `glo-daily-<YYYY-MM-DD>` with `v: 2`
  (older formats are ignored) so reloads make no API calls. If the cached
  photo no longer loads, a curated photo is shown instead (quote kept).
- **Without a Pexels key** (or on any failure): "Dein Tiermoment" — a random
  species with `photos`, then a random ID from it (species-balanced, never the
  same species twice in a row via `glo-last-animal`), URL
  `images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg`. A failing photo
  skips to another species (max 5 tries, then 🐶💤). Credit links the Pexels
  photo page.
- Images use `srcset` 640/960/1280/1920 w with `sizes`.

To verify without real keys, route `**/config.js*` to set `window.CONFIG`
and mock `api.pexels.com` / `api.anthropic.com`. The filter checks the
species, so the mocked Pexels alt texts must name the species that was
actually queried (read `query` from the request URL). Assert: heading "Tier
des Tages", Claude receives only filtered candidates, the chosen photo and
quote are shown, photographer credit, cache written, and a **reload makes
zero API calls**. For the fallback path, don't set CONFIG → heading
"Dein Tiermoment", curated quote, credit "Foto: Pexels".

## Flows worth driving

1. Page load: greeting matches time of day, Tier-des-Tages photo (Pexels with
   keys, else curated Pexels photo / emoji placeholder), quote shown, 3 news items
   (DE/EU/Welt). News rotate daily: `renderNews()` picks
   `NEWS_SETS[berlinDayNumber() % NEWS_SETS.length]` (Europe/Berlin date, so
   same for all visitors, flips at German midnight). `scheduleNewsRefresh()`
   re-renders at the next 00:01 Berlin. To test rotation without waiting,
   override `window.berlinDayNumber = () => N; renderNews()` and confirm a
   different set renders; check the wait math prints a positive
   seconds-until-00:01.
2. Breathe exercise: click "Übung starten" → label cycles Einatmen (3s) →
   Halten (4s) → Ausatmen (5s) with countdown; second click resets to
   "Bereit?" / "Übung starten".
3. Compliment generator: click "Ich brauche ein Kompliment" → text from
   COMPLIMENTS appears with pop animation; consecutive clicks never repeat
   the same compliment twice in a row.
4. Bubble wrap: fills the whole card surface — count computed from the grid's
   measured size (buildBubbleWrap: cols from width, rows from height, ~40px
   bubbles). Expect ~100+ bubbles on a tall desktop column, ~30 on mobile
   (min-height 260px). A `ResizeObserver` on `#bubble-grid` rebuilds on size
   change (guarded by a dims string to avoid a loop). Click bubbles → .popped
   class + pop sound (WebAudio; check `audioContext.state === 'running'`);
   re-clicking a popped bubble does nothing; after all popped → status message,
   grid regenerates after ~1.6s. The grid sits far down the page — scroll it
   into view before dispatching clicks. Headless needs
   `--autoplay-policy=no-user-gesture-required`.
5. Gratitude window: type into `#gratitude-input`, submit `#gratitude-form` →
   a `.gratitude-star.fly` element with "🌠 <text>" appears, input clears, note
   updates, star removed after ~1.8s. Empty submit shows a hint, no star.
6. Desktop column alignment: `.bubblewrap` (left col) and `.gratitude` (right
   col) are the fillers — their `getBoundingClientRect().bottom` must match.
7. Mobile (390×844): cards stack vertically in order hero → news → breathe →
   compliment → bubblewrap → gratitude (flex `order`), no horizontal scroll
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
