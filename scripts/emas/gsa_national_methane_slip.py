"""Variance-based (Sobol') sensitivity analysis of national methane slip.

Model (Eq. 1 and Eq. 2 of the manuscript, applied to the national total):
    m = V_tot * u * b * x * rho(T) * (1 - eta) / 1000        [t]
    rho(T) = p * M / (R * (T + 273.15))                       [kg m-3]

u is random satellite volume error; b is an optional one-sided bias factor
for flares the satellite misses (b >= 1 means the true volume is larger).
All inputs are independent. Distributions are screening assumptions, not
measured distributions.

Cases
  A  base        eta U(0.911, 0.98); x U(0.75, 0.95); T U(0, 20) degC; u U(0.905, 1.095)
  B  lit-flare   as A but eta U(0.952, 0.98)
  C  triangular  eta Tri(0.911, mode 0.952, 0.98); x Tri(0.75, 0.85, 0.95);
                 T Tri(0, 15, 20); u Normal(1, 0.0485)  [+/-9.5 % read as a 95 % interval]
  D  wide x      as A but x U(0.65, 0.95)  [stress test; 0.65 is not a measured value]
  E  bias        as A or B plus b U(1, b_max), b_max in {1.5, 2.2, 3.0}

For a product of independent factors the first-order and total Sobol'
indices have closed forms (Sobol', 2001). The script computes them exactly
and checks them by Monte Carlo (Saltelli sampling; first-order and Jansen
total estimators as given by Saltelli et al., 2010), fixed seed.

V_tot values are the unrounded national volumes from
results/emas/national_totals_by_year.csv (Supplementary Data S2).

Usage: python gsa_national_methane_slip.py  ->  writes gsa_results.csv
"""
import csv
import numpy as np
from scipy import stats

P, M, R, K0 = 101325.0, 16.043e-3, 8.314462, 273.15
SEED = 20261029
N = 2 ** 18
V_TOT = {2022: 5405461030.274345, 2023: 5871180167.0350106, 2024: 6634366552.306519}


def rho(t):
    return P * M / (R * (np.asarray(t) + K0))


def tri(a, c, b):
    return stats.triang(c=(c - a) / (b - a), loc=a, scale=b - a)


class Factor:
    """A model factor X = g(Z) with Z ~ dist; g is identity unless given."""

    def __init__(self, name, dist, g=None):
        self.name, self.dist, self.g = name, dist, g

    def moments(self):
        if self.g is None:
            m = self.dist.mean()
            return m, self.dist.var() + m * m
        return self.dist.expect(self.g), self.dist.expect(lambda z: self.g(z) ** 2)

    def sample(self, rng, n):
        z = self.dist.rvs(size=n, random_state=rng)
        return z if self.g is None else self.g(z)


def slip_factor(lo, hi):          # 1 - eta for eta ~ U(lo, hi)
    return stats.uniform(1 - hi, hi - lo)


def case(eta_dist, x_dist, t_dist, u_dist, bias_max=None):
    f = [Factor("destruction_efficiency", eta_dist),
         Factor("methane_fraction", x_dist),
         Factor("reference_temperature", t_dist, rho),
         Factor("volume_random_error", u_dist)]
    if bias_max:
        f.append(Factor("volume_bias_small_flares", stats.uniform(1.0, bias_max - 1.0)))
    return f


def analytic(factors):
    mom = [f.moments() for f in factors]
    e1 = np.array([m[0] for m in mom]); e2 = np.array([m[1] for m in mom])
    var_y = np.prod(e2) - np.prod(e1) ** 2
    s1, st, cv = [], [], []
    for i in range(len(factors)):
        o1 = np.prod(np.delete(e1, i) ** 2)
        o2 = np.prod(np.delete(e2, i))
        vi = e2[i] - e1[i] ** 2
        s1.append(vi * o1 / var_y)
        st.append(1 - e1[i] ** 2 * (o2 - o1) / var_y)
        cv.append(np.sqrt(vi) / e1[i])
    return s1, st, cv


def monte_carlo(factors, rng):
    k = len(factors)
    a = np.column_stack([f.sample(rng, N) for f in factors])
    b = np.column_stack([f.sample(rng, N) for f in factors])
    fa, fb = a.prod(1), b.prod(1)
    var = np.var(np.concatenate([fa, fb]))
    s1, st = [], []
    for i in range(k):
        abi = a.copy(); abi[:, i] = b[:, i]
        fab = abi.prod(1)
        s1.append(np.mean(fb * (fab - fa)) / var)
        st.append(0.5 * np.mean((fa - fab) ** 2) / var)
    return s1, st, fa


def main():
    rng = np.random.default_rng(SEED)
    U = stats.uniform
    base = (slip_factor(0.911, 0.98), U(0.75, 0.20), U(0.0, 20.0), U(0.905, 0.19))
    lit = (slip_factor(0.952, 0.98),) + base[1:]
    cases = {
        "A base": case(*base),
        "B lit-flare": case(*lit),
        "C triangular": case(tri(0.02, 0.048, 0.089), tri(0.75, 0.85, 0.95), tri(0.0, 15.0, 20.0),
                             stats.norm(1.0, 0.0485)),
        "D wide methane fraction": case(base[0], U(0.65, 0.30), base[2], base[3]),
    }
    for bmax in (1.5, 2.2, 3.0):
        cases[f"E bias b<= {bmax} (base)"] = case(*base, bias_max=bmax)
        cases[f"E bias b<= {bmax} (lit-flare)"] = case(*lit, bias_max=bmax)

    rows = []
    for label, fac in cases.items():
        s1, st, cv = analytic(fac)
        ms1, mst, fa = monte_carlo(fac, rng)
        for j, f in enumerate(fac):
            rows.append(dict(case=label, quantity="index", input=f.name, cv=f"{cv[j]:.4f}",
                             S1_analytic=f"{s1[j]:.4f}", ST_analytic=f"{st[j]:.4f}",
                             S1_mc=f"{ms1[j]:.4f}", ST_mc=f"{mst[j]:.4f}"))
        for year, vt in V_TOT.items():
            m = vt * fa / 1000.0
            p5, p50, p95 = np.percentile(m, [5, 50, 95])
            rows.append(dict(case=label, quantity=f"slip_t_{year}", input="all",
                             p5=f"{p5:.0f}", p50=f"{p50:.0f}", p95=f"{p95:.0f}", mean=f"{m.mean():.0f}"))

    # Thresholds: volume spread at which its first-order index equals that of eta.
    for label, lo in (("A base", 0.911), ("B lit-flare", 0.952)):
        f = Factor("eta", slip_factor(lo, 0.98)); e1, e2 = f.moments()
        cv_eta = np.sqrt(e2 - e1 ** 2) / e1
        half = cv_eta * np.sqrt(3.0)                       # symmetric U(1-a, 1+a)
        bstar = (1 + half) / (1 - half)                    # one-sided U(1, b)
        rows.append(dict(case=label, quantity="random_half_width_equal_to_eta", input="volume", cv=f"{half:.4f}"))
        rows.append(dict(case=label, quantity="bias_bmax_equal_to_eta", input="volume", cv=f"{bstar:.4f}"))

    keys = ["case", "quantity", "input", "cv", "S1_analytic", "ST_analytic", "S1_mc", "ST_mc",
            "p5", "p50", "p95", "mean"]
    with open("gsa_results.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=keys); w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in keys})
    for r in rows:
        print({k: v for k, v in r.items() if v != "" and k not in ("quantity",) or k == "quantity" and v != "index"})


if __name__ == "__main__":
    main()
