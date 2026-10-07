#!/usr/bin/env python3
"""Python side of the property-based mutation check (Task B.2, EMAS step 3).

app/src/utils/integrity.propertyMutation.test.js uses fast-check to pick
many random (base record, field, replacement value) combinations, mutate
a sealed record at that one field, and check whether the JS verifyReport()
flags it — expected for fields in the evidence payload, the event log, or
the cross-checked stored-status fields; expected NOT to be flagged for
declared-mutable or currently-excluded fields. It exports every mutated
record it actually generated to validation/results/property_mutations.json.

This script re-verifies the exact same mutated records with the
independent Python reference implementation (validation/canonical.py,
built from scratch from the documented algorithm, sharing no code with
the JS app) and reports whether Python agrees with JS on every one.

Run after the JS test (which must run first to produce the export file):
    python3 validation/property_mutation_check.py
"""
import json
import os
import sys

from canonical import verify_report

HERE = os.path.dirname(os.path.abspath(__file__))
EXPORT_PATH = os.path.join(HERE, 'results', 'property_mutations.json')
REPORT_PATH = os.path.join(HERE, 'results', 'property_mutation_check.json')


def is_flagged(v):
    return v.get('payloadValid') is False or v.get('eventChainValid') is False \
        or v.get('statusConsistent') is False or v.get('eventLogComplete') is False


def main():
    if not os.path.exists(EXPORT_PATH):
        print(f'{EXPORT_PATH} not found -- run the JS test '
              f'(npm test -- integrity.propertyMutation, from app/) first.', file=sys.stderr)
        return 2

    with open(EXPORT_PATH) as f:
        data = json.load(f)

    counts = {}
    mismatches = []
    for entry in data['records']:
        category_key = 'protected' if entry['shouldDetect'] else 'mutable'
        counts.setdefault(category_key, {'attempted': 0, 'pythonCorrect': 0, 'agreesWithJs': 0})
        counts[category_key]['attempted'] += 1

        py_verdict = verify_report(entry['record'])
        py_flagged = is_flagged(py_verdict)
        py_correct = py_flagged == entry['shouldDetect']
        agrees_with_js = py_flagged == entry['detected']

        if py_correct:
            counts[category_key]['pythonCorrect'] += 1
        if agrees_with_js:
            counts[category_key]['agreesWithJs'] += 1
        else:
            mismatches.append({
                'target': entry['target'],
                'category': entry['category'],
                'shouldDetect': entry['shouldDetect'],
                'jsDetected': entry['detected'],
                'pythonDetected': py_flagged,
            })

    total_attempted = sum(c['attempted'] for c in counts.values())
    total_python_correct = sum(c['pythonCorrect'] for c in counts.values())
    total_agrees = sum(c['agreesWithJs'] for c in counts.values())

    report = {
        'generatedBy': 'validation/property_mutation_check.py',
        'sourceExport': 'validation/results/property_mutations.json',
        'recordsChecked': total_attempted,
        'byCategory': counts,
        'pythonAllCorrect': total_python_correct == total_attempted,
        'pythonAgreesWithJsOnAll': total_agrees == total_attempted,
        'mismatches': mismatches,
    }
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2)

    print(f'Re-verified {total_attempted} fast-check-generated mutated records in Python.')
    for key, c in counts.items():
        print(f"  [{key}] attempted={c['attempted']} pythonCorrect={c['pythonCorrect']} agreesWithJs={c['agreesWithJs']}")
    print(f'Python correct on all records: {report["pythonAllCorrect"]}')
    print(f'Python agrees with JS on all records: {report["pythonAgreesWithJsOnAll"]}')
    print(f'Wrote {REPORT_PATH}')

    if not report['pythonAllCorrect'] or not report['pythonAgreesWithJsOnAll']:
        print('FAIL: see mismatches in the report', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
