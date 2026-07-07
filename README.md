# 🌴 Gute-Laune-Oase

Eine kleine One-Page-Website, die für ein paar Sekunden gute Laune verbreitet:
ein zufälliges Tierbild, ein positives Zitat, gute Nachrichten, eine
Atemübung im 3-4-5-Rhythmus zum Runterkommen, ein Komplimente-Generator und virtuelle
Luftpolsterfolie zum Ploppen (mit Sound, komplett im Browser erzeugt).

**Technik:** Reines HTML/CSS/JS – kein Backend, kein Login, kein Tracking,
keine Speicherung von Nutzerdaten.

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
`?v=…`-Parameter an den drei Einbindungen (`style.css?v=2`, `data.js?v=2`,
`app.js?v=2`) um eins hochzählen. Das zwingt Browser, die geänderten Dateien
neu zu laden, statt eine alte Version aus dem Cache zu verwenden.

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

### Tierbilder ändern

Die Bilder kommen von kostenlosen, schlüssellosen APIs. Die Quellen stehen in
**`js/app.js`** in der Liste `IMAGE_SOURCES` (aktuell: Hunde von
[dog.ceo](https://dog.ceo/dog-api/), Füchse von
[randomfox.ca](https://randomfox.ca), Katzen von
[cataas.com](https://cataas.com)). Pro Seitenaufruf wird zufällig eine
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
index.html        – Aufbau der Seite
css/style.css     – Design (Farben, Layout, Animationen)
js/data.js        – ✏️ Zitate & News (hier pflegst du Inhalte)
js/app.js         – Logik (Begrüßung, Bild-Laden, Atemübung)
scripts/          – separates Experiment (täglicher Supabase/Unsplash-Job),
                    gehört nicht zur Website
```
