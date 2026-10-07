# Nigeria flare data summary (Task B steps 3–4)

Generated from `data/public/nigeria_flares.csv`, produced by
`scripts/emas/extract_nigeria.py` from the three EOG VIIRS files in
`data/public/raw/`. Single source only — see `docs/emas/BLOCKERS.md` for
why World Bank GFMR is absent.

## Nigerian sites per year, per sheet (flare category)

| Year | flare upstream | flare oil downstream | flare gas downstream | Total sites |
| --- | --- | --- | --- | --- |
| 2022 | 161 | 2 | 2 | 165 |
| 2023 | 162 | 2 | 4 | 168 |
| 2024 | 173 | 6 | 8 | 187 |

## Total volume per year, per sheet

Units are each file's own `BCM {year}` column, summed with no
conversion, merging, or averaging across sheets or years.

| Year | flare upstream | flare oil downstream | flare gas downstream | Total (all sheets) |
| --- | --- | --- | --- | --- |
| 2022 | 5.241167 | 0.014707 | 0.149588 | 5.405461 |
| 2023 | 5.655552 | 0.020146 | 0.195482 | 5.871180 |
| 2024 | 6.245553 | 0.092919 | 0.295894 | 6.634367 |

## Columns available

See `data/public/PROVENANCE.md` for the exact column headers of each
source sheet. The extracted `nigeria_flares.csv` carries: `source`,
`year`, `sheet`, `site_id`, `latitude`, `longitude`, `flare_type`,
`volume`, `volume_unit`, plus the raw cross-year ID-matching columns
(`id2022`, `id2023`, `idmyc`) used in `data/public/NIGERIA_SITE_MATCH.md`.

## Provider's stated reference conditions for volume

Not stated in file. Every file's volume column header reads exactly `BCM
{year}` with no accompanying statement, in any sheet, cell comment, or
workbook property, of what "BCM" stands for or what temperature/pressure
the volume is referenced to. See `data/public/PROVENANCE.md` for the
full per-file property check.

## Per-site detail and cross-year matching

Per-row data: `data/public/nigeria_flares.csv` (520 rows: 165 + 168 +
187). Which sites appear in one year but not another, and exactly how
they were matched: `data/public/NIGERIA_SITE_MATCH.md`.
