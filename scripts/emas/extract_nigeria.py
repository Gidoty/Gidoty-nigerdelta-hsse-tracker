#!/usr/bin/env python3
"""Filter Nigerian flare sites out of the EOG VIIRS Nightfire annual
flaring-volume workbooks in data/public/raw/, and write the combined
result to data/public/nigeria_flares.csv.

Standard library plus pandas only (pandas needs openpyxl installed to
read .xlsx; no other dependency). Source files are untrusted input — run
this script with `python3 -I` and never from inside data/public/raw/.

Each input workbook has three site-level sheets, one per flare category:
'flare upstream', 'flare oil downstream', 'flare gas downstream'. Rows
are filtered to ISO Code == 'NGA'. Column names differ slightly release
to release (e.g. 'Avg. temp., K' in the 2022 file vs 'Avg temp., K' in
2023/2024, 'Detection frequency 2022' vs 'Detection freq. 2023') — this
script reads each year's own id/volume column by the exact name that
year's file uses, rather than assuming a single fixed name across years.

This is EOG VIIRS data only. No World Bank GFMR file was available in
this session (see docs/emas/BLOCKERS.md), so nigeria_flares.csv has a
single source. The `source` column is still written explicitly so a
second source can be appended later without changing this script's
output shape.
"""
import csv
import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(HERE, "..", "..", "data", "public", "raw")
OUT_PATH = os.path.join(HERE, "..", "..", "data", "public", "nigeria_flares.csv")

# (year, filename, id-match columns present in that year's sheets)
FILES = [
    (2022, "VIIRS_Global_flaring_d.7_slope_0.029353_2022_v20230526_web.xlsx"),
    (2023, "VIIRS_Global_flaring_d.7_slope_0.029353_2023_v20230614_web_IDmatch.xlsx"),
    (2024, "VIIRS_Global_flaring_d.7_slope_0.029353_2024_v20240730_web_IDmatch.xlsx"),
]

SHEETS = ["flare upstream", "flare oil downstream", "flare gas downstream"]

OUT_COLUMNS = [
    "source",
    "year",
    "sheet",
    "site_id",
    "latitude",
    "longitude",
    "flare_type",
    "volume",
    "volume_unit",
    "id2022",   # present in 2022 and 2023 files only; blank otherwise
    "id2023",   # present in 2023 (as 'ID 2023' itself) and 2024 (as 'ID2023'); blank for 2022
    "idmyc",    # present in 2024 file only; blank otherwise
]


def extract_year(year, filename):
    path = os.path.join(RAW_DIR, filename)
    rows = []
    for sheet in SHEETS:
        df = pd.read_excel(path, sheet_name=sheet, engine="openpyxl")
        df.columns = [str(c).strip() for c in df.columns]
        nga = df[df["ISO Code"] == "NGA"]

        id_col = f"ID {year}"
        vol_col = f"BCM {year}"

        for _, row in nga.iterrows():
            rows.append(
                {
                    "source": "EOG VIIRS",
                    "year": year,
                    "sheet": sheet,
                    "site_id": row[id_col],
                    "latitude": row["Latitude"],
                    "longitude": row["Longitude"],
                    "flare_type": row["Type"],
                    "volume": row[vol_col],
                    "volume_unit": vol_col,  # the provider's own column header, not expanded or assumed
                    "id2022": row.get("id2022", ""),
                    "id2023": row[id_col] if year == 2023 else row.get("ID2023", ""),
                    "idmyc": row.get("IDMYC", ""),
                }
            )
    return rows


def main():
    all_rows = []
    for year, filename in FILES:
        path = os.path.join(RAW_DIR, filename)
        if not os.path.exists(path):
            print(f"Missing expected raw file: {path}", file=sys.stderr)
            sys.exit(1)
        year_rows = extract_year(year, filename)
        print(f"{year}: {len(year_rows)} Nigerian site-rows extracted from {filename}")
        all_rows.extend(year_rows)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=OUT_COLUMNS)
        writer.writeheader()
        for row in all_rows:
            writer.writerow(row)

    print(f"Wrote {len(all_rows)} rows to {OUT_PATH}")


if __name__ == "__main__":
    main()
