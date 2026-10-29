# Supplementary data — Environmental Modelling & Software manuscript

- **Supplementary_Data_S1.csv** — Site-year methane slip estimates for every calculable 2022–2024 Nigerian flare site-year (499 records), plus the 21 zero-volume site-years excluded from calculation, marked `excluded_zero_volume`.
- **Supplementary_Data_S2.csv** — National total flared volume, methane slip, CO₂, and CO₂e by year (2022–2024), for all 27 destruction-efficiency/methane-fraction/temperature scenario combinations.
- **Supplementary_Data_S3.csv** — The 23 methane-calculator test vectors, each one's independent Python reference result, and the resulting relative error for every physical output field.
- **Supplementary_Data_S4.py** — The variance-based (Sobol') sensitivity-analysis script used to produce S5, unchanged from `scripts/emas/gsa_national_methane_slip.py`.
- **Supplementary_Data_S5.csv** — The real output of running Supplementary_Data_S4.py: first-order and total Sobol' indices, coefficients of variation, percentile bands of national methane slip, and threshold values, for every case described in the script's own docstring.
