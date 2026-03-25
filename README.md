# Synapse

A clean, production-style **pre-med networking** web app (LinkedIn-like) focused on connecting pre-med students with doctors for shadowing opportunities.

## Tech

- Next.js (App Router) + React
- TypeScript
- Tailwind CSS
- Mock data only (no backend yet)

## Getting started

1. Install **Node.js LTS** (includes `npm`). Check with `node -v` and `npm -v`.
2. In Terminal, go into **this** project folder (not your whole Documents folder):

```bash
cd /Users/audrenbarclay/Documents/premed-networking
```

3. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

**If the page does not load:** the dev server is not running, or it failed to start. Read the Terminal output after `npm run dev`—fix any errors, or try another port: `npm run dev -- -p 3001` then open `http://localhost:3001`.

## Project structure

- `src/app/` routes/pages
- `src/components/` reusable UI components
- `src/data/` mock data
- `src/types/` TypeScript types
- `src/utils/` small utilities
