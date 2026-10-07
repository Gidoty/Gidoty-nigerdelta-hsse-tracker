# Nigeria site matching across the three EOG VIIRS files

This covers Task B step 4: flagging Nigerian sites that appear in one
file but not another, and stating exactly how sites were matched. No
site was merged or averaged across years or files — every row in
`data/public/nigeria_flares.csv` is exactly as it appears in its source
workbook; this file only cross-references site IDs between workbooks.

## What "the other source" means here

The original Task B asked to cross-check Nigerian sites between two
*providers*: World Bank GFMR and EOG VIIRS. No World Bank file was ever
supplied to this session (`docs/emas/BLOCKERS.md` — that download is
still blocked). The three files actually provided are all EOG VIIRS,
one release per year (2022, 2023, 2024). So the only "appears in one
source but not the other" comparison this session can make, honestly, is
**year-to-year within the single EOG VIIRS source** — not
provider-to-provider. That comparison is reported below. The
provider-to-provider comparison remains undone; do not read anything
below as substituting for it.

## How sites were matched

Not by distance, name, or any invented key. The 2023 and 2024 workbooks
carry the provider's own cross-year ID-matching columns, used exactly as
given:

- The 2023 file's `id2022` column states, for each 2023 row, which 2022
  `ID 2022` value (if any) the provider matched it to.
- The 2024 file's `ID2023` column states, for each 2024 row, which 2023
  `ID 2023` value (if any) the provider matched it to. (The 2024 file
  also carries an `IDMYC` column — a separate provider-internal
  multi-year composite ID — which is preserved in
  `data/public/nigeria_flares.csv` but not used for this matching, since
  `ID2023` is the column that explicitly links to the 2023 file's own
  primary key.)

A 2022 Nigerian site is counted as carried into 2023 if its `ID 2022`
value appears in at least one 2023 Nigerian row's `id2022` column, and
likewise for 2023→2024 via `id2023`/`ID2023`. Matching was done on the ID
value alone (not restricted to the same flare-category sheet), since IDs
are assigned from one global pool per release and `Type` only classifies
what kind of flare each ID is, per the files' own structure.

## Results

### 2022 → 2023 (165 Nigerian sites in 2022; 168 in 2023)

- **12** sites present in the 2023 file with no `id2022` back-reference —
  i.e. new detections the provider did not match to any 2022 site:
  site IDs 5912, 5913, 5923, 5945, 5955, 5965, 5966, 5986, 5999, 6060,
  6088, 6100.
- **17** sites present in the 2022 file whose `ID 2022` value is not
  referenced by any 2023 row's `id2022` — i.e. sites the provider did not
  carry forward into (or re-match in) the 2023 release: site IDs 5769,
  5773, 5776, 5791, 5804, 5809, 5818, 5828, 5830, 5836, 5838, 5841, 5905,
  5926, 5928, 5935, 5960.

### 2023 → 2024 (168 Nigerian sites in 2023; 187 in 2024)

- **17** sites present in the 2024 file with no `id2023` back-reference:
  site IDs 6999, 7019, 7026, 7028, 7030, 7035, 7041, 7058, 7065, 7091,
  7097, 7098, 7159, 7161, 7174, 7180, 7219.
- **12** sites present in the 2023 file whose `ID 2023` value is not
  referenced by any 2024 row's `id2023`: site IDs 5917, 5965, 5979, 5986,
  5989, 5991, 5996, 6038, 6052, 6064, 6067, 6068.

Two site IDs — 5965 and 5986 — appear in both "new in 2023" and "not
carried into 2024," meaning the provider detected and matched that
location only in the 2023 release.

These counts are an unavoidable reading of the provider's own ID-matching
columns, not a judgement about whether a flare physically started or
stopped — the provider's detection/matching process can itself miss or
gain a site between releases for reasons (algorithm changes, satellite
coverage, threshold changes) this session has no way to check from the
files alone.
