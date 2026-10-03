# NigerDelta HSSE Tracker

**Community Environmental Monitoring for the Niger Delta**

Built by Gideon Owhonda
gideon.owhonda@cgrpng.org

---

## What It Does

The NigerDelta HSSE Tracker is a free, offline-capable Progressive Web Application that enables
Niger Delta residents to report oil spills, gas flares, and environmental health incidents, and
tracks regulatory response and estimated methane emissions.

25 integrated features across 7 categories:
REPORT · MONITOR · CALCULATE · TRACK · GENERATE · HEALTH · DATA

## Architecture

Device-local only: reports are stored in the reporting device's IndexedDB and never leave it
automatically. There is no server and no background sync. Reaching NOSDRA, a journalist, or
anyone else is always an explicit action by the reporter — generating a notification letter,
exporting a signed JSON record, or sharing a reference number. See
[`docs/MANUSCRIPT_CHANGES.md`](docs/MANUSCRIPT_CHANGES.md) (Phase 7) for what this replaced.

## Live Application

https://gidoty.github.io/nigerdelta-hsse-tracker/

## Repository

This repository is a dedicated archival mirror of the tracker, split out from a
larger personal-portfolio repository so it can be archived on Zenodo with its
own DOI. The live application above continues to deploy from the portfolio
repository; this repository does not affect that deployment.

https://github.com/Gidoty/gidoty-nigerdelta-hsse-tracker

## Legal Foundation

Constitutionally grounded (CFRN 1999 ss.20, 33, 37, 39, 40) · NOSDRA Act 2006 · Oil Spill
Regulations 2011 s.5 · PIA 2021 · FOI Act 2011 · Nigerian Evidence Act 2011 · NDPA 2023 · African
Charter Art. 24 · Paris Agreement Art. 6.4

## Scientific Methodology

- **Methane emissions**: mass-balance calculation from user-supplied gas volume, CH₄ fraction, and
  combustion efficiency — using the ideal gas law for CH₄ density at a selectable reference
  condition (0/15/20 °C, 101.325 kPa), not a fixed emission factor. See
  [`app/src/utils/methaneCalc.js`](app/src/utils/methaneCalc.js) for the formula and cited
  constants, and [`validation/reference_calcs.py`](validation/reference_calcs.py) for an
  independent Python cross-check.
- **Nigerian associated gas CH₄ fraction**: user-adjustable, defaulting to 0.90 and labelled
  "assumed, not measured" — no verified Niger Delta-specific figure was available at time of
  writing; see [`docs/AUTHOR_ACTION_REQUIRED.md`](docs/AUTHOR_ACTION_REQUIRED.md).
  Combustion efficiency is user-selectable with cited sources per option, plus a sensitivity
  table across a plausible efficiency range.
- **GWP**: IPCC AR6 WGI 2021 (GWP₂₀=82.5, GWP₁₀₀=29.8), consistently from the same assessment
  report.
- **Evidence integrity**: SHA-256 over a canonically-serialized (sorted-key) evidence payload,
  with mutable state (NOSDRA notification, cleanup status, evidence-status upgrades) recorded
  separately in an append-only, hash-chained event log (Nigerian Evidence Act 2011 ss.84-87).
  This detects later tampering with a saved record; it does not establish that a report is true,
  who made it, or its legal admissibility.

## Validation

- 76 unit tests (Vitest) covering the emissions calculator, the integrity/hashing module,
  evidence-status and regulatory-status replay from the event log, and the
  localStorage-to-IndexedDB migration.
- The methane calculator is cross-checked against an independent, from-scratch Python
  reimplementation at 1×10⁻⁹ relative tolerance (23 test vectors).
- A tamper-detection check confirms the integrity scheme flags fifteen mutation scenarios
  correctly (including event-log truncation and evidence-status tampering) and does not
  false-positive on fields that are meant to change after submission.
- A cross-implementation check confirms the JS app and the independent Python verifier agree
  byte-for-byte on canonical serialization and hashing, including 4,014 seeded number-format
  edge cases.
- A manual protocol (`validation/offline_test.md`) verifies device-local, no-sync storage on real
  hardware; results for three Android phones are in `validation/results/offline_trials.csv`.

Run `bash validation/run_all.sh` to execute the automated checks and regenerate
`validation/results/SUMMARY.md` from the real output.

## Tech Stack

React 18 · Vite · Tailwind CSS · React Router v6 · Leaflet.js · leaflet.heat · Recharts · Web
Crypto API · IndexedDB · Service Worker PWA

## AI Assistance

Portions of this codebase were developed with AI coding assistance (Claude, Anthropic). See
[`docs/AI_ASSISTANCE.md`](docs/AI_ASSISTANCE.md) for what was and wasn't AI-assisted, and how
outputs were verified.

## Disclaimer

Community monitoring tool. Data constitutes community observations and does not replace formal
regulatory investigation. All reports are labelled as community-submitted. The platform does not
transmit data to regulators or anyone else automatically — every report stays on the reporting
device until the reporter explicitly exports or shares it.

## Licence

MIT Licence · © 2026 Gideon Owhonda — see [`LICENSE`](LICENSE).
