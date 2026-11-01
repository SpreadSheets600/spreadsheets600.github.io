<div align="center">
  <img src="docs/banner.png" alt="SpreadSheets600" width="100%" />
</div>

## spreadsheets600.github.io

My personal site. Projects, skills, and a live connect page that pulls in what I'm up to right now.

## What it shows

- **GitHub & WakaTime:** contributions, top languages and coding time
- **Steam:** recent and most played games, achievements and badges
- **Spotify:** the track currently playing
- **AniList:** anime stats and favourites
- **Discord:** live presence and profile badges

All live data comes from a small API ([`spreadSheets600.api.io`](https://github.com/SpreadSheets600/spreadSheets600.api.io)) and is fetched in the browser, so the pages themselves stay static.

## Built with

[Astro](https://astro.build) · [Tailwind CSS](https://tailwindcss.com) · TypeScript · Cloudflare Pages

## Running locally

```bash
git clone https://github.com/SpreadSheets600/spreadsheets600.github.io
cd spreadsheets600.github.io
npm install
npm run dev
```

Copy `.env.example` to `.env` if you want to run `npm run sync-repos`.
