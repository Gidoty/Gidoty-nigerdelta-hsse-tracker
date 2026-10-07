"""Explicit unit conversion for the EMAS assessment reference scripts.
Mirrors scripts/emas/lib/units.mjs exactly -- 1 BCM = 1e9 m^3 by
definition of the metric prefix, not a measured or provider-specific
factor.
"""
import math

M3_PER_BCM = 1e9


def bcm_to_m3(bcm):
    if not isinstance(bcm, (int, float)) or isinstance(bcm, bool) or math.isnan(bcm) or math.isinf(bcm):
        raise ValueError(f"bcm_to_m3: expected a finite number, got {bcm!r}")
    return bcm * M3_PER_BCM
