# Assessment notes

Every assumption, limitation, and data anomaly found while building
`results/emas/*.csv`. Anomalies are reported, not corrected — see the
hard rule in the governing prompt. Numbers here are read from the actual
outputs of `scripts/emas/run_assessment.mjs` and
`scripts/emas/run_assessment_ref.py`; none are hand-typed estimates.

## Data anomalies found

### 1. Zero-volume rows (21 of 520)

21 rows in `data/public/nigeria_flares.csv` have `volume == 0.0`. No row
has a negative volume. `app/src/utils/methaneCalc.js`'s own
`calculateCH4Slip()` rejects `volumeM3 <= 0` via `validateVolumeM3` —
since that module is used unchanged, these 21 rows cannot be run through
it. **They are excluded from every methane-calculator output**
(`full_grid.csv`, `site_year_estimates.csv`, `national_totals_by_year.csv`,
`sensitivity_summary.csv`, and the methane columns of
`top20_sites_by_year.csv`), not assumed to be zero-emission and not
patched around the app's validator. 499 of 520 rows are calculable.

All 21 are `flare upstream` rows:

| Year | Site IDs |
| --- | --- |
| 2022 | 5769, 5791, 5800, 5809, 5818, 5830, 5926 |
| 2023 | 5979, 5991, 5995, 5996, 6052, 6056, 6064, 6065, 6068 |
| 2024 | 7077, 7196, 7207, 7210, 7211 |

A genuinely zero flared volume for a cataloged flare site is physically
plausible (temporarily shut in, under repair, or below the detection
threshold for that year), but this session has no way to confirm which,
and did not try to guess.

### 2. Sites south of a simple Nigeria land bounding box (32 of 520)

Checked every row's `(latitude, longitude)` against a simple rectangular
box for mainland Nigeria (4.0–14.0°N, 2.5–14.8°E — an approximate,
commonly used extent, not an official boundary). 32 rows fall south of
it, at 3.0–4.0°N, all in the `flare upstream` sheet, across all three
years. **This is not necessarily an error**: Nigeria's maritime
Exclusive Economic Zone extends well south of the mainland coastline
into the Gulf of Guinea, and Nigerian-licensed offshore oil fields
(e.g. deepwater/shelf platforms) legitimately sit south of this land-only
box. The same near-identical coordinates recur across 2022/2023/2024
(e.g. ≈3.47°N, 5.56°E appears as site 5900 in 2022, 6031 in 2023, and
7134 in 2024) — consistent with the same offshore platform being
tracked year to year, not a data-entry error. No row was found north,
east, or west of the box; no row was found at an obviously-wrong
coordinate (e.g. (0,0), or on land in a different country). This is
reported as a flag for the author to confirm against known offshore
licence-block locations, not corrected.

### 3. No duplicate rows found

Checked for repeated `(year, site_id)` pairs and for exact full-row
duplicates across all 520 rows: zero of either. (This is a negative
finding, stated because the task asked to check for it, not omitted
because there was nothing to report.)

### 4. A dangling cross-year ID reference (site 6068, 2023)

Building `site_persistence.csv` found one 2023 row (`flare upstream`,
site ID 6068) whose `id2022` back-reference is `5950` — but `ID 2022 ==
5950` does not exist anywhere in the 2022 file's `flare upstream` sheet
at all (checked the full sheet, not just the Nigeria subset). The
provider's own cross-year matching column points to a record that was
never in the 2022 release. `scripts/emas/lib/persistence.mjs` treats
this the same as a genuinely new 2023 site (no working back-reference),
which is why `site_persistence.csv` reports 3 "only in 2023" sites
(5965, 5986, 6068), one more than the 2 found by eye while writing
`data/public/NIGERIA_SITE_MATCH.md` in step 1 — that earlier count only
cross-referenced two lists of IDs and did not check whether a stated
`id2022` value actually resolves to a real row. This script's count is
the correct one; `NIGERIA_SITE_MATCH.md` is left as written (it is
step 1's historical record) rather than edited after the fact. Site 6068
is also one of the 21 zero-volume rows above — both anomalies land on
the same row.

### 5. Header wording and ID-scheme differences between the three provider files

Already documented in `data/public/PROVENANCE.md` and
`data/public/NIGERIA_SITE_MATCH.md`; restated here because it directly
affects this assessment's `site_persistence.csv`: the 2024 file's
`ID 2024` numbering restarts from 1 and is not on the same scale as
`ID 2022`/`ID 2023`, and only carries a one-year-back `ID2023`
reference (no full `id2015`–`id2022` chain as the 2023 file has). The
2024 file's `Type` values also drop the `oil`/`gas` suffix used in 2022/2023
(`upstream` vs. `upstream oil`/`upstream gas`).

## Assumptions

- **Single data source.** Only EOG VIIRS Nightfire data is used. No
  World Bank GFMR file was ever obtained (session network policy
  blocked both source sites — see `docs/emas/BLOCKERS.md`), so there is
  no second source to cross-validate flared volumes against.
- **`volumeSource` passed to the calculator**: `'satellite_estimate'`,
  the closest of the app's three `VOLUME_SOURCE_OPTIONS` to EOG VIIRS
  satellite-detected volumes (the other two options are
  `'operator_data'` and `'user_assumption'`, neither of which describes
  this data).
- **Methane volume fraction (0.75 / 0.85 / 0.95)**: all three are marked
  `"PROVISIONAL, source AUTHOR TO PROVIDE"` in `scripts/emas/scenarios.json`
  — none is backed by a citation yet. Every output derived from these
  values inherits that provisional status.
- **Destruction efficiency** values (0.98 IPCC 2006; 0.952 and 0.911,
  both Plant et al. 2022) are sourced, but both Plant et al. figures were
  measured on US basins, not Nigerian ones — applying them to Nigeria is
  an assumption of transferability this assessment does not test.
- **Reference temperature** (0/15/20°C at 101.325 kPa) is a user-chosen
  scenario grid, not a value the provider states for its own `BCM`
  volumes — see `data/public/PROVENANCE.md`: no file states what
  temperature/pressure its volume figures are referenced to.
- **Volume uncertainty (±9.5%, Elvidge et al. 2016)** is applied
  uniformly to every site and year in `site_year_estimates.csv`'s low/high
  bounds. The actual uncertainty is very unlikely to be uniform across
  1,500+ site-years spanning three releases; no per-site or per-year
  uncertainty is available to use instead.
- **GWP (82.5 20-yr, 29.8 100-yr, AR6 fossil methane)** — a single
  source, not varied in the scenario grid at all (only destruction
  efficiency, methane fraction, and reference temperature are varied).

## Limitations

- **Top-down, not metered.** All volumes are satellite-detected
  estimates (EOG VIIRS Nightfire), not operator-reported, metered
  volumes. Every figure in this assessment inherits whatever error is in
  that detection/retrieval process, on top of the three scenario
  dimensions this assessment does vary.
- **CO₂ figures cover methane combustion only.** Every `co2_*` column is
  labelled `methane_fraction_only` and excludes C2+ hydrocarbons, exactly
  as `methaneCalc.js`'s own `calculateCO2FromMethaneCombustion()` is
  documented to do. It is not a total flare CO₂ estimate.
- **CO₂e figures cover methane slip only.** Every `co2e_*` column is
  labelled `methane_slip_only` — it converts the unburned-methane mass
  to CO₂-equivalent; it is not an estimate of total flare greenhouse-gas
  impact (which would also include the CO₂ from the burned fraction and
  any other combustion products).
- **Cross-year site matching is the provider's own algorithm.** Entries
  and exits reported in `site_persistence.csv` reflect EOG's own
  id2022/id2023 matching, which this session cannot independently
  verify — a site could appear "new" or "dropped" because of a change
  in EOG's detection or matching process, not because flaring actually
  started or stopped.
- **Sensitivity analysis is one-factor-at-a-time**, not a full
  variance decomposition — `sensitivity_summary.csv` holds two of the
  three varying factors at their central value while sweeping the third,
  so it does not capture interaction effects between factors.
- **No uncertainty propagation beyond volume.** The ±9.5% bound in
  `site_year_estimates.csv` is applied to volume only; destruction
  efficiency and methane fraction uncertainty are instead handled by
  running the full scenario grid (`national_totals_by_year.csv`), not
  combined with the volume bound into a single combined uncertainty
  range.

## Cross-implementation check

`scripts/emas/run_assessment_ref.py` independently recomputes every
value in `results/emas/full_grid.csv` using
`validation/reference_calcs.py` (unchanged) and reports the result to
`results/emas/cross_check_report.json`. Latest run: 67,365 values
compared (499 calculable rows × 27 scenarios × 5 fields), 0 missing,
**maximum relative error 0.0**, well under the 1e-9 threshold.
