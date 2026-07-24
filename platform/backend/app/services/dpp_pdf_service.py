"""
DPP PDF export — baskıya hazır, QR kodlu tekil pasaport.

Fiziksel ürüne iliştirilebilecek A4 / A5 çıktı için. WeasyPrint kullanılır
(zaten reqs'da). Native kütüphaneler eksikse HTML fallback döner.

Header'lar sektör-özel etiketlerle Türkçe. Public URL QR olarak sağ üstte.
"""
from __future__ import annotations
from datetime import datetime
from .dpp_service import build_public_url, generate_qr_svg

try:
    from weasyprint import HTML, CSS
    _PDF_AVAILABLE = True
except (ImportError, OSError):
    _PDF_AVAILABLE = False


CATEGORY_LABEL_TR = {
    "textile": "Tekstil",
    "battery": "Batarya",
    "electronics": "Elektronik",
    "furniture": "Mobilya",
    "iron_steel": "Demir-Çelik",
    "tyre": "Lastik",
    "detergent": "Deterjan",
    "paint": "Boya",
    "construction": "İnşaat Malzemesi",
    "chemical": "Kimyasal",
    "other": "Diğer",
}


def _build_html(passport, product) -> str:
    public_url = build_public_url(passport.id)
    qr_svg = generate_qr_svg(public_url, scale=6)

    materials_rows = "".join(
        f"<tr><td>{m.material_name}</td>"
        f"<td>%{(m.percentage_by_weight or 0):.1f}</td>"
        f"<td>%{(m.recycled_content_pct or 0):.0f}</td>"
        f"<td>{m.source_country or '-'}</td>"
        f"<td>{'⚠️' if m.is_hazardous else '✓'}</td></tr>"
        for m in (passport.materials or [])
    ) or "<tr><td colspan='5' style='color:#94a3b8'>Malzeme kaydı yok</td></tr>"

    doc_rows = "".join(
        f"<tr><td>{d.doc_type.upper()}</td><td>{d.title}</td>"
        f"<td>{d.issued_by or '-'}</td>"
        f"<td>{d.valid_until.isoformat() if d.valid_until else '-'}</td></tr>"
        for d in (passport.documents or [])
    ) or "<tr><td colspan='4' style='color:#94a3b8'>Belge yok</td></tr>"

    supplier_rows = "".join(
        f"<tr><td>T{s.tier}</td><td>{s.name}</td>"
        f"<td>{s.country or '-'}</td>"
        f"<td>{s.role or '-'}</td>"
        f"<td>{', '.join(s.certifications or []) or '-'}</td></tr>"
        for s in (passport.suppliers or [])
    ) or "<tr><td colspan='5' style='color:#94a3b8'>Tedarikçi bilgisi yok</td></tr>"

    green = passport.green_score
    green_html = (
        f'<div class="score-box"><div class="score-val">{green:.0f}</div>'
        f'<div class="score-label">Yeşil Skor · {(passport.green_score_breakdown or {}).get("grade","-")}</div></div>'
        if green is not None else '<div class="score-box empty">Skor hesaplanmadı</div>'
    )

    return f"""<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>DPP {product.name_tr}</title></head>
<body>
  <header>
    <div class="brand">SustainHub · Dijital Ürün Pasaportu</div>
    <div class="qr">{qr_svg}</div>
  </header>
  <h1>{product.name_tr}</h1>
  <div class="sub">{CATEGORY_LABEL_TR.get(product.category, product.category)}
    {f'· {product.subcategory}' if product.subcategory else ''}</div>

  <div class="row">
    <div class="col">
      <div class="kv"><span>SKU</span><b>{product.sku}</b></div>
      <div class="kv"><span>GTIN</span><b>{product.gtin or '-'}</b></div>
      <div class="kv"><span>Parti No</span><b>{product.batch_number or '-'}</b></div>
      <div class="kv"><span>Menşei</span><b>{product.manufacturing_country or '-'}</b></div>
      <div class="kv"><span>Üretim Tarihi</span><b>{product.manufactured_at.isoformat() if product.manufactured_at else '-'}</b></div>
      <div class="kv"><span>Ağırlık</span><b>{(f'{product.weight_kg} kg') if product.weight_kg else '-'}</b></div>
      <div class="kv"><span>CE</span><b>{'✓' if product.ce_marked else '-'}</b></div>
      <div class="kv"><span>Enerji Sınıfı</span><b>{product.energy_class or '-'}</b></div>
      <div class="kv"><span>Garanti</span><b>{f'{product.warranty_months} ay' if product.warranty_months else '-'}</b></div>
    </div>
    <div class="col right">
      {green_html}
      <div class="kv"><span>Karbon Ayak İzi</span><b>{f'{passport.carbon_footprint_kgco2e:.1f} kgCO₂e' if passport.carbon_footprint_kgco2e else '-'}</b></div>
      <div class="kv"><span>Geri Dönüştürülmüş</span><b>{f'%{passport.recycled_content_pct:.0f}' if passport.recycled_content_pct else '-'}</b></div>
      <div class="kv"><span>Onarılabilirlik</span><b>{f'{passport.repairability_score}/10' if passport.repairability_score else '-'}</b></div>
      <div class="kv"><span>Pasaport v{passport.version}</span><b>{passport.status.upper()}</b></div>
    </div>
  </div>

  <h2>Malzeme Bileşimi</h2>
  <table><thead><tr><th>Malzeme</th><th>%</th><th>Geri Dön.</th><th>Menşei</th><th>Tehlike</th></tr></thead>
  <tbody>{materials_rows}</tbody></table>

  <h2>Tedarik Zinciri (Tier 1)</h2>
  <table><thead><tr><th>Tier</th><th>Ad</th><th>Ülke</th><th>Rol</th><th>Sertifikalar</th></tr></thead>
  <tbody>{supplier_rows}</tbody></table>

  <h2>Uygunluk Belgeleri</h2>
  <table><thead><tr><th>Tip</th><th>Başlık</th><th>Veren</th><th>Geçerlilik</th></tr></thead>
  <tbody>{doc_rows}</tbody></table>

  {f'<h2>Geri Dönüşüm Talimatları</h2><p>{passport.recycling_instructions}</p>' if passport.recycling_instructions else ''}

  <footer>
    <div>Yayın: {passport.issued_at.isoformat() if passport.issued_at else 'draft'} ·
    <a>{public_url}</a></div>
    <div class="tiny">AB ESPR (Tüzük 2024/1781) formatında · SustainHub tarafından üretildi</div>
  </footer>
</body></html>"""


_CSS = """
@page { size: A4; margin: 1.5cm; }
body { font-family: "DejaVu Sans", Arial, sans-serif; font-size: 10pt; color:#0f172a; }
header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
.brand { font-weight: bold; color: #059669; letter-spacing: 0.5px; }
.qr { width: 3.5cm; }
.qr svg { width: 100%; }
h1 { font-size: 20pt; margin: 12px 0 2px 0; }
.sub { color: #64748b; margin-bottom: 12px; }
.row { display: flex; gap: 20px; margin: 12px 0; }
.col { flex: 1; }
.col.right { border-left: 1px solid #e2e8f0; padding-left: 20px; }
.kv { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0; }
.kv span { color: #64748b; }
.kv b { color: #0f172a; }
.score-box { text-align: center; background: #ecfdf5; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
.score-box.empty { color: #94a3b8; background: #f8fafc; }
.score-val { font-size: 32pt; font-weight: bold; color: #059669; line-height: 1; }
.score-label { font-size: 9pt; color: #047857; }
h2 { font-size: 12pt; color: #1e293b; margin-top: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; }
th { text-align: left; background: #f1f5f9; padding: 6px; }
td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
footer { margin-top: 24px; font-size: 8pt; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
.tiny { color: #94a3b8; }
"""


def generate_pdf(passport, product) -> tuple[bytes, str]:
    """
    Returns (content, media_type). PDF üretilemezse HTML fallback döner.
    """
    html = _build_html(passport, product)
    if not _PDF_AVAILABLE:
        return html.encode("utf-8"), "text/html"
    pdf_bytes = HTML(string=html).write_pdf(stylesheets=[CSS(string=_CSS)])
    return pdf_bytes, "application/pdf"
