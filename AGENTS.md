# Suikoden RNG Tool

Browser tool for the PS1 game *Suikoden 1* (speedrun/RNG-manipulation community). Predicts RNG-driven events
(encounters, item drops, stats, NPC movement, etc.) and finds the current RNG seed from observed encounters.
Live at https://ak505188.github.io/Suikoden-RNG-Tool/ (GitHub Pages, `npm run deploy` → `gh-pages -d build`).
`README.md` is mostly a write-up of how the game's RNG works (32-bit RNG at `0x00009010`, what advances it, method pseudocode) — read it for game-logic context.

## Stack
- Vite 8 + `@vitejs/plugin-react` (config: `vite.config.mjs`, `index.html` at the repo root), Node 22 (`.nvmrc`). React 16 (hooks + some class code), JSX in `.jsx` (Vite requires `.jsx` for JSX and rejects type annotations in source).
- UI: `semantic-ui-react`, `react-virtualized` tables, `styled-components`, some `.css` / one `.scss` (`sass`).
- Routing: `react-router-dom` v5 `HashRouter`. State is passed form → result via **URL query params** (`/sequence/result?rng=..&iterations=..`); the result page recomputes from the params.
- Redux (`redux`, `redux-actions`) is used only by Run Assistant.
- Game logic lives in the external package **`suikoden-rng-lib`** (git dependency, `ak505188/Suikoden-RNG-lib#battle-simulator`; `.npmrc` sets `allow-git=all` because npm 12 blocks git deps by default): `RNG` (`raw`, `rand`, `next()`, `jump(n)`, `peek()`, `clone()`, `seed`, `count`), `Areas`/`Area`, `Helpers`, roll checks (`isCliveAppearance(rand)`, `countWheelAttempts(rng)`, ...), stats, `Kaku`, chinchironin, assassin. Import from the package root only (it has an `exports` map). This repo is the UI on top of it.
- Absolute imports from `src/` for `components/`, `RunAssistant/`, `Table/`, `findRNG/` (aliases in `vite.config.mjs`, mirrored in `jsconfig.json`).
- Worker: `findRNG/findRNG.worker.js`, loaded with Vite's `?worker` import in `rngfinder.jsx`. Table filtering uses the in-repo `Table/SearchIndex.js` (replaced `js-worker-search`, whose bundle crashes as an ES module).
- Commands: `npm start` (dev), `npm run build` (output in `build/`), `npm run preview`, `npm test` (Vitest, jsdom), `npm run deploy` (gh-pages from `build/`). Branches: work on `dev`, `master` is main. Base path is `/Suikoden-RNG-Tool/` (GitHub Pages).
- Local lib development: `npm install` reinstalls the lib from git. To use a local checkout, replace `node_modules/suikoden-rng-lib` with a symlink to it (e.g. `ln -s ../../Suikoden-RNG-lib node_modules/suikoden-rng-lib`) after each install.

## Layout
- `index.html` – Vite entry page. `src/index.jsx` – app entry (HashRouter). `src/App.jsx` – all routes. `Navbar.jsx`, `Home.jsx`.
- `src/components/<tool>/{form,result}/` – one folder per tool, convention: `form/<tool>-form.jsx` (inputs → push URL), `result/<tool>-result-container.jsx` (parse params, compute) + `<tool>-result-table.jsx` (display), each dir with `index.jsx` re-export. Tools: `encounters`, `itemdrops`, `sequence`, `npc-movements`, `stats` (`starting-stats`, `level-ups`), `experience`, `chinchironin`, `assassin`, `kaku`, `rngfinder`.
- `src/components/form/` – shared form inputs (`InputRNG`, `InputIterations`, ...); `ListSelector`, `DoubleListSelector`, `ImportModal` – shared widgets.
- `src/RunAssistant/` – the largest tool: live run companion with Redux (`actions/`, `reducers/`, `controls/` incl. hotkeys + config modal, `Table.jsx`).
- `src/Table/` – generic searchable/filterable/exportable virtualized table used by results; `src/SearchAttemptTable/` – related search table.
- `src/findRNG/` – brute-force RNG seed finder (iterates up to 2^32 states matching an observed encounter sequence); has a web worker wrapper (`findRNG.worker.js`, `WebWorker.js`) and progress `Status`.
- `src/assets/` – enemy sprites (`<Name>.png/.gif`) used in encounter displays.
- `public/` – static files (includes a `service-worker.js` that unregisters the old CRA service worker in returning browsers). `build/` – generated output (gitignored).

## Adding a tool
Create `components/<tool>/form` + `result` following the pattern above, then add two `<Route>`s in `App.jsx` and a link in `Navbar.jsx`/`Home.jsx`.

## Notes
- Tests: Vitest; only `src/App.test.jsx` (render smoke test) exists, no real coverage yet.
- Recent work: Assassin, Kaku, Chinchironin simulators and an encounter offset option.
