# Mutation testing summary (Stryker)

Scope: `app/src/utils/methaneCalc.js` and `app/src/utils/integrity.js` only
(Task C.2, EMAS step 3). Run with `npx stryker run` from `app/`, using
`app/stryker.conf.json` and the `command` test runner (vitest's own
Stryker plugin produced unreliable "NoCoverage" results against this
project's Vitest 5 — see "Known tooling issue" below, which is why the
command runner is used instead).

**Important scoping caveat:** Stryker's sandbox only copies `app/`, so it
can only run test files with no dependency outside that directory. That
excludes `crossImplementation.test.js` and
`integrity.propertyMutation.test.js`, both of which reach into
`../../../validation`. The scores below reflect mutation coverage from
`methaneCalc.test.js` and `integrity.test.js` alone — the project's full
test suite (which also includes the fast-check property-based mutation
tests and the cross-implementation check) almost certainly kills some
mutants these two files leave surviving, particularly around the
`statusConsistent`/`eventLogComplete` cross-checks that
`integrity.propertyMutation.test.js` exercises directly. The numbers here
are Stryker's real output for the scope it could run, not an estimate.

## Score before adding tests for survivors

| File | Mutation score | Killed | Survived | Total |
| --- | --- | --- | --- | --- |
| All files | 66.74% | 319 | 159 | 478 |
| integrity.js | 64.93% | 174 | 94 | 268 |
| methaneCalc.js | 69.05% | 145 | 65 | 210 |

(`coverageAnalysis: "off"` — every mutant is run against the full scoped
test suite; there were 0 "no coverage" and 0 timeout/error mutants in
either run.)

## Tests added for survivors

Twelve tests were added (`app/src/utils/methaneCalc.test.js`,
`app/src/utils/integrity.test.js`) targeting real behavioral gaps found
by reading the surviving mutants — not every survivor, and not mutants
judged equivalent (see below):

- `calculateCO2Equivalent` rejecting non-finite-but-not-negative input
  (e.g. `NaN`) — the validation is `!isFinite(x) || x < 0`; no prior test
  separated these two conditions.
- `calculateCO2FromMethaneCombustion` missing a parallel validation-error
  test suite — `calculateCH4Slip` had one, `calculateCO2FromMethaneCombustion`
  did not (missing volume source, out-of-range combustion efficiency).
- `inputs.ch4FractionSource` recorded as `null` (not left `undefined`)
  when the caller omits it, for both calculator functions.
- `defaultsUsed.referenceConditionId` correctness for both the default
  and a non-default reference condition, for both calculator functions.
- Four isolated single-field `statusConsistent` mismatches (nosdraNotified
  alone, nosdraNotifiedAt alone, evidenceStatus.level alone — cleanupStatus
  already had one), each holding the other three fields consistent. The
  existing tests always changed two fields together (e.g. nosdraNotified
  and nosdraNotifiedAt at once), which happens to also catch an `&&`→`||`
  mutant at the wrong adjacent pair; an isolated single-field mismatch is
  the case that actually requires all four terms to be AND'ed, not OR'ed,
  together.
- `deriveEvidenceLevel`: an `independently_verified` event with only
  `verification.reference` (no `source`) must not count as an upgrade —
  only the symmetric case (`source` with no `reference`) was tested
  before.
- `buildEvidencePayload` defaulting every optional field (`subType`,
  `duration`, `description`, `location.gps/display/lga/landmark`,
  `health.*`, `language`, `consentVersion`, `appVersion`) to `null`/`[]`/`''`
  when the input report omits them — only the "all fields present" case
  was tested before.
- `sealReport` defaulting `photoHashes` and `events` to `[]` when
  `evidence`/`events` are absent from the input report.

## Score after adding tests for survivors

| File | Mutation score | Killed | Survived | Total |
| --- | --- | --- | --- | --- |
| All files | 74.69% | 357 | 121 | 478 |
| integrity.js | 72.39% | 194 | 74 | 268 |
| methaneCalc.js | 77.62% | 163 | 47 | 210 |

## Remaining 121 survivors, by mutator type

| Mutator | Count | Why they were left |
| --- | --- | --- |
| StringLiteral | 51 | Mostly error-message text, citation/source strings, and formula-documentation strings (e.g. replacing a citation with `""`). Killing these would mean asserting exact prose in tests, which is brittle and tests wording, not behavior. |
| OptionalChaining | 20 | Largely in `verifyReport`'s `report.regulatory?.x` / `report.integrity?.x` reads, where the object is always present by the time these run in practice (sealReport always creates `regulatory`/`integrity`); removing `?.` doesn't change behavior for any input these functions are ever actually called with. |
| ConditionalExpression | 12 | Several are the `defaultsUsed`/`referenceConditionId === DEFAULT` ternaries reduced to always-true/always-false — a few of these were fixed (see above); remaining ones are mostly in rarely-exercised branches of `verifyReport`'s legacy-record early return. |
| ArrayDeclaration | 12 | Replacing a real array (e.g. `sources: [...]`, `symptoms: []`) with `["Stryker was here"]` or `[]` — again mostly documentation/citation content, not computed values. |
| LogicalOperator | 11 | A mix of genuine remaining gaps (further `&&`/`||` positions in `statusConsistent` and `deriveEvidenceLevel` not yet isolated) and some that are equivalent given the surrounding validation (see below). |
| CallExpression | 7 | Includes the equivalent-mutant case below (`validateReferenceConditionId` called twice). |
| BlockStatement | 4 | Emptying an `if` body or function body in branches already covered by the ConditionalExpression/LogicalOperator survivors above. |
| ObjectLiteral | 4 | Replacing a returned object with `{}` — in each remaining case, no test reads enough of that specific object's fields to notice. |

### A known equivalent mutant

`calculateCH4Slip` and `calculateCO2FromMethaneCombustion` both call
`validateReferenceConditionId(referenceConditionId)` directly, and then
call `ch4Density(referenceConditionId)`, which calls
`validateReferenceConditionId` again internally. Removing the first
(explicit) call is a mutant that **cannot be killed by any test**,
because the second call still throws for the same bad input — the
observable behavior is identical either way. This is a textbook
equivalent mutant, not a test gap; no test was written to "kill" it.

## Known tooling issue

`@stryker-mutator/vitest-runner` (the dedicated Vitest plugin for
Stryker) reported **0% coverage for every mutant in both files**
regardless of `coverageAnalysis` setting (`perTest`, `all`, or `off`),
even though Vitest's own coverage run independently shows 90%+ statement
coverage for both files. Running with `--fileLogLevel debug` crashed with
`TypeError: Converting circular structure to JSON` while serializing
Vitest's internal config object — evidence of a real incompatibility
between this Stryker plugin (`@stryker-mutator/core`/`vitest-runner`
10.0.0, the latest published major) and Vitest 5.0.3. Switching to
Stryker's generic `command` runner (`npx vitest run
src/utils/methaneCalc.test.js src/utils/integrity.test.js` per mutant)
sidesteps the plugin entirely and produced the real, trustworthy scores
reported above — at the cost of running the full two-file test suite for
every mutant rather than only the tests that actually cover each one,
which is why this run took close to six minutes rather than a few
seconds.
