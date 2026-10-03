#!/usr/bin/env python3
"""Independent re-implementation of the mass-balance methane calculator.

Shares no code with the app (src/utils/methaneCalc.js) — it is a from-
scratch reimplementation of the same published formulas, used to catch
transcription errors in the JavaScript. Standard library only.

Run directly to (re)generate test_vectors.json:
    python3 validation/reference_calcs.py

The companion Vitest test (src/utils/methaneCalc.test.js) loads this file's
output and asserts the app's calculator reproduces every non-error vector
within a relative tolerance of 1e-9, and raises for every vector marked
"expectError".
"""
import json
import math
import os

# ---- Physical constants (CODATA / IUPAC) — must match methaneCalc.js ----
CH4_MOLAR_MASS_G_MOL = 16.043
CO2_MOLAR_MASS_G_MOL = 44.009
GAS_CONSTANT_J_PER_MOL_K = 8.314462

REFERENCE_CONDITIONS = {
    "0C": {"tempK": 273.15, "pressureKPa": 101.325},
    "15C": {"tempK": 288.15, "pressureKPa": 101.325},
    "20C": {"tempK": 293.15, "pressureKPa": 101.325},
}


def ch4_density(reference_condition_id):
    ref = REFERENCE_CONDITIONS[reference_condition_id]
    pressure_pa = ref["pressureKPa"] * 1000
    molar_mass_kg_mol = CH4_MOLAR_MASS_G_MOL / 1000
    return (pressure_pa * molar_mass_kg_mol) / (GAS_CONSTANT_J_PER_MOL_K * ref["tempK"])


def validate_inputs(volume_m3, ch4_fraction, combustion_efficiency):
    if not isinstance(volume_m3, (int, float)) or volume_m3 <= 0 or math.isnan(volume_m3):
        raise ValueError("Gas volume (V_g) must be greater than zero")
    if not (0 <= ch4_fraction <= 1):
        raise ValueError("CH4 fraction (x_CH4) must be between 0 and 1")
    if not (0.5 <= combustion_efficiency <= 1):
        raise ValueError("Combustion efficiency (eta_f) must be between 0.5 and 1.0")


def calculate_ch4_slip_tonnes(volume_m3, ch4_fraction, combustion_efficiency, reference_condition_id):
    validate_inputs(volume_m3, ch4_fraction, combustion_efficiency)
    density = ch4_density(reference_condition_id)
    return (volume_m3 * ch4_fraction * density * (1 - combustion_efficiency)) / 1000


def calculate_co2_from_combustion_tonnes(volume_m3, ch4_fraction, combustion_efficiency, reference_condition_id):
    validate_inputs(volume_m3, ch4_fraction, combustion_efficiency)
    density = ch4_density(reference_condition_id)
    molar_ratio = CO2_MOLAR_MASS_G_MOL / CH4_MOLAR_MASS_G_MOL
    return (volume_m3 * ch4_fraction * density * combustion_efficiency * molar_ratio) / 1000


def calculate_co2e(ch4_tonnes):
    if ch4_tonnes < 0:
        raise ValueError("CH4 mass (tonnes) must be a non-negative number")
    return {"co2e20yrTonnes": ch4_tonnes * 82.5, "co2e100yrTonnes": ch4_tonnes * 29.8}


# ---- Test vectors: typical, boundary, and invalid inputs ----
# Each vector: (volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId)
VECTORS = [
    # Typical
    {"id": "typical-1", "volumeM3": 48000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    {"id": "typical-2", "volumeM3": 12000, "ch4Fraction": 0.85, "combustionEfficiency": 0.911, "referenceConditionId": "15C"},
    {"id": "typical-3", "volumeM3": 100000, "ch4Fraction": 0.9, "combustionEfficiency": 0.95, "referenceConditionId": "0C"},
    {"id": "typical-4", "volumeM3": 5000, "ch4Fraction": 0.75, "combustionEfficiency": 0.98, "referenceConditionId": "20C"},
    {"id": "typical-5", "volumeM3": 250000, "ch4Fraction": 0.92, "combustionEfficiency": 0.9, "referenceConditionId": "15C"},
    {"id": "typical-6", "volumeM3": 30000, "ch4Fraction": 0.88, "combustionEfficiency": 0.6, "referenceConditionId": "0C"},
    {"id": "typical-7", "volumeM3": 75000, "ch4Fraction": 0.6, "combustionEfficiency": 0.7, "referenceConditionId": "20C"},
    {"id": "typical-8", "volumeM3": 1500, "ch4Fraction": 0.95, "combustionEfficiency": 0.99, "referenceConditionId": "15C"},
    # Boundary: x_CH4 = 0
    {"id": "boundary-xch4-zero", "volumeM3": 10000, "ch4Fraction": 0, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    # Boundary: x_CH4 = 1
    {"id": "boundary-xch4-one", "volumeM3": 10000, "ch4Fraction": 1, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    # Boundary: eta_f = 1 (no unburned slip at all -> zero CH4 slip)
    {"id": "boundary-eta-one", "volumeM3": 10000, "ch4Fraction": 0.9, "combustionEfficiency": 1, "referenceConditionId": "15C"},
    # Boundary: eta_f = 0.5 (minimum allowed)
    {"id": "boundary-eta-min", "volumeM3": 10000, "ch4Fraction": 0.9, "combustionEfficiency": 0.5, "referenceConditionId": "15C"},
    # Boundary: very small V_g
    {"id": "boundary-vg-tiny", "volumeM3": 0.001, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    # Boundary: very large V_g
    {"id": "boundary-vg-huge", "volumeM3": 50000000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    # Boundary: all three reference conditions at identical other inputs
    {"id": "refcond-0C", "volumeM3": 20000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "0C"},
    {"id": "refcond-15C", "volumeM3": 20000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C"},
    {"id": "refcond-20C", "volumeM3": 20000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "20C"},
    # Invalid: zero volume
    {"id": "invalid-vg-zero", "volumeM3": 0, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C", "expectError": True},
    # Invalid: negative volume
    {"id": "invalid-vg-negative", "volumeM3": -5000, "ch4Fraction": 0.9, "combustionEfficiency": 0.98, "referenceConditionId": "15C", "expectError": True},
    # Invalid: x_CH4 negative
    {"id": "invalid-xch4-negative", "volumeM3": 10000, "ch4Fraction": -0.1, "combustionEfficiency": 0.98, "referenceConditionId": "15C", "expectError": True},
    # Invalid: x_CH4 > 1
    {"id": "invalid-xch4-toobig", "volumeM3": 10000, "ch4Fraction": 1.1, "combustionEfficiency": 0.98, "referenceConditionId": "15C", "expectError": True},
    # Invalid: eta_f below 0.5
    {"id": "invalid-eta-toolow", "volumeM3": 10000, "ch4Fraction": 0.9, "combustionEfficiency": 0.3, "referenceConditionId": "15C", "expectError": True},
    # Invalid: eta_f above 1
    {"id": "invalid-eta-toohigh", "volumeM3": 10000, "ch4Fraction": 0.9, "combustionEfficiency": 1.2, "referenceConditionId": "15C", "expectError": True},
]


def build_test_vectors():
    results = []
    for vector in VECTORS:
        entry = {"id": vector["id"], "inputs": {k: v for k, v in vector.items() if k not in ("id", "expectError")}}
        if vector.get("expectError"):
            entry["expectError"] = True
        else:
            ch4_slip = calculate_ch4_slip_tonnes(
                vector["volumeM3"], vector["ch4Fraction"], vector["combustionEfficiency"], vector["referenceConditionId"]
            )
            co2_combustion = calculate_co2_from_combustion_tonnes(
                vector["volumeM3"], vector["ch4Fraction"], vector["combustionEfficiency"], vector["referenceConditionId"]
            )
            co2e = calculate_co2e(ch4_slip)
            entry["expected"] = {
                "ch4SlipTonnes": ch4_slip,
                "co2FromCombustionTonnes": co2_combustion,
                "co2e20yrTonnes": co2e["co2e20yrTonnes"],
                "co2e100yrTonnes": co2e["co2e100yrTonnes"],
                "densityKgM3": ch4_density(vector["referenceConditionId"]),
            }
        results.append(entry)
    return results


def main():
    vectors = build_test_vectors()
    out_path = os.path.join(os.path.dirname(__file__), "test_vectors.json")
    with open(out_path, "w") as f:
        json.dump(
            {
                "generatedBy": "validation/reference_calcs.py",
                "constants": {
                    "CH4_MOLAR_MASS_G_MOL": CH4_MOLAR_MASS_G_MOL,
                    "CO2_MOLAR_MASS_G_MOL": CO2_MOLAR_MASS_G_MOL,
                    "GAS_CONSTANT_J_PER_MOL_K": GAS_CONSTANT_J_PER_MOL_K,
                },
                "vectors": vectors,
            },
            f,
            indent=2,
        )
    print(f"Wrote {len(vectors)} test vectors to {out_path}")


if __name__ == "__main__":
    main()
