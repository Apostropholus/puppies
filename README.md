# 🌴 Gute-Laune-Oase

Eine kleine One-Page-Website, die für ein paar Sekunden gute Laune verbreitet:
ein „Tier des Tages" (Foto + passendes Zitat), gute Nachrichten, eine
Atemübung im 3-4-5-Rhythmus zum Runterkommen, ein Komplimente-Generator,
virtuelle Luftpolsterfolie zum Ploppen (mit Sound, komplett im Browser erzeugt)
und ein Dankbarkeits-Fenster, dessen Text als Sternschnuppe davonfliegt
(nichts wird gespeichert).

**Technik:** Reines HTML/CSS/JS – kein Backend, kein Login, kein Tracking,
keine Speicherung von Nutzerdaten (außer dem Tier-des-Tages-Cache und der
zuletzt gezeigten Tierart im `localStorage` des eigenen Browsers).

## Tier des Tages (optional, mit API-Schlüsseln)

Das Hero-Bild zeigt pro Tag **ein** Tierbaby-Foto von [Pexels](https://www.pexels.com/api/)
und dazu ein **von Claude** (`claude-sonnet-4-6`) frisch geschriebenes Zitat.
Das Foto ist an einem Tag für alle Besucher:innen gleich und wechselt um
Mitternacht. Ergebnis wird im `localStorage` zwischengespeichert, damit ein
erneutes Laden am selben Tag keine weiteren API-Aufrufe kostet.

**So kommt ein gutes Foto zustande:**

1. **Ausgewogen:** Die Tierart wechselt täglich reihum durch die Liste
   `BABY_ANIMALS` (47 Arten: Haustiere, Hoftiere, Wald, Savanne, Polar, Meer,
   Vögel, …). Jede Art kommt gleich oft dran, egal wie viele Fotos es gibt.
2. **Vorfilter:** Pexels liefert bis zu 80 Treffer. Durch kommen nur Fotos in
   hoher Auflösung (mind. 2400 px breit), im Querformat, deren Beschreibung
   die Tierart **und** ein Baby-Wort (baby, cub, kitten, foal, …) enthält und
   keine Menschen, Spielzeug, Grafiken, Schwarzweiß oder Trauriges.
3. **Bildprüfung durch Claude:** Claude sieht sich bis zu 6 Kandidaten an und
   wählt das schönste Foto, das wirklich ein süßes Tierbaby zeigt (scharf, gut
   belichtet, Tier gut zu sehen). Taugt keines, kommen weitere Kandidaten bzw.
   die nächste Tierart dran (höchstens 3 Prüfungen pro Tag).
4. **Scharf auf jedem Bildschirm:** Das Foto wird in passender Größe geladen
   (640–1920 px, `srcset`) statt wie früher fest mit 940 px.

**Einrichten:**

1. `config.template.js` kopieren und in **`config.js`** umbenennen.
2. Deine Schlüssel eintragen (Pexels: kostenlos; Anthropic:
   [console.anthropic.com](https://console.anthropic.com/)).
3. Seite neu laden.

Der Pexels-Schlüssel reicht schon für das Tier des Tages (dann ohne
Bildprüfung und mit kuratiertem Zitat); mit Anthropic-Schlüssel kommt die
Bildprüfung durch Claude dazu. Kosten: ein Pexels-Aufruf und ein Claude-Aufruf
pro Tag (in seltenen Fällen bis zu drei).

**Ohne `config.js` funktioniert die Seite ganz normal weiter** – sie zeigt
dann bei jedem Aufruf ein zufälliges Foto aus der festen Fotoliste (siehe
unten) und ein kuratiertes Zitat. Auch wenn Pexels mal nicht antwortet oder
kein passendes Foto findet, greift dieser freundliche Rückfall.

### ⚠️ Sicherheit & Deployment (bitte lesen!)

Diese Seite ist **reine Statik**. Jeder API-Schlüssel, der im Browser
verwendet wird, ist damit grundsätzlich für Besucher:innen sichtbar. Das hat
zwei praktische Folgen:

- **`config.js` steht in `.gitignore`** und wird nicht eingecheckt. Auf einem
  öffentlichen Hosting wie **GitHub Pages** liegt sie deshalb **nicht** vor –
  dort läuft die Seite im kostenlosen Fallback-Modus (feste Fotoliste +
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
`?v=…`-Parameter an den Einbindungen (`style.css?v=11`, `config.js?v=11`,
`data.js?v=11`, `app.js?v=11`) um eins hochzählen. Das zwingt Browser, die
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

Die Nachrichten wechseln **täglich automatisch**: `js/data.js` enthält die Liste
`NEWS_SETS` – eine Sammlung von Tages-Sets (je 3 Meldungen). Die Seite zeigt
jeden Tag ein anderes Set und wechselt **um Mitternacht deutscher Zeit**
(Europe/Berlin) zum nächsten; nach dem letzten Set beginnt die Rotation von
vorn. Bleibt die Seite über Mitternacht geöffnet, aktualisiert sie sich um
kurz nach 00:00 selbst.

Ein neues Tages-Set ergänzt du als weiteren `[ … ]`-Block. Jede Meldung darin:

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

Je mehr Sets, desto länger dauert es bis zur Wiederholung. Bitte nur Meldungen
aus seriösen Quellen übernehmen (z.B. ZEIT, Süddeutsche, FAZ, ARD/tagesschau,
ZDF, Reuters, dpa) und das Medium in `source` angeben.

> **Hinweis:** Die Seite ist reine Statik und ruft keine Nachrichten live ab –
> sie rotiert eine gepflegte Sammlung „guter Nachrichten". Für echte
> tagesaktuelle Schlagzeilen bräuchte es eine Nachrichten-API bzw. ein
> Backend, das die `NEWS_SETS` regelmäßig neu befüllt (z.B. per GitHub Action).

### Tierarten & feste Fotoliste ändern

Alle Tierarten stehen in **`js/data.js`** in der Liste `BABY_ANIMALS`, eine
Art pro Zeile:

```js
{ name: "Fuchswelpe", query: "fox cub", words: ["fox"], photos: [10673284, 20407336] },
```

- `name` – deutscher Anzeigename (geht auch an Claude)
- `query` – Pexels-Suchbegriff (englisch funktioniert am besten)
- `words` – mindestens eines dieser Wörter muss in der Fotobeschreibung stehen
- `photos` – Pexels-Foto-IDs für den Betrieb **ohne** Schlüssel: die Zahl am
  Ende der Pexels-Adresse (`pexels.com/photo/…-10673284/`). Darf leer bleiben.

Die Reihenfolge ist bunt gemischt, damit nicht zwei ähnliche Tiere
hintereinander kommen. Ohne Schlüssel wird zuerst zufällig eine Art gewählt
(nie zweimal dieselbe hintereinander) und dann eines ihrer Fotos – so ist
jede Art gleich oft zu sehen. Lädt ein Foto nicht (z.B. bei Pexels
gelöscht), springt automatisch eine andere Art ein. Gefällt dir ein Foto
nicht, lösche einfach seine ID; ein schönes Foto auf pexels.com fügst du über
seine ID hinzu.

### Farben & Design anpassen

Die Farbpalette steht ganz oben in **`css/style.css`** als CSS-Variablen
(`:root { --bg: …; --accent: …; }`) – dort eine Farbe ändern wirkt sich auf
die ganze Seite aus.

## Projektstruktur

```
index.html          – Aufbau der Seite
css/style.css       – Design (Farben, Layout, Animationen)
js/data.js          – ✏️ Zitate, News, Komplimente & Tierarten/Fotoliste
js/app.js           – Logik (Tier des Tages, Atemübung, Folie, …)
config.template.js  – Vorlage für die API-Schlüssel
config.js           – deine echten Schlüssel (NICHT eingecheckt, in .gitignore)
scripts/            – separates Experiment (täglicher Supabase/Unsplash-Job),
                      gehört nicht zur Website
```
