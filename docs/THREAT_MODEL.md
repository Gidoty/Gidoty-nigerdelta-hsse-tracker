# Threat model: the report integrity scheme

Scope: `app/src/utils/integrity.js` (canonical JSON + SHA-256 hashing,
append-only event log, derived-status cross-checks) as described in its own
header comment — a tamper-evidence mechanism, not a truth, authorship, or
admissibility mechanism. "Detected" below means `verifyReport()` /
`validation/canonical.py`'s `verify_report()` returns `False` for at least
one of `payloadValid`, `eventChainValid`, `statusConsistent`,
`eventLogComplete`.

| Threat | Detected | Which check | Condition |
| --- | --- | --- | --- |
| Editing an evidence-payload field after sealing (incident description, severity, type, duration, dateTime; location gps/display/state/lga/landmark; submittedAt; health fields; language/consentVersion/appVersion) | Yes | `payloadValid` | Record is re-verified at all; no further condition — these fields are always part of the hashed payload. |
| Editing embedded photo data (even a single byte) | Yes | `payloadValid` | Photo is still present as a data URL in `evidence.photos`; `photoHashes` is recomputed from current content, not cached. |
| Editing an event's `data` field | Yes | `eventChainValid` | The event's own `eventHash` is recomputed from its signing payload and compared. |
| Breaking the event chain (rewriting a later event's `prevEventHash`) | Yes | `eventChainValid` | Any event after the break fails the `prevEventHash` continuity check. |
| Truncating the event log (dropping trailing events) while leaving `integrity.eventCount`/`headEventHash` at their pre-truncation values | Yes | `eventLogComplete` | Only catches the mismatch between the stored high-water mark and the event array actually present now — see the fully-undetectable row below for what happens when an attacker updates both. |
| Directly editing `report.regulatory.nosdraNotified` / `nosdraNotifiedAt` / `cleanupStatus` without a corresponding `appendEvent` call | Yes | `statusConsistent` | The field's replayed value (from `deriveRegulatoryStatus`) is compared against the stored field; a direct edit with no event makes them diverge. |
| Directly editing `evidenceStatus.level` upward with no supporting event | Yes | `statusConsistent` | `deriveEvidenceLevel` replay diverges from the stored level. |
| Logging an `evidence_status_changed` event claiming `independently_verified` but omitting the required `verification.source`/`reference` | Yes | `statusConsistent` | `deriveEvidenceLevel` does not count an unsupported upgrade, so the stored level (if raised anyway) diverges from the replay. |
| Editing `contact.name`, `contact.phone`, or `audit.userAgent` | No (by design) | — | These are explicitly excluded from the evidence payload (see `buildEvidencePayload`) because they are expected to change after submission; this is intentional, not a gap. |
| Directly editing `regulatory.nuprcNotified`, `operatorResponse`, `jivScheduled`, `jivDate`, `jivCompleted` | No (coverage gap) | — | No event type derives or cross-checks these fields today — unlike NOSDRA notification and cleanup status, there is no `deriveX`/`statusConsistent` term for them. A direct edit to any of these currently passes unnoticed. |
| A false-but-internally-consistent report: fabricated content, correctly hashed at submission time | No | — | Tamper-evidence proves the saved record matches what was hashed at submission; it cannot and does not claim the submitted content is true. Stated directly in `integrity.js`'s header comment. |
| The exported JSON file is altered in transit (e.g., an email attachment edited before NOSDRA opens it) | Conditional | Independent recomputation of `payloadHash` via `validation/verify_export.py` | Only detected if the recipient actually runs the recomputation step; a recipient who opens and trusts the file without recomputing the hash will not notice. |
| A compromised or modified build of the app itself seals records with a different algorithm, or a modified in-app "Verify" screen that always reports success | Conditional | Cross-implementation check (`validation/canonical.py`, built independently from the JS) | Only detected if the record is re-verified on a separate, trusted codebase (the Python reference implementation) rather than trusting the same (possibly compromised) app that produced it. |
| A pre-integrity-rework ("legacy") record, or one with its `integrity` block stripped entirely | Conditional | `verifyReport` returns `payloadValid: null` (not `true`) | Only detected if whoever reads the result treats `null` as "cannot be verified" rather than mistaking it for "verified true" — the four fields are nullable precisely so this case is distinguishable, but that distinction has to actually be read. |
| **A person with access to the device's local storage who rewrites a record's content and recomputes every hash — `payloadHash`, every `eventHash`/`prevEventHash` link, and `integrity.eventCount`/`headEventHash` — so the rewritten record is internally self-consistent, before any copy is ever exported elsewhere** | **No — fundamentally undetectable by this mechanism** | — | **None.** This is the limit case this scheme cannot cover and does not claim to: every value `verifyReport()` checks is itself recomputed from the device's current content. Detecting this requires an independently held copy made *before* the rewrite (an earlier export, given to someone else, compared against the current one) — a control entirely outside `integrity.js`, which is why the app nags the reporter to export and hand off a copy (see Task D's export reminder). This is already flagged in `integrity.js`'s own comments on `sealReport`/`eventCount`. |

## What this table is for

It is a map of where the four boolean checks (`payloadValid`,
`eventChainValid`, `statusConsistent`, `eventLogComplete`) actually reach,
not a claim that the scheme makes reports trustworthy. Two rows are
deliberate non-goals (truthfulness of content; mutability of contact
details); one row is a known, currently uncovered gap (NUPRC/JIV status
fields); and the device-access row is the scheme's fundamental limit,
which only an independently held, earlier export can address.
