import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from units import bcm_to_m3, M3_PER_BCM  # noqa: E402


class TestUnits(unittest.TestCase):
    def test_m3_per_bcm_is_1e9(self):
        self.assertEqual(M3_PER_BCM, 1e9)

    def test_bcm_to_m3_one_bcm(self):
        self.assertEqual(bcm_to_m3(1), 1e9)

    def test_bcm_to_m3_typical_value(self):
        self.assertEqual(bcm_to_m3(0.18783718525), 0.18783718525 * 1e9)

    def test_bcm_to_m3_zero(self):
        self.assertEqual(bcm_to_m3(0), 0)

    def test_bcm_to_m3_rejects_non_finite(self):
        with self.assertRaises(ValueError):
            bcm_to_m3(float("nan"))
        with self.assertRaises(ValueError):
            bcm_to_m3(float("inf"))
        with self.assertRaises(ValueError):
            bcm_to_m3("0.5")


if __name__ == "__main__":
    unittest.main()
