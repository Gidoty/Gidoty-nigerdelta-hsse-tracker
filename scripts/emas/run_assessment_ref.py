#!/usr/bin/env python3
"""Independent Python cross-check of run_assessment.mjs.

Recomputes CH4 slip, CO2 (methane-fraction-only), and CO2e (methane-
slip-only) for every calculable row of data/public/nigeria_flares.csv
under every scenario in scenarios.json, using
validation/reference_calcs.py's existing functions unchanged (no formula
is reimplemented here), then compares every value against
results/emas/full_grid.csv (written by run_assessment.mjs, which must be
run first). Reports the maximum relative error found and exits non-zero
if it exceeds 1e-9.

Standard library only (plus the existing validation/reference_calcs.py
and scripts/emas/lib/units.py, neither of which is modified by this
script).
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.join(HERE, "..", "..")
VALIDATION_DIR = os.path.join(REPO_ROOT, "validation")
sys.path.insert(0, VALIDATION_DIR)
sys.path.insert(0, os.path.join(HERE, "lib"))

from reference_calcs import (  # noqa: E402
    calculate_ch4_slip_tonnes,
    calculate_co2_from_combustion_tonnes,
    calculate_co2e,
)
from units import bcm_to_m3  # noqa: E402

NIGERIA_CSV = os.path.join(REPO_ROOT, "data", "public", "nigeria_flares.csv")
SCENARIOS_PATH = os.path.join(HERE, "scenarios.json")
FULL_GRID_PATH = os.path.join(REPO_ROOT, "results", "emas", "full_grid.csv")
REPORT_PATH = os.path.join(REPO_ROOT, "results", "emas", "cross_check_report.json")

RELATIVE_ERROR_THRESHOLD = 1e-9


def load_scenarios():
    with open(SCENARIOS_PATH) as f:
        return json.load(f)


def load_nigeria_rows():
    with open(NIGERIA_CSV) as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r["year"] = int(r["year"])
        r["volume"] = float(r["volume"])
    return rows


def scenario_combinations(scenarios):
    combos = []
    for de in scenarios["destructionEfficiency"]:
        for mf in scenarios["methaneVolumeFraction"]:
            for rt in scenarios["referenceTemperature"]:
                combos.append(
                    {
                        "destructionEfficiencyId": de["id"],
                        "destructionEfficiency": de["value"],
                        "methaneFractionId": mf["id"],
                        "methaneFraction": mf["value"],
                        "referenceTemperatureId": rt["id"],
                        "referenceConditionId": rt["referenceConditionId"],
                    }
                )
    return combos


def compute_site_scenario(volume_bcm, destruction_efficiency, methane_fraction, reference_condition_id):
    volume_m3 = bcm_to_m3(volume_bcm)
    ch4_slip = calculate_ch4_slip_tonnes(volume_m3, methane_fraction, destruction_efficiency, reference_condition_id)
    co2 = calculate_co2_from_combustion_tonnes(volume_m3, methane_fraction, destruction_efficiency, reference_condition_id)
    co2e = calculate_co2e(ch4_slip)
    return {
        "volume_m3": volume_m3,
        "ch4_slip_tonnes": ch4_slip,
        "co2_tonnes_methane_fraction_only": co2,
        "co2e_20yr_tonnes_methane_slip_only": co2e["co2e20yrTonnes"],
        "co2e_100yr_tonnes_methane_slip_only": co2e["co2e100yrTonnes"],
    }


def relative_error(actual, expected):
    if expected == 0:
        return abs(actual)
    return abs((actual - expected) / expected)


FIELDS_TO_COMPARE = [
    "volume_m3",
    "ch4_slip_tonnes",
    "co2_tonnes_methane_fraction_only",
    "co2e_20yr_tonnes_methane_slip_only",
    "co2e_100yr_tonnes_methane_slip_only",
]


def main():
    if not os.path.exists(FULL_GRID_PATH):
        print(f"{FULL_GRID_PATH} not found -- run scripts/emas/run_assessment.mjs first.", file=sys.stderr)
        return 2

    scenarios = load_scenarios()
    rows = [r for r in load_nigeria_rows() if r["volume"] > 0]
    combos = scenario_combinations(scenarios)

    with open(FULL_GRID_PATH) as f:
        js_grid = list(csv.DictReader(f))
    js_by_key = {}
    for g in js_grid:
        key = (int(g["year"]), g["site_id"], g["sheet"], g["destructionEfficiencyId"], g["methaneFractionId"], g["referenceTemperatureId"])
        js_by_key[key] = g

    max_relative_error = 0.0
    max_relative_error_field = None
    max_relative_error_key = None
    compared = 0
    missing = []

    for row in rows:
        for combo in combos:
            key = (row["year"], row["site_id"], row["sheet"], combo["destructionEfficiencyId"], combo["methaneFractionId"], combo["referenceTemperatureId"])
            js_row = js_by_key.get(key)
            if js_row is None:
                missing.append(key)
                continue

            py_result = compute_site_scenario(
                row["volume"], combo["destructionEfficiency"], combo["methaneFraction"], combo["referenceConditionId"]
            )
            py_values = {
                "volume_m3": py_result["volume_m3"],
                "ch4_slip_tonnes": py_result["ch4_slip_tonnes"],
                "co2_tonnes_methane_fraction_only": py_result["co2_tonnes_methane_fraction_only"],
                "co2e_20yr_tonnes_methane_slip_only": py_result["co2e_20yr_tonnes_methane_slip_only"],
                "co2e_100yr_tonnes_methane_slip_only": py_result["co2e_100yr_tonnes_methane_slip_only"],
            }
            for field in FIELDS_TO_COMPARE:
                js_value = float(js_row[field])
                py_value = py_values[field]
                err = relative_error(py_value, js_value)
                compared += 1
                if err > max_relative_error:
                    max_relative_error = err
                    max_relative_error_field = field
                    max_relative_error_key = key

    report = {
        "generatedBy": "scripts/emas/run_assessment_ref.py",
        "rowsCompared": len(rows),
        "scenarioCombinations": len(combos),
        "valuesCompared": compared,
        "missingJsRows": len(missing),
        "maxRelativeError": max_relative_error,
        "maxRelativeErrorField": max_relative_error_field,
        "maxRelativeErrorKey": list(max_relative_error_key) if max_relative_error_key else None,
        "relativeErrorThreshold": RELATIVE_ERROR_THRESHOLD,
        "passed": max_relative_error <= RELATIVE_ERROR_THRESHOLD and len(missing) == 0,
    }
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)

    print(f"Compared {compared} values across {len(rows)} rows x {len(combos)} scenarios.")
    print(f"Missing JS rows: {len(missing)}")
    print(f"Max relative error: {max_relative_error} (field: {max_relative_error_field}, key: {max_relative_error_key})")
    print(f"Wrote {REPORT_PATH}")

    if missing:
        print("FAIL: some rows present in the Python side were not found in full_grid.csv", file=sys.stderr)
        return 1
    if max_relative_error > RELATIVE_ERROR_THRESHOLD:
        print(f"FAIL: max relative error {max_relative_error} exceeds threshold {RELATIVE_ERROR_THRESHOLD}", file=sys.stderr)
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
