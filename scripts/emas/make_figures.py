#!/usr/bin/env python3
"""Builds Fig3 and Fig4 for the EMAS submission from this project's own
existing outputs (results/emas/national_totals_by_year.csv and
data/public/nigeria_flares.csv). No value plotted here is computed fresh
by this script beyond the single documented, exact linear-scaling step
noted below for Fig3's error bars -- see figures/FIGURE_DATA.md for the
full source-column mapping.

Requires matplotlib and Pillow (not tracked anywhere else in this
project's otherwise dependency-light Python scripts, since they are only
needed for this one figure-generation step):
    pip install matplotlib pillow

Font: Arial/Helvetica are not installable on this Linux build machine
(proprietary fonts); Liberation Sans is used instead, since it is built
specifically as an Arial metric-equivalent (same glyph widths), which is
the standard free substitute accepted in this situation. This is stated
here and in figures/FIGURE_DATA.md, not left implicit.

Run from the repo root or from scripts/emas/:
    python3 scripts/emas/make_figures.py
"""
import csv
import os

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams["pdf.fonttype"] = 42  # embed fonts fully (TrueType), not a font reference
matplotlib.rcParams["ps.fonttype"] = 42
matplotlib.rcParams["font.family"] = "sans-serif"
matplotlib.rcParams["font.sans-serif"] = ["Liberation Sans", "Arial", "Helvetica"]
matplotlib.rcParams["font.size"] = 9
matplotlib.rcParams["axes.linewidth"] = 0.5
matplotlib.rcParams["svg.fonttype"] = "none"

import matplotlib.pyplot as plt  # noqa: E402
from PIL import Image  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.join(HERE, "..", "..")
RESULTS_EMAS = os.path.join(REPO_ROOT, "results", "emas")
NIGERIA_CSV = os.path.join(REPO_ROOT, "data", "public", "nigeria_flares.csv")
FIGURES_DIR = os.path.join(REPO_ROOT, "figures")

MM_PER_INCH = 25.4
VOLUME_UNCERTAINTY_PCT = 9.5  # scenarios.json volumeUncertainty.plusMinusPercent -- see note in build_fig3

EFFICIENCY_STYLE = {
    "design_98": {"label": "98% (IPCC 2006 design assumption)", "color": "#1b4f72", "marker": "o", "linestyle": "-"},
    "plant2022_lit": {"label": "95.2% (Plant et al. 2022, lit flares)", "color": "#b9770e", "marker": "s", "linestyle": "--"},
    "plant2022_effective": {"label": "91.1% (Plant et al. 2022, fleet effective)", "color": "#117864", "marker": "^", "linestyle": ":"},
}
YEAR_STYLE = {
    2022: {"color": "#1b4f72", "marker": "o", "linestyle": "-"},
    2023: {"color": "#b9770e", "marker": "s", "linestyle": "--"},
    2024: {"color": "#117864", "marker": "^", "linestyle": ":"},
}


def mm_to_in(mm):
    return mm / MM_PER_INCH


def save_tiff_rgb(fig, path, dpi=600):
    tmp_path = path + ".rgba.tmp.tif"
    fig.savefig(tmp_path, dpi=dpi, format="tiff")
    with Image.open(tmp_path) as im:
        rgb = Image.new("RGB", im.size, (255, 255, 255))
        rgb.paste(im, mask=im.split()[3] if im.mode == "RGBA" else None)
        rgb.save(path, format="TIFF", dpi=(dpi, dpi), compression="tiff_lzw")
    os.remove(tmp_path)


def save_pdf(fig, path):
    fig.savefig(path, format="pdf")


def read_national_totals():
    with open(os.path.join(RESULTS_EMAS, "national_totals_by_year.csv"), newline="") as f:
        return list(csv.DictReader(f))


def build_fig3():
    """National methane slip by year, for the three sourced destruction
    efficiencies, at methane fraction 0.85 (id 'x85') and 15C (id
    '15C'), with error bars from the +/-9.5% volume uncertainty.

    results/emas/national_totals_by_year.csv has no low/high bounds
    (those exist only for the central scenario, in
    site_year_estimates.csv). Deriving them here for the other two
    efficiencies is an exact consequence of the calculator's own formula
    being linear in volume (m_CH4_slip = V_g * x_CH4 * rho * (1 - eta)):
    scaling V_g by (1 +/- 0.095) scales m_CH4_slip by the same factor,
    for any eta. So low/high = central * (1 -/+ 0.095) exactly -- not a
    new estimate, just the already-documented +/-9.5% rule
    (scenarios.json volumeUncertainty) applied algebraically to the
    already-computed central national total.
    """
    rows = read_national_totals()
    filtered = [r for r in rows if r["methaneFractionId"] == "x85" and r["referenceTemperatureId"] == "15C"]
    years = sorted({int(r["year"]) for r in filtered})

    fig_w, fig_h = mm_to_in(84), mm_to_in(65)
    fig, ax = plt.subplots(figsize=(fig_w, fig_h))

    for eff_id, style in EFFICIENCY_STYLE.items():
        values = []
        for year in years:
            row = next(r for r in filtered if r["destructionEfficiencyId"] == eff_id and int(r["year"]) == year)
            values.append(float(row["total_ch4_slip_tonnes"]))
        errors = [v * (VOLUME_UNCERTAINTY_PCT / 100) for v in values]
        ax.errorbar(
            years, values, yerr=errors,
            color=style["color"], marker=style["marker"], linestyle=style["linestyle"],
            linewidth=1.0, markersize=4, capsize=3, elinewidth=0.75,
            label=style["label"],
        )

    ax.set_xlabel("Year")
    ax.set_ylabel("National CH₄ slip (tonnes)")
    ax.set_xticks(years)
    ax.set_xlim(years[0] - 0.3, years[-1] + 0.3)
    # Headroom above the highest error bar so the legend has clear space
    # and does not overlap any line or marker.
    ymax = max(v + v * (VOLUME_UNCERTAINTY_PCT / 100) for eff_id in EFFICIENCY_STYLE for v in
               [float(next(r for r in filtered if r["destructionEfficiencyId"] == eff_id and int(r["year"]) == y)["total_ch4_slip_tonnes"]) for y in years])
    ax.set_ylim(0, ymax * 1.45)
    ax.legend(loc="upper left", fontsize=7, frameon=False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()

    save_tiff_rgb(fig, os.path.join(FIGURES_DIR, "Fig3.tif"))
    save_pdf(fig, os.path.join(FIGURES_DIR, "Fig3.pdf"))
    plt.close(fig)
    print("Wrote figures/Fig3.tif and figures/Fig3.pdf")


def build_fig4():
    """Cumulative share of national flared volume against ranked sites,
    one line per year. Every row is used for ranking and the volume
    total (including zero-volume rows), matching the convention already
    documented in scripts/emas/run_assessment.mjs's buildTop20SitesByYear
    (adding a zero-volume row changes neither the ranking nor the
    total)."""
    with open(NIGERIA_CSV, newline="") as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r["year"] = int(r["year"])
        r["volume"] = float(r["volume"])

    fig_w, fig_h = mm_to_in(84), mm_to_in(65)
    fig, ax = plt.subplots(figsize=(fig_w, fig_h))

    for year in sorted({r["year"] for r in rows}):
        year_rows = sorted((r["volume"] for r in rows if r["year"] == year), reverse=True)
        total = sum(year_rows)
        cumulative = []
        running = 0.0
        for v in year_rows:
            running += v
            cumulative.append(100 * running / total)
        ranks = list(range(1, len(year_rows) + 1))
        style = YEAR_STYLE[year]
        ax.plot(
            ranks, cumulative,
            color=style["color"], marker=style["marker"], linestyle=style["linestyle"],
            linewidth=1.0, markersize=2, markevery=10,
            label=str(year),
        )

    ax.set_xlabel("Site rank (descending flared volume)")
    ax.set_ylabel("Cumulative share of national\nflared volume (%)")
    ax.set_ylim(0, 100)
    ax.legend(loc="lower right", fontsize=7, frameon=False, title=None)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()

    save_tiff_rgb(fig, os.path.join(FIGURES_DIR, "Fig4.tif"))
    save_pdf(fig, os.path.join(FIGURES_DIR, "Fig4.pdf"))
    plt.close(fig)
    print("Wrote figures/Fig4.tif and figures/Fig4.pdf")


def main():
    os.makedirs(FIGURES_DIR, exist_ok=True)
    build_fig3()
    build_fig4()


if __name__ == "__main__":
    main()
