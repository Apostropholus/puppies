/* =========================================================================
   Gute-Laune-Oase – Logik
   ========================================================================= */

// --- 1. Begrüßung nach Tageszeit -----------------------------------------
function setGreeting() {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 5) greeting = "Noch wach? Schön, dass du da bist! 🌙";
  else if (hour < 11) greeting = "Guten Morgen – schön, dass du da bist! ☕";
  else if (hour < 14) greeting = "Hallo und guten Tag – schön, dass du da bist! ☀️";
  else if (hour < 18) greeting = "Schönen Nachmittag – toll, dass du vorbeischaust! 🌼";
  else if (hour < 22) greeting = "Guten Abend – schön, dass du da bist! 🌇";
  else greeting = "Gute Nacht bald – aber erst noch etwas gute Laune! ✨";
  document.getElementById("greeting").textContent = greeting;
}

// --- 2. Tierbaby-Fotos -------------------------------------------------------
// Alle Fotos kommen von Pexels. Deren Bildserver liefert jedes Foto in genau
// der Breite, die das Display braucht (srcset): scharf auf Retina-Displays,
// sparsam auf dem Handy.
const PHOTO_WIDTHS = [640, 960, 1280, 1920];
const PHOTO_SIZES = "(min-width: 900px) 520px, calc(100vw - 5rem)";

function pexelsImageUrl(base, width) {
  return `${base}?auto=compress&cs=tinysrgb&w=${width}`;
}

// Bildadresse eines Pexels-Fotos aus seiner ID (für die feste Fotoliste)
function pexelsBaseFromId(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
}

// Zeigt ein Foto im Hero an. Das Promise schlägt fehl, wenn es nicht lädt.
function showPhoto(base, alt) {
  const img = document.getElementById("animal-image");
  const placeholder = document.getElementById("image-placeholder");
  return new Promise((resolve, reject) => {
    img.onload = () => {
      img.hidden = false;
      placeholder.hidden = true;
      resolve();
    };
    img.onerror = reject;
    img.alt = alt;
    img.sizes = PHOTO_SIZES;
    img.srcset = PHOTO_WIDTHS.map((w) => `${pexelsImageUrl(base, w)} ${w}w`).join(", ");
    img.src = pexelsImageUrl(base, 1280);
  });
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Feste Fotoliste (Betrieb ohne Pexels-Schlüssel): erst eine Tierart, dann
// ein Foto davon – so ist jede Art gleich wahrscheinlich, egal wie viele
// Fotos sie hat. Die zuletzt gezeigte Art kommt nicht direkt noch einmal.
const LAST_ANIMAL_KEY = "glo-last-animal";

function pickCuratedPhoto(skipNames) {
  const all = BABY_ANIMALS.filter((a) => a.photos.length);
  const fresh = all.filter((a) => !skipNames.includes(a.name));
  const pool = fresh.length ? fresh : all;
  if (!pool.length) return null;
  const animal = randomItem(pool);
  return { animal, id: randomItem(animal.photos) };
}

async function loadCuratedPhoto() {
  const skip = [];
  try {
    const last = localStorage.getItem(LAST_ANIMAL_KEY);
    if (last) skip.push(last);
  } catch {
    // localStorage nicht verfügbar – dann eben ohne Wiederholungsschutz
  }

  // Lädt ein Foto nicht (z.B. bei Pexels gelöscht), kommt eine andere Art dran
  for (let attempt = 0; attempt < 5; attempt++) {
    const pick = pickCuratedPhoto(skip);
    if (!pick) break;
    try {
      await showPhoto(pexelsBaseFromId(pick.id), pick.animal.name);
      showPhotoCredit("", "", `https://www.pexels.com/photo/${pick.id}/`);
      try {
        localStorage.setItem(LAST_ANIMAL_KEY, pick.animal.name);
      } catch {
        // egal
      }
      return;
    } catch {
      skip.push(pick.animal.name);
    }
  }
  // Nichts ladbar: freundlicher Emoji-Platzhalter bleibt stehen
  document.getElementById("image-placeholder").textContent = "🐶💤";
}

// --- 3. Zitat setzen / kuratiertes Zufallszitat ----------------------------
function setQuote(text, author) {
  document.getElementById("quote-text").textContent = "„" + text + "“";
  document.getElementById("quote-author").textContent = author ? "– " + author : "";
}

function randomCuratedQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function showRandomQuote() {
  const q = randomCuratedQuote();
  setQuote(q.text, q.author);
}

// --- 3b. Tier des Tages (Pexels-Suche + Bildprüfung durch Claude) -----------
// Ein Foto pro Tag, für alle Besucher:innen gleich. Die Tierart wechselt
// täglich reihum durch BABY_ANIMALS, so kommt jede Art gleich oft dran.
// Pexels liefert Kandidaten, die streng vorgefiltert werden (Auflösung,
// Querformat, Bildbeschreibung). Mit Anthropic-Schlüssel sieht sich Claude
// (claude-sonnet-4-6) die Kandidaten an, wählt das schönste Foto, das wirklich
// ein süßes Tierbaby zeigt, und schreibt das passende Zitat dazu.
// Ergebnis wird in localStorage zwischengespeichert, damit ein erneutes Laden
// am selben Tag KEINE weiteren API-Aufrufe auslöst. Fehlt der Pexels-Schlüssel
// oder schlägt etwas fehl, zeigt die Seite ein Foto aus der festen Liste.
const CACHE_PREFIX = "glo-daily-";
const CACHE_VERSION = 2; // bei Formatänderung hochzählen – alter Cache verfällt
const CANDIDATES_PER_REVIEW = 6;
const MAX_REVIEWS_PER_DAY = 3;
const MIN_PHOTO_WIDTH = 2400; // px – schließt alte, niedrig aufgelöste Fotos aus

// Die Fotobeschreibung muss eines dieser Wörter enthalten (Tierbaby) …
const BABY_WORDS = [
  "baby", "babies", "cub", "pup", "puppy", "puppies", "kitten", "young", "juvenile",
  "little", "newborn", "calf", "calves", "foal", "fawn", "lamb", "piglet", "chick",
  "duckling", "gosling", "cygnet", "owlet", "joey", "hatchling", "fledgling",
  "bunny", "bunnies", "cria",
];
// … und darf keines von diesen enthalten (Menschen, Spielzeug, Grafik, Trauriges).
const EXCLUDE_WORDS = [
  "person", "people", "man", "men", "woman", "women", "girl", "boy", "child", "children",
  "kid", "kids", "toddler", "infant", "human", "shower", "toy", "plush", "stuffed", "teddy", "doll",
  "figurine", "statue", "sculpture", "ornament", "carving", "wooden", "ceramic",
  "plastic", "knitted", "crochet", "illustration", "drawing", "painting", "cartoon",
  "art", "mural", "graffiti", "tattoo", "logo", "poster", "cake", "cookie", "costume",
  "mask", "dead", "meat", "taxidermy", "skull", "cage", "caged", "hunting", "hunter",
  "grayscale", "greyscale", "monochrome",
];

function hasPexelsKey() {
  return !!(window.CONFIG && window.CONFIG.PEXELS_API_KEY);
}

function hasClaudeKey() {
  return !!(window.CONFIG && window.CONFIG.ANTHROPIC_API_KEY);
}

// Fortlaufende Tagesnummer (lokaler Kalendertag) – anders als der Tag im Jahr
// beginnt sie nicht jedes Neujahr von vorn, die Rotation bleibt gleichmäßig.
function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function readDailyCache(dateKey) {
  try {
    const entry = JSON.parse(localStorage.getItem(CACHE_PREFIX + dateKey));
    return entry && entry.v === CACHE_VERSION && entry.imageBase ? entry : null;
  } catch {
    return null;
  }
}

function writeDailyCache(dateKey, entry) {
  try {
    // Ältere Tage aufräumen, damit localStorage nicht vollläuft
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX) && k !== CACHE_PREFIX + dateKey) {
        localStorage.removeItem(k);
      }
    }
    localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(entry));
  } catch {
    // localStorage nicht verfügbar (z.B. Privatmodus) – dann eben ohne Cache
  }
}

// Ganzes Wort (auch Plural auf -s/-es), ohne Groß-/Kleinschreibung
function containsWord(text, words) {
  return words.some((w) => new RegExp("\\b" + w + "(e?s)?\\b", "i").test(text));
}

function isGoodCandidate(photo, animal) {
  if (photo.width < MIN_PHOTO_WIDTH) return false;
  const ratio = photo.width / photo.height;
  if (ratio < 1.2 || ratio > 2) return false; // passt gut in den 4:3-Rahmen
  // Bildbeschreibung + sprechender Teil der Adresse (…/photo/fox-cub-in-grass-123/)
  const slug = (photo.url || "").split("/photo/")[1] || "";
  const text = (photo.alt || "") + " " + slug.replace(/[-/\d]+/g, " ");
  return (
    containsWord(text, animal.words) &&
    containsWord(text, BABY_WORDS) &&
    !containsWord(text, EXCLUDE_WORDS)
  );
}

async function searchBabyPhotos(animal) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(animal.query)}&per_page=80&orientation=landscape`,
    { headers: { Authorization: window.CONFIG.PEXELS_API_KEY } }
  );
  if (!res.ok) throw new Error("Pexels API: " + res.status);
  const data = await res.json();
  return (data.photos || [])
    .filter((p) => isGoodCandidate(p, animal))
    .map((p) => ({
      base: p.src.original,
      alt: p.alt || animal.name,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      pageUrl: p.url,
    }));
}

async function callClaude(content, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": window.CONFIG.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      // Erlaubt den direkten Aufruf aus dem Browser (CORS)
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) throw new Error("Anthropic API: " + res.status);
  const data = await res.json();
  const text = data.content && data.content[0] && data.content[0].text;
  if (!text) throw new Error("Anthropic: leere Antwort");
  return text.trim();
}

function cleanQuote(text) {
  return text.trim().replace(/^[„“”"'‚‘’]+|[„“”"'‚‘’]+$/g, "");
}

// Claude sieht sich die Kandidaten an, wählt das schönste Tierbaby-Foto und
// schreibt gleich das Zitat dazu. Ergebnis: { index, quote } – index -1 heißt,
// keines der Fotos ist gut genug.
async function reviewWithClaude(animal, candidates) {
  const content = [];
  candidates.forEach((c, i) => {
    content.push({ type: "text", text: "Foto " + i + ":" });
    content.push({ type: "image", source: { type: "url", url: pexelsImageUrl(c.base, 800) } });
  });
  content.push({
    type: "text",
    text:
      "Das sind " + candidates.length + " Kandidaten (Foto 0 bis " + (candidates.length - 1) + ") " +
      "für das „Tier des Tages“ auf einer Gute-Laune-Website. Gesucht: " + animal.name + ".\n" +
      "Ein Foto ist nur geeignet, wenn ALLES zutrifft:\n" +
      "- Hauptmotiv ist eindeutig ein Tierbaby bzw. Jungtier (nicht nur ein ausgewachsenes Tier) und es ist richtig süß\n" +
      "- scharf, gut belichtet, schön fotografiert; das Tier ist gut zu sehen und nicht angeschnitten\n" +
      "- keine Menschen im Vordergrund, kein Spielzeug, keine Grafik oder Illustration\n" +
      "- nichts Trauriges oder Beunruhigendes (Käfig, Verletzung, Jagd)\n" +
      "Wähle das schönste geeignete Foto und schreibe dazu einen einzigen kurzen, warmherzigen " +
      "deutschen Spruch (höchstens 15 Wörter), der zu diesem Foto passt.\n" +
      'Antworte NUR mit JSON: {"index": <Nummer des Fotos oder -1, wenn keines geeignet ist>, "quote": "<Spruch>"}',
  });
  const text = await callClaude(content, 200);
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const index =
    Number.isInteger(json.index) && json.index >= 0 && json.index < candidates.length ? json.index : -1;
  return { index, quote: typeof json.quote === "string" ? cleanQuote(json.quote) : "" };
}

// Nur-Text-Zitat, falls die Bildprüfung selbst nicht geklappt hat
async function generateQuote(animalDescription) {
  const text = await callClaude(
    "Schreibe ein einziges kurzes, warmherziges deutsches Zitat oder einen " +
      "aufmunternden Spruch (höchstens 15 Wörter), der zu einem Foto von diesem " +
      "Tier passt: " + animalDescription + ". Antworte NUR mit dem Spruch – " +
      "ohne Anführungszeichen, ohne Einleitung, ohne Erklärung.",
    100
  );
  return cleanQuote(text);
}

// Sucht das Foto des Tages. Innerhalb einer Tierart rückt das Kandidaten-
// Fenster mit jeder Runde durch die Liste weiter, damit dieselbe Art beim
// nächsten Mal ein anderes Foto zeigt. Lehnt Claude alle Kandidaten ab, kommt
// das nächste Fenster bzw. die nächste Tierart dran.
async function findDailyPhoto(day) {
  const count = BABY_ANIMALS.length;
  const round = Math.floor(day / count);
  let reviews = 0;
  for (let offset = 0; offset < 3; offset++) {
    const animal = BABY_ANIMALS[(day + offset) % count];
    const candidates = await searchBabyPhotos(animal);
    const windows = Math.ceil(candidates.length / CANDIDATES_PER_REVIEW);
    for (let w = 0; w < Math.min(windows, 2); w++) {
      const start = ((round + w) % windows) * CANDIDATES_PER_REVIEW;
      const group = candidates.slice(start, start + CANDIDATES_PER_REVIEW);
      // Ohne Claude: bestes vorgefiltertes Foto (Pexels sortiert nach Relevanz)
      if (!hasClaudeKey()) return { photo: group[0], animal, quote: "" };
      if (reviews === MAX_REVIEWS_PER_DAY) throw new Error("Kein geeignetes Foto gefunden");
      reviews++;
      let verdict;
      try {
        verdict = await reviewWithClaude(animal, group);
      } catch {
        // Claude nicht erreichbar → vorgefiltertes Foto, Zitat kommt separat
        return { photo: group[0], animal, quote: "" };
      }
      if (verdict.index >= 0) return { photo: group[verdict.index], animal, quote: verdict.quote };
    }
  }
  throw new Error("Kein geeignetes Foto gefunden");
}

function showImageLoading() {
  const placeholder = document.getElementById("image-placeholder");
  const img = document.getElementById("animal-image");
  img.hidden = true;
  placeholder.hidden = false;
  placeholder.textContent = "🐾";
}

function creditLink(text, href) {
  if (!href) return text;
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = text;
  return a;
}

// "Foto: Name / Pexels" – der Pexels-Link führt zur Seite des Fotos
function showPhotoCredit(photographer, photographerUrl, pageUrl) {
  const el = document.getElementById("photo-credit");
  el.innerHTML = "";
  el.append("Foto: ");
  if (photographer) el.append(creditLink(photographer, photographerUrl), " / ");
  el.append(creditLink("Pexels", pageUrl || "https://www.pexels.com"));
  el.hidden = false;
}

function setHeroNote(msg) {
  const el = document.getElementById("hero-note");
  if (!msg) {
    el.hidden = true;
    return;
  }
  el.textContent = msg;
  el.hidden = false;
}

function renderDaily(entry) {
  setQuote(entry.quote, "");
  showPhotoCredit(entry.photographer, entry.photographerUrl, entry.pageUrl);
  setHeroNote("");
  // Foto nicht (mehr) abrufbar → eines aus der festen Liste, Zitat bleibt
  showPhoto(entry.imageBase, entry.alt || "Tier des Tages").catch(loadCuratedPhoto);
}

// Sanfter Rückfall auf die feste Fotoliste + kuratierte Zitate
function fallbackToCuratedAnimal(note) {
  document.getElementById("hero-heading").textContent = "🐾 Dein Tiermoment";
  showRandomQuote();
  loadCuratedPhoto();
  setHeroNote(note || "");
}

async function initDailyAnimal() {
  const dateKey = todayKey();
  const cached = readDailyCache(dateKey);
  if (cached) {
    renderDaily(cached);
    return;
  }

  if (!hasPexelsKey()) {
    // Kein Pexels-Schlüssel hinterlegt → feste Fotoliste + kuratierte Zitate (still)
    fallbackToCuratedAnimal();
    return;
  }

  showImageLoading();
  showQuoteLoading("Dein Tier des Tages wird geladen …");
  try {
    const { photo, animal, quote: reviewedQuote } = await findDailyPhoto(dayNumber(new Date()));

    let quote = reviewedQuote;
    if (!quote && hasClaudeKey()) {
      try {
        quote = await generateQuote(animal.name + " – " + photo.alt);
      } catch {
        // Claude nicht erreichbar → kuratiertes Zitat
      }
    }
    if (!quote) quote = randomCuratedQuote().text;

    const entry = {
      v: CACHE_VERSION,
      date: dateKey,
      imageBase: photo.base,
      alt: photo.alt,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      pageUrl: photo.pageUrl,
      quote,
    };
    writeDailyCache(dateKey, entry);
    renderDaily(entry);
  } catch {
    // Pexels nicht erreichbar oder nichts Passendes → freundlicher Rückfall
    fallbackToCuratedAnimal("🌼 Das Tier des Tages ruht gerade – hier ein Gruß aus unserem Vorrat.");
  }
}

function showQuoteLoading(msg) {
  document.getElementById("quote-text").textContent = msg;
  document.getElementById("quote-author").textContent = "";
}

// --- 4. Gute Nachrichten ---------------------------------------------------
// Jeden Tag ein anderes Nachrichten-Set. Der Wechsel richtet sich nach dem
// Kalendertag in deutscher Zeit (Europe/Berlin), unabhängig von der Zeitzone
// der Besucher:innen – so sind die News für alle am selben Tag identisch und
// wechseln um Mitternacht deutscher Zeit.
function berlinDateParts() {
  // en-CA liefert das Datum als "YYYY-MM-DD"
  const str = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = str.split("-").map(Number);
  return { y, m, d };
}

// Fortlaufende Tagesnummer (Berliner Kalendertag) für die Set-Auswahl
function berlinDayNumber() {
  const { y, m, d } = berlinDateParts();
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function todaysNewsSet() {
  const index = ((berlinDayNumber() % NEWS_SETS.length) + NEWS_SETS.length) % NEWS_SETS.length;
  return NEWS_SETS[index];
}

function renderNews() {
  const list = document.getElementById("news-list");
  list.innerHTML = "";
  for (const item of todaysNewsSet()) {
    const li = document.createElement("li");
    li.className = "news-item";

    const region = document.createElement("span");
    region.className = "news-region";
    region.textContent = item.emoji + " " + item.region;

    const headline = document.createElement("h3");
    headline.className = "news-headline";
    headline.textContent = item.headline;

    const text = document.createElement("p");
    text.className = "news-text";
    text.textContent = item.text;

    li.append(region, headline, text);

    if (item.source) {
      const source = document.createElement("p");
      source.className = "news-source";
      source.append("Quelle: ");
      if (item.sourceUrl) {
        const link = document.createElement("a");
        link.href = item.sourceUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = item.source;
        source.appendChild(link);
      } else {
        source.append(item.source);
      }
      li.appendChild(source);
    }

    list.appendChild(li);
  }
}

// Sorgt dafür, dass die News auch bei geöffneter Seite pünktlich wechseln:
// plant das nächste Neu-Rendern auf 00:01 deutscher Zeit und wiederholt sich.
function scheduleNewsRefresh() {
  const [h, m, s] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hourCycle: "h23", // 00–23, vermeidet die "24:00"-Eigenart mancher Browser
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .format(new Date())
    .split(":")
    .map(Number);

  const secondsIntoDay = h * 3600 + m * 60 + s;
  // Sekunden bis zum nächsten 00:01 Uhr (Berlin); +1 s Puffer für den Datumswechsel
  let wait = (86400 - secondsIntoDay + 60) % 86400;
  if (wait <= 0) wait += 86400;

  setTimeout(() => {
    renderNews();
    scheduleNewsRefresh();
  }, (wait + 1) * 1000);
}

// --- 5. Atem-Kreis (3-4-5-Rhythmus) ----------------------------------------
const BREATHE_PHASES = [
  { label: "Einatmen", seconds: 3, className: "inhale" },
  { label: "Halten", seconds: 4, className: "hold" },
  { label: "Ausatmen", seconds: 5, className: "exhale" },
];

const breatheState = { running: false, timeoutId: null, intervalId: null };

function stopBreathing() {
  breatheState.running = false;
  clearTimeout(breatheState.timeoutId);
  clearInterval(breatheState.intervalId);

  const circle = document.getElementById("breathe-circle");
  circle.classList.remove("inhale", "hold", "exhale");
  document.getElementById("breathe-label").textContent = "Bereit?";
  document.getElementById("breathe-timer").innerHTML = "&nbsp;";
  document.getElementById("breathe-button").textContent = "Übung starten";
}

function runPhase(index) {
  if (!breatheState.running) return;

  const phase = BREATHE_PHASES[index % BREATHE_PHASES.length];
  const circle = document.getElementById("breathe-circle");
  const label = document.getElementById("breathe-label");
  const timer = document.getElementById("breathe-timer");

  circle.classList.remove("inhale", "hold", "exhale");
  // Reflow erzwingen, damit die CSS-Transition bei gleicher Klasse neu startet
  void circle.offsetWidth;
  circle.classList.add(phase.className);
  circle.style.transitionDuration = phase.seconds + "s";
  label.textContent = phase.label;

  let remaining = phase.seconds;
  timer.textContent = remaining + " s";
  clearInterval(breatheState.intervalId);
  breatheState.intervalId = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) timer.textContent = remaining + " s";
  }, 1000);

  breatheState.timeoutId = setTimeout(() => runPhase(index + 1), phase.seconds * 1000);
}

function toggleBreathing() {
  if (breatheState.running) {
    stopBreathing();
    return;
  }
  breatheState.running = true;
  document.getElementById("breathe-button").textContent = "Übung beenden";
  runPhase(0);
}

// --- 6. Komplimente-Generator ----------------------------------------------
let lastComplimentIndex = -1;

function showCompliment() {
  let index;
  do {
    index = Math.floor(Math.random() * COMPLIMENTS.length);
  } while (index === lastComplimentIndex && COMPLIMENTS.length > 1);
  lastComplimentIndex = index;

  const el = document.getElementById("compliment-text");
  el.classList.remove("compliment-pop");
  void el.offsetWidth; // Reflow, damit die Animation erneut abspielt
  el.textContent = COMPLIMENTS[index];
  el.classList.add("compliment-pop");
}

// --- 7. Luftpolsterfolie ------------------------------------------------------
// Die Blasen füllen die gesamte verfügbare Fläche der Karte. Anzahl der
// Spalten/Zeilen wird aus der Größe berechnet – kleinere Blasen, mehr davon.
const BUBBLE_GAP = 8; // px – muss zum gap in .bubble-grid (CSS) passen
const BUBBLE_TARGET = 40; // gewünschter Durchmesser einer Blase in px
let audioContext = null;

function playPopSound() {
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;

    // Kurzer "Plopp": Sinuston mit schnellem Tonhöhen- und Lautstärkeabfall
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320 + Math.random() * 160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Ohne Audio (z.B. blockiert) ploppt es eben lautlos weiter
  }
}

function buildBubbleWrap() {
  const grid = document.getElementById("bubble-grid");
  const status = document.getElementById("bubblewrap-status");
  grid.innerHTML = "";
  status.innerHTML = "&nbsp;";

  // Spalten aus der Breite, Zeilen aus der Höhe ableiten, damit die Fläche
  // möglichst vollständig mit Blasen gefüllt ist.
  const w = grid.clientWidth || 300;
  const h = grid.clientHeight || 260;
  const cols = Math.max(3, Math.floor((w + BUBBLE_GAP) / (BUBBLE_TARGET + BUBBLE_GAP)));
  const cell = (w - BUBBLE_GAP * (cols - 1)) / cols; // tatsächlicher Durchmesser
  const rows = Math.max(2, Math.floor((h + BUBBLE_GAP) / (cell + BUBBLE_GAP)));
  const bubbleCount = cols * rows;

  grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "bubble";
    bubble.setAttribute("aria-label", "Luftpolster zerplatzen");
    bubble.addEventListener("click", () => {
      if (bubble.classList.contains("popped")) return;
      bubble.classList.add("popped");
      bubble.setAttribute("aria-label", "Zerplatzt");
      playPopSound();

      if (grid.querySelectorAll(".bubble.popped").length === grid.children.length) {
        status.textContent = "Alle geploppt! 🎉 Neue Folie kommt …";
        setTimeout(buildBubbleWrap, 1600);
      }
    });
    grid.appendChild(bubble);
  }
}

// --- 8. Dankbarkeits-Fenster --------------------------------------------------
// Text eintippen, "Abschicken" – der Text fliegt als Sternschnuppe davon.
// Nichts wird gespeichert; allein das Aufschreiben tut gut.
// (Reduzierte Bewegung wird per CSS-@media respektiert.)
function launchGratitudeStar(text) {
  const card = document.querySelector(".gratitude");
  const input = document.getElementById("gratitude-input");

  const star = document.createElement("div");
  star.className = "gratitude-star";
  star.textContent = "🌠 " + text;

  // Startposition am Textfeld ausrichten
  const cardRect = card.getBoundingClientRect();
  const inRect = input.getBoundingClientRect();
  star.style.left = inRect.left - cardRect.left + "px";
  star.style.top = inRect.top - cardRect.top + "px";
  star.style.maxWidth = inRect.width + "px";

  card.appendChild(star);
  // Im nächsten Frame die Flug-Animation starten
  requestAnimationFrame(() => star.classList.add("fly"));
  star.addEventListener("animationend", () => star.remove());
  // Sicherheitsnetz, falls animationend ausbleibt
  setTimeout(() => star.remove(), 3000);
}

function initGratitude() {
  const form = document.getElementById("gratitude-form");
  const input = document.getElementById("gratitude-input");
  const note = document.getElementById("gratitude-note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      note.textContent = "Tipp erst etwas Schönes ein 💛";
      input.focus();
      return;
    }
    launchGratitudeStar(text);
    input.value = "";
    note.textContent = "Losgeflogen! ✨ Trag ruhig noch etwas ein.";
    input.focus();
  });
}

// --- Start -----------------------------------------------------------------
setGreeting();
renderNews();
scheduleNewsRefresh(); // News um 00:01 deutscher Zeit automatisch wechseln
initDailyAnimal();
buildBubbleWrap();
initGratitude();
// Bei jeder Größenänderung (Fenster, Layoutwechsel, nachgeladenes Tierfoto)
// die Folie passend zur neuen Fläche neu füllen. Der Dimensions-Vergleich
// verhindert eine Endlosschleife durch das Neuaufbauen selbst.
const bubbleGridEl = document.getElementById("bubble-grid");
let lastBubbleDims = "";
new ResizeObserver(() => {
  const dims = bubbleGridEl.clientWidth + "x" + bubbleGridEl.clientHeight;
  if (dims !== lastBubbleDims) {
    lastBubbleDims = dims;
    buildBubbleWrap();
  }
}).observe(bubbleGridEl);
document.getElementById("breathe-button").addEventListener("click", toggleBreathing);
document.getElementById("compliment-button").addEventListener("click", showCompliment);
