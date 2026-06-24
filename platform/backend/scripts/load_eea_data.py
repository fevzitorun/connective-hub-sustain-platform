"""
EEA Çevre Göstergeleri Veri Yükleyici.
Kaynak: raporlar/ee25-*.csv (AB-38 ülke verisi)
Hedef: benchmark_service.py EEA_INDICATORS güncelleme + JSON özet.

Kullanım:
  python scripts/load_eea_data.py --csv-dir ../../../raporlar --output eea_summary.json
"""
import csv
import json
import argparse
from pathlib import Path

EEA_FILES = {
    "circular_material_use_rate": {
        "file": "ee25-circular-material-use-rate-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend_Circular_material_use_rate_Percent",
        "unit": "%",
        "name": "Döngüsel Materyal Kullanım Oranı",
    },
    "organic_farming_area": {
        "file": "ee25-area-under-organic-farming-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "%",
        "name": "Organik Tarım Alanı",
    },
    "climate_economic_losses": {
        "file": "ee25-climate-related-economic-losses-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "milyar EUR",
        "name": "İklimle İlişkili Ekonomik Kayıplar",
    },
    "consumption_footprint": {
        "file": "ee25-consumption-footprint-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "ton/kişi",
        "name": "Tüketim Ayak İzi",
    },
    "eco_innovation_index": {
        "file": "ee25-eco-innovation-index-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "index",
        "name": "Eko-İnovasyon Endeksi",
    },
    "green_employment": {
        "file": "ee25-employment-in-the-environmental-goods-and-services-sector-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "% toplam istihdam",
        "name": "Çevre Sektöründe İstihdam",
    },
    "energy_poverty": {
        "file": "ee25-energy-poverty-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "%",
        "name": "Enerji Yoksulluğu",
    },
    "env_protection_expenditure": {
        "file": "ee25-environmental-protection-expenditure-all-eea38-countries.csv",
        "eu_col_keyword": "EU_trend",
        "unit": "% GSYH",
        "name": "Çevre Koruma Harcamaları",
    },
}


def find_eu_column(headers: list[str], keyword: str):
    """EU trend sütununu bul."""
    for h in headers:
        if "EU_trend" in h or keyword in h:
            return h
    return None


def extract_latest_eu_value(csv_path: Path, eu_col_keyword: str):
    """Son yılın AB ortalama değerini ve bir önceki yıl değerini döndür."""
    rows = []
    eu_col = None

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        eu_col = find_eu_column(headers, eu_col_keyword)

        for row in reader:
            year_str = row.get("years", "").strip()
            if not year_str or not year_str.isdigit():
                continue
            val_str = row.get(eu_col, "").strip() if eu_col else ""
            try:
                rows.append((int(year_str), float(val_str)))
            except (ValueError, TypeError):
                continue

    if not rows:
        return None, None, None

    rows.sort(key=lambda x: x[0])
    # Son iki değer
    latest_year, latest_val = rows[-1]
    prev_val = rows[-2][1] if len(rows) >= 2 else latest_val
    trend = round(latest_val - prev_val, 2)
    return round(latest_val, 2), latest_year, trend


def load_all_indicators(csv_dir: Path) -> dict:
    results = {}
    for key, meta in EEA_FILES.items():
        csv_path = csv_dir / meta["file"]
        if not csv_path.exists():
            print(f"  [ATLA] {meta['file']} bulunamadı")
            continue

        value, year, trend = extract_latest_eu_value(csv_path, meta["eu_col_keyword"])
        if value is None:
            print(f"  [HATA] {meta['file']} okunamadı")
            continue

        results[key] = {
            "name": meta["name"],
            "value": value,
            "unit": meta["unit"],
            "trend": trend,
            "year": year,
            "source": "EEA",
            "file": meta["file"],
        }
        print(f"  [OK] {meta['name']}: {value} {meta['unit']} ({year}), trend: {trend:+.2f}")

    return results


def main():
    parser = argparse.ArgumentParser(description="EEA CSV verilerini yükle")
    parser.add_argument("--csv-dir", default="../../../raporlar", help="raporlar/ klasörü yolu")
    parser.add_argument("--output", default="eea_summary.json", help="Çıktı JSON dosyası")
    args = parser.parse_args()

    csv_dir = Path(args.csv_dir).resolve()
    print(f"EEA CSV klasörü: {csv_dir}")

    if not csv_dir.exists():
        print(f"HATA: Klasör bulunamadı: {csv_dir}")
        return

    print("\nGöstergeler yükleniyor...")
    indicators = load_all_indicators(csv_dir)

    output_path = Path(args.output)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(indicators, f, ensure_ascii=False, indent=2)

    print(f"\n{len(indicators)}/{len(EEA_FILES)} gösterge yüklendi → {output_path}")
    print("\nBenchmark servisine entegre etmek için:")
    print("  benchmark_service.py > EEA_INDICATORS sözlüğünü bu dosyayla güncelleyin.")


if __name__ == "__main__":
    main()
