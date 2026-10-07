# Electronic Supplementary Material — captions

**ESM_1.csv.** The 23 methane-calculator test vectors used to validate
`app/src/utils/methaneCalc.js`, each vector's independent Python
reference result, and the resulting relative error (all 0, well under
the 1×10⁻⁹ tolerance) for every physical output field.

**ESM_2.csv.** Results of the 15 tamper-detection scenarios run against
100 synthetic report records (which integrity check flagged each one,
and how many records were skipped as inapplicable), together with the
300-trial fast-check property-based mutation test's counts by category
(protected fields correctly flagged, declared-mutable/excluded fields
correctly left unflagged) and their agreement with an independent Python
re-verification.

**ESM_3.csv.** A blank template for logging manual offline/device-local
storage trials (nine steps per `docs/emas/DEPLOY_AND_TRIAL.md`); no
trial results are recorded in this file.

**ESM_4.csv.** Site-year methane, CO₂ (methane-fraction-only), and CO₂e
(methane-slip-only) estimates for every calculable 2022–2024 Nigerian
flare site-year, at the central scenario (98% destruction efficiency,
85% methane fraction, 15°C), with low/high bounds from the ±9.5% volume
uncertainty (Elvidge et al. 2016).

**ESM_5.csv.** National total flared volume, methane slip, CO₂
(methane-fraction-only), and CO₂e (methane-slip-only), by year
(2022–2024) and scenario, for all 27 combinations of destruction
efficiency, methane volume fraction, and reference temperature.
