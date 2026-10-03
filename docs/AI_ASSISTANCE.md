# AI Assistance Disclosure

This project used AI coding assistance (Claude, Anthropic) during
development, including a structured audit-and-fix pass ahead of submission
to the Journal of Engineering and Applied Science. This document states
what that assistance did, what it did not do, and how its output was
checked, so a reviewer or reader can weigh the code and the manuscript
accordingly.

## What the AI assistant did

- Wrote and modified source code across the application: the emissions
  calculator, the report-integrity/hashing module, storage and migration
  logic, UI panels, and the service worker.
- Wrote the validation tooling in `validation/` (the Python reference
  implementation, synthetic-data generator, tamper-detection check, and
  export-verification CLI) and the Vitest unit test suite in
  `app/src/utils/*.test.js`.
- Audited the existing codebase against the manuscript's claims,
  identifying and fixing a physically-impossible emission factor, a
  same-device "corroboration" mechanism that could not demonstrate
  independent confirmation, a false claim of automatic background sync,
  and several unverifiable numeric and legal claims.
- Drafted this file and the other Phase 9 documentation
  (`README.md`, `CHANGELOG.md`, `CITATION.cff`,
  `docs/MANUSCRIPT_CHANGES.md`, `docs/AUTHOR_ACTION_REQUIRED.md`).

## What the AI assistant did not do

- It did not invent or guess any numeric constant, emission factor,
  citation, or legal provision. Every constant introduced or kept in the
  emissions calculator carries a source comment in
  `app/src/utils/methaneCalc.js`. Where no verifiable figure was available
  (for example, the Niger Delta associated-gas CH₄ fraction), the value
  was left as an explicit, labelled user input rather than a silent
  default, and the gap is listed in `docs/AUTHOR_ACTION_REQUIRED.md` for
  the author to source or confirm.
- It did not verify legal citations against primary legislative text
  beyond what is noted in `docs/AUTHOR_ACTION_REQUIRED.md` — several
  citations (FOI Act section numbers, a penalty figure, WHO air-quality
  source claims) are flagged there as carried over or unverified and need
  the author's direct confirmation before submission.
- It did not run the manual offline/device test protocol
  (`validation/offline_test.md`) — that requires physical hardware and is
  the author's to execute; `validation/results/offline_trials.csv` is
  still an empty template.
- It did not decide the project's scope or architecture unilaterally.
  Scope decisions — synthetic-only validation, a device-local
  architecture with no server or sync, MIT licensing, and the removal of
  the carbon-credit and corroboration features rather than reworking them
  — were confirmed with the author before implementation.

## How the output was checked

- 60 automated unit tests (Vitest) cover the emissions calculator, the
  integrity/hashing module, evidence-status transitions, and the
  storage-migration logic, including edge cases (invalid inputs, a
  migration that undercounts and must not delete the source data).
- The emissions calculator is cross-checked against a from-scratch,
  independently-implemented Python reference (`validation/reference_calcs.py`,
  sharing no code with the app) at a 1×10⁻⁹ relative tolerance across 23
  test vectors — a transcription error in either implementation would need
  to reproduce identically in both to go undetected.
- A tamper-detection check (`validation/tamper_test.py`) applies nine
  mutation scenarios to 100 synthetic records and confirms the integrity
  scheme flags every genuine tamper case and does not flag legitimate
  post-submission field changes.
- Lint (`oxlint`) and the production build were run after every phase of
  changes.
- A live end-to-end smoke test (report submission through IndexedDB
  storage, dashboard, integrity verification, and export) was run against
  the built app in a browser, not just via unit tests, specifically
  because the storage rewrite was the highest-risk change.

## Human decisions and review

The author (Gideon Owhonda) directed the scope of this audit, approved
each phase's plan before implementation, made the scope decisions listed
above, and is responsible for reviewing this code and the resulting
manuscript changes before submission. The outstanding items in
`docs/AUTHOR_ACTION_REQUIRED.md` are not yet resolved and must be
addressed by the author, not assumed resolved by this disclosure.
