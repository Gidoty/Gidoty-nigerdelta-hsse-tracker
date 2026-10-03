# Manuscript Changes Required

This lists what the JEAS manuscript must say differently because of fixes
made to the app. It does not rewrite the manuscript — that is the author's
work.

## Scope (decided before this audit)

- The paper must present this as an engineering verification study using
  **synthetic test records only**. Drop the ">50 users" and ">10 incidents"
  figures, the informal user feedback, hypothesis H1 (structured vs.
  free-text comparison), and the usability evaluation section — none of that
  work exists in the app or was ever collected under a research protocol.
- The paper must state: **"Ethics approval and consent to participate: Not
  applicable (no human participants or human data; synthetic test records
  only)."**

## Architecture (decided before this audit)

- The app is device-local with no server, database, analytics, or network
  transmission of report data. The paper must not claim sync, aggregate
  incident counts across users, or cross-user/cross-device corroboration —
  none of that is possible in this architecture, and Phase 4 below removes
  the one feature that implied it.

## Phase 1 — Emission calculations

- The manuscript's methane-emission methodology section must be rewritten
  to describe the **mass-balance method**
  (`m_CH4_slip = V_g × x_CH4 × ρ_CH4(T_ref,P_ref) × (1 − η_f)`), not "IPCC
  2006 Tier 1." The app no longer implements a Tier 1 volumetric emission
  factor.
- Any worked example in the manuscript using the old factor (e.g. "48,000 m³
  → 96 t CH₄") must be replaced with a mass-balance example. On 48,000 m³ at
  x_CH4 = 0.90, η_f = 0.98, 15°C/101.325 kPa reference conditions, the app
  now computes approximately 0.586 t CH₄ slip — recompute and cite whatever
  worked example you use directly from the running app or its test vectors
  (`validation/test_vectors.json`), not by hand.
- Report GWP₂₀ = 82.5 (not 84) if the manuscript states a value — this was
  an AR5/AR6 mixing error in the app, now corrected to AR6 throughout.
- Any manuscript figure or table that used the deleted `estimateFlaredVolume`
  heuristic (base flow rate × stack multiplier × duration) must be removed
  or replaced — flared volume is now a required, sourced user input, not a
  derived estimate.
- Drop any manuscript claim describing a "cars"/"households" CO₂e context
  comparison feature — it has been removed pending a sourced comparison
  figure (see `AUTHOR_ACTION_REQUIRED.md`).

## Phase 2 — Carbon-credit features removed

- The manuscript must not describe carbon-credit estimation, Gold Standard,
  Verra/VCS, or Article 6.4 baseline-data export as implemented features.
  Both panels (`carbon-credit-potential`, `carbon-credit-data-package`) have
  been removed from the live app — community observation of a third-party
  flare cannot form a credit baseline, and the feature is out of scope for
  a device-local, no-corroboration tool. The panel source is preserved on
  the `archive/carbon-credit` branch if you want to describe it as future
  work rather than a delivered feature.
- Feature-count claims must drop from 27 to 25 tools across 7 categories,
  and the Home page's feature grid from 11 to 10 items.

## Phase 3 — Integrity hashing reworked

- The manuscript must not claim the app's SHA-256 fingerprint "meets
  Nigerian Evidence Act 2011 Sections 84–87 requirements for admissibility."
  This claim has been removed from every UI surface. The correct framing,
  used everywhere in the app now: it is a **tamper-evident fingerprint**
  that detects later changes to a saved record; it does not establish
  truth, authorship, or legal admissibility. Describe it this way in the
  manuscript too.
- The hashing method changed: the app now hashes a canonically-serialised
  (sorted keys, fixed formatting) **immutable evidence payload** —
  incident fields, location, timestamps, description, per-photo SHA-256
  hashes, health fields, language, consent version, and app version —
  explicitly excluding the reporter's contact details, browser user agent,
  and the regulatory/corroboration fields (which change after submission).
  Regulatory and corroboration mutations (NOSDRA notification, cleanup
  status changes) are now recorded in a separate, append-only,
  hash-chained events log per report, independently verifiable without
  touching the original evidence hash. If the manuscript describes the
  hashing method, it must describe this scheme, not a single whole-object
  `JSON.stringify` hash.
- Reports saved before this change are tagged
  `integrity.canonicalization: "legacy-v0-noncanonical"` and are not
  re-verifiable — if the manuscript discusses any pre-existing test data,
  say so.
- A "Verify Integrity" action now exists in the report detail view,
  independently re-deriving the payload hash and event-chain hashes. An
  independent Python re-implementation (`validation/verify_export.py`,
  Phase 8) exists for verifying exported records outside the app.

## Phase 4 — Corroboration replaced with an evidence-status enum

- The manuscript must not describe "community corroboration" as multiple
  independent community members confirming the same incident. With no
  server, a second confirmation can only come from the same browser as the
  original report, so it cannot demonstrate independent agreement. The
  self-corroboration feature (and its UI, `CorroborationModal.jsx`) has
  been **removed entirely** — not reworked, removed.
- In its place: every report starts at evidence status **Community
  Observed**. It can be raised to **Externally Referenced** only by linking
  a specific external record (a NOSDRA Oil Spill Monitor incident ID, or a
  Gas Flare Tracker site) with a URL and access date, or to **Independently
  Verified** only by citing a specific verification source (e.g. a JIV
  report reference). The app never sets either upgraded level
  automatically. This is shown on every report — map popups, cards, the
  submitted-reports list, CSV exports, and generated NOSDRA letters.
- Drop hypothesis H1 (structured vs. free-text corroboration comparison) —
  already noted under Scope above, restated here because it is this
  feature specifically that made H1 impossible to test as originally
  conceived.
- The map's "Live Heatmap" is relabelled "Reporting Hotspot Map" with an
  on-map note that density reflects where people reported, not measured
  pollution levels. If the manuscript describes the heatmap as measuring
  pollution intensity, correct that.

## Phase 5 — Legal and timer wording

- The operator-response timer is labelled "Time since you recorded
  notifying NOSDRA" everywhere it appears, not "time since the spill" — it
  measures the reporter's own notification action, which NOSDRA Act 2006
  s.6(2) does not directly govern (the Act's 24-hour duty runs from spill
  occurrence and falls on the operator, not the reporter). A separate,
  optional "estimated time the spill occurred" field was added to the
  NOSDRA notification flow so the two timestamps are never conflated.
- The unsourced "JIV not yet scheduled (72h+ elapsed)" warning has been
  removed pending a citable provision (see `AUTHOR_ACTION_REQUIRED.md`).
- An unverified "₦500,000 daily fine" figure was also removed from the
  notification-timer warning text pending a citable provision — do not use
  that figure in the manuscript unless it is independently sourced.
- Every generated NOSDRA notification letter and FOI request now ends with
  "Prepared by the reporter using NigerDelta HSSE Tracker. This is not an
  official NOSDRA document." If the manuscript implies these documents are
  authoritative NOSDRA correspondence, correct that.

## Phase 6 — WHO air-quality panel

- Added ozone (O₃) to the WHO AQG reference panel, completing all six WHO
  2021 AQG criteria pollutants (PM2.5, PM10, O₃, NO₂, SO₂, CO). If the
  manuscript lists only five pollutants, add ozone.
- Moved benzene out of the WHO AQG panel into a separate "Other
  Petroleum-Related Substances" section, since the UNEP Ogoniland figure
  cited is a **drinking-water** concentration, not an air concentration —
  it was previously presented alongside air-quality guideline values,
  which conflates the two. If the manuscript describes benzene as part of
  the app's WHO AQG comparison, correct that.
- Added the disclaimer "This app does not measure pollutant concentrations.
  Reported symptoms are not diagnoses or exposure measurements" to the
  panel. The four Niger Delta context sources remain unverified pending
  DOI checks — see `AUTHOR_ACTION_REQUIRED.md`.

## Phase 7 — Storage, offline behaviour, and consent

- Reports now live in IndexedDB, not `localStorage`. `localStorage` had a
  roughly 5 MB quota that a handful of photo-bearing reports could exceed;
  IndexedDB does not have that practical ceiling. A one-time migration
  copies any existing `localStorage` reports into IndexedDB, verifies the
  record count matches, and only then clears the old key — if the manuscript
  states a storage mechanism, it must say IndexedDB, not localStorage.
- The service worker now precaches the entire built app shell (every
  content-hashed JS/CSS file from the actual build output, via a
  build-time manifest) rather than just the root document and icons, so a
  first offline launch after install works. Cache version bumped
  accordingly.
- **The "submits automatically when you reconnect" claim was false and has
  been removed everywhere it appeared** — the no-typo-server architecture
  never queued anything for later transmission; every report was already
  fully saved locally the instant it was created, online or not. Removed:
  the no-op `syncQueuedReports` in `sw.js`, the `sync-reports` Background
  Sync registration in `Report.jsx`, the `'queued'`/`'offline'` result
  states, the "queued offline" counter in the drawer, and the
  "Awaiting submission" badge. The connectivity banner and consent screen
  now say a report is saved on this device, full stop — reaching NOSDRA or
  anyone else requires an explicit export or share action. This directly
  contradicts any prior manuscript claim of background sync or automatic
  submission-on-reconnect; correct that section.
- Added an "Export for Submission" action producing a single JSON file
  containing the canonical record and its integrity hash — this is now the
  documented way a report leaves the device.
- Added `dataClass` (`operational` / `developer_test` / `demo`) to every
  report. Demo fixture data is tagged `demo` and was already structurally
  excluded from real-report views (it is generated in memory, never
  written to storage); CSV exports now also explicitly filter to
  `operational` records only. A `?mode=test` URL flag labels records
  created during device testing as `developer_test` (see
  `validation/offline_test.md`, Phase 8).
- Added `appVersion` (package version + build commit SHA, injected at
  build time) to every newly-created report's audit metadata.

## Phase 8 — Validation methodology

This phase built the validation evidence a JEAS submission needs to cite,
rather than changing app behavior. If the manuscript has (or needs) a
"Validation" or "Testing" section, it should describe this:

- **Independent cross-check of the methane calculator.**
  `validation/reference_calcs.py` is a from-scratch Python
  reimplementation of the mass-balance formula in
  `src/utils/methaneCalc.js` (shares no code with it), generating 23 hand-
  picked test vectors (typical, boundary, and invalid inputs) into
  `validation/test_vectors.json`. A Vitest test
  (`src/utils/methaneCalc.test.js`) asserts the JS calculator reproduces
  every non-error vector within 1e-9 relative tolerance and raises for
  every vector marked invalid, writing the comparison to
  `validation/results/calculator_check.json`. If the manuscript claims the
  calculator was validated, this is the validation — cite the tolerance
  and vector count, not a general assertion.
- **Unit tests.** `src/utils/*.test.js` (Vitest) cover the integrity/hash
  module (canonicalization, sealing, tamper detection, the event chain,
  legacy records), the evidence-status transitions, and the
  localStorage-to-IndexedDB migration (including the case where migration
  undercounts and must not delete the original data). 60 tests, run via
  `npm test` in `app/`.
- **Synthetic test data.** `validation/make_synthetic.py` generates 100
  fabricated reports (fixed random seed, stdlib only) covering every
  incident type and severity and a spread of optional-field combinations,
  with small generated PNG "photos" and fictional Niger Delta coordinates.
  All are tagged `dataClass: "developer_test"`. **This is fabricated data
  for testing only — if the manuscript presents any figures, counts, or
  case examples, they must come from real submissions or clearly-labeled
  hypothetical scenarios, never from this synthetic set.**
- **Tamper-detection check.** `validation/tamper_test.py` applies nine
  mutation scenarios to the synthetic records — six that should be
  detected (description, location, severity, a single altered photo byte,
  an altered event, a broken event-chain link) and three legitimate
  mutable-field changes that should *not* be flagged (NOSDRA notification,
  cleanup status, contact details) — and confirms the integrity module
  gets all nine right. Results: `validation/results/tamper_check.json`.
- **Independent export verification.** `validation/verify_export.py` is a
  standalone CLI (no Node.js, no browser) that recomputes an exported
  report's payload hash and event chain using the same canonicalization
  algorithm, for use by an editor, reviewer, or investigator who receives
  an exported file and wants to check it independently of this app's own
  code.
- **Manual offline/device protocol.** `validation/offline_test.md` is a
  step-by-step protocol for verifying the device-local, no-sync storage
  claim on real hardware. **This has not been run yet — see
  `docs/AUTHOR_ACTION_REQUIRED.md`.** Any manuscript claim about offline
  behavior on physical devices must wait for those trial results, not cite
  this protocol's existence as if it were already executed.
- **`validation/run_all.sh`** runs the Python reference implementation,
  the synthetic-data and tamper-detection scripts, and the JS test suite
  in sequence, and writes `validation/results/SUMMARY.md` from the actual
  output of that run — every number in it is read back from the real
  results files, never hand-typed.

## Phase 9 — Availability docs and a leftover GWP figure

- `app/src/data/parameters.js`'s CO₂ Equivalent feature description still
  cited GWP₂₀ = 84 (the AR5/AR6 mixing error Phase 1 fixed everywhere
  else) — missed because it lives in the feature catalog, not
  `methaneCalc.js` or a panel. Corrected to 82.5. If the manuscript quotes
  this feature-catalog text anywhere, use the corrected figure.
- Added `README.md` methodology/validation sections, `LICENSE` (MIT, per
  author confirmation), `CITATION.cff`, `CHANGELOG.md`, and
  `docs/AI_ASSISTANCE.md` (required for a submission that used AI coding
  assistance). None of these change app behavior.

## Phase 10 — Two integrity gaps closed on PR review

A reviewer of the pull request implementing Phases 1-9 found two real gaps
in the integrity scheme from Phase 3, both now fixed. If the manuscript
describes the integrity/hashing scheme, these two points must be part of
that description:

- **Regulatory status could drift from the event log undetected.**
  `report.regulatory.nosdraNotified`, `nosdraNotifiedAt`, and
  `cleanupStatus` were writable independently of the event log that is
  supposed to be their audit trail — nothing checked that a stored value
  actually matched what the events said happened. `deriveRegulatoryStatus()`
  (`app/src/utils/integrity.js`) now replays the event log as the source of
  truth for these three fields, and `verifyReport()` returns a new
  `statusConsistent: false` if the stored fields and the replayed value
  disagree — catching a direct field edit made without going through
  `appendEvent()`. The three fields are still also stored directly on
  `report.regulatory` as a fast-read cache (unchanged for every UI read
  site), but that cache is no longer trusted uncritically at verification
  time.
- **A truncated-but-internally-consistent event tail was undetectable.**
  Deleting the last N events from `report.events` left the remaining chain
  perfectly self-consistent — `eventChainValid` had no way to know events
  were missing from the end. `integrity.eventCount` and
  `integrity.headEventHash` are now updated on every `appendEvent()` call as
  a running high-water mark, and `verifyReport()` returns
  `eventLogComplete: false` when the current event array doesn't match that
  recorded mark. **This detection has a real limit the manuscript must
  state plainly: it only catches truncation on the device where the
  truncation happened if whoever did it forgot to also update
  `eventCount`/`headEventHash` to match.** An attacker with access to the
  device's storage can rewrite the entire record, including those two
  fields, consistently — nothing on that single device can then prove data
  is missing. Real protection requires an independently held earlier copy
  (an export taken before the truncation) to compare against; `verify_export.py`
  now performs exactly that comparison between an export's top-level
  summary and its embedded record, and between two exports of different
  ages if you have both. Do not describe this as tamper-proof; describe it
  as tamper-evident against an external reference copy, and only
  best-effort on-device.
- `validation/tamper_test.py`'s NOSDRA and cleanup "legitimate change"
  scenarios were split in two: a change made through a proper `appendEvent`
  call (must still verify cleanly) and a direct field edit with no event
  (must now be detected). `validation/make_synthetic.py` now gives every
  one of its 100 records 2-4 events (previously most had none), so the
  event-chain and truncation scenarios exercise the full synthetic corpus
  instead of a handful of records.
- The ₦500,000 daily-fine figure removed in Phase 5 for lacking a citation
  is restored in `TimelineCard.jsx`, now cited to NOSDRA Act 2006 s.6(2)
  ("₦500,000 for each day of failure to report"). The corresponding item
  in `docs/AUTHOR_ACTION_REQUIRED.md` is removed. This audit did not
  itself re-verify the Act's text against this citation — the citation was
  supplied directly by the author, who is responsible for its accuracy in
  the manuscript.

## Phase 11 — Cross-implementation agreement and evidence-status replay

- **Number formatting now matches across implementations.** The Python
  verifier (`validation/canonical.py`) formatted integer-valued floats
  with a trailing ".0" (for example `14.0`), while the app writes `14`.
  This made 6 of 100 Python-sealed synthetic records fail verification in
  the app. The Python formatter now follows the ECMAScript number-to-string
  rules, the same rules the JSON Canonicalization Scheme (RFC 8785) uses.
- **The cross-implementation check is now part of `run_all.sh`.**
  `app/src/utils/crossImplementation.test.js` verifies every Python-sealed
  synthetic record in the app, writes app-sealed edge-case exports
  (non-ASCII text, emoji, escapes, floats) for the Python verifier, and
  writes seeded number-format vectors; `validation/cross_impl_check.py`
  checks the Python side and writes
  `validation/results/cross_implementation.json`. Restoring the old
  formatter makes this check fail (94/100 and 5/6), so it detects the
  original defect.
- **Evidence status is now replayed from the event log.** A stored
  evidence level raised without a logged, supported
  `evidence_status_changed` event now fails `statusConsistent`. An
  upgrade event counts only if it carries the reference the rules
  require. `tamper_test.py` gained three scenarios (upgrade via event,
  direct edit with no event, upgrade event without a reference) and now
  records which of the four checks fired for each scenario.
