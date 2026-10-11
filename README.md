# MeetingPilot

**A real, offline-first meeting companion for phones and PCs.** Plan an agenda, keep your place during a live meeting, record real outcomes, and prepare an editable follow-up.

## What works in this version

- Four navigation areas: Home, Prepare, Live, Follow-up.
- Create a meeting, edit objectives and schedule, add/reorder/delete agenda topics, edit talking points, set planned time and expected decisions, add participants.
- Save and reuse meeting templates, including topics and participants.
- Start/pause/resume a meeting, select next/previous topic, reorder topics while live, monitor elapsed and overtime. **Topic changes are always manual.**
- Live **I'm Lost** dialog provides a glanceable objective, first talking point, and conversational prompt. Enter your own prompt per topic in Prepare.
- Record separate decisions, action items with owners and due dates, parked discussions, and notes.
- Closing a meeting creates an editable follow-up from **only recorded data**, with copy, share (where supported), and TXT download. Check off tasks and resolve parked discussions.
- Saves records locally in IndexedDB using Dexie. Closing the browser does not reset a live meeting. Uses real `Date.now()` timestamp deltas so device sleep does not silently stop timers.
- Offline caching / installation from HTTPS site, and responsive phone and desktop layouts.
- Export/import a complete local JSON backup for manual transfer across devices (import replaces local records).
- Includes a **fictional example** Pack 179 leadership planning agenda, for demonstration only.

## What does **not** work yet

- Google Calendar or Gmail integration; AI planning; recording/transcription; notifications; PackOps/Volunteer Wrangler linkage.
- Automatic sync between devices or accounts. Your phone and PC hold **separate** data. Use Home → Download backup / Import backup for manual transfer; importing **replaces** the destination device’s records. GitHub Pages only hosts the static app, not your meeting database. Do not rely on browser storage as the sole permanent archive for important decisions.
- Multi-user simultaneous editing and user login.

## Run on your PC (Windows / Mac / Linux)

1. Install **Node.js 22 LTS** and Git (or use GitHub Desktop).
2. Unzip this project, open a terminal in the `MeetingPilot` folder.
3. Run `npm install` (requires internet on **your PC**) and `npm run dev`.
4. Open the address shown by Vite (normally `http://localhost:5173`).
5. For a production build, run `npm run build`, then `npm run preview` to test.

> Local `http://localhost` allows offline development, but the deployable installable PWA is intended to be served over HTTPS, like GitHub Pages. `npm install` on your machine creates `package-lock.json`; commit that lockfile to your repository for consistent future builds.

## Deploy free on GitHub Pages

1. On GitHub, create a **new public repository** called `MeetingPilot` (or another name).
2. Upload **everything inside** the project folder, including `.github/workflows/deploy.yml`, to the repository root. Make sure the default branch is named `main`. On a PC, use GitHub Desktop, or run:

   ```bash
   git init
   git add .
   git commit -m "Initial MeetingPilot PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/MeetingPilot.git
   git push -u origin main
   ```

3. In GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. In the **Actions** tab, inspect the latest `Test, build and deploy MeetingPilot` workflow. It installs dependencies, checks TypeScript, runs unit tests, runs Playwright Chromium desktop + mobile tests, builds, and deploys.
5. Visit `https://YOUR-USERNAME.github.io/MeetingPilot/` (replace both account and repo names as appropriate). The Vite base path is configured automatically from `GITHUB_REPOSITORY` during GitHub Actions.
6. On Windows with Chrome/Edge: open site → browser install icon in address bar or menu → **Install MeetingPilot**. On Android with Chrome: open site → browser menu → **Install app**. You can also simply use the website in a browser.

**Important:** If the Actions build fails, don't try to install the app from an incomplete/old page; open Actions and inspect the error. A blank screen after deployment is often a misconfigured repository base path; this project configures it automatically for GitHub Pages.

## Testing

```bash
npm install
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Vitest tests the timestamp math and data-only summaries. Playwright tests the full create → agenda → start → decision + action → reload → end → summary path at desktop and mobile viewport sizes.

## Architecture

```text
src/
  types.ts              Entity definitions and IDs
  services/
    db.ts               Dexie IndexedDB schema / versioning
    meetings.ts         CRUD, agenda sorting, templates, example seed
    live.ts             Transactional topic and timer state, captures
    timers.ts           Pure real-time elapsed calculations
    followup.ts         Deterministic data-only summaries
    backup.ts           Manual JSON backup/restore
    integrations/       Explicit future provider interfaces (no live services)
  pages/
    Home.tsx            Overview, templates, resume
    Prepare.tsx         Agenda editor
    Live.tsx            Meeting cockpit and capture dialogs
    Followup.tsx        Follow-up, export, task resolution
  components/           Shared layout and controls
  lib/                  File export and date helpers
```

HashRouter (`/#/live/...`) means refresh and direct navigation work even on static GitHub Pages hosting. `vite-plugin-pwa` precaches the app shell. Once installed/loaded successfully, the UI is usable offline; new installs and updates still require an internet connection.

### Data model

All entities use UUID identifiers and creation/update timestamps: `Meeting`, `AgendaTopic`, `Participant`, `Decision`, `ActionItem`, `ParkingLotEntry`, `MeetingNote`, and `MeetingTemplate`. Each captured item has a `meetingId`, optionally a `topicId`. Timers preserve `startedAt`, `pausedAt`, `totalPausedMs`, and per-topic `activeStartAt`/`elapsedMs`. No background timer has to keep running to preserve accurate elapsed time.

### Extension plan

Add `src/services/integrations/` for opt-in Google OAuth + Calendar/Gmail, an eventual authenticated backend for cross-device sync, consent-driven speech capture, and adapters to PackOps/Volunteer Wrangler. **None are wired up yet.** Google API secrets must never be committed or embedded in this static app. Local-first records should stay on-device unless the user explicitly activates a secure sync provider.

### Privacy and known limits

This app does **not** send meeting notes to any server. Stored data is browser-profile- and origin-specific. Clearing site data, using private mode, changing browsers, or uninstalling may delete local records. GitHub hosting does not equal a backup. Export summaries regularly. Live collaboration and backup/sync are not part of this milestone. The demo meeting is fictional.

## Troubleshooting

- **Page is blank:** inspect browser DevTools Console and GitHub Actions. The Pages root should match the repository name; use workflow deployment rather than publishing unbuilt `src/` files.
- **App installed, but only splash screen:** close the installed app, revisit the deployed URL in Chrome, hard refresh, and reinstall after a successful Actions deploy. An old service worker cache can sometimes persist.
- **Different records on PC and phone:** expected—IndexedDB data is local per browser and device. Use Home → Download backup on one device, then Import backup on the other (this replaces local records, so export from both before transferring).
- **`npm: command not found`:** install Node.js, then restart your terminal.
- **Failed tests:** check the Actions logs; deployment is intentionally blocked if typecheck/tests fail.
