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

// --- 3. Zufälliges Zitat ---------------------------------------------------
function showRandomQuote() {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById("quote-text").textContent = "„" + quote.text + "“";
  document.getElementById("quote-author").textContent = quote.author ? "– " + quote.author : "";
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
    list.appendChild(li);
  }
}

// --- 5. Atem-Kreis (4-7-8-Methode) ----------------------------------------
const BREATHE_PHASES = [
  { label: "Einatmen", seconds: 4, className: "inhale" },
  { label: "Halten", seconds: 7, className: "hold" },
  { label: "Ausatmen", seconds: 8, className: "exhale" },
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

// --- Start -----------------------------------------------------------------
setGreeting();
showRandomQuote();
renderNews();
loadAnimalImage();
document.getElementById("breathe-button").addEventListener("click", toggleBreathing);
