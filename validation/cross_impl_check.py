#!/usr/bin/env python3
"""Python side of the cross-implementation check (see
app/src/utils/crossImplementation.test.js, which must run first).

1. Verifies every JS-sealed export in validation/results/js_exports/ with
   the independent Python verifier.
2. Confirms the Python number formatter reproduces ECMAScript number
   formatting for every seeded vector written by the JS test.
3. Reads the JS-side result (Python-sealed records verified in JS).

Writes validation/results/cross_implementation.json. Standard library only.
"""
import glob
import json
import os
import struct
import sys

from canonical import _js_number, verify_report

HERE = os.path.dirname(os.path.abspath(__file__))
RESULTS = os.path.join(HERE, 'results')


def passes(v):
    return all(v.get(k) is True for k in ('payloadValid', 'eventChainValid', 'statusConsistent', 'eventLogComplete'))


def main():
    exports = sorted(glob.glob(os.path.join(RESULTS, 'js_exports', '*.json')))
    js_export_pass = 0
    for path in exports:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        record = data['record'] if 'record' in data else data
        if passes(verify_report(record)):
            js_export_pass += 1

    with open(os.path.join(RESULTS, 'number_format_vectors.json')) as f:
        vectors = json.load(f)
    mismatches = []
    for v in vectors:
        x = struct.unpack('>d', bytes.fromhex(v['bits']))[0]
        py = '0' if x == 0 else _js_number(x)
        if py != v['js']:
            mismatches.append({'bits': v['bits'], 'python': py, 'js': v['js']})

    with open(os.path.join(RESULTS, 'cross_impl_js.json')) as f:
        js_side = json.load(f)

    summary = {
        'generatedBy': 'validation/cross_impl_check.py',
        'jsSealedExports': len(exports),
        'jsSealedExportsVerifiedInPython': js_export_pass,
        'pythonSealedRecords': js_side['pythonSealedRecords'],
        'pythonSealedRecordsVerifiedInJs': js_side['verifiedInJs'],
        'numberFormatVectors': len(vectors),
        'numberFormatMismatches': len(mismatches),
        'mismatchExamples': mismatches[:5],
    }
    summary['allAgree'] = (
        len(exports) > 0 and js_export_pass == len(exports)
        and js_side['verifiedInJs'] == js_side['pythonSealedRecords']
        and not mismatches
    )
    with open(os.path.join(RESULTS, 'cross_implementation.json'), 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"JS-sealed exports verified in Python: {js_export_pass}/{len(exports)}")
    print(f"Python-sealed records verified in JS: {js_side['verifiedInJs']}/{js_side['pythonSealedRecords']}")
    print(f"Number-format vectors matching ECMAScript: {len(vectors) - len(mismatches)}/{len(vectors)}")
    return 0 if summary['allAgree'] else 1


if __name__ == '__main__':
    sys.exit(main())
