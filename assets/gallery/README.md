Drop gallery images into folders named after the filter categories:

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

The script updates `js/gallery-data.js`, and the gallery page renders those images automatically.
