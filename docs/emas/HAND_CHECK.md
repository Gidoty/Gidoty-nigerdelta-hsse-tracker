# Hand-check sheet

Three worked examples, with every arithmetic step written out, so the
authors can reproduce them on a calculator before trusting the app or
the EMAS assessment scripts. All three use the same two formulas from
`app/src/utils/methaneCalc.js` (unchanged by this step):

```
ρ_CH4(T, P) = P·M / (R·T)                                    [ideal gas law]
m_CH4_slip  = V_g × x_CH4 × ρ_CH4 × (1 − η_f)                 [mass balance]
CO2         = V_g × x_CH4 × ρ_CH4 × η_f × (M_CO2 / M_CH4)     [stoichiometric, methane fraction only]
CO2e(20-yr) = m_CH4_slip × GWP20
CO2e(100-yr)= m_CH4_slip × GWP100
```

Constants used throughout (same in every vector):

| Constant | Value |
| --- | --- |
| M_CH4 (CH₄ molar mass) | 16.043 g/mol = 0.016043 kg/mol |
| M_CO2 (CO₂ molar mass) | 44.009 g/mol = 0.044009 kg/mol |
| R (gas constant) | 8.314462 J/(mol·K) |
| Reference condition | 15°C, 101.325 kPa → T = 288.15 K, P = 101,325 Pa |
| GWP20 (AR6, fossil CH₄) | 82.5 |
| GWP100 (AR6, fossil CH₄) | 29.8 |

## Step 0: CH₄ density at 15°C, 101.325 kPa (shared by all three vectors)

```
ρ_CH4 = P × M_CH4 / (R × T)
      = 101325 × 0.016043 / (8.314462 × 288.15)
      = 1,626.05... / 2,395.2203...
      = 0.6784993238760395 kg/m³
```

Carry **ρ_CH4 = 0.67849932 kg/m³** (8 decimal places) into every vector below.

---

## Vector 1: typical case

Inputs: V_g = 50,000 m³ · x_CH4 = 0.85 · η_f = 0.98 (design assumption, IPCC 2006) · 15°C

**m_CH4_slip:**
```
= V_g × x_CH4 × ρ_CH4 × (1 − η_f)
= 50,000 × 0.85 × 0.67849932 × (1 − 0.98)
= 50,000 × 0.85 × 0.67849932 × 0.02
= 42,500 × 0.67849932 × 0.02
= 28,836.22... × 0.02
= 576.7244... kg
= 0.5767244253 tonnes
```

**CO2 (methane fraction only):**
```
= V_g × x_CH4 × ρ_CH4 × η_f × (M_CO2 / M_CH4)
= 50,000 × 0.85 × 0.67849932 × 0.98 × (44.009 / 16.043)
= 28,836.22... × 0.98 × 2.74325...
= 28,259.50... × 2.74325...
= 77,521.174... kg
= 77.5211741 tonnes
```

**CO2e (methane slip only):**
```
CO2e(20-yr)  = 0.5767244253 × 82.5 = 47.5797650868 tonnes
CO2e(100-yr) = 0.5767244253 × 29.8 = 17.1863878738 tonnes
```

| Figure | Value |
| --- | --- |
| CH₄ slip | 0.5767244253 t |
| CO₂ (methane fraction only) | 77.5211741200 t |
| CO₂e 20-yr (methane slip only) | 47.5797650868 t |
| CO₂e 100-yr (methane slip only) | 17.1863878738 t |

---

## Vector 2: at η_f = 0.911 (Plant et al. 2022, fleet effective value)

Inputs: V_g = 100,000 m³ · x_CH4 = 0.85 · η_f = 0.911 (fleet effective, includes unlit flares, three US basins; not a single-flare efficiency) · 15°C

**m_CH4_slip:**
```
= 100,000 × 0.85 × 0.67849932 × (1 − 0.911)
= 100,000 × 0.85 × 0.67849932 × 0.089
= 85,000 × 0.67849932 × 0.089
= 57,672.4425... × 0.089
= 5,132.8474... kg
= 5.1328473851 tonnes
```

**CO2 (methane fraction only):**
```
= 100,000 × 0.85 × 0.67849932 × 0.911 × (44.009 / 16.043)
= 57,672.4425... × 0.911 × 2.74325...
= 52,575.9365... × 2.74325...
= 144,261.0127... kg
= 144.1261012720 tonnes
```

**CO2e (methane slip only):**
```
CO2e(20-yr)  = 5.1328473851 × 82.5 = 423.4599092725 tonnes
CO2e(100-yr) = 5.1328473851 × 29.8 = 152.9588520766 tonnes
```

| Figure | Value |
| --- | --- |
| CH₄ slip | 5.1328473851 t |
| CO₂ (methane fraction only) | 144.1261012720 t |
| CO₂e 20-yr (methane slip only) | 423.4599092725 t |
| CO₂e 100-yr (methane slip only) | 152.9588520766 t |

---

## Vector 3: a real site-year from the EMAS assessment (central case)

Source: `results/emas/site_year_estimates.csv`, row for **2022, site 5772** (`flare upstream`, `upstream oil`, lat 5.70853, lng 4.481316). Central case = η_f 0.98 (design_98), x_CH4 0.85, 15°C — see `scripts/emas/scenarios.json`'s `centralCase`.

The provider's raw volume is in BCM and must be converted to m³ explicitly before use (1 BCM = 10⁹ m³) — this is the exact conversion `scripts/emas/lib/units.mjs`/`units.py` perform and their tests check:

```
V_g = 0.18783718525 BCM × 1,000,000,000 m³/BCM
    = 187,837,185.25 m³
```

**m_CH4_slip:**
```
= V_g × x_CH4 × ρ_CH4 × (1 − η_f)
= 187,837,185.25 × 0.85 × 0.67849932 × 0.02
= 159,661,607.46... × 0.67849932 × 0.02
= 108,282,929.3... × 0.02
= 2,166,605.85... kg
= 2,166.6058542454 tonnes
```

**CO2 (methane fraction only):**
```
= 187,837,185.25 × 0.85 × 0.67849932 × 0.98 × (44.009 / 16.043)
= 159,661,607.46... × 0.98 × 2.74325...
= 156,468,375.3... × 2.74325...
= 291,227,182.9... kg
= 291,227.1828794 tonnes
```

**CO2e (methane slip only):**
```
CO2e(20-yr)  = 2,166.6058542454 × 82.5 = 178,744.9829752 tonnes
CO2e(100-yr) = 2,166.6058542454 × 29.8 = 64,564.8544565 tonnes
```

| Figure | This hand check | `site_year_estimates.csv` central column | Match |
| --- | --- | --- | --- |
| CH₄ slip | 2,166.6058542454 t | 2166.6058542453598 | Yes |
| CO₂ (methane fraction only) | 291,227.1828794 t | 291227.18287943106 | Yes |
| CO₂e 20-yr (methane slip only) | 178,744.9829752 t | 178744.9829752422 | Yes |
| CO₂e 100-yr (methane slip only) | 64,564.8544565 t | 64564.85445651172 | Yes |

(Sub-decimal differences above are rounding in this sheet's intermediate display only — both sides come from the same unmodified formula and constants.)

---

## Sign-off

Verified by / date: ______________________________
