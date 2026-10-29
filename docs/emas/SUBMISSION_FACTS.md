# Submission facts — Environmental Modelling & Software manuscript

Collected 2026-10-29, in this session, from this repository's `main` branch
(local HEAD `5289d82`, which matches `origin/main`) unless stated otherwise.
Every fact below carries where it was read: a file and line, a command and
its real output, or a `git log` entry. Nothing here is estimated or
assumed — where a fact could not be verified, it says `NOT FOUND` and
states exactly where this session looked.

## 1. Unit test counts

- **Calculator module only**: 49 tests.
  Source: `npx vitest run src/utils/methaneCalc.test.js` (run from `app/`),
  this session — real output: `Test Files 1 passed (1)`, `Tests 49 passed (49)`.
- **Total app unit tests**: 100 tests, across 6 files.
  Source: `npx vitest run` (run from `app/`), this session — real output:
  `Test Files 6 passed (6)`, `Tests 100 passed (100)`.
  The 6 files: `crossImplementation.test.js`, `evidenceStatus.test.js`,
  `integrity.propertyMutation.test.js`, `integrity.test.js`,
  `methaneCalc.test.js`, `storage.test.js` (all under `app/src/utils/`).

## 2. Calculator module coverage

- **Statement coverage: 97.1%** (matches the paper's 97.1%).
- **Branch coverage: 94.87%**, which rounds to **94.9%** (matches the
  paper's 94.9%).
  Source: `npx vitest run --coverage` (run from `app/`, v8 coverage
  provider), this session — real output for `methaneCalc.js`:
  `97.1 | 94.87 | 100 | 100` (Stmts / Branch / Funcs / Lines), uncovered
  lines 113, 126.

## 3. Hand-check sheet (`docs/emas/HAND_CHECK.md`)

Three vectors, all with worked arithmetic already filled in (not blank):

| Vector | Inputs | Hand result | App/sheet result | Match column says |
| --- | --- | --- | --- | --- |
| 1 (typical) | V_g=50,000 m³, x_CH4=0.85, η_f=0.98, 15°C | CH₄ slip 0.5767244253 t; CO₂ 77.5211741200 t; CO₂e20 47.5797650868 t; CO₂e100 17.1863878738 t | (no separate app-run column in the doc for vector 1 — it is a standalone hand derivation, not cross-checked against a stored app output in this file) | — |
| 2 (η_f=0.911, Plant et al. 2022) | V_g=100,000 m³, x_CH4=0.85, η_f=0.911, 15°C | CH₄ slip 5.1328473851 t; CO₂ 144.1261012720 t; CO₂e20 423.4599092725 t; CO₂e100 152.9588520766 t | (same — standalone hand derivation) | — |
| 3 (real site-year, 2022 site 5772, central case) | V_g=0.18783718525 BCM → 187,837,185.25 m³, x_CH4=0.85, η_f=0.98, 15°C | CH₄ slip 2,166.6058542454 t; CO₂ 291,227.1828794 t; CO₂e20 178,744.9829752 t; CO₂e100 64,564.8544565 t | `site_year_estimates.csv` central column: 2166.6058542453598 / 291227.18287943106 / 178744.9829752422 / 64564.85445651172 | **Yes** for all four figures |

**Sign-off line is blank**: the document's last line reads
`Verified by / date: ______________________________` with nothing filled
in. Per your instruction, this is reported as blank and not filled in —
no human has recorded signing off on this hand check.

## 4. Date of the first commit

- **This repository** (`Gidoty/gidoty-nigerdelta-hsse-tracker`): first
  commit is `25243ff`, 2026-10-03T01:38:18Z, "Initial import: NigerDelta
  HSSE Tracker archival mirror." This repository has no earlier history —
  it was split out from the portfolio repository as a single import commit.
  Source: `git log --reverse --format="%H %ad %s" --date=iso` (this repo).
- **Other repository the app was developed in**: `Gidoty/Gidoty.github.io`
  (the personal-portfolio repository, present on this machine at
  `/home/user/Gidoty.github.io`). First commit touching the
  `nigerdelta-hsse-tracker/` subtree: `f561cecc`, 2026-09-02T19:38:32Z,
  "Add NigerDelta HSSE Tracker foundation: landing page, routing, PWA
  shell." Source: `git log --reverse --format="%H %ad %s" --date=iso --
  nigerdelta-hsse-tracker/` (portfolio repo).

## 5. Size of the v0.2.0 release

Measured by downloading the real GitHub archive for tag `v0.2.0` this
session (`codeload.github.com`, via `api.github.com/.../zipball|tarball/v0.2.0`)
and checking it with `ls -la` / `du -sb`:

- **Zipball (compressed)**: 5,207,172 bytes ≈ **4.97 MB** (5.21 MB decimal).
- **Tarball (compressed)**: 5,083,000 bytes ≈ **4.85 MB** (5.08 MB decimal).
- **Extracted source code (uncompressed)**: 10,616,486 bytes ≈ **10.12 MB**
  (10.62 MB decimal).

(Binary MB = bytes/1,048,576; decimal MB = bytes/1,000,000. Both given
since "MB" is ambiguous between the two.)

## 6. EOG spreadsheet file names (inputs)

From `ls data/public/raw/` and confirmed against `data/public/PROVENANCE.md`:

- **2022**: `VIIRS_Global_flaring_d.7_slope_0.029353_2022_v20230526_web.xlsx`
- **2023**: `VIIRS_Global_flaring_d.7_slope_0.029353_2023_v20230614_web_IDmatch.xlsx`
- **2024**: `VIIRS_Global_flaring_d.7_slope_0.029353_2024_v20240730_web_IDmatch.xlsx`

## 7. Which repository the deployed app builds from

**NOT independently confirmable via a workflow file — neither repository
has one.** This session looked for `.github/workflows/*` in both
`Gidoty/gidoty-nigerdelta-hsse-tracker` (this repo) and
`Gidoty/Gidoty.github.io` (the portfolio repo, on disk at
`/home/user/Gidoty.github.io`) and found no `.github` directory in
either. A direct check of GitHub Pages' build-source setting via
`gh api repos/Gidoty/Gidoty.github.io/pages` was refused by this
session's proxy (`403: Access to this GitHub API path is not permitted
through this proxy`).

What **is** verifiable:
- This repo's own `README.md` states directly: "The live application
  above continues to deploy from the portfolio repository; this
  repository does not affect that deployment."
- The portfolio repository (`/home/user/Gidoty.github.io`) contains a
  `nigerdelta-hsse-tracker/` directory holding the built app
  (`index.html`, `app/`, `assets/`, etc.), consistent with GitHub Pages'
  "deploy from a branch" mode serving that path directly — not a
  workflow-based deploy.
- The portfolio repo's working tree is clean and at commit `547e4855`
  (2026-09-30T10:53:37+01:00, "Record phone offline trials (3/3 passed)
  and update the protocol"); if the live site reflects that same commit,
  that is the commit it was built from, but this session cannot confirm
  the live page's actual served commit without fetching the public URL,
  which was not done here.

## 8. Creators in CITATION.cff / .zenodo.json

Both files list a single creator/author, **Gideon Owhonda** only:

- `CITATION.cff`: `family-names: Owhonda`, `given-names: Gideon`,
  affiliation "NLNG Centre for Gas, Refining and Petrochemical
  Engineering, University of Port Harcourt", ORCID
  `0009-0003-8826-4747`.
- `.zenodo.json`: `"name": "Owhonda, Gideon"`, same affiliation and ORCID.

**Note**: neither file lists a second author. If Tunji Fadoyeni is a
co-author of the Environmental Modelling & Software manuscript (as
named in your Task 1 instructions in an earlier session), that is not
reflected in either metadata file as they currently stand on `main`.

## 9. Calculator's default methane fraction in the v0.2.0 code

**There is no default.** Confirmed directly in code, two places:

- `app/src/utils/methaneCalc.js` line 60: comment states "Required
  alongside a user-supplied CH₄ fraction — there is no default"; line 72
  throws `RangeError('A CH₄ fraction source (measured, published, or
  assumed) must be selected')` if no source is picked — the calculation
  cannot run without it.
- `app/src/components/appshell/panels/MethaneEmissionsPanel.jsx` line
  269 (UI copy): "There is no default for this value — it must be
  measured for this site, taken from a published source, or stated as
  an assumption."

The two calculator panels (`MethaneEmissionsPanel.jsx`,
`Co2CombustionPanel.jsx`) do initialize their fraction *slider's handle*
to `0.9` via `useState(0.9)` — but this is only the slider's starting
visual position; no calculation can be submitted using it unless the
user also selects a fraction source, which is validated and blocked
otherwise (`methaneCalc.test.js:153`, "rejects an omitted CH4 fraction —
there is no default").

## 10. Node.js, Python, numpy, scipy versions

- **Node.js**: v22.22.2 (`node --version`, this session).
- **Python**: 3.11.15 (`python3 --version`, this session).
- **numpy**: 2.4.6 — already installed in this environment
  (`python3 -c "import numpy; print(numpy.__version__)"`, this session).
- **scipy**: 1.17.1 — **installed by this session** (`pip install scipy`,
  this session; it was not present beforehand —
  `ModuleNotFoundError: No module named 'scipy'` was the first result).
  No `requirements.txt` existed in the repository before this session;
  one was added this session (see "Sensitivity analysis" below).

---

## Files to upload to the separate Zenodo dataset deposit

All five now exist in `supplementary/` (total folder size 198,870
bytes ≈ 0.19 MB binary / 0.199 MB decimal):

- `Supplementary_Data_S1.csv` (166,872 bytes)
- `Supplementary_Data_S2.csv` (12,024 bytes)
- `Supplementary_Data_S3.csv` (5,833 bytes)
- `Supplementary_Data_S4.py` (6,541 bytes)
- `Supplementary_Data_S5.csv` (6,450 bytes)

Upload these five. `supplementary/README.md` (1,150 bytes) is a local
one-line-per-file manifest for this repository, not part of the
dataset itself — upload it too only if you want the manifest archived
alongside the data.

---

## Sensitivity analysis (Task 2)

`scripts/emas/gsa_national_methane_slip.py` (supplied by the author,
written with Claude Opus 5.5 outside this repository — see
`docs/AI_ASSISTANCE.md`) was saved unchanged, had its `V_TOT` constants
set to the unrounded 2022/2023/2024 national volumes from
`results/emas/national_totals_by_year.csv` (5,405,461,030.274345 /
5,871,180,167.0350106 / 6,634,366,552.306519 m³), and was run for real
from `results/emas/` via `python3 -I .../gsa_national_methane_slip.py`,
writing `results/emas/gsa_results.csv`. Every index and threshold this
session was given a paper value to compare against matched at three
decimal places (see the comparison table in this session's chat
reply). `results/emas/` and `data/public/` were re-checked with
`git diff --stat` after a full `scripts/emas/run_all.sh` run and
confirmed byte-identical to before — the new GSA step did not alter
any existing output.
