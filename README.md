# 🌴 Gute-Laune-Oase

Eine kleine One-Page-Website, die für ein paar Sekunden gute Laune verbreitet:
ein „Tier des Tages" (Foto + passendes Zitat), gute Nachrichten, eine
Atemübung im 3-4-5-Rhythmus zum Runterkommen, ein Komplimente-Generator und virtuelle
Luftpolsterfolie zum Ploppen (mit Sound, komplett im Browser erzeugt).

**Technik:** Reines HTML/CSS/JS – kein Backend, kein Login, kein Tracking,
keine Speicherung von Nutzerdaten (außer dem Tier-des-Tages-Cache im
`localStorage` des eigenen Browsers).

## Tier des Tages (optional, mit API-Schlüsseln)

Das Hero-Bild kann pro Tag **ein** Babytier-Foto von [Pexels](https://www.pexels.com/api/)
zeigen und dazu ein **von Claude** (`claude-sonnet-4-6`) frisch geschriebenes
Zitat. Das Foto ist an einem Tag für alle Besucher:innen gleich (der Tag im
Jahr bestimmt Suchbegriff und Auswahl) und wechselt um Mitternacht. Ergebnis
wird im `localStorage` zwischengespeichert, damit ein erneutes Laden am selben
Tag keine weiteren API-Aufrufe kostet.

**Einrichten:**

1. `config.template.js` kopieren und in **`config.js`** umbenennen.
2. Deine Schlüssel eintragen (Pexels: kostenlos; Anthropic:
   [console.anthropic.com](https://console.anthropic.com/)).
3. Seite neu laden.

**Ohne `config.js` funktioniert die Seite ganz normal weiter** – sie fällt
dann automatisch auf die kostenlosen, schlüssellosen Tierbild-APIs und die
kuratierten Zitate zurück (siehe unten). Auch wenn eine der APIs mal nicht
antwortet, greift dieser freundliche Rückfall.

### ⚠️ Sicherheit & Deployment (bitte lesen!)

Diese Seite ist **reine Statik**. Jeder API-Schlüssel, der im Browser
verwendet wird, ist damit grundsätzlich für Besucher:innen sichtbar. Das hat
zwei praktische Folgen:

- **`config.js` steht in `.gitignore`** und wird nicht eingecheckt. Auf einem
  öffentlichen Hosting wie **GitHub Pages** liegt sie deshalb **nicht** vor –
  dort läuft die Seite im kostenlosen Fallback-Modus (freie Bild-APIs +
  kuratierte Zitate). Das ist Absicht: So gelangen deine Schlüssel nicht
  versehentlich an die Öffentlichkeit.
- Würdest du `config.js` doch einchecken, um das Feature online zu schalten,
  wären deine Schlüssel **öffentlich lesbar**. Der Anthropic-Schlüssel kostet
  echtes Geld. Wenn du das trotzdem willst: setze in der Anthropic-Konsole ein
  striktes **Ausgabelimit**, und nutze am besten einen separaten, nur dafür
  gedachten Schlüssel. Für einen wirklich sicheren Live-Betrieb bräuchtest du
  einen kleinen Proxy (z.B. Cloudflare Worker), der den Schlüssel geheim hält –
  das wäre dann aber kein reines Statik-Setup mehr.

Kurz: **lokal** volles Feature mit Schlüsseln, **öffentlich** der sichere
Fallback – oder bewusst mit Ausgabelimit/Proxy arbeiten.

## Seite öffnen

Einfach `index.html` im Browser öffnen (Doppelklick genügt) – ein Webserver
ist nicht nötig. Alternativ lokal serven, z.B.:

```bash
python3 -m http.server
# dann http://localhost:8000 öffnen
```

## Inhalte selbst pflegen

Alle Texte liegen in **`js/data.js`** – einfach die Datei in einem Editor
öffnen, ändern, speichern, fertig.

**Wichtig nach jeder Änderung an CSS/JS:** In `index.html` den
`?v=…`-Parameter an den Einbindungen (`style.css?v=7`, `config.js?v=7`,
`data.js?v=7`, `app.js?v=7`) um eins hochzählen. Das zwingt Browser, die
geänderten Dateien neu zu laden, statt eine alte Version aus dem Cache zu
verwenden.

### Zitate ändern

In `js/data.js` die Liste `QUOTES` bearbeiten. Jeder Eintrag sieht so aus:

```js
{ text: "Dein neues Zitat.", author: "Name oder leer lassen" },
```

Bei jedem Seitenaufruf wird ein Zitat zufällig ausgewählt. Du kannst beliebig
viele Einträge hinzufügen oder löschen.

### Komplimente ändern

In `js/data.js` die Liste `COMPLIMENTS` bearbeiten – ein Eintrag pro Zeile,
einfach als String:

```js
"Dein neues Kompliment.",
```

### News aktualisieren

In `js/data.js` die Liste `NEWS` bearbeiten. Jeder Eintrag:

```js
{
  region: "Deutschland",        // Anzeige-Label
  emoji: "🇩🇪",                  // kleines Icon vor dem Label
  headline: "Kurze Überschrift",
  text: "Die eigentliche Nachricht in 1-2 Sätzen.",
  source: "ZDFheute",           // Name des Mediums (wird als Quellenzeile angezeigt)
  sourceUrl: "https://…",       // Link zum Originalartikel, "" wenn keiner da ist
},
```

Die Reihenfolge in der Liste bestimmt die Reihenfolge auf der Seite.
Bitte nur Meldungen aus seriösen Quellen übernehmen (z.B. ZEIT, Süddeutsche,
FAZ, ARD/tagesschau, ZDF, Reuters, dpa) und das Medium in `source` angeben.

### Tier des Tages: Suchbegriffe ändern

Welche Tiere Pexels sucht, steht in **`js/data.js`** in der Liste
`SEARCH_TERMS`. Die Begriffe werden nach dem Tag im Jahr durchrotiert – einfach
umsortieren, ergänzen oder austauschen (englische Begriffe funktionieren bei
Pexels am besten).

### Tierbilder-Fallback ändern

Ohne API-Schlüssel (oder wenn Pexels ausfällt) kommen die Bilder von
kostenlosen, schlüssellosen APIs. Die Quellen stehen in **`js/app.js`** in der
Liste `IMAGE_SOURCES` (aktuell: Hunde von
[dog.ceo](https://dog.ceo/dog-api/), Füchse von
[randomfox.ca](https://randomfox.ca), Katzen von
[cataas.com](https://cataas.com)). Es wird zufällig eine
Quelle gewählt; fällt sie aus, springt die nächste ein. Eine neue Quelle
ergänzt du als weiteren Eintrag nach demselben Muster:

```js
{
  name: "Meine Quelle",
  async getUrl() {
    const res = await fetch("https://beispiel-api.de/random");
    const data = await res.json();
    return data.url;   // muss eine direkte Bild-URL zurückgeben
  },
},
```

### Farben & Design anpassen

Die Farbpalette steht ganz oben in **`css/style.css`** als CSS-Variablen
(`:root { --bg: …; --accent: …; }`) – dort eine Farbe ändern wirkt sich auf
die ganze Seite aus.

## Projektstruktur

```
index.html          – Aufbau der Seite
css/style.css       – Design (Farben, Layout, Animationen)
js/data.js          – ✏️ Zitate, News, Komplimente & Pexels-Suchbegriffe
js/app.js           – Logik (Tier des Tages, Atemübung, Folie, …)
config.template.js  – Vorlage für die API-Schlüssel
config.js           – deine echten Schlüssel (NICHT eingecheckt, in .gitignore)
scripts/            – separates Experiment (täglicher Supabase/Unsplash-Job),
                      gehört nicht zur Website
```
