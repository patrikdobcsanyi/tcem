(() => {
  const headerMount = document.querySelector('[data-include="site-header"]');
  const footerMount = document.querySelector('[data-include="site-footer"]');
  const path = window.location.pathname;
  const isHome = path.endsWith("/") || path.endsWith("index.html");

  const sectionHref = (hash) => (isHome ? hash : `index.html${hash}`);
  const activeAttr = (name) => headerMount?.dataset.active === name ? ' aria-current="page"' : "";

  if (headerMount) {
    headerMount.outerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="TC Eschen-Mauren Startseite">
          <img class="brand-logo" src="assets/logos/logo.png" alt="" aria-hidden="true" />
          <span>
            <strong>TC Eschen-Mauren</strong>
            <small>Tennis &amp; Padel in Schaanwald</small>
          </span>
        </a>

        <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
          <a href="index.html"${activeAttr("home")}>Home</a>
          <a href="${sectionHref("#training")}">Training</a>
          <a href="verein.html"${activeAttr("verein")}>Verein</a>
          <a href="padel.html"${activeAttr("padel")}>Padel</a>
          <a href="spielbetrieb.html?matchday=preview"${activeAttr("spielbetrieb")}>Spielbetrieb</a>
          <a href="sportstueble.html"${activeAttr("sportstueble")}>Sportstüble</a>
          <a href="gallery.html"${activeAttr("galerie")}>Galerie</a>
          <div class="nav-dropdown">
            <button class="nav-cta nav-dropdown-toggle" type="button" aria-expanded="false">
              Platz buchen
            </button>
            <div class="nav-dropdown-menu">
              <a href="https://apps.gotcourts.com/de/profile/club/tc-eschen-mauren">Aussenplätze</a>
              <a href="https://tc-eschen-mauren.ebusy.de/court-module/2404">Hallenplätze</a>
              <a href="https://tc-eschen-mauren.ebusy.de/court-module/3085">Padel</a>
            </div>
          </div>
        </nav>
      </header>
    `;
  }

  if (footerMount) {
    footerMount.outerHTML = `
      <footer class="site-footer" id="kontakt">
        <div>
          <strong>TC Eschen-Mauren</strong>
          <p>Sportfeldstrasse 23<br />9486 Schaanwald<br />Liechtenstein</p>
        </div>
        <div>
          <strong>Kontakt</strong>
          <p>Verein: <a href="mailto:office@tceschen-mauren.li">office@tceschen-mauren.li</a><br />Halle: <a href="mailto:verwaltung@tceschen-mauren.li">verwaltung@tceschen-mauren.li</a></p>
        </div>
        <div>
          <strong>Rechtliches</strong>
          <p><a href="impressum.html">Impressum</a><br /><a href="datenschutzerklaerung.html">Datenschutzerklärung</a></p>
        </div>
        <div>
          <strong>Intern</strong>
          <p><a href="statuten.html">Statuten</a><br /><a href="gv-protokolle.html">GV-Protokolle</a><br /><a href="jahresberichte.html">Jahresberichte</a></p>
        </div>
      </footer>
    `;
  }
})();
