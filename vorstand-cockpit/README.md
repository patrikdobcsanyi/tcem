# TCEM Vorstand Cockpit

Static prototype for an internal Vorstand dashboard.

Open `index.html` directly or run a local server from the repository root:

```bash
python3 -m http.server 8001
```

Then visit:

```text
http://127.0.0.1:8001/vorstand-cockpit/
```

The prototype is currently data-driven through `js/data.js`. Later this can be connected to Cloudflare Access plus a Cloudflare Worker that saves changes back to GitHub.
