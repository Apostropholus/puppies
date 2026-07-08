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

// --- 2. Zufälliges Babytier-Bild ------------------------------------------
// Kostenlose, schlüssellose Bild-APIs. Bei jedem Seitenaufruf wird zufällig
// eine Quelle gewählt; schlägt sie fehl, probieren wir die nächste.
const IMAGE_SOURCES = [
  {
    name: "Hund (dog.ceo)",
    async getUrl() {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      return data.message;
    },
  },
  {
    name: "Fuchs (randomfox.ca)",
    async getUrl() {
      const res = await fetch("https://randomfox.ca/floof/");
      const data = await res.json();
      return data.image;
    },
  },
  {
    name: "Katze (cataas.com)",
    async getUrl() {
      const res = await fetch("https://cataas.com/cat?json=true");
      const data = await res.json();
      return data.url;
    },
  },
];

async function loadAnimalImage() {
  const img = document.getElementById("animal-image");
  const placeholder = document.getElementById("image-placeholder");

  // Quellen in zufälliger Reihenfolge durchprobieren
  const sources = [...IMAGE_SOURCES].sort(() => Math.random() - 0.5);

  for (const source of sources) {
    try {
      const url = await source.getUrl();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      img.hidden = false;
      placeholder.hidden = true;
      return;
    } catch {
      // nächste Quelle probieren
    }
  }
  // Alle Quellen fehlgeschlagen: freundlicher Emoji-Platzhalter bleibt stehen
  placeholder.textContent = "🐶💤";
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

// --- 3b. Tier des Tages (Pexels-Foto + KI-Zitat) ---------------------------
// Ein Foto pro Tag, für alle Besucher:innen gleich (Tag-im-Jahr als Seed).
// Foto von Pexels, passendes Zitat von Claude (claude-sonnet-4-6).
// Ergebnis wird in localStorage zwischengespeichert, damit ein erneutes Laden
// am selben Tag KEINE weiteren API-Aufrufe auslöst. Fehlen die Schlüssel oder
// schlägt eine API fehl, fällt die Seite sanft auf die freien Bild-APIs und
// die kuratierten Zitate zurück.
const CACHE_PREFIX = "glo-daily-";
let currentAnimalAlt = null;

function hasConfig() {
  return !!(window.CONFIG && window.CONFIG.PEXELS_API_KEY && window.CONFIG.ANTHROPIC_API_KEY);
}

function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - start) / 86400000);
}

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function readDailyCache(dateKey) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + dateKey);
    return raw ? JSON.parse(raw) : null;
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

async function fetchDailyPhoto(term, doy) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=15&orientation=landscape`,
    { headers: { Authorization: window.CONFIG.PEXELS_API_KEY } }
  );
  if (!res.ok) throw new Error("Pexels API: " + res.status);
  const data = await res.json();
  if (!data.photos || !data.photos.length) throw new Error("Pexels: keine Fotos gefunden");
  // Deterministischer Index → alle Besucher:innen sehen dasselbe Foto pro Tag
  const photo = data.photos[doy % data.photos.length];
  return {
    imageUrl: photo.src.large,
    alt: photo.alt || term,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
  };
}

async function generateQuote(animalDescription) {
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
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content:
            "Schreibe ein einziges kurzes, warmherziges deutsches Zitat oder einen " +
            "aufmunternden Spruch (höchstens 15 Wörter), der zu einem Foto von diesem " +
            "Tier passt: " + animalDescription + ". Antworte NUR mit dem Spruch – " +
            "ohne Anführungszeichen, ohne Einleitung, ohne Erklärung.",
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("Anthropic API: " + res.status);
  const data = await res.json();
  const text = data.content && data.content[0] && data.content[0].text;
  if (!text) throw new Error("Anthropic: leere Antwort");
  return text.trim().replace(/^[„"']+|[""'']+$/g, "");
}

function showImageLoading() {
  const placeholder = document.getElementById("image-placeholder");
  const img = document.getElementById("animal-image");
  img.hidden = true;
  placeholder.hidden = false;
  placeholder.textContent = "🐾";
}

function showPhotoCredit(name, url) {
  const el = document.getElementById("photo-credit");
  if (!name) {
    el.hidden = true;
    return;
  }
  el.innerHTML = "";
  el.append("Foto: ");
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = name;
    el.appendChild(a);
  } else {
    el.append(name);
  }
  el.append(" / Pexels");
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
  const img = document.getElementById("animal-image");
  const placeholder = document.getElementById("image-placeholder");
  img.onload = () => {
    img.hidden = false;
    placeholder.hidden = true;
  };
  img.onerror = () => {
    img.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = "🐾";
  };
  img.alt = entry.alt || "Tier des Tages";
  img.src = entry.imageUrl;
  currentAnimalAlt = entry.alt || null;
  setQuote(entry.quote, "");
  showPhotoCredit(entry.photographer, entry.photographerUrl);
  setHeroNote("");
}

// Sanfter Rückfall auf die freien Bild-APIs + kuratierte Zitate
function fallbackToFreeAnimal(note) {
  document.getElementById("hero-heading").textContent = "🐾 Dein Tiermoment";
  document.getElementById("photo-credit").hidden = true;
  currentAnimalAlt = null;
  showRandomQuote();
  loadAnimalImage();
  setHeroNote(note || "");
}

async function initDailyAnimal() {
  const dateKey = todayKey();
  const cached = readDailyCache(dateKey);
  if (cached && cached.imageUrl) {
    renderDaily(cached);
    return;
  }

  if (!hasConfig()) {
    // Keine Schlüssel hinterlegt → freie APIs + kuratierte Zitate (still)
    fallbackToFreeAnimal();
    return;
  }

  showImageLoading();
  showQuoteLoading("Dein Tier des Tages wird geladen …");
  try {
    const doy = dayOfYear(new Date());
    const term = SEARCH_TERMS[doy % SEARCH_TERMS.length];
    const photo = await fetchDailyPhoto(term, doy);

    let quote;
    try {
      quote = await generateQuote(photo.alt);
    } catch {
      // Claude nicht erreichbar → kuratiertes Zitat als Ersatz
      quote = randomCuratedQuote().text;
    }

    const entry = {
      date: dateKey,
      imageUrl: photo.imageUrl,
      alt: photo.alt,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      quote,
    };
    writeDailyCache(dateKey, entry);
    renderDaily(entry);
  } catch {
    // Pexels nicht erreichbar → freundlicher Rückfall
    fallbackToFreeAnimal("🌼 Das Tier des Tages ruht gerade – hier ein Gruß aus unserem Vorrat.");
  }
}

function showQuoteLoading(msg) {
  document.getElementById("quote-text").textContent = msg;
  document.getElementById("quote-author").textContent = "";
}

// --- 4. Gute Nachrichten ---------------------------------------------------
function renderNews() {
  const list = document.getElementById("news-list");
  list.innerHTML = "";
  for (const item of NEWS) {
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
