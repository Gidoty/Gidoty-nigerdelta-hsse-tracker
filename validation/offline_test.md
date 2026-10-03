# Manual offline / device-local storage test protocol

This project has no server and no sync: a report submitted on a phone
lives only in that phone's IndexedDB until the reporter explicitly
exports or shares it (see `docs/MANUSCRIPT_CHANGES.md`, Phase 7). That
claim can only be checked on a real device and a real browser — it is not
something a unit test can verify, since Vitest's `node` environment and
`fake-indexeddb` don't exercise a real browser's storage, service worker,
or network stack. Run this protocol on at least the devices/browsers the
manuscript claims support for, and record every trial in
`validation/results/offline_trials.csv`.

Trials were run on three Android phones on 30 September 2026; results are in
`validation/results/offline_trials.csv`.

## Setup

1. Build and serve the production bundle (not the dev server, so the
   service worker behaves as it will for real users):
   ```
   cd nigerdelta-hsse-tracker/app
   npm run build
   npx serve ../  # or any static file server rooted one level up
   ```
2. Open the served URL in the browser under test.
3. Append `?mode=test` to the report URL so records created in this
   session are tagged `dataClass: "developer_test"` and can be told apart
   from real submissions afterward.

## Trial script (phones, as run on 30 September 2026)

Run all nine steps in one sitting per phone and browser. Record the phone
model, Android or iOS version and browser version in the CSV. Use made-up
details only: no real names or phone numbers.

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
   (No report data is ever transmitted; the code contains no request that
   carries report content.)
9. On the Audit tab tap **Export for Submission**, then verify the file:
   `python3 validation/verify_export.py <file>` must print PASS.

If the phone previously showed a blank page, first clear site data for
gidoty.github.io (Chrome: Settings → Site settings → All sites).

## Recording results

For each device/browser combination, add one row per trial to
`validation/results/offline_trials.csv` with a pass/fail per step and any
notes (e.g. "step 2 failed on iOS Safari 17: blank screen offline").
A trial is only a pass overall if every step passes.
