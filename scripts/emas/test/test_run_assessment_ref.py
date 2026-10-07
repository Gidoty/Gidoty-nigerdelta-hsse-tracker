import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from run_assessment_ref import (  # noqa: E402
    compute_site_scenario,
    relative_error,
    scenario_combinations,
)

SCENARIOS = {
    "destructionEfficiency": [{"id": "d1", "value": 0.98}, {"id": "d2", "value": 0.9}],
    "methaneVolumeFraction": [{"id": "m1", "value": 0.85}, {"id": "m2", "value": 0.75}],
    "referenceTemperature": [
        {"id": "t1", "referenceConditionId": "15C"},
        {"id": "t2", "referenceConditionId": "0C"},
    ],
}


class TestRelativeError(unittest.TestCase):
    def test_zero_expected_uses_absolute_value(self):
        self.assertEqual(relative_error(0.0, 0.0), 0.0)
        self.assertEqual(relative_error(5.0, 0.0), 5.0)

    def test_exact_match_is_zero(self):
        self.assertEqual(relative_error(123.456, 123.456), 0.0)

    def test_known_relative_error(self):
        self.assertAlmostEqual(relative_error(110.0, 100.0), 0.1)


class TestScenarioCombinations(unittest.TestCase):
    def test_produces_full_cartesian_product(self):
        combos = scenario_combinations(SCENARIOS)
        self.assertEqual(len(combos), 2 * 2 * 2)
        keys = {(c["destructionEfficiencyId"], c["methaneFractionId"], c["referenceTemperatureId"]) for c in combos}
        self.assertEqual(len(keys), 8)


class TestComputeSiteScenario(unittest.TestCase):
    def test_matches_known_value_for_a_real_row(self):
        # Same row/scenario as scripts/emas/test/assessment.test.mjs (2022
        # site 5772), used there to check the JS side against the app
        # calculator directly. Checking it here too pins the Python
        # reference side to the same known-good number.
        result = compute_site_scenario(0.18783718525, 0.98, 0.85, "15C")
        self.assertAlmostEqual(result["volume_m3"], 0.18783718525 * 1e9)
        self.assertGreater(result["ch4_slip_tonnes"], 0)
        self.assertGreater(result["co2e_20yr_tonnes_methane_slip_only"], result["co2e_100yr_tonnes_methane_slip_only"])


if __name__ == "__main__":
    unittest.main()
