#!/usr/bin/env bash
# Regenerates every EMAS output from the raw provider files, in order:
#   1. data/public/nigeria_flares.csv  <- data/public/raw/*.xlsx
#   2. results/emas/*.csv              <- nigeria_flares.csv + scenarios.json
#   3. results/emas/cross_check_report.json <- independent Python re-check
# Run from anywhere; paths below are resolved relative to this script.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"

echo "== 1/3: extracting Nigerian rows from raw provider files =="
python3 -I "$HERE/extract_nigeria.py"

echo
echo "== 2/3: running the methane assessment (Node, app calculator unchanged) =="
node "$HERE/run_assessment.mjs"

echo
echo "== 3/3: independent Python cross-check =="
python3 -I "$HERE/run_assessment_ref.py"
