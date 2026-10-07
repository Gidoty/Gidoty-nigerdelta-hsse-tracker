# Release notes — 0.2.0

Changes since the `v0.1.0` tag (commit `25243ff`, this repository's
initial import). A note on `CHANGELOG.md`: its "Unreleased — academic
submission audit" section describes the pre-existing JEAS-era audit
(mass-balance calculator, integrity rework, IndexedDB migration, and so
on) — that work was already present in the code `v0.1.0` was tagged
from, so it is not part of this release's actual delta. Everything below
is new between `v0.1.0` and this release (EMAS submission preparation,
steps 1–4, all on 2026-10-07).

## Application changes (step 3 — interface and labelling only; the
calculator's mathematics and the integrity algorithm are unchanged)

- Combustion-efficiency presets in the Methane Emissions and CO₂-from-
  Combustion calculators now offer three sourced values — 98% (design
  assumption, IPCC 2006), 95.2% (lit flares, measured, Plant et al.
  2022), and 91.1% (fleet effective value including unlit flares, Plant
  et al. 2022; explicitly labelled "not a single-flare efficiency") —
  plus a custom value, replacing the previous two-option set.
- The CH₄ fraction input no longer silently defaults to 90%. It is now a
  required input, and the source of that value — measured, published, or
  assumed — must be explicitly selected before a result is shown.
- Every CO₂ figure is labelled "methane fraction only" and every CO₂e
  figure "methane slip only," with an on-screen note that non-methane
  (C2+) hydrocarbons, CO₂ already present in the gas, and non-ideal-gas
  behaviour are not modelled.
- The app now requests persistent storage (`navigator.storage.persist()`)
  at load and shows the result in the footer; the post-submission screen
  now reminds the reporter to export a copy and offers an export button
  directly from that screen.
- The footer shows the build's version and short commit hash.

## Integrity evidence and test quality (step 3)

- `docs/THREAT_MODEL.md`: a threat table (detected yes/no/conditional,
  which check, condition) for the report-integrity scheme, including the
  case it cannot detect — a person with device storage access who
  rewrites a record and recomputes every hash before any export exists.
- Property-based mutation testing (fast-check): 300 random single-field
  mutations of sealed records, each classified as a field the scheme
  must flag or one it must not, re-verified in Python
  (`validation/property_mutation_check.py`) for cross-implementation
  agreement (300/300 agreed).
- Statement/branch/function/line coverage measured for the calculator
  and integrity modules (`validation/results/coverage_summary.json`).
- Mutation testing (Stryker) on the same two modules: 66.74% → 74.69%
  after adding targeted tests for real survivors (see
  `validation/results/mutation_testing_summary.md` for the full
  before/after breakdown and the one identified equivalent mutant).
- `docs/emas/HAND_CHECK.md`: three fully worked arithmetic vectors so the
  calculator's output can be checked by hand.

## EMAS assessment (steps 1–2)

- `scripts/emas/`: extracts Nigerian flare sites from the raw EOG VIIRS
  provider workbooks, runs the app's own (unmodified) methane calculator
  across every site-year under 27 scenario combinations
  (`scripts/emas/scenarios.json`), and cross-checks every value against
  an independent Python re-implementation at a 1×10⁻⁹ relative-error
  threshold.
- `results/emas/`: the resulting CSVs (site-year estimates with
  uncertainty bounds, national totals by year and scenario, a one-
  factor-at-a-time sensitivity summary, top-20 sites by year, and a
  cross-year site-persistence table) plus `ASSESSMENT_NOTES.md`,
  documenting every assumption, limitation, and data anomaly found
  (including a dangling provider cross-reference and 32 sites south of a
  simple Nigeria land bounding box).
- `scripts/emas/run_all.sh` regenerates every one of these outputs from
  the raw provider files in one command, and has reproduced them
  byte-identically through every subsequent change in steps 3 and 4.

## Corrections and release preparation (step 4)

- See `docs/emas/STEP4_CORRECTIONS.md` for the full record: the 27 stale
  pre-rebuild build-output files removed in step 3 and why; the "1,500+
  site-years" placeholder in `results/emas/ASSESSMENT_NOTES.md`
  corrected to the true count (520); every reference to a specific
  target journal removed from this repository's prose (quoted historical
  text in `docs/emas/REPO_RECORD.md` excepted, for an accurate audit
  trail); and `README.md`'s "25 integrated features" corrected to state
  the real implemented/placeholder split (16/9).
- Version bumped to 0.2.0 (`app/package.json`, `CITATION.cff`,
  `.zenodo.json`); author ORCID added to both citation files.
- `docs/AI_ASSISTANCE.md` extended with a model-and-file breakdown
  covering every phase through step 4.
- `docs/emas/DEPLOY_AND_TRIAL.md`: exact deployment steps and the
  nine-step offline device-trial protocol, with a blank log template.
- `esm/`: five supplementary-material CSVs built from existing outputs
  (calculator test vectors, integrity scenario results and property-test
  counts, a blank offline-trial template, site-year methane estimates,
  and national totals for all 27 scenarios), plus `esm/CAPTIONS.md`.
- `figures/`: `Fig3.tif`/`.pdf` (national methane slip by year and
  destruction efficiency, with volume-uncertainty error bars) and
  `Fig4.tif`/`.pdf` (cumulative share of flared volume by ranked site,
  one line per year), generated by `scripts/emas/make_figures.py` from
  `results/emas/` data with no values altered; `figures/FIGURE_DATA.md`
  states the exact source columns.

No change in this release touches the calculator's mathematics, the
integrity algorithm, or any value in `results/emas/` — confirmed by
re-running `scripts/emas/run_all.sh` after every change and comparing
output hashes.
