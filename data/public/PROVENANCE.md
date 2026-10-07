# Provenance — data/public/raw/

Three files were placed in `data/public/raw/` by hand by the author. This
session did not download them (both source websites remain blocked for
this session — see `docs/emas/BLOCKERS.md`) and did not modify them.
Everything below was read directly from each file using `python3 -I`
with `openpyxl`/`pandas`, run from outside this directory, passing each
file's path as an argument, except source URL, download date, and
provider, which the author supplied directly (step 2).

All three are Earth Observation Group (EOG) VIIRS Nightfire annual
flared-gas-volume workbooks (`VIIRS_Global_flaring_d.7_slope_0.029353_*`
naming matches the EOG VIIRS Nightfire flare detection/volume algorithm
family). No World Bank GFMR file is present in this directory.

---

## VIIRS_Global_flaring_d.7_slope_0.029353_2022_v20230526_web.xlsx

- **Size**: 916,257 bytes
- **SHA-256**: `c9fa2ec4440445155be99e44d1bdb88ae3b1a989c54bb788288b248b47d1b8a3`
- **Source URL**: https://eogdata.mines.edu/products/vnf/global_gas_flare.html
- **Download date**: 2026-10-07
- **Provider**: Earth Observation Group, Payne Institute for Public Policy, Colorado School of Mines
- **Licence / terms**: AUTHOR TO PROVIDE (not stated anywhere in the file: no title, description, comments, or notes sheet states a licence)
- **Requested citation**: AUTHOR TO PROVIDE (not stated anywhere in the file)
- **Calibration method / algorithm version**: not stated in file (checked every cell comment, workbook core/extended properties, and the zip package for a custom-properties part — none exists; see note below on what *was* found that is not this)
- **Workbook properties found**: `creator`: "Microsoft Office User", `lastModifiedBy`: "Microsoft Office User"; `created`: 2023-06-06T18:36:42Z, `modified`: 2023-06-06T21:13:23Z (file's own internal timestamps — not the download date above, and not a calibration/algorithm version); extended properties record `Application: Microsoft Macintosh Excel`, `AppVersion: 16.0300` — this is the Excel application's own version number, not a VIIRS Nightfire calibration or algorithm version (no such version string exists anywhere in the file)

**Sheets and column headers** (exactly as they appear, row 1 of each sheet):

| Sheet | Column headers |
| --- | --- |
| `flare upstream` | Country, ISO Code, ID 2022, Latitude, Longitude, BCM 2022, Avg. temp., K, Ellipticity, Detection frequency 2022, Clear Obs., Type |
| `flare oil downstream` | Country, ISO Code, ID 2022, Latitude, Longitude, BCM 2022, Avg. temp., K, Ellipticity, Detection frequency 2022, Clear Obs., Type |
| `flare gas downstream` | Country, ISO Code, ID 2022, Latitude, Longitude, BCM 2022, Avg. temp., K, Ellipticity, Detection frequency 2022, Clear Obs., Type |
| `countries upstream` | Country, ISO Code, BCM 2022, Flare count 2022 |
| `countries oil downstream` | Country, ISO Code, BCM 2022, Flare count 2022 |
| `countries gas downstream` | Country, ISO Code, BCM 2022, Flare count 2022 |

No `id20NN` back-reference columns in this file (it is the earliest of
the three).

---

## VIIRS_Global_flaring_d.7_slope_0.029353_2023_v20230614_web_IDmatch.xlsx

- **Size**: 1,266,299 bytes
- **SHA-256**: `3a4607100413af2d56746d31ede71aea1a698dc1f9edfedd3694f70509470193`
- **Source URL**: https://eogdata.mines.edu/products/vnf/global_gas_flare.html
- **Download date**: 2026-10-07
- **Provider**: Earth Observation Group, Payne Institute for Public Policy, Colorado School of Mines
- **Licence / terms**: AUTHOR TO PROVIDE (not stated in the file)
- **Requested citation**: AUTHOR TO PROVIDE (not stated in the file)
- **Calibration method / algorithm version**: not stated in file (same checks as the 2022 file; none found)
- **Workbook properties found**: `creator`: "Tamara Sparks", `lastModifiedBy`: "Tamara Sparks"; `created`: 2024-06-10T18:36:18Z, `modified`: 2024-06-20T20:44:11Z (file's own internal timestamps, not the download date); extended properties record `Application: Microsoft Macintosh Excel`, `AppVersion: 16.0300` — the Excel application's version, not a VIIRS Nightfire calibration/algorithm version

**Sheets and column headers:**

| Sheet | Column headers |
| --- | --- |
| `flare upstream` | Country, ISO Code, ID 2023, Latitude, Longitude, BCM 2023, Avg temp., K, Ellipticity, Detection freq. 2023, Clear Obs., Type, id2015, id2016, id2017, id2018, id2019, id2020, id2021, id2022 |
| `flare oil downstream` | Country, ISO Code, ID 2023, Latitude, Longitude, BCM 2023, Avg temp., K, Ellipticity, Detection freq. 2023, Clear Obs., Type, id2015, id2016, id2017, id2018, id2019, id2020, id2021, id2022 |
| `flare gas downstream` | Country, ISO Code, ID 2023, Latitude, Longitude, BCM 2023, Avg temp., K, Ellipticity, Detection freq. 2023, Clear Obs., Type, id2015, id2016, id2017, id2018, id2019, id2020, id2021, id2022 |
| `countries upstream` | Country, ISO Code, BCM 2023, Flare count 2023 |
| `countries oil downstream` | Country, ISO Code, BCM 2023, Flare count 2023 |
| `countries gas downstream` | Country, ISO Code, BCM 2023, Flare count 2023 |
| `countries all` | Country, ISO Code, BCM 2023, Flare count 2023 |

Note the header text differs slightly from the 2022 file even where the
meaning is the same: `Avg temp., K` (no period after "Avg") vs. the 2022
file's `Avg. temp., K`, and `Detection freq. 2023` vs. `Detection
frequency 2022`. Quoted exactly as each file has it; not normalized.

---

## VIIRS_Global_flaring_d.7_slope_0.029353_2024_v20240730_web_IDmatch.xlsx

- **Size**: 985,053 bytes
- **SHA-256**: `2fcf6f27fe9d4a4322b62ecf9f89a4a34ad0842c192f3903e9568ae4f32e0ed6`
- **Source URL**: https://eogdata.mines.edu/products/vnf/global_gas_flare.html
- **Download date**: 2026-10-07
- **Provider**: Earth Observation Group, Payne Institute for Public Policy, Colorado School of Mines
- **Licence / terms**: AUTHOR TO PROVIDE (not stated in the file)
- **Requested citation**: AUTHOR TO PROVIDE (not stated in the file)
- **Calibration method / algorithm version**: not stated in file (same checks as the other two files; none found)
- **Workbook properties found**: `creator`: "openpyxl"; `created`/`modified`: 2025-07-30T18:07:42Z (this file was itself last saved by a Python script, not authored directly in Excel/Office — consistent with the generic `Application: Microsoft Excel`, `AppVersion: 3.0` extended properties openpyxl writes by default, which is not a real Office version and not a calibration/algorithm version)

**Sheets and column headers:**

| Sheet | Column headers |
| --- | --- |
| `flare upstream` | Country, ISO Code, ID 2024, Latitude, Longitude, BCM 2024, Avg temp., K, Ellipticity, Detection freq. 2024, Clear Obs., Type, IDMYC, ID2023 |
| `flare oil downstream` | Country, ISO Code, ID 2024, Latitude, Longitude, BCM 2024, Avg temp., K, Ellipticity, Detection freq. 2024, Clear Obs., Type, IDMYC, ID2023 |
| `flare gas downstream` | Country, ISO Code, ID 2024, Latitude, Longitude, BCM 2024, Avg temp., K, Ellipticity, Detection freq. 2024, Clear Obs., Type, IDMYC, ID2023 |
| `countries upstream` | Country, ISO Code, BCM 2024, Flare count 2024 |
| `countries oil downstream` | Country, ISO Code, BCM 2024, Flare count 2024 |
| `countries gas downstream` | Country, ISO Code, BCM 2024, Flare count 2024 |
| `countries all` | Country, ISO Code, BCM 2024, Flare count 2024 |

This file's `ID 2024` numbering restarts from 1 and is **not** on the
same numeric scale as `ID 2022`/`ID 2023` (confirmed: the first `flare
upstream` row is `ID 2024 = 1`, located in the United States, whereas
2022/2023 IDs for comparable rows run in the thousands). This file does
not carry the full `id2015`–`id2022` back-reference chain the 2023 file
has — only `ID2023` (direct link to the 2023 file's own `ID 2023`
column) and `IDMYC`, a separate provider-internal multi-year composite ID
not otherwise explained in the file. Also note the `Type` value for
upstream-category rows is simply `upstream` in this file, where the 2022
and 2023 files use `upstream oil` / `upstream gas` for the same category
— another unflagged wording change between releases, quoted here rather
than silently reconciled.

---

## Units and reference conditions (Task B step 3/4 requirement)

Every file's volume column is headed exactly `BCM {year}` (e.g. `BCM
2022`) — that is the provider's own and only stated label; no file
spells out what "BCM" stands for, and no file states a reference
temperature or pressure condition for that volume anywhere in its
headers, cell comments, or workbook properties. Per the hard rule not to
substitute: **reference conditions for volume: not stated in file.**
