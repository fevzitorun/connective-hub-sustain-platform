"""
Rapor şablonları — TSRS, COP31, CBAM, EUDR, UK SRS, CSRD.
Her şablon: sistem prompt eki + zorunlu bölüm yapısı + uyum çerçevesi.
"""
import uuid
from sqlalchemy import String, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base

# Yerleşik şablonlar — DB yerine kod içinde tanımlandı (Phase 4'te DB'ye taşınabilir)
BUILTIN_TEMPLATES = [
    {
        "id": "tsrs-v2",
        "name": "TSRS 1 & 2 — Standart Rapor",
        "standard": "tsrs",
        "language": "tr",
        "description": "KGK tarafından zorunlu kılınan TSRS 1 (İklimle İlgili Riskler ve Fırsatlar) "
                       "ve TSRS 2 (Yönetişim) standartlarına uyumlu Türkçe rapor.",
        "required_sections": [
            "Rapor Hakkında",
            "Yönetişim",
            "Strateji",
            "Risk Yönetimi",
            "Metrik ve Hedefler",
            "TSRS Uyum Endeksi",
            "Güvence Beyanı",
        ],
        "regulatory_refs": ["KGK 29.12.2023", "RG 32414", "TSRS 1", "TSRS 2"],
        "prompt_suffix": "Raporun dili TÜRKÇE olmalı. Tüm TSRS maddeleri ele alınmalı.",
        "is_active": True,
    },
    {
        "id": "cop31-tr",
        "name": "COP31 Sunum Raporu — Türkiye",
        "standard": "cop31",
        "language": "tr",
        "description": "Türkiye'nin COP31 taahhütlerini öne çıkaran sunum raporu. "
                       "NDC hedefleri, uzun vadeli iklim stratejisi ve sektör katkıları.",
        "required_sections": [
            "Türkiye'nin İklim Taahhütleri (NDC)",
            "Net Sıfır Hedef Senaryoları",
            "Sektörel Karbonsuzlaşma Planı",
            "Paris Anlaşması Uyumu",
            "Finansman ve Teknoloji İhtiyaçları",
            "Uyum ve Dayanıklılık",
        ],
        "regulatory_refs": ["UNFCCC NDC", "Paris Anlaşması Md.4", "IPCC 1.5°C"],
        "prompt_suffix": (
            "Bu, COP31 Bakü 2026 için hazırlanmış bir sunum raporu. "
            "Türkiye NDC (Ulusal Katkı Beyanı) ve Uzun Vadeli İklim Stratejisi'ne dayandır. "
            "Rafineri, çelik ve tekstil sektörlerinin dönüşüm planlarını vurgula."
        ),
        "is_active": True,
    },
    {
        "id": "cbam-declaration",
        "name": "CBAM Emisyon Beyan Raporu",
        "standard": "cbam",
        "language": "tr",
        "description": "AB'ye ihracat yapan şirketler için Tüzük (AB) 2023/956 kapsamında "
                       "çelik, alüminyum, çimento, gübre, elektrik veya hidrojen gömülü emisyon beyanı.",
        "required_sections": [
            "Ürün ve CN Kodu",
            "Gömülü Doğrudan Emisyon",
            "Gömülü Dolaylı Emisyon",
            "Emisyon Hesaplama Metodolojisi",
            "AB ETS Sertifika Sayısı",
            "Türkiye Karbon Fiyatı Mahsubu",
            "Beyan Beyannamesi",
        ],
        "regulatory_refs": ["Tüzük (AB) 2023/956", "CBAM Uygulama Tüzüğü 2023/1773"],
        "prompt_suffix": (
            "CBAM beyanı İNGİLİZCE veya TÜRKÇE seçilebilir. "
            "AB ETS fiyatına göre yükümlülük hesaplanmalı. "
            "İhracat miktarı, gömülü CO₂ faktörü ve AB ETS fiyatı hesaplamada kullanılmalı."
        ),
        "is_active": True,
    },
    {
        "id": "eudr-due-diligence",
        "name": "EUDR Tedarik Zinciri Durum Tespiti",
        "standard": "eudr",
        "language": "tr",
        "description": "Tüzük (AB) 2023/1115 — 8 emtia grubu için ormansızlaşmaya yol açmadığını "
                       "kanıtlayan durum tespiti raporu. Aralık 2026 zorunlu.",
        "required_sections": [
            "Şirket ve Kapsam",
            "Tedarik Zinciri Haritalama",
            "Coğrafi Koordinat Doğrulama",
            "Risk Değerlendirme Metodolojisi",
            "Azaltma Tedbirleri",
            "AB Bilgi Sistemi Bildirimi",
            "Uyum Beyanı",
        ],
        "regulatory_refs": ["Tüzük (AB) 2023/1115", "EUDR Md.8 Durum Tespiti"],
        "prompt_suffix": (
            "EUDR raporu; ürün, coğrafi koordinat ve risk düzeyini kapsayan durum tespiti formatında hazırlanmalı. "
            "Türkiye'den ihraç edilen ahşap, kağıt, palmiye, kakao gibi emtialar öncelikli."
        ),
        "is_active": True,
    },
    {
        "id": "csrd-double-materiality",
        "name": "CSRD Çifte Önemlilik Analizi",
        "standard": "csrd",
        "language": "en",
        "description": "AB Kurumsal Sürdürülebilirlik Raporlama Direktifi — ESRS standartları "
                       "çerçevesinde etki, finansal risk ve fırsat analizi.",
        "required_sections": [
            "Double Materiality Assessment Process",
            "Impact Materiality (IRO-1)",
            "Financial Materiality",
            "Stakeholder Engagement",
            "ESRS Topic Coverage",
            "Transition Plan (ESRS E1)",
            "Value Chain Analysis",
        ],
        "regulatory_refs": ["Direktif (AB) 2022/2464", "ESRS 1", "ESRS 2", "ESRS E1"],
        "prompt_suffix": (
            "This is a CSRD double materiality report in ENGLISH. "
            "Follow ESRS 1 General Requirements. Identify IROs (Impacts, Risks, Opportunities). "
            "Include transition plan for climate (ESRS E1)."
        ),
        "is_active": True,
    },
    {
        "id": "uk-srs",
        "name": "UK Sustainability Reporting Standard",
        "standard": "uk_srs",
        "language": "en",
        "description": "UK Sustainability Disclosure Standards — TCFD uyumlu İngilizce "
                       "iklim açıklama raporu. UK borsaya kayıtlı şirketler için.",
        "required_sections": [
            "Governance",
            "Strategy",
            "Risk Management",
            "Metrics and Targets",
            "Climate Scenario Analysis (1.5°C / 4°C)",
            "Transition Plan",
        ],
        "regulatory_refs": ["UK SRS", "TCFD", "FCA PS22/3"],
        "prompt_suffix": (
            "UK SRS report in ENGLISH. Follow TCFD framework. "
            "Include scenario analysis aligned with IPCC 1.5°C and 4°C pathways. "
            "Reference UK net zero target 2050."
        ),
        "is_active": True,
    },
    {
        "id": "gri-universal",
        "name": "GRI Universal Standards Raporu",
        "standard": "gri",
        "language": "tr",
        "description": "GRI 1-3 Universal Standards 2021 çerçevesinde kapsamlı "
                       "sürdürülebilirlik raporu. GRI Endeksi dahil.",
        "required_sections": [
            "Kuruluş ve Raporlama Uygulamaları",
            "Faaliyetler ve İşçiler",
            "Yönetişim",
            "Strateji, Politikalar ve Uygulamalar",
            "Paydaş Katılımı",
            "Önemlilik ve Kapsam",
            "GRI İçerik Endeksi",
        ],
        "regulatory_refs": ["GRI 1 (2021)", "GRI 2 (2021)", "GRI 3 (2021)", "GRI 305 Emisyonlar"],
        "prompt_suffix": (
            "GRI raporlaması TÜRKÇE. GRI 1, GRI 2, GRI 3 Universal Standards gerekliliklerini karşıla. "
            "Son bölümde GRI İçerik Endeksi tablosu oluştur."
        ),
        "is_active": True,
    },
    {
        "id": "eu-taxonomy-v1",
        "name": "EU Taxonomy Raporu",
        "standard": "eu_taxonomy",
        "language": "en",
        "description": "Tüzük (AB) 2020/852 — Bir şirketin ekonomik faaliyetlerinin 6 çevresel hedefe "
                       "göre sürdürülebilirlik performansını değerlendiren rapor.",
        "required_sections": [
            "Executive Summary",
            "Taxonomy-Eligible Activities",
            "Alignment with Environmental Objectives",
            "Substantial Contribution Analysis",
            "Do No Significant Harm (DNSH) Assessment",
            "Taxonomy KPI Disclosures (Turnover, CapEx, OpEx)",
            "Minimum Safeguards Compliance",
        ],
        "regulatory_refs": ["Regulation (EU) 2020/852", "Taxonomy Delegated Acts"],
        "prompt_suffix": (
            "This is an EU Taxonomy report in ENGLISH. Focus on the 3 core KPIs: Turnover, CapEx, and OpEx. "
            "Clearly distinguish between 'eligible' and 'aligned' activities. Detail the SC and DNSH criteria."
        ),
        "is_active": True,
    },
    {
        "id": "cdp-climate-v2024",
        "name": "CDP İklim Değişikliği Raporu",
        "standard": "cdp",
        "language": "en",
        "description": "CDP (Carbon Disclosure Project) 2024 İklim Değişikliği soru setine dayalı "
                       "kapsamlı beyan raporu. A'dan D-'ye puanlama için temel oluşturur.",
        "required_sections": [
            "C0: Introduction",
            "C1: Governance",
            "C2: Risks and Opportunities",
            "C3: Business Strategy",
            "C4: Targets and Performance",
            "C5: Emissions Methodology",
            "C6: Emissions Data",
            "C7: Emissions Breakdown",
            "C8: Energy",
            "C9: Additional Metrics",
            "C11: Carbon Pricing",
            "C12: Engagement",
        ],
        "regulatory_refs": ["CDP Climate Change Questionnaire 2024", "TCFD"],
        "prompt_suffix": (
            "This is a CDP Climate Change report in ENGLISH. The structure must follow the official "
            "CDP questionnaire modules (C1, C2, C3...). Answer each question clearly and provide "
            "quantitative data where requested. The goal is to achieve a high score (A or B)."
        ),
        "is_active": True,
    },
    {
        "id": "eu-taxonomy-v2024",
        "name": "EU Taxonomy Alignment Report",
        "standard": "eu_taxonomy",
        "language": "en",
        "description": "AB Taksonomisi (EU 2020/852) uygunluk ve uyum raporu.",
        "required_sections": [
            "Executive Summary",
            "Business Activities & NACE Mapping",
            "Eligibility Assessment (Turnover, CapEx, OpEx)",
            "Alignment Assessment (SC, DNSH, MS)",
            "Substantial Contribution (SC) Analysis",
            "Do No Significant Harm (DNSH) Evaluation",
            "Minimum Safeguards (MS) Compliance",
            "Taxonomy KPI Disclosures",
            "Recommendations & Action Plan"
        ],
        "regulatory_refs": ["EU Taxonomy Regulation 2020/852", "EU 2021/2139", "EU 2023/2486"],
        "prompt_suffix": (
            "This is an EU Taxonomy Alignment Report in ENGLISH. Clearly explain the difference between Eligibility and Alignment. "
            "Detail the results for the three main KPIs: Turnover, CapEx, and OpEx. Provide a section for each of the 6 environmental objectives."
        ),
        "is_active": True,
    },
    {
        "id": "gpc-municipality-metropolitan-v1",
        "name": "Büyükşehir Belediyesi Sürdürülebilirlik Raporu (GPC)",
        "standard": "gpc_municipality",
        "language": "tr",
        "description": "GPC (Global Protocol for Community-Scale GHG Inventories) kent ölçeği "
                       "envanterine dayalı büyükşehir belediyesi tam sürdürülebilirlik raporu. "
                       "İzmir B.B. 2024 formatı referans alınır.",
        "required_sections": [
            "Kurumsal Profil",
            "Yönetişim",
            "GPC Sera Gazı Envanteri",
            "Sosyal Performans",
            "Ekonomik Performans",
            "Hedefler ve Taahhütler",
            "Performans Göstergeleri Tablosu",
        ],
        "regulatory_refs": ["GPC (WRI/C40/ICLEI)", "CDP-ICLEI Unified Reporting", "Global Covenant of Mayors"],
        "prompt_suffix": (
            "Bu bir BÜYÜKŞEHİR BELEDİYESİ sürdürülebilirlik raporu, dili TÜRKÇE. "
            "GPC standardına göre kent ölçeği sera gazı envanterini (Sabit Enerji, Ulaşım, Atık; "
            "opsiyonel IPPU/AFOLU) sektör kırılımıyla sun. Belediye Sürdürülebilirlik Endeksi "
            "skorunu (Ekonomik/Sosyal/Çevresel, 0-4 ölçek) ve harf notunu yorumla."
        ),
        "is_active": True,
    },
    {
        "id": "gpc-municipality-district-v1",
        "name": "İlçe Belediyesi Durum Analiz Raporu",
        "standard": "gpc_municipality_light",
        "language": "tr",
        "description": "İlçe/küçük belediyeler için hafif durum analizi (gap analysis) formatı. "
                       "Karşıyaka Belediyesi 2022 'Kimseyi geride bırakma' formatı referans alınır.",
        "required_sections": [
            "Kurum Tanıtımı",
            "Rapor Kapsamı",
            "Mevcut Durum Analizi",
            "Öncelikli Alanlar",
            "Yol Haritası",
        ],
        "regulatory_refs": ["GPC (WRI/C40/ICLEI)", "SDG Yerelleştirme"],
        "prompt_suffix": (
            "Bu bir İLÇE BELEDİYESİ durum analiz raporu, dili TÜRKÇE. Tam GPC envanteri yerine "
            "mevcut durum analizi (gap analysis) yaklaşımı kullan. Öncelikli gelişim alanlarını ve "
            "somut bir yol haritasını vurgula. Küçük belediyeler için erişilebilir, sade bir dil kullan."
        ),
        "is_active": True,
    },
]


class ReportTemplate(Base):
    """DB'ye kayıtlı özel şablonlar (tenant bazlı white-label, Phase 4)."""
    __tablename__ = "report_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    standard: Mapped[str] = mapped_column(String(30), nullable=False)
    language: Mapped[str] = mapped_column(String(5), default="tr")
    description: Mapped[str | None] = mapped_column(Text)
    required_sections: Mapped[list] = mapped_column(JSON, default=list)
    regulatory_refs: Mapped[list] = mapped_column(JSON, default=list)
    prompt_suffix: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    company_id: Mapped[str | None] = mapped_column(String, nullable=True)  # None = global
