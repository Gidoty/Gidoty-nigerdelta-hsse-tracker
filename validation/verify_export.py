#!/usr/bin/env python3
"""Independently verify a report exported from the app's "Export for
Submission" action (src/utils/integrity.js buildSubmissionExport), without
needing Node.js or a browser — for an editor, reviewer, or investigator who
receives an exported .json file and wants to confirm it has not been
altered since the reporter sealed it.

Usage:
    python3 validation/verify_export.py path/to/HSSE-XXXX-export.json

Exits 0 and prints PASS if the payload hash, the event chain, the
regulatory status (NOSDRA notification / cleanup status, replayed from the
event log), and the event-log length all recompute correctly; exits 1 and
prints FAIL with details otherwise. Understands both a raw sealed report
and the export wrapper ({"record": {...}, "verification": {...}}) that
buildSubmissionExport produces.

Note on the event-log length check: it only catches truncation if whoever
truncated the file didn't also update record.integrity.eventCount/
headEventHash to match — see the "on-device protection is limited" note
in docs/MANUSCRIPT_CHANGES.md. Real protection against a sophisticated
truncation comes from comparing this export's eventCount/headEventHash
against an independently-held earlier export of the same record, not from
this script alone.
"""
import json
import sys

from canonical import verify_report


def load_export(path):
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict) and 'record' in data:
        return data['record'], data.get('verification')
    return data, None


def main():
    if len(sys.argv) != 2:
        print('Usage: python3 validation/verify_export.py <exported-report.json>', file=sys.stderr)
        return 2

    record, verification = load_export(sys.argv[1])
    result = verify_report(record)

    print(f"Reference number  : {record.get('referenceNumber', '(unknown)')}")
    print(f"Payload valid     : {result['payloadValid']}")
    print(f"Event chain valid : {result['eventChainValid']}")
    print(f"Status consistent : {result['statusConsistent']}")
    print(f"Event log complete: {result['eventLogComplete']}")
    print(f"Details           : {json.dumps(result['details'], indent=2)}")

    # The export wrapper carries its own eventCount/headEventHash summary
    # alongside the full record — cross-check the two agree, catching a
    # doctored export where only one of the copies was edited.
    if verification is not None:
        record_integrity = record.get('integrity', {}) or {}
        summary_matches = (
            verification.get('eventCount') == record_integrity.get('eventCount')
            and verification.get('headEventHash') == record_integrity.get('headEventHash')
        )
        print(f"Export summary matches record.integrity: {summary_matches}")
        if not summary_matches:
            print('\nFAIL — the export’s top-level verification summary disagrees with record.integrity.')
            return 1

    if result['payloadValid'] is None:
        print('\nUNVERIFIABLE — legacy record, predates canonical hashing.')
        return 1
    if result['payloadValid'] and result['eventChainValid'] and result['statusConsistent'] and result['eventLogComplete']:
        print('\nPASS — record matches its stored hash, event chain, regulatory status, and event-log length.')
        return 0

    print('\nFAIL — record does not match its stored hash, event chain, regulatory status, and/or event-log length.')
    return 1


if __name__ == '__main__':
    sys.exit(main())
