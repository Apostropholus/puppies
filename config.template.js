/* =========================================================================
   Vorlage für die API-Schlüssel des "Tier des Tages"-Features.

   SO GEHT'S:
   1. Diese Datei kopieren und in  config.js  umbenennen.
   2. Deine echten Schlüssel eintragen.
   3. config.js NICHT einchecken – sie steht in .gitignore.

   ⚠️  SICHERHEIT – bitte lesen:
   Diese Seite läuft als reine Statik (z.B. GitHub Pages). Ein im Browser
   verwendeter Schlüssel ist grundsätzlich für Besucher:innen sichtbar.
   - Der Anthropic-Schlüssel kostet echtes Geld: Lege in der Anthropic-Konsole
     ein striktes Ausgabelimit fest und teile diesen Schlüssel NICHT öffentlich.
   - Ohne config.js läuft die Seite trotzdem: Sie fällt dann automatisch auf
     die kostenlosen Tierbild-APIs und die kuratierten Zitate zurück.
   Details stehen in der README unter "Sicherheit & Deployment".
   ========================================================================= */

window.CONFIG = {
  // Kostenloser Schlüssel: https://www.pexels.com/api/
  PEXELS_API_KEY: "",

  // https://console.anthropic.com/  – Modell: claude-sonnet-4-6
  ANTHROPIC_API_KEY: "",
};
