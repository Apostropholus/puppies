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

// --- Komplimente ------------------------------------------------------------
// Wird beim Klick auf "Ich brauche ein Kompliment" zufällig ausgewählt.
const COMPLIMENTS = [
  "Du bist wertvoll – genau so, wie du bist.",
  "Schön, dass es dich gibt!",
  "Dein Lächeln steht dir ausgezeichnet.",
  "Du machst die Welt ein Stückchen besser.",
  "Mit dir ist das Leben einfach schöner.",
  "Du hast heute schon mehr geschafft, als du denkst.",
  "Deine Art, Dinge zu sehen, ist etwas Besonderes.",
  "Du darfst stolz auf dich sein.",
  "In deiner Nähe fühlt man sich wohl.",
  "Du bist stärker, als du glaubst.",
  "Dein Herz ist am richtigen Fleck.",
  "Du bringst Menschen zum Lachen – das ist ein Geschenk.",
  "Es ist mutig, wie du deinen Weg gehst.",
  "Du bist eine Bereicherung für jeden Raum, den du betrittst.",
  "Heute ist ein guter Tag – auch, weil du da bist.",
];

// --- Positive Nachrichten -------------------------------------------------
// Format: { region, emoji, headline, text, source, sourceUrl }
// Bitte nur Meldungen aus seriösen Quellen verwenden (z.B. ZEIT, Süddeutsche,
// FAZ, ARD/tagesschau, ZDF, Reuters, dpa). source ist der Name des Mediums,
// sourceUrl der Link zum Originalartikel (kann leer "" bleiben).
// Tipp: Alte News einfach überschreiben, die Reihenfolge bestimmt die Anzeige.
const NEWS = [
  {
    region: "Deutschland",
    emoji: "🇩🇪",
    headline: "Überlebenschancen bei Krebs steigen",
    text: "Die Chancen, eine Krebserkrankung zu überleben, verbessern sich laut Robert Koch-Institut stetig: Die Sterberaten sind in den letzten 25 Jahren deutlich gesunken – bei Männern um rund 31, bei Frauen um rund 21 Prozent.",
    source: "ZDFheute",
    sourceUrl: "https://www.zdfheute.de/wissen/krebs-rki-zahlen-ueberleben-gesundheit-100.html",
  },
  {
    region: "Europa",
    emoji: "🇪🇺",
    headline: "Rekord bei Strom aus Erneuerbaren",
    text: "Fast die Hälfte des Stroms in der EU stammt inzwischen aus erneuerbaren Energien: 2024 lag der Anteil laut einer Ember-Analyse bei rekordhohen 47,5 Prozent – vor allem dank des starken Solar-Ausbaus.",
    source: "ZDFheute",
    sourceUrl: "https://www.zdfheute.de/wirtschaft/eu-erneuerbare-energie-stromanteil-100.html",
  },
  {
    region: "Welt",
    emoji: "🌍",
    headline: "Die Ozonschicht erholt sich",
    text: "Das Ozonloch über der Antarktis war 2024 so klein wie seit Jahren nicht und lag unter dem langjährigen Durchschnitt – ein Erfolg des weltweiten Verzichts auf ozonschädliche Stoffe wie FCKW.",
    source: "ZDFheute",
    sourceUrl: "https://www.zdfheute.de/wissen/klima-ozon-loch-kleiner-erholung-100.html",
  },
];
