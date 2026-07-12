Drop gallery images or short videos into folders named after the filter categories:

- `interclub`
- `junioren`
- `events`
- `anlage`
- `padel`
- `sportstueble`

Then run:

```sh
node scripts/generate-gallery.mjs
```

Supported image formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`
Supported video formats: `.mp4`, `.webm`, `.mov`

The script updates `js/gallery-data.js`, and the gallery page renders those media files automatically.
