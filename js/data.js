/* =========================================================================
   Inhalte der Gute-Laune-Oase
   Hier kannst du Zitate und News ganz einfach selbst pflegen –
   einfach Einträge ändern, löschen oder neue hinzufügen und speichern.
   ========================================================================= */

// --- Zitate & Sprüche ----------------------------------------------------
// Format: { text: "…", author: "…" }  (author darf leer "" sein)
const QUOTES = [
  { text: "Jeder Tag ist eine neue Chance, glücklich zu sein.", author: "" },
  { text: "Das Glück ist das einzige, das sich verdoppelt, wenn man es teilt.", author: "Albert Schweitzer" },
  { text: "Wo Worte fehlen, hilft ein Lächeln.", author: "" },
  { text: "Auch aus Steinen, die dir in den Weg gelegt werden, kannst du etwas Schönes bauen.", author: "Erich Kästner" },
  { text: "Freude ist die einfachste Form der Dankbarkeit.", author: "Karl Barth" },
  { text: "Ein Tag ohne Lächeln ist ein verlorener Tag.", author: "Charlie Chaplin" },
  { text: "Kleine Dinge machen oft die größte Freude.", author: "" },
  { text: "Der beste Weg, gute Laune zu bekommen, ist, sie zu verschenken.", author: "" },
  { text: "Glück ist kein Ziel, sondern eine Art zu reisen.", author: "" },
  { text: "Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.", author: "Antoine de Saint-Exupéry" },
  { text: "Jeder Morgen ist ein kleiner Neuanfang.", author: "" },
  { text: "Auch der weiteste Weg beginnt mit einem ersten Schritt.", author: "Laotse" },
  { text: "Lachen ist die Sonne, die den Winter aus dem menschlichen Gesicht vertreibt.", author: "Victor Hugo" },
  { text: "Du bist genau richtig, so wie du bist.", author: "" },
  { text: "Die schönsten Dinge im Leben sind keine Dinge.", author: "" },
  { text: "Hinter jeder Wolke wartet schon die Sonne.", author: "" },
  { text: "Genieße die kleinen Dinge – eines Tages wirst du zurückblicken und merken, dass es die großen waren.", author: "" },
  { text: "Heute ist ein guter Tag, um einen guten Tag zu haben.", author: "" },
];

// --- Positive Nachrichten -------------------------------------------------
// Format: { region: "…", emoji: "…", headline: "…", text: "1-2 Sätze" }
// Tipp: Alte News einfach überschreiben, die Reihenfolge bestimmt die Anzeige.
const NEWS = [
  {
    region: "Deutschland",
    emoji: "🇩🇪",
    headline: "Mehr Grün in den Städten",
    text: "Immer mehr deutsche Städte verwandeln alte Parkplätze in kleine Parks und Gemeinschaftsgärten – allein im letzten Jahr entstanden Hunderte neue grüne Oasen.",
  },
  {
    region: "Europa",
    emoji: "🇪🇺",
    headline: "Rekord bei erneuerbaren Energien",
    text: "In Europa stammt inzwischen fast die Hälfte des Stroms aus erneuerbaren Quellen – so viel wie nie zuvor.",
  },
  {
    region: "Welt",
    emoji: "🌍",
    headline: "Comeback der Meeresschildkröten",
    text: "Dank jahrzehntelanger Schutzprogramme erholen sich die Bestände vieler Meeresschildkröten weltweit deutlich – an manchen Stränden gibt es so viele Nester wie seit Jahrzehnten nicht.",
  },
];
