# Admin Production Setup

The website stays static. Cloudflare adds login and the Worker saves edited data files to GitHub.

## Architecture

```text
/admin.html
  Cloudflare Access protects who can open it

/api/admin/save
  Worker admin password or Cloudflare Access protects who can call it
  Cloudflare Worker validates the request
  Cloudflare Worker commits js/*-data.js to GitHub

/api/admin/verify
  Worker validates the admin password before the editor opens

/api/admin/upload
  Worker admin password or Cloudflare Access protects who can call it
  Cloudflare Worker validates the image
  Cloudflare Worker commits allowed assets/* images to GitHub
```

## 1. GitHub Token

Create a fine-grained GitHub personal access token.

Recommended scope:

- Repository: `patrikdobcsanyi/tcem`
- Permission: `Contents: Read and write`

Do not put this token into browser JavaScript or commit it to the repo.

## 2. Cloudflare Access

Create a Zero Trust Access application for:

```text
tceschen-mauren.li/admin.html
tceschen-mauren.li/api/admin/*
```

Allow only Vorstand/admin email addresses.

Cloudflare documents path-based Access applications in their application path docs:
https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/

For Workers, Cloudflare can expose the authenticated identity through `ctx.access`:
https://developers.cloudflare.com/workers/configuration/cloudflare-access/

## 3. Worker

Copy the example config:

```sh
cp wrangler.admin.example.toml wrangler.toml
```

Edit:

```toml
ALLOWED_ADMIN_EMAILS = "person1@example.com,person2@example.com"
```

Set the GitHub token as a secret:

```sh
npx wrangler secret put GITHUB_TOKEN
```

For GitHub Pages, also set a shared admin password. This avoids Cloudflare Access cross-origin fetch redirects:

```sh
npx wrangler secret put ADMIN_PASSWORD
```

Deploy:

```sh
npx wrangler deploy
```

If the admin page runs on GitHub Pages, do not put Cloudflare Access in front of the `workers.dev` API endpoint. The Worker checks `ADMIN_PASSWORD` itself. Cloudflare Access can still be used later when the admin page and API are on the same Cloudflare-controlled domain.

## 4. Editable Files

The Worker only allows these files:

- `js/news-data.js`
- `js/events-data.js`
- `js/sponsors-data.js`
- `js/membership-data.js`
- `js/matches-data.js`
- `js/vorstand-data.js`

It validates that the posted content is a matching `window.<name> = ...;` assignment containing valid JSON.

## 5. Image Uploads

The admin can upload images for:

- News images: `assets/news`
- Sponsor logos: `assets/sponsors`
- Vorstand portraits: `assets/vorstand`

Allowed formats are JPG, PNG, WebP, GIF, and AVIF up to 6 MB. SVG uploads are intentionally blocked; keep SVG logos manual and reviewed.

## 6. Later Improvements

- Move `admin.html` to `/admin/index.html`
- Add draft mode: commit to a branch instead of `main`
- Add a preview deployment before publishing
