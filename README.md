## TODO

- Make phones and emails clickable
- Insert Sponsoren images
- Einwilligungserklärung

- Padel site

## Galerie aktualisieren

Bilder oder kurze Videos in `assets/gallery/<kategorie>/` ablegen, zum Beispiel:

- `assets/gallery/interclub/`
- `assets/gallery/junioren/`
- `assets/gallery/events/`
- `assets/gallery/anlage/`
- `assets/gallery/padel/`
- `assets/gallery/sportstueble/`

Danach aus dem Projektordner ausführen:

```sh
node scripts/generate-gallery.mjs
```

Das erzeugt `js/gallery-data.js`; die Galerie lädt die Medien daraus automatisch.

Unterstützte Bilder: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`  
Unterstützte Videos: `.mp4`, `.webm`, `.mov`

## Vorstand aktualisieren

Vorstandsmitglieder werden in `js/vorstand-data.js` gepflegt.

Beispiel:

```js
{
  name: "Max Muster",
  role: "Präsident",
  email: "praesident@tceschen-mauren.li",
  phone: "+423 785 55 00",
  image: "assets/vorstand/placeholder.png",
}
```

Die Verein-Seite rendert daraus automatisch die Karten und dupliziert sie für die Laufband-Animation.

## News aktualisieren

News-Einträge werden in `js/news-data.js` gepflegt.

Beispiel:

```js
{
  date: "2026-06-11",
  title: "50 Jahre TCEM",
  text: "Kurzer Beschreibungstext für die Startseite.",
  image: "assets/news/50-years.png",
  alt: "50 Jahre TCEM",
}
```

## Vereinskalender aktualisieren

Kalendertermine werden in `js/events-data.js` gepflegt.

Beispiel:

```js
{
  date: "2026-08-22",
  type: "event",
  title: "Sommerfest",
  description: "Clubanlass für Mitglieder, Familien und Freunde des Vereins.",
}
```

Mögliche `type`-Werte: `club`, `match`, `junior`, `event`.

## Sponsoren aktualisieren

Sponsoren werden in `js/sponsors-data.js` gepflegt.

Beispiel:

```js
{
  name: "LLB AG",
  logo: "assets/sponsors/LLB-AG.png",
}
```

Die Startseite rendert daraus automatisch den Sponsor-Rotator.

## Mitgliedschaftspreise aktualisieren

Mitgliedschaftspreise werden in `js/membership-data.js` gepflegt.

Beispiel:

```js
{
  title: "Erwachsene",
  price: "250",
  info: "Regulärer Einzeltarif für Erwachsene.",
}
```

Optionale Felder:

```js
highlighted: true
passive: true
```

## Teams aktualisieren

Spielbetrieb-Teams werden in `js/teams-data.js` gepflegt.

Beispiel:

```js
{
  category: "Interclub",
  title: "Herren 1",
  description: "Aktive Mannschaft",
  details: {
    Liga: "2. Liga",
    Captain: "Captain folgt",
    Kontakt: "spiel@tceschen-mauren.li",
  },
}
```

Die Gruppen `interclub`, `junioren` und `challenge` werden automatisch in die passenden Abschnitte auf `spielbetrieb.html` gerendert.

## Match-Einträge aktualisieren

Spielbetrieb-Matches werden in `js/matches-data.js` gepflegt.

Beispiel:

```js
{
  date: "2026-05-02",
  label: "Interclub",
  title: "Herren 1 vs. TC Vaduz",
  description: "Heimspiel auf der Aussenanlage Schaanwald",
  status: "Geplant",
}
```

Optionale Felder:

```js
labelClass: "junior" // oder "challenge"
statusClass: "away"
```

## Padel-Angebote aktualisieren

Padel-Preise und Angebote werden in `js/padel-data.js` gepflegt.

Beispiel:

```js
{
  title: "Mitglieder Tarif",
  subtitle: "Exklusive Konditionen für unsere Vereinsmitglieder.",
  badge: "Club-Vorteil",
  badgeClass: "badge-member",
  prices: [
    {
      currency: "CHF",
      amount: "20.–",
      suffix: "/ Stunde",
    },
  ],
}
```

Die Gruppen `material`, `single`, `blocks` und `season` werden automatisch in die passenden Abschnitte auf `padel.html` gerendert.

## Statuten PDFs aktualisieren

Die Statuten-Seite verlinkt auf zwei PDF-Dateien im Ordner `assets/documents/`:

- `statuten-tc-eschen-mauren.pdf`
- `statuten-tennishalle-unterland.pdf`

Wenn die Dateien anders heissen sollen, die Links in `statuten.html` entsprechend anpassen.

## GV-Protokolle aktualisieren

Die GV-Protokolle werden in `js/gv-protokolle-data.js` gepflegt.

Auf `gv-protokolle.html` gibt es zusätzlich einen separaten Login-Hinweis mit Link zur alten Fairgate-Website.

Pro Eintrag muss nur `title`, `subtitle` und `link` angepasst werden:

```js
{
  title: "GV-Protokoll 2025",
  subtitle: "49. Protokoll",
  link: "https://alter-link-zum-protokoll.pdf",
}
```
