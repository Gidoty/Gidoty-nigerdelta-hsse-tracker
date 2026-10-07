# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/). This
project does not yet follow strict semantic versioning tags; entries are
grouped by the audit/development phase that produced them. See
`docs/MANUSCRIPT_CHANGES.md` for the full, manuscript-facing detail behind
each entry below.

## Unreleased — academic submission audit

### Changed

- Replaced the physically-impossible IPCC Tier 1 methane emission factor
  with a mass-balance calculation (ideal gas law CH₄ density × volume ×
  fraction × unburned share), with a user-selectable reference condition,
  combustion-efficiency source, and a sensitivity table.
- Corrected GWP values to consistently use IPCC AR6 (GWP₂₀=82.5,
  GWP₁₀₀=29.8), replacing a mix of AR5/AR6 figures.
- Reworked report integrity hashing into a canonical (sorted-key) JSON
  serialization with a separate, append-only, hash-chained event log for
  mutable state (NOSDRA notification, cleanup status, evidence-status
  changes), so later legitimate updates never require re-hashing the
  original evidence.
- Replaced the same-device "corroboration count" with an evidence-status
  enum (Community Observed / Externally Referenced / Independently
  Verified) that can only advance by citing something outside the app.
- Moved report storage from `localStorage` to IndexedDB, with a one-time,
  count-verified migration of existing records; legacy records are tagged
  and not re-verifiable.
- Rewrote the service worker to precache the full build-time app shell
  from a generated manifest, instead of just the root document.
- Corrected NOSDRA-notification timer and JIV-threshold wording to remove
  an unverified 72-hour legal deadline claim.
- Completed the WHO Air Quality Guidelines reference panel (added ozone;
  separated benzene as a water-quality figure, not an air pollutant).

### Removed

- Carbon-credit potential and data-package panels (project scope,
  synthetic-only validation, has no basis for issuing or pricing actual
  carbon credits); preserved on the `archive/carbon-credit` branch.
- The "submits automatically when you reconnect" claim and all related
  code (Background Sync registration, queued/offline states) — the
  device-local architecture never queued anything; every report was
  already fully saved locally the instant it was created.
- `CorroborationModal.jsx` and the same-device corroboration mechanism it
  implemented.

### Added

- `validation/` — an independent Python re-implementation of the methane
  calculator, 100 synthetic test reports, a tamper-detection check, a
  standalone export-verification CLI, a manual offline/device test
  protocol, and `run_all.sh` to run all of it and write a real-output
  summary.
- 60 Vitest unit tests covering the calculator, integrity/hashing module,
  evidence-status transitions, and the storage migration.
- `dataClass` (`operational` / `developer_test` / `demo`) and `appVersion`
  fields on every report.
- `LICENSE`, `CITATION.cff`, `docs/AI_ASSISTANCE.md`,
  `docs/MANUSCRIPT_CHANGES.md`, `docs/AUTHOR_ACTION_REQUIRED.md`.

## 0.1.0 — Initial build

- Initial release: 25 features across REPORT, MONITOR, CALCULATE, TRACK,
  GENERATE, HEALTH, and DATA categories, built as a React 18 + Vite +
  Tailwind CSS progressive web app.
