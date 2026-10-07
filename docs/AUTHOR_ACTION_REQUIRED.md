# Author Action Required

Values, wording, and citations below could not be sourced or verified by this
audit and need the author's direct attention before submission. Nothing in
this list has been silently defaulted in the app — each item is either an
explicit user input with no default, or flagged inline where it appears.

## Phase 7 — new Pidgin consent strings

The following new/changed Pidgin strings in `translations.js` need a native
speaker's check before submission — they were written by this audit, not
translated by a fluent Pidgin speaker:

- `consentStorage` (pidgin): "Your report dey save for this device only. E
  no dey go to NOSDRA, the person wey build this app, or anybody else
  unless na you yourself choose to export am or share am."
- `submitting` (pidgin): "E dey save..."
- `successTitle` (pidgin): "Report Don Save"
- `successText` (pidgin): "We don save your report for this phone/device.
  Reference number:"
- `shareWithNosdra` (pidgin): "This report dey stay for your device. To
  reach NOSDRA, use the notification letter for dashboard, or share this
  reference number directly."

## General finding — unwired components

`src/components/tracker/TimelineCard.jsx`, `EscalationStats.jsx`,
`EscalationTable.jsx`, `FoiGenerator.jsx`, and
`src/components/dashboard/StatsBar.jsx` / `ChartsPanel.jsx` are not imported
or rendered anywhere in the live app — `parameters.js` marks the
TRACK-category features they were presumably built for ("Incident Response
Timeline", "Operator Response Timer", "JIV Status Tracker") as
`status: 'placeholder'`, served by a generic placeholder panel instead. If
the manuscript describes these as implemented features, that is incorrect
and needs correcting. This audit still fixed the wording inside these files
(Phases 4–5) since they are real source code in the repository, but they
remain unreachable from the UI as shipped.

## Phase 1 — Emission calculations

- **CH₄ fraction of Niger Delta associated gas (x_CH4).** The app defaults
  the input to 0.90 and labels it "assumed; not measured." Source a
  published Niger Delta (or Nigerian) associated-gas composition figure —
  NNPC/NUPRC data, an SPE paper, or similar — or confirm 0.90 is the best
  available figure and cite it.
- **"X average passenger cars" / "X average Nigerian households"
  comparison.** This was `calculateContext()` in the old `methaneCalc.js`,
  now deleted. It divided CO₂e by an unverified per-person/per-car annual
  emissions figure sourced only as "IEA (2023)" with no report or table
  cited. If you want this comparison back in the app, find and cite the
  specific IEA (or other) table it should use.

## Phase 5 — Legal wording

- **72-hour JIV threshold.** The old `TimelineCard.jsx` displayed "JIV not
  yet scheduled (72h+ elapsed)" as if this were a legal deadline. No
  provision citing a specific 72-hour JIV-scheduling duty was found in the
  NOSDRA Act 2006 or the Oil Spill Regulations 2011 during this audit. If
  such a provision exists, cite the section and the app can reinstate the
  threshold with that citation. Otherwise it stays removed.
- **FOI Act 2011 citations.** `FoiRequestDocumentPanel.jsx` and
  `trackerUtils.js` cite "Section 4" for the 7-day response duty and
  "Section 7" for stating grounds of denial. These were left unchanged per
  instruction, but were not independently re-verified against the Act's
  text during this audit — please confirm both section numbers before
  submission.

## Phase 6 — WHO air-quality panel sources

The following sources in `whoAqgData.js` were carried over from the
pre-existing app content and were not independently verified against the
original paper/report during this audit. Please confirm the DOI, the exact
figure cited, and that it says what the app claims it says:

- Nwosisi et al. 2021, *Scientific African* (PM2.5, SO₂ exceedance figures)
- Zabbey et al. 2021 (PM10 exceedance claim)
- HumAngle Media / Obrikom study, 2024 (NO₂, CO claims)
- Wami-Amadi & Chisom Faith (2025) (exceedance summary text)

## Phase 8 — Offline device trials (done, two details to confirm)

Trials ran on 30 September 2026 on three Android phones in Chrome; all nine
steps passed (`validation/results/offline_trials.csv`). Still to confirm:
the Android version of the Redmi 13C (reported as "14TP1A"; TP1A is an
Android 13 build prefix) and the Chrome versions on the Huawei P30 Pro and
Tecno Spark 10 Pro (Chrome → Settings → About Chrome).

## Phase 9 — Archival DOI

An academic submission requires an archived version of the software with
a DOI (e.g. via Zenodo). The dedicated GitHub repository this needs (rather than a
subdirectory of a personal portfolio site) now exists —
https://github.com/Gidoty/gidoty-nigerdelta-hsse-tracker — but connecting
it to Zenodo, creating the GitHub release that triggers the archive, and
confirming the minted DOI are account actions only the author can take.
Once a release is published and Zenodo mints a DOI, add it to
`CITATION.cff`'s `doi` field (left out deliberately until then) and to
this repository's description.

## Phase 10 — GitHub repository description typo

Step 4 of the EMAS preparation was asked to fix a "NigetDelta" typo in
the repository description. It does not appear in any tracked file —
`README.md`, `CITATION.cff`, `.zenodo.json`, and every other file in this
repository were searched (`grep -rni nigetdelta`) with no match. This
means it most likely lives in the GitHub repository's own "About"
description field (Settings → general repo settings), which is not
version-controlled and not accessible from this session. Please check
that field directly on
https://github.com/Gidoty/gidoty-nigerdelta-hsse-tracker and correct it
to "NigerDelta" if it is misspelled there.
