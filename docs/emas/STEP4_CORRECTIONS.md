# Step 4 corrections

Factual record of the four corrections requested for step 4 of the EMAS
preparation. Each item states what was found and what was changed; where
nothing needed inventing, that is stated too.

## 1. Files removed with `git rm` in step 3, and why

Step 3 rebuilt the app (`npm run build` in `app/`) after changing its
source (new combustion-efficiency presets, the required CH₄-fraction
source field, result labelling, the persistent-storage hook, and the
footer's build identity). This repository's build output
(`index.html`, `precache-manifest.json`, `assets/*.js`/`*.css`) is
committed directly at the repository root — there is no separate CI
build step (see `app/vite.config.js`'s comment on why `outDir` is the
parent directory). Vite content-hashes every emitted file's name from
its contents, and `emptyOutDir` is deliberately `false` (the output
directory is a parent of the source directory, so emptying it would
delete the source tree itself) — so a rebuild adds new, differently-named
files but never deletes the old ones on its own.

Comparing the freshly built `precache-manifest.json` (written by the
project's own `hsse-precache-manifest` Vite plugin, which lists exactly
what that build emitted) against the files already tracked under
`assets/` found 27 tracked files the new build did not emit — stale
output from the pre-step-3 source, superseded by a same-named *component*
but a new *content hash* because the component's source changed. These
27 were removed with `git rm` (and the equivalent — deleted on disk, then
staged) so the repository does not keep serving or shipping dead,
unreferenced build artifacts:

```
assets/About-CvBNwpiy.js
assets/AffectedPopulationCounterPanel-Bbbf6cNe.js
assets/AppShell-ne3a9QtR.js
assets/BarChart-Cwhlc_qo.js
assets/CleanupBoardPanel-JDfeTMPV.js
assets/Co2CombustionPanel-C-EEP9sW.js
assets/Co2EquivalentPanel-CvUErWZo.js
assets/CommunitySymptomMonitorPanel-DhsNJRdH.js
assets/CsvDataExportPanel-CLUdRWoR.js
assets/FoiRequestDocumentPanel-BzFWaHHq.js
assets/Home-DygdX_cL.js
assets/IncidentFeedPanel-Cu7QWPvx.js
assets/LiveHeatmapPanel-BWP5CXFO.js
assets/MethaneEmissionReportPanel-BZuFdDa0.js
assets/MethaneEmissionsPanel-fo5t3-YN.js
assets/MySubmittedReportsPanel-D5Ap7Qtr.js
assets/NosdraNotificationLetterPanel-B4XRH-2P.js
assets/Report-DdHYPouZ.js
assets/ReportDetailModal-C9MvmJIw.js
assets/ResponseTimeAnalyticsPanel-anHT8YRX.js
assets/TileLayer-BM0e2gqF.js
assets/WhoAqgReferencePanel-CedPSSxy.js
assets/incidentTypes-Be_ef339.js
assets/index-j__piijd.js
assets/methaneCalc-BgoUT7E8.js
assets/useLiveReports-BY3FCq8X.js
assets/useReportsWithDemo-BOAP5jmw.js
```

Each one is a JavaScript (or, in no case here, CSS) chunk that Vite's
code-splitting assigns one per route/lazy-loaded component
(`methaneCalc-*.js` is the shared calculator module every panel imports;
`index-*.js` is the app's entry chunk). `git log --stat` on the step 3
commit shows 9 of these 27 as plain deletions and the other 18 paired by
git's own rename-similarity heuristic with their step-3 replacement
(e.g. `Home-DygdX_cL.js` → `Home-BDJM8-cI.js`) — both are the same
underlying action (old hash removed, new hash added); which way git's
diff algorithm happens to display a given pair depends only on how much
byte content it shares with its replacement, not on anything done
differently file to file.

No file outside `assets/` was removed in step 3. No data file, script,
or document was deleted.

## 2. `results/emas/ASSESSMENT_NOTES.md` — "1,500+ site-years"

`results/emas/ASSESSMENT_NOTES.md` (in the "Volume uncertainty" bullet
under Assumptions) said the ±9.5% bound was applied "uniformly ... across
1,500+ site-years spanning three releases." That figure was never
computed from the data — it reads as a rough, overstated placeholder.
The true count, read directly from `data/public/nigeria_flares.csv`
(`tail -n +2 data/public/nigeria_flares.csv | cut -d, -f2 | sort | uniq
-c`): **520 site-years** (165 in 2022, 168 in 2023, 187 in 2024). The
file has been corrected to state this exact count and its by-year
breakdown instead. No other file in the repository was found to repeat
the "1,500+" figure.

## 3. JEAS references in `docs/emas/REPO_RECORD.md`

See `docs/emas/REPO_RECORD.md` §A.2 directly for the full before/after
table. In short: the five file/line references that §A.2 found naming a
specific target journal (`CHANGELOG.md`, `docs/MANUSCRIPT_CHANGES.md`
×2, `docs/AI_ASSISTANCE.md`, `docs/AUTHOR_ACTION_REQUIRED.md`) were each
reworded to name no journal at all — not the old one, and not a
replacement name either. `docs/emas/REPO_RECORD.md`'s own prose (which
had both named the old target by its acronym and the current submission
by its full journal name) was reworded the same way, so that no file in
this repository's prose names a specific journal, as of this step.

The one remaining occurrence anywhere in the repository is the quoted
historical text inside §A.2's own table — reproduced verbatim as it
stood at the time of the step 1 search, including a quotation from an
already-published commit message in the portfolio repository's history,
which this project's rules against rewriting published history mean
cannot be edited. Quoting superseded text accurately is not the same as
restating it as current.

This correction does not apply to `docs/emas/`, `scripts/emas/`, and
`results/emas/` as directory names, or to the branch names
(`emas-step1`…`emas-step4`) — these are this project's own internal path
convention, established from step 1 onward (including by the task
instructions themselves, which name each step "EMAS paper"), not a
sentence in the repository's prose asserting a submission target.
Renaming them now would break every cross-reference built across three
already-committed steps for no benefit the instruction asked for.

## 4. `README.md`

- "25 integrated features" → corrected to state the real breakdown: 16
  of the 25 catalogued features are implemented and reachable in the
  live app, 9 are shown as placeholders (see
  `docs/emas/REPO_RECORD.md` §A.4 for the category-by-category table
  this count is read from — computed from `app/src/data/parameters.js`'s
  `status` field and cross-checked against `AppShell.jsx`'s panel
  registry, not estimated).
- "NigetDelta" typo: searched every file in this repository
  (`grep -rni nigetdelta`) with no match. It is not in `README.md`,
  `CITATION.cff`, `.zenodo.json`, or anywhere else tracked by git. This
  points to the GitHub repository's own "About" description field, which
  is not version-controlled, not visible to this session, and not
  something this session can change without pushing or touching live
  settings outside git — both ruled out for this step. Flagged instead
  in `docs/AUTHOR_ACTION_REQUIRED.md` (Phase 10) for the author to check
  and fix directly on GitHub.
