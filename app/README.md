# NigerDelta HSSE Tracker

Community environmental monitoring for the Niger Delta — geo-tagged, photo-supported oil spill,
gas flare, and health incident reporting, aligned with Nigeria's legal framework (NOSDRA Act 2006,
Oil Spill Regulations 2011, NDPA 2023) and international instruments (African Charter Art. 24,
Paris Agreement Art. 6.4).

Built with React 18, Vite, Tailwind CSS v4, and React Router v6.

## Structure

This is the editable source. It builds to `../` (`nigerdelta-hsse-tracker/`), the folder actually
served at `gidoty.github.io/nigerdelta-hsse-tracker/` by the parent GitHub Pages user site.

```
src/
  components/   Navbar, Footer, shared Placeholder card
  pages/        One file per route
public/         manifest.json, sw.js, PWA icons — copied as-is into the build output
scripts/        generate-icons.mjs regenerates public/icon-*.png from scripts/icon.svg
```

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # builds to ../ (the served output)
npm run icons     # regenerate PWA icons from scripts/icon.svg
```

After `npm run build`, commit both `app/` (source) and the sibling files it produced in
`nigerdelta-hsse-tracker/` (index.html, assets/, manifest.json, sw.js, icons) — the parent repo has
no build step of its own, so the compiled output is what gets served.

Built by Gideon Owhonda.
