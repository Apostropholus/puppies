/* =========================================================================
   Inhalte der Gute-Laune-Oase
   Hier kannst du Zitate und News ganz einfach selbst pflegen –
   einfach Einträge ändern, löschen oder neue hinzufügen und speichern.
   ========================================================================= */

// --- Tierbabys ------------------------------------------------------------
// Jede Tierart ist EIN Eintrag. Die Seite wählt zuerst die Tierart (reihum
// bzw. zufällig) und erst danach ein Foto – so kommen alle Arten gleich oft
// dran, egal wie viele Fotos es von einer Art gibt. Die Reihenfolge ist bunt
// gemischt (Haustier, Wildtier, Vogel, …), damit nicht zwei ähnliche Tiere
// hintereinander kommen.
//
//   name:   Anzeigename (deutsch), geht auch an Claude für Bildprüfung + Zitat
//   query:  Pexels-Suchbegriff (englisch funktioniert am besten)
//   words:  Mindestens eines dieser Wörter muss in der Fotobeschreibung
//           stehen, sonst wird das Foto verworfen (Schutz vor Fehltreffern)
//   photos: Pexels-Foto-IDs für den Betrieb OHNE Schlüssel (die Zahl am Ende
//           der Pexels-Adresse, z.B. pexels.com/photo/…-10673284/). Darf leer
//           bleiben – die Art erscheint dann nur mit Pexels-Schlüssel.
const BABY_ANIMALS = [
  { name: "Kätzchen", query: "kitten", words: ["kitten"], photos: [8523547, 17515917, 5441458] },
  { name: "Fuchswelpe", query: "fox cub", words: ["fox"], photos: [10673284, 20407336] },
  { name: "Elefantenbaby", query: "baby elephant", words: ["elephant"], photos: [750536, 16591291] },
  { name: "Entenküken", query: "duckling", words: ["duckling", "duck"], photos: [16973277, 32885762, 1300353] },
  { name: "Pandababy", query: "baby panda", words: ["panda"], photos: [1661535] },
  { name: "Lamm", query: "lamb", words: ["lamb", "sheep"], photos: [16384899, 28544181, 17564394] },
  { name: "Koalababy", query: "baby koala", words: ["koala"], photos: [] },
  { name: "Robbenbaby", query: "seal pup", words: ["seal"], photos: [10273316, 463925] },
  { name: "Hundewelpe", query: "puppy", words: ["puppy", "puppies"], photos: [18618491, 3726277, 10361804] },
  { name: "Rehkitz", query: "fawn", words: ["fawn", "deer"], photos: [19781448, 17884247, 17997821] },
  { name: "Löwenjunges", query: "lion cub", words: ["lion", "lioness"], photos: [624033, 12778384] },
  { name: "Küken", query: "baby chick", words: ["chick", "chicken", "hen"], photos: [7440694, 29116765] },
  { name: "Tigerjunges", query: "tiger cub", words: ["tiger"], photos: [29070049, 28807791, 2541239] },
  { name: "Ferkel", query: "piglet", words: ["piglet", "pig"], photos: [4767458, 4813937, 20447453] },
  { name: "Känguru-Joey", query: "baby kangaroo joey", words: ["kangaroo", "wallaby", "joey"], photos: [7178637, 15117434, 14991256] },
  { name: "Pinguinküken", query: "baby penguin", words: ["penguin"], photos: [6475330] },
  { name: "Häschen", query: "baby bunny", words: ["bunny", "bunnies", "rabbit"], photos: [16773474, 4123972] },
  { name: "Eulenküken", query: "baby owl", words: ["owl", "owlet"], photos: [] },
  { name: "Giraffenbaby", query: "baby giraffe", words: ["giraffe"], photos: [] },
  { name: "Fohlen", query: "foal", words: ["foal"], photos: [9102270, 7922991, 10254517] },
  { name: "Gepardenjunges", query: "cheetah cub", words: ["cheetah"], photos: [5306211, 31362074, 5306203] },
  { name: "Zicklein", query: "baby goat", words: ["goat"], photos: [7516858, 22863546] },
  { name: "Otterbaby", query: "baby otter", words: ["otter"], photos: [] },
  { name: "Bärenjunges", query: "bear cub", words: ["bear"], photos: [33531974, 19982551] },
  { name: "Kälbchen", query: "baby cow calf", words: ["calf", "calves", "cow", "cattle"], photos: [5205221, 20634965, 8024491] },
  { name: "Zebrafohlen", query: "baby zebra", words: ["zebra"], photos: [19040675] },
  { name: "Igelbaby", query: "baby hedgehog", words: ["hedgehog"], photos: [] },
  { name: "Roter-Panda-Baby", query: "baby red panda", words: ["red panda"], photos: [] },
  { name: "Gänseküken", query: "gosling", words: ["gosling", "goose", "geese"], photos: [12284846] },
  { name: "Faultierbaby", query: "baby sloth", words: ["sloth"], photos: [] },
  { name: "Alpakababy", query: "baby alpaca", words: ["alpaca", "llama"], photos: [7022792] },
  { name: "Eisbärjunges", query: "polar bear cub", words: ["polar bear"], photos: [] },
  { name: "Eichhörnchenbaby", query: "baby squirrel", words: ["squirrel"], photos: [] },
  { name: "Nilpferdbaby", query: "baby hippo", words: ["hippo", "hippopotamus"], photos: [] },
  { name: "Meerschweinchenbaby", query: "baby guinea pig", words: ["guinea pig"], photos: [] },
  { name: "Wolfswelpe", query: "wolf pup", words: ["wolf", "wolves"], photos: [] },
  { name: "Erdmännchenbaby", query: "baby meerkat", words: ["meerkat"], photos: [] },
  { name: "Eselfohlen", query: "baby donkey", words: ["donkey"], photos: [] },
  { name: "Waschbärbaby", query: "baby raccoon", words: ["raccoon"], photos: [] },
  { name: "Gorillababy", query: "baby gorilla", words: ["gorilla"], photos: [] },
  { name: "Schwanenküken", query: "cygnet", words: ["cygnet", "swan"], photos: [] },
  { name: "Orang-Utan-Baby", query: "baby orangutan", words: ["orangutan"], photos: [] },
  { name: "Frischling", query: "wild boar piglet", words: ["boar"], photos: [] },
  { name: "Nashornbaby", query: "baby rhino", words: ["rhino", "rhinoceros"], photos: [] },
  { name: "Schildkrötenbaby", query: "baby sea turtle", words: ["turtle", "tortoise"], photos: [] },
  { name: "Capybarababy", query: "baby capybara", words: ["capybara"], photos: [] },
  { name: "Affenbaby", query: "baby monkey", words: ["monkey", "macaque"], photos: [] },
];

// --- Zitate & Sprüche ----------------------------------------------------
// Format: { text: "…", author: "…" }  (author darf leer "" sein)
// Diese Liste dient auch als Fallback, falls die KI-Zitate nicht verfügbar sind.
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
// Format je Meldung: { region, emoji, headline, text, source, sourceUrl }
// Bitte nur Meldungen aus seriösen Quellen verwenden (z.B. ZEIT, Süddeutsche,
// FAZ, ARD/tagesschau, ZDF, Reuters, dpa). source ist der Name des Mediums,
// sourceUrl der Link zum Originalartikel (kann leer "" bleiben).
//
// NEWS_SETS ist eine Liste von Tages-Sets (je 3 Meldungen). Die App zeigt
// jeden Tag ein anderes Set an und wechselt um Mitternacht deutscher Zeit
// (Europe/Berlin) zum nächsten – nach dem letzten Set beginnt es von vorn.
// Neues Set: einfach einen weiteren [ ... ]-Block ergänzen.
// Hinweis: Die Zusatz-Sets enthalten bewusst zeitlose "gute Entwicklungen",
// damit sie beim Durchrotieren nicht veralten.
const NEWS_SETS = [
  // Set 1
  [
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
  ],
  // Set 2
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Wolf und Luchs kehren zurück",
      text: "In Deutschlands Wäldern breiten sich Wolf und Luchs wieder aus. Nach Jahrzehnten der Abwesenheit wachsen die Bestände dank strengem Schutz stetig – ein Zeichen für gesündere Ökosysteme.",
      source: "NABU",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Saubere Luft in Europas Städten",
      text: "Die Luftqualität in der EU verbessert sich seit Jahren spürbar: Feinstaub- und Stickoxidwerte sinken, wodurch laut Europäischer Umweltagentur jedes Jahr Hunderttausende Menschen gesünder leben.",
      source: "tagesschau",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Kindersterblichkeit weltweit halbiert",
      text: "Die weltweite Kindersterblichkeit ist seit 1990 um mehr als die Hälfte gefallen. Bessere Gesundheitsversorgung und Impfungen retten laut UNICEF jedes Jahr Millionen Kinderleben.",
      source: "UNICEF",
      sourceUrl: "",
    },
  ],
  // Set 3
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Rauchen bei Jugendlichen auf Rekordtief",
      text: "So wenige Jugendliche wie nie zuvor greifen zur Zigarette: Der Anteil rauchender Teenager ist laut Bundeszentrale für gesundheitliche Aufklärung über die Jahre drastisch gesunken.",
      source: "ZEIT",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Europas Flüsse werden wieder frei",
      text: "In ganz Europa werden alte Wehre und Staustufen zurückgebaut. Tausende Flusskilometer sind wieder durchgängig – Wanderfische wie der Lachs erobern ihre Laichgebiete zurück.",
      source: "Reuters",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Guinea-Wurm fast ausgerottet",
      text: "Eine der ältesten Plagen der Menschheit steht vor dem Aus: Die Zahl der Guinea-Wurm-Fälle ist weltweit von Millionen auf nur noch eine Handvoll pro Jahr gefallen.",
      source: "WHO",
      sourceUrl: "",
    },
  ],
  // Set 4
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Erneuerbare decken über die Hälfte des Stroms",
      text: "Inzwischen stammt mehr als die Hälfte des in Deutschland verbrauchten Stroms aus Wind, Sonne und anderen erneuerbaren Quellen – Tendenz weiter steigend.",
      source: "Umweltbundesamt",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Mehr Nachtzüge quer durch Europa",
      text: "Reisen ohne Fliegen wird einfacher: Immer mehr neue Nachtzugverbindungen vernetzen Europas Städte und machen klimafreundliches Reisen bequemer.",
      source: "Süddeutsche Zeitung",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Der Riesenpanda ist zurück",
      text: "Dank jahrzehntelanger Schutzprogramme gilt der Große Panda nicht mehr als „stark gefährdet“. Die Bestände in Chinas Bergwäldern wachsen wieder.",
      source: "IUCN",
      sourceUrl: "",
    },
  ],
  // Set 5
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Lachse kehren in deutsche Flüsse zurück",
      text: "Sauberere Gewässer zeigen Wirkung: In Rhein und Elbe werden wieder Lachse gesichtet, die dort jahrzehntelang verschwunden waren.",
      source: "NABU",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Seeadler erobern Europa zurück",
      text: "Einst fast ausgerottet, brüten Seeadler heute wieder in weiten Teilen Europas. Konsequenter Schutz hat den mächtigen Greifvogel zurückgebracht.",
      source: "Reuters",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Extreme Armut geht langfristig zurück",
      text: "Trotz aller Krisen lebt heute ein deutlich kleinerer Anteil der Menschheit in extremer Armut als noch vor 30 Jahren, so die Weltbank.",
      source: "ZDFheute",
      sourceUrl: "",
    },
  ],
  // Set 6
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Mehr Wald in Deutschland",
      text: "Deutschlands Waldfläche ist über die vergangenen Jahrzehnte gewachsen. Millionen neu gepflanzter Bäume und naturnahe Wälder binden CO₂ und bieten Lebensraum.",
      source: "tagesschau",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Kraniche auf Rekordkurs",
      text: "Immer mehr Kraniche ziehen über Europa. Geschützte Rastplätze lassen die Bestände des „Vogels des Glücks“ wachsen.",
      source: "ZEIT",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Buckelwale haben sich erholt",
      text: "Nach dem Ende des kommerziellen Walfangs haben sich die Bestände der Buckelwale in vielen Meeren eindrucksvoll erholt.",
      source: "Reuters",
      sourceUrl: "",
    },
  ],
  // Set 7
  [
    {
      region: "Deutschland",
      emoji: "🇩🇪",
      headline: "Biber sind zurück an unseren Gewässern",
      text: "Der Biber, in Deutschland einst fast ausgestorben, ist zurück: Seine Dämme schaffen wertvolle Feuchtgebiete, in denen unzählige Arten leben.",
      source: "BUND",
      sourceUrl: "",
    },
    {
      region: "Europa",
      emoji: "🇪🇺",
      headline: "Weniger Plastik an Europas Stränden",
      text: "An vielen europäischen Küsten wird weniger Plastikmüll gefunden. Verbote von Einwegplastik und große Aufräumaktionen zeigen Wirkung.",
      source: "Europäische Umweltagentur",
      sourceUrl: "",
    },
    {
      region: "Welt",
      emoji: "🌍",
      headline: "Polio steht vor der Ausrottung",
      text: "Die Kinderlähmung ist weltweit fast besiegt: Nur noch in wenigen Regionen treten Fälle auf – dank jahrzehntelanger globaler Impfkampagnen.",
      source: "WHO",
      sourceUrl: "",
    },
  ],
];
