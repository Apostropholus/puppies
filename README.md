# 🌴 Gute-Laune-Oase

Eine kleine One-Page-Website, die für ein paar Sekunden gute Laune verbreitet:
ein zufälliges Tierbild, ein positives Zitat, gute Nachrichten und eine
4-7-8-Atemübung zum Runterkommen.

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

### Zitate ändern

In `js/data.js` die Liste `QUOTES` bearbeiten. Jeder Eintrag sieht so aus:

```js
{ text: "Dein neues Zitat.", author: "Name oder leer lassen" },
```

Bei jedem Seitenaufruf wird ein Zitat zufällig ausgewählt. Du kannst beliebig
viele Einträge hinzufügen oder löschen.

### News aktualisieren

In `js/data.js` die Liste `NEWS` bearbeiten. Jeder Eintrag:

```js
{
  region: "Deutschland",        // Anzeige-Label
  emoji: "🇩🇪",                  // kleines Icon vor dem Label
  headline: "Kurze Überschrift",
  text: "Die eigentliche Nachricht in 1-2 Sätzen.",
},
```

Die Reihenfolge in der Liste bestimmt die Reihenfolge auf der Seite.

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
