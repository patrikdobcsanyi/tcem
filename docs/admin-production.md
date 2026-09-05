# Admin Production Setup

The website stays static. Cloudflare adds login and the Worker saves edited data files to GitHub.

## Architecture

```text
/admin.html
  Cloudflare Access protects who can open it

/api/admin/save
  Cloudflare Access protects who can call it
  Cloudflare Worker validates the request
  Cloudflare Worker commits js/*-data.js to GitHub
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

Deploy:

```sh
npx wrangler deploy
```

## 4. Editable Files

The Worker only allows these files:

- `js/news-data.js`
- `js/events-data.js`
- `js/sponsors-data.js`
- `js/membership-data.js`
- `js/matches-data.js`
- `js/vorstand-data.js`

It validates that the posted content is a matching `window.<name> = ...;` assignment containing valid JSON.

## 5. Later Improvements

- Move `admin.html` to `/admin/index.html`
- Add image upload through the Worker
- Add draft mode: commit to a branch instead of `main`
- Add a preview deployment before publishing
