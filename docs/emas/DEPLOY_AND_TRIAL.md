# Deployment and offline trial protocol

Two separate things: how the author deploys this build to the live site,
and how to re-run the manual offline/device trial protocol and log the
result. This document does not perform either — no push, tag, or deploy
was made from this session; every step below is the author's to carry
out.

## 1. Deploying this build

The live application at `https://gidoty.github.io/nigerdelta-hsse-tracker/`
is served by GitHub Pages directly from the `main` branch of a *different*
repository — `github.com/Gidoty/Gidoty.github.io` (the "portfolio repo"),
inside its `nigerdelta-hsse-tracker/` subdirectory. There is no
`.github/workflows` directory in that repo, so there is no CI build step:
whatever is committed to `main` is exactly what is served. **This
repository (`gidoty-nigerdelta-hsse-tracker`) is a separate archival
mirror for Zenodo/DOI purposes and does not drive that deployment** — see
`README.md`'s "Repository" section and `docs/emas/REPO_RECORD.md` §A.1.

To deploy the changes in this repository to the live site:

1. In a checkout of the portfolio repo (`Gidoty/Gidoty.github.io`), apply
   the same source changes this repository has under
   `nigerdelta-hsse-tracker/app/src/` (every file changed since `v0.1.0`
   is listed in `RELEASE_NOTES_0.2.0.md`). The simplest way is to copy
   this repository's `app/` directory over the portfolio repo's
   `nigerdelta-hsse-tracker/app/` directory, since both are the same
   application and this repository's `app/` is the authoritative current
   source.
2. From the portfolio repo's `nigerdelta-hsse-tracker/app/` directory,
   run:
   ```
   npm install
   npm run build
   ```
   This writes the built site to `nigerdelta-hsse-tracker/` (one level
   above `app/`, per `app/vite.config.js`'s `outDir`), overwriting
   `index.html`, `precache-manifest.json`, and `assets/`. Confirm the
   build picked up a real commit hash — check the footer of the built
   `index.html`/the running app for "Version 0.2.0+<short-sha>", not
   "Version 0.2.0+unknown" (a missing hash means `git rev-parse
   --short HEAD` failed inside the build, usually because the build ran
   outside a git checkout).
3. Review the diff (`git status`, `git diff --stat`) inside the
   portfolio repo to confirm only `nigerdelta-hsse-tracker/` changed, and
   that stale pre-build asset files are removed the same way step 3 of
   this project's own history did (compare
   `nigerdelta-hsse-tracker/precache-manifest.json`'s `assets` list
   against what's physically present in
   `nigerdelta-hsse-tracker/assets/`; remove anything present but not
   listed).
4. Commit and push to the portfolio repo's `main` branch. GitHub Pages
   serves the new build automatically, typically within a few minutes of
   the push.
5. Confirm the live site shows the new build (check the footer's version
   string, and that persistent-storage status and the export reminder
   described in `RELEASE_NOTES_0.2.0.md` are visible where expected).

Do not perform steps 4–5 from an automated session without the author's
explicit, separate instruction to push and deploy — this document only
records the exact steps, it does not authorize carrying them out.

## 2. Offline / device-local storage trial protocol

This is the same nine-step protocol already defined in
`validation/offline_test.md`, reproduced here for convenience alongside
a trial log template that also records the build hash. The protocol
itself is unchanged; only the log template below is new (it adds a
build-hash and tester-initials column that the original
`validation/results/offline_trials.csv` predates, since the footer did
not show a build hash before step 3 of this preparation).

### Setup

1. Build and serve the production bundle (not the dev server, so the
   service worker behaves as it will for real users):
   ```
   cd nigerdelta-hsse-tracker/app
   npm run build
   npx serve ../  # or any static file server rooted one level up
   ```
2. Open the served URL in the browser under test.
3. Append `?mode=test` to the report URL so records created in this
   session are tagged `dataClass: "developer_test"` and can be told
   apart from real submissions afterward.

### The nine steps

Run all nine steps in one sitting per device/browser. Record the device,
OS version, browser version, and the build hash shown in the app's
footer in the log before starting.

1. With internet on, open
   `https://gidoty.github.io/nigerdelta-hsse-tracker/report?mode=test`
   and wait 10 seconds.
2. Turn on airplane mode and refresh. The report form must still show.
3. Tap **Report Anonymously**, fill the form with fake details, add one
   photo and tap **Submit Report**. Note the reference number.
4. Refresh. The page must still load.
5. Open **Menu → Dashboard → My Submitted Reports**. The report must be
   listed.
6. Close the browser completely, reopen the same link (still offline).
   The report and its reference number must still be there.
7. Tap **View Full Report → Audit → Verify Integrity**. It must report
   that the evidence payload matches the recorded hash.
8. Turn airplane mode off and refresh. The report must be unchanged.
   (No report data is ever transmitted; the code contains no request
   that carries report content.)
9. On the Audit tab tap **Export for Submission**, then verify the file:
   `python3 validation/verify_export.py <file>` must print PASS.

If the device previously showed a blank page, first clear site data for
`gidoty.github.io` (Chrome: Settings → Site settings → All sites).

### Blank trial log template

One row per device/browser combination. This template is empty — no
result has been filled in or assumed for any step.

| Date | Device | OS version | Browser version | Build hash (footer) | Tester initials | Step 1 | Step 2 | Step 3 | Step 4 | Step 5 | Step 6 | Step 7 | Step 8 | Step 9 | Overall | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | |

A trial is only a pass overall if every one of the nine steps passes.
Record each step as `pass` or `fail`; leave "Overall" blank until all
nine are filled in for that row. Add a row per device/browser trial —
do not overwrite a prior row.
