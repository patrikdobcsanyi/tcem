## TODO

- Make phones and emails clickable
- Insert Sponsoren images
- Einwilligungserklärung
- Statuten
- GV-Berichte

- Padel site

## Galerie aktualisieren

Bilder in `assets/gallery/<kategorie>/` ablegen, zum Beispiel:

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

Das erzeugt `js/gallery-data.js`; die Galerie lädt die Bilder daraus automatisch.
