"""
Magic Import Engine — AI destekli Excel/CSV sütun haritalama.
Kullanıcının Excel tablolarını EmissionData alanlarına otomatik eşler.
"""
import io
import re
from typing import Optional
from dataclasses import dataclass, field

try:
    import openpyxl  # type: ignore
    XLSX_AVAILABLE = True
except ImportError:
    XLSX_AVAILABLE = False

import csv as csv_module

# canonical field → tanınan başlık desenleri (TR + EN)
FIELD_PATTERNS: dict[str, list[str]] = {
    "natural_gas_m3": [
        "doğalgaz", "dogalgaz", "natural gas", "gas consumption", "gaz tüketim",
        "gaz_m3", "ng m3", "ng_m3", "gazm3", "dogal gaz",
    ],
    "diesel_liters": [
        "dizel", "diesel", "yakıt", "fuel", "mazot", "motorin", "fuel oil",
        "dizel litre", "diesel liter", "yakıt litre",
    ],
    "lpg_kg": [
        "lpg", "tüp gaz", "tup gaz", "propane", "bütan", "butane", "sıvı gaz",
    ],
    "coal_tons": [
        "kömür", "komur", "coal", "linyit", "lignite", "taş kömür",
    ],
    "electricity_kwh": [
        "elektrik", "electricity", "electric", "enerji tüketim", "kwh",
        "power consumption", "elektrik tüketim", "el_kwh", "electricitykwh",
    ],
    "renewable_electricity_kwh": [
        "yenilenebilir", "renewable", "solar", "güneş", "rüzgar", "wind",
        "green energy", "temiz enerji", "ye elektrik",
    ],
    "steam_gj": [
        "buhar", "steam", "gj", "steam gj", "buhar gj",
    ],
    "company_vehicles_km": [
        "araç km", "arac km", "vehicle km", "fleet km", "filo km",
        "şirket araç", "company vehicle", "araç", "filo",
    ],
    "business_flights_shorthaul": [
        "kısa uçuş", "kisa ucus", "short haul", "shorthaul", "iç hat",
        "domestic flight", "kısa mesafe uçuş",
    ],
    "business_flights_longhaul": [
        "uzun uçuş", "uzun ucus", "long haul", "longhaul", "dış hat",
        "international flight", "uzun mesafe uçuş",
    ],
    "employee_commute_km": [
        "işe gidiş", "ise gidis", "commute", "servis km", "shuttle",
        "personel taşıma", "çalışan ulaşım",
    ],
    "purchased_goods_spend_tl": [
        "satın alım", "satin alim", "purchased goods", "tedarik harcama",
        "mal alım", "goods spend",
    ],
    "waste_tons": [
        "atık", "atik", "waste", "çöp", "cop", "katı atık", "solid waste",
        "atık ton", "waste ton",
    ],
    "water_m3": [
        "su tüketim", "su tuketim", "water", "su m3", "water m3",
        "water consumption",
    ],
    "year": [
        "yıl", "yil", "year", "dönem", "donem", "period", "reporting year",
        "raporlama yılı", "tarih",
    ],
    "employee_count": [
        "çalışan sayısı", "calisan sayisi", "employee count", "personel sayısı",
        "staff count", "headcount", "çalışan", "calisan",
    ],
    "sector": [
        "sektör", "sektor", "sector", "industry", "endüstri",
    ],
}


@dataclass
class ColumnMapping:
    original_name: str
    mapped_field: Optional[str]
    confidence: float
    sample_values: list = field(default_factory=list)
    unit_hint: str = ""


@dataclass
class ImportPreview:
    filename: str
    row_count: int
    column_mappings: list
    unmapped_columns: list
    mapped_count: int


def _normalize(text: str) -> str:
    text = str(text).lower().strip()
    for k, v in {'ı': 'i', 'ğ': 'g', 'ş': 's', 'ç': 'c', 'ö': 'o', 'ü': 'u'}.items():
        text = text.replace(k, v)
    text = re.sub(r'[_\-\/\(\)\[\]\.\s]+', ' ', text).strip()
    return text


def _score_match(col: str, patterns: list[str]) -> float:
    nc = _normalize(col)
    for pat in patterns:
        np_ = _normalize(pat)
        if nc == np_:
            return 1.0
        if np_ in nc or nc in np_:
            return 0.87
        cw = set(nc.split())
        pw = set(np_.split())
        overlap = len(cw & pw)
        if overlap > 0:
            score = 0.5 + 0.35 * overlap / max(len(cw), len(pw))
            if score > 0.4:
                return score
    return 0.0


_UNIT_HINTS = {
    "natural_gas_m3": "m³/yıl",
    "diesel_liters": "Litre/yıl",
    "lpg_kg": "kg/yıl",
    "coal_tons": "Ton/yıl",
    "electricity_kwh": "kWh/yıl",
    "renewable_electricity_kwh": "kWh/yıl",
    "steam_gj": "GJ/yıl",
    "company_vehicles_km": "km/yıl",
    "business_flights_shorthaul": "Uçuş sayısı",
    "business_flights_longhaul": "Uçuş sayısı",
    "employee_commute_km": "km/yıl",
    "purchased_goods_spend_tl": "₺/yıl",
    "waste_tons": "Ton/yıl",
    "water_m3": "m³/yıl",
    "year": "YYYY",
    "employee_count": "Kişi",
    "sector": "Metin",
}


def map_column(col_name: str) -> tuple[Optional[str], float]:
    best_field, best_score = None, 0.0
    for f, patterns in FIELD_PATTERNS.items():
        s = _score_match(col_name, patterns)
        if s > best_score:
            best_score, best_field = s, f
    if best_score < 0.38:
        return None, 0.0
    return best_field, round(best_score, 2)


def parse_import_file(file_bytes: bytes, filename: str) -> ImportPreview:
    """Parse Excel/CSV and return AI column mapping preview."""
    rows: list[dict] = []
    headers: list[str] = []

    fname_lower = filename.lower()
    if fname_lower.endswith('.csv'):
        content = file_bytes.decode('utf-8-sig', errors='replace')
        reader = csv_module.DictReader(io.StringIO(content))
        headers = list(reader.fieldnames or [])
        for i, row in enumerate(reader):
            if i >= 200:
                break
            rows.append(dict(row))
    elif fname_lower.endswith(('.xlsx', '.xls')):
        if not XLSX_AVAILABLE:
            raise ValueError("Excel desteği için openpyxl gerekli.")
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True, read_only=True)
        ws = wb.active
        all_rows = list(ws.iter_rows(values_only=True))
        wb.close()
        if not all_rows:
            raise ValueError("Dosya boş.")
        header_row_idx = next(
            (i for i, r in enumerate(all_rows) if any(c is not None for c in r)), None
        )
        if header_row_idx is None:
            raise ValueError("Başlık satırı bulunamadı.")
        raw_headers = all_rows[header_row_idx]
        headers = [str(h).strip() if h is not None else f"Sütun_{i}" for i, h in enumerate(raw_headers)]
        for row in all_rows[header_row_idx + 1:header_row_idx + 201]:
            if any(c is not None for c in row):
                rows.append({headers[i]: row[i] for i in range(min(len(headers), len(row)))})
    else:
        raise ValueError("Desteklenmeyen dosya formatı. Lütfen .xlsx, .xls veya .csv yükleyin.")

    mappings: list[ColumnMapping] = []
    unmapped: list[str] = []
    seen_fields: set[str] = set()

    for h in headers:
        if not h or h.strip() in ('', 'None'):
            continue
        f, conf = map_column(h)
        if f in seen_fields:
            f = None
            conf = 0.0
        if f:
            seen_fields.add(f)
        sample = [str(r.get(h, '')) for r in rows[:3] if r.get(h) not in (None, '', 'None')][:3]
        mappings.append(ColumnMapping(
            original_name=h,
            mapped_field=f,
            confidence=conf,
            sample_values=sample,
            unit_hint=_UNIT_HINTS.get(f, '') if f else '',
        ))
        if not f:
            unmapped.append(h)

    return ImportPreview(
        filename=filename,
        row_count=len(rows),
        column_mappings=mappings,
        unmapped_columns=unmapped,
        mapped_count=len([m for m in mappings if m.mapped_field]),
    )


def apply_mapping(rows: list[dict], confirmed_mapping: dict[str, str]) -> list[dict]:
    """
    Apply confirmed column mapping to raw rows.
    confirmed_mapping: {original_col_name → target_field_name}
    Returns list of EmissionData-compatible dicts.
    """
    result = []
    for row in rows:
        record: dict = {}
        for orig_col, target_field in confirmed_mapping.items():
            if not target_field:
                continue
            val = row.get(orig_col)
            if val in (None, '', 'None'):
                continue
            try:
                if target_field in ('year', 'employee_count'):
                    record[target_field] = int(float(str(val)))
                elif target_field == 'sector':
                    record[target_field] = str(val).strip().lower()
                else:
                    record[target_field] = float(str(val).replace(',', '.').replace(' ', ''))
            except (ValueError, TypeError):
                pass
        if record:
            result.append(record)
    return result
