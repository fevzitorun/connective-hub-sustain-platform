"""
PDF Export servisi.
WeasyPrint kullanılır. Kurulu değilse text/markdown fallback döner.

Kurulum: pip install weasyprint
macOS: brew install cairo pango gdk-pixbuf libffi
"""
import re
from datetime import datetime

try:
    from weasyprint import HTML, CSS  # type: ignore
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False


_REPORT_CSS = """
@page {
    size: A4;
    margin: 2.5cm 2cm;
    @bottom-center {
        content: "SustainHub · sustainhub.ai · Sayfa " counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #6b7280;
    }
}
body {
    font-family: "DejaVu Sans", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1f2937;
}
h1 { font-size: 20pt; color: #14532d; margin-top: 0; }
h2 { font-size: 14pt; color: #166534; border-bottom: 1px solid #d1fae5; padding-bottom: 4pt; }
h3 { font-size: 12pt; color: #15803d; }
table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
th { background: #f0fdf4; color: #166534; font-weight: bold; padding: 6pt 8pt; border: 1px solid #d1fae5; }
td { padding: 5pt 8pt; border: 1px solid #e5e7eb; vertical-align: top; }
.header-bar {
    background: #14532d;
    color: white;
    padding: 16pt 20pt;
    margin: -2.5cm -2cm 24pt;
}
.header-bar h1 { color: white; font-size: 16pt; margin: 0; }
.header-bar p { color: #bbf7d0; margin: 4pt 0 0; font-size: 10pt; }
.compliance-badge {
    display: inline-block;
    background: #dcfce7;
    color: #166534;
    border-radius: 4pt;
    padding: 2pt 8pt;
    font-weight: bold;
}
blockquote { border-left: 3pt solid #16a34a; margin: 0; padding-left: 12pt; color: #374151; }
"""


def _markdown_to_html(text: str) -> str:
    """Basit markdown → HTML dönüştürücü (WeasyPrint için)."""
    # Başlıklar
    text = re.sub(r'^### (.+)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)
    text = re.sub(r'^## (.+)$', r'<h2>\1</h2>', text, flags=re.MULTILINE)
    text = re.sub(r'^# (.+)$', r'<h1>\1</h1>', text, flags=re.MULTILINE)
    # Bold / italic
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # Madde işareti
    text = re.sub(r'^- (.+)$', r'<li>\1</li>', text, flags=re.MULTILINE)
    text = re.sub(r'(<li>.*?</li>\n?)+', r'<ul>\g<0></ul>', text, flags=re.DOTALL)
    # Paragraflar
    text = re.sub(r'\n{2,}', '</p><p>', text)
    text = f'<p>{text}</p>'
    return text


def generate_pdf(
    report_text: str,
    company_name: str,
    standard: str,
    year: int,
    compliance_score: int | None = None,
) -> bytes:
    """
    Rapor metninden PDF üret.
    Returns: PDF bytes (WeasyPrint varsa) veya UTF-8 kodlu plain-text bytes.
    """
    now = datetime.utcnow().strftime("%d.%m.%Y")
    score_html = (
        f'<span class="compliance-badge">Uyum Skoru: {compliance_score}/100</span>'
        if compliance_score is not None
        else ""
    )

    html_body = _markdown_to_html(report_text)
    full_html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>{company_name} — {standard.upper()} Raporu {year}</title>
</head>
<body>
  <div class="header-bar">
    <h1>🌿 SustainHub</h1>
    <p>sustainhub.ai · Global Sürdürülebilirlik İstihbarat Platformu</p>
  </div>
  <h1>{company_name}</h1>
  <p><strong>Standart:</strong> {standard.upper()} &nbsp;|&nbsp;
     <strong>Yıl:</strong> {year} &nbsp;|&nbsp;
     <strong>Oluşturma Tarihi:</strong> {now}</p>
  {score_html}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16pt 0;">
  {html_body}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24pt 0 8pt;">
  <p style="font-size:9pt;color:#9ca3af;text-align:center;">
    Bu rapor SustainHub (sustainhub.ai) tarafından Claude Sonnet 4.6 AI modeli kullanılarak üretilmiştir.
    Raporlama standartlarına uyumluluk için bağımsız güvence önerilir.
  </p>
</body>
</html>"""

    if WEASYPRINT_AVAILABLE:
        pdf_bytes = HTML(string=full_html).write_pdf(
            stylesheets=[CSS(string=_REPORT_CSS)]
        )
        return pdf_bytes

    # Fallback: UTF-8 text
    plain = re.sub(r'<[^>]+>', '', full_html)
    plain = re.sub(r'\n{3,}', '\n\n', plain)
    return plain.encode("utf-8")


def get_content_type() -> str:
    return "application/pdf" if WEASYPRINT_AVAILABLE else "text/plain; charset=utf-8"


def get_file_extension() -> str:
    return "pdf" if WEASYPRINT_AVAILABLE else "txt"
