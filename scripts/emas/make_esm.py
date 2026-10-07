#!/usr/bin/env python3
"""Builds the esm/ supplementary-material CSVs from this project's own
existing outputs (validation/results/*.json, validation/test_vectors.json,
results/emas/*.csv). No value is computed here that doesn't already exist
in those files — this script only re-shapes and adds the required
journal comment header, per Task C of EMAS step 4.

Run from the repo root or from scripts/emas/:
    python3 scripts/emas/make_esm.py
"""
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.join(HERE, "..", "..")
VALIDATION = os.path.join(REPO_ROOT, "validation")
RESULTS_EMAS = os.path.join(REPO_ROOT, "results", "emas")
ESM_DIR = os.path.join(REPO_ROOT, "esm")

HEADER_LINES = [
    "# Article title: AUTHOR TO PROVIDE",
    "# Journal: Environmental Monitoring and Assessment",
    "# Authors: Gideon Owhonda; Tunji Fadoyeni",
    "# Corresponding author: Gideon Owhonda, NLNG Centre for Gas, Refining and "
    "Petrochemical Engineering, University of Port Harcourt, gideon.owhonda@cgrpng.org",
]


def write_csv(path, title, source_note, columns, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        for line in HEADER_LINES:
            f.write(line + "\n")
        f.write(f"# Supplementary file: {os.path.basename(path).removesuffix('.csv')} -- {title}\n")
        f.write(f"# Source: {source_note}; values unchanged from that source\n")
        writer = csv.writer(f)
        writer.writerow(columns)
        for row in rows:
            writer.writerow(row)
    print(f"Wrote {path} ({len(rows)} data rows)")


def rel_err(field_name, fields_by_name):
    f = fields_by_name.get(field_name)
    return (f["actual"], f["expected"], f["relativeError"]) if f else ("", "", "")


def build_esm1():
    with open(os.path.join(VALIDATION, "test_vectors.json")) as f:
        vectors = {v["id"]: v for v in json.load(f)["vectors"]}
    with open(os.path.join(VALIDATION, "results", "calculator_check.json")) as f:
        check = json.load(f)

    columns = [
        "vector_id", "volume_m3", "ch4_fraction", "combustion_efficiency", "reference_condition_id",
        "expect_error", "threw_or_passed",
        "ch4_slip_tonnes_actual", "ch4_slip_tonnes_expected", "ch4_slip_tonnes_relative_error",
        "co2_from_combustion_tonnes_actual", "co2_from_combustion_tonnes_expected", "co2_from_combustion_tonnes_relative_error",
        "co2e_20yr_tonnes_actual", "co2e_20yr_tonnes_expected", "co2e_20yr_tonnes_relative_error",
        "co2e_100yr_tonnes_actual", "co2e_100yr_tonnes_expected", "co2e_100yr_tonnes_relative_error",
        "density_kg_m3_actual", "density_kg_m3_expected", "density_kg_m3_relative_error",
        "all_within_tolerance",
    ]
    rows = []
    for comp in check["comparisons"]:
        vector = vectors[comp["id"]]
        inputs = vector["inputs"]
        if comp["expectError"]:
            row = [
                comp["id"], inputs["volumeM3"], inputs["ch4Fraction"], inputs["combustionEfficiency"], inputs["referenceConditionId"],
                True, comp["threw"],
                "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                comp["pass"],
            ]
        else:
            fields = {fld["field"]: fld for fld in comp["fields"]}
            a1, e1, r1 = rel_err("ch4SlipTonnes", fields)
            a2, e2, r2 = rel_err("co2FromCombustionTonnes", fields)
            a3, e3, r3 = rel_err("co2e20yrTonnes", fields)
            a4, e4, r4 = rel_err("co2e100yrTonnes", fields)
            a5, e5, r5 = rel_err("densityKgM3", fields)
            row = [
                comp["id"], inputs["volumeM3"], inputs["ch4Fraction"], inputs["combustionEfficiency"], inputs["referenceConditionId"],
                False, "",
                a1, e1, r1, a2, e2, r2, a3, e3, r3, a4, e4, r4, a5, e5, r5,
                comp["pass"],
            ]
        rows.append(row)

    write_csv(
        os.path.join(ESM_DIR, "ESM_1.csv"),
        "methane-calculator test vectors and JS-vs-Python comparison results",
        "validation/test_vectors.json, validation/results/calculator_check.json",
        columns, rows,
    )


def build_esm2():
    with open(os.path.join(VALIDATION, "results", "tamper_check.json")) as f:
        tamper = json.load(f)
    with open(os.path.join(VALIDATION, "results", "property_mutation_check.json")) as f:
        propcheck = json.load(f)

    columns = [
        "section", "label", "expected_detection", "n_attempted", "n_skipped", "n_correct", "all_correct",
        "payload_valid_failures", "event_chain_valid_failures", "status_consistent_failures", "event_log_complete_failures",
        "python_correct", "agrees_with_js",
    ]
    rows = []
    for s in tamper["scenarios"]:
        cf = s["checksFailed"]
        rows.append([
            "tamper_scenario", s["scenario"], s["expectedDetection"], s["recordsAttempted"], s["recordsSkipped"],
            s["recordsCorrect"], s["allCorrect"],
            cf["payloadValid"], cf["eventChainValid"], cf["statusConsistent"], cf["eventLogComplete"],
            "", "",
        ])
    for category, c in propcheck["byCategory"].items():
        rows.append([
            "property_test", category, "", c["attempted"], "", c["pythonCorrect"], c["pythonCorrect"] == c["attempted"],
            "", "", "", "",
            c["pythonCorrect"], c["agreesWithJs"],
        ])

    write_csv(
        os.path.join(ESM_DIR, "ESM_2.csv"),
        "integrity tamper-detection scenario results and fast-check property-test counts",
        "validation/results/tamper_check.json, validation/results/property_mutation_check.json",
        columns, rows,
    )


def build_esm3():
    columns = [
        "date", "device", "os_version", "browser_version", "build_hash_footer", "tester_initials",
        "step1", "step2", "step3", "step4", "step5", "step6", "step7", "step8", "step9", "overall", "notes",
    ]
    # Template only -- deliberately no data rows (empty log, nothing to fill in or assume).
    write_csv(
        os.path.join(ESM_DIR, "ESM_3.csv"),
        "offline/device trial log template (empty -- no trials recorded here)",
        "docs/emas/DEPLOY_AND_TRIAL.md blank trial log template",
        columns, [],
    )


def copy_with_header(src_name, esm_name, title, source_note):
    src_path = os.path.join(RESULTS_EMAS, src_name)
    with open(src_path, newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    write_csv(os.path.join(ESM_DIR, esm_name), title, source_note, header, rows)


def main():
    build_esm1()
    build_esm2()
    build_esm3()
    copy_with_header(
        "site_year_estimates.csv", "ESM_4.csv",
        "site-year methane emission estimates, central case with low/high volume-uncertainty bounds",
        "results/emas/site_year_estimates.csv",
    )
    copy_with_header(
        "national_totals_by_year.csv", "ESM_5.csv",
        "national methane/CO2/CO2e totals by year, for every one of the 27 scenario combinations",
        "results/emas/national_totals_by_year.csv",
    )


if __name__ == "__main__":
    main()
