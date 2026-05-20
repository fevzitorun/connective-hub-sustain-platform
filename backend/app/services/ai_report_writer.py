"""
Claude claude-sonnet-4-6 ile TSRS 1 & 2 uyumlu Türkçe rapor üretimi.
Prompt caching aktif — sistem promptu cache'te tutulur (maliyet optimizasyonu).
16 gerçek Türk TSRS raporundan öğrenilen format.
"""
import anthropic
from ..config import settings

SYSTEM_PROMPT = """Sen Türkiye'nin en deneyimli sürdürülebilirlik raporu yazarısın.
KGK tarafından yayımlanan TSRS 1 ve TSRS 2 (29.12.2023, 32414 sayılı RG),
GRI Universal Standards 2021, TCFD, ESRS ve AB Taksonomisi standartlarında uzmansın.

Aşağıdaki gerçek Türk şirketlerinin TSRS raporlarını inceleyerek formatı öğrendin:
Akbank 2024, Denizbank 2024, Ziraat Bankası 2025, Arçelik 2024,
Afyon Çimento 2024, OYAK Çimento 2025, Aksa Enerji 2024,
Alarko Holding 2024, ENKA 2025, Migros 2025 (Çift Yönlü Önemlilik),
Tüpraş 2025 (AB Taksonomisi), İller Bankası 2025 (ilk entegre rapor),
Bupa Acıbadem 2024.

RAPOR FORMATI KURALLARI (gerçek raporlardan çıkarıldı):

1. ZORUNLU BÖLÜM SIRASI:
   Rapor Hakkında → Yönetişim → Strateji → Risk Yönetimi →
   Metrik ve Hedefler → Ekler (TSRS Uyum Endeksi + Güvence Beyanı)

2. Her bölümde zorunlu alt başlıklar:
   - Rapor Hakkında: Amaç, Kapsam, Standartlar (TSRS 1&2 KGK 29.12.2023, 32414 sayılı RG),
     Önemlilik, İşletme Sınırları, Geçiş Muafiyetleri, Güvence, SASB Ciltleri
   - Yönetişim: YK izleme fonksiyonu (üç ayda bir), Komiteler, Üst yönetim,
     Ücretlendirme mekanizması (iklim hedefleri bağlantısı)
   - Strateji: Risk/fırsat analizi, Zaman dilimleri (kısa 0-3 yıl, orta 3-10 yıl, uzun 10+ yıl),
     Senaryo analizi (IEA NZE 2050, IPCC 1.5°C/2°C), Geçiş planı, Dirençlilik
   - Risk Yönetimi: Fiziksel riskler (akut+kronik) + Geçiş riskleri + Fırsatlar,
     Değerlendirme metodolojisi, Önceliklendirme matrisi
   - Metrik ve Hedefler: Kapsam 1-2-3 (ayrı ayrı, ton CO₂e), Enerji metrikleri,
     Sektörler arası metrikler, Sektör bazlı (SASB), Hedefler (SBTi varsa)

3. DİL VE TON KURALLARI:
   - Formal kurumsal Türkçe, aktif yapı (pasif YOK)
   - DOĞRU: "Şirketimiz 2024 yılında X ton CO₂e emisyonu gerçekleştirdi."
   - YANLIŞ: "...gerçekleştirilmiştir" veya belirsiz ifadeler
   - Raporun öznesi: "Şirketimiz" veya şirket adı
   - Rakamları her zaman bağlamla: "X ton CO₂e — bir önceki yıla kıyasla %Y azaldı"
   - İngilizce terimler YASAK — Türkçe karşılıklar zorunlu:
     Scope → Kapsam, Materiality → Önemlilik, Scenario Analysis → Senaryo Analizi,
     Net Zero → Net Sıfır, GAR → Yeşil Varlık Oranı, GHG Protocol → Sera Gazı Protokolü

4. SAYI FORMATI:
   - Binlik ayırıcı: nokta → 1.250.000
   - Ondalık: virgül → 1.250,5 ton CO₂e

5. TSRS UYUM ENDEKSİ (EK bölümünde zorunlu tablo):
   | TSRS Maddesi | Açıklama | Sayfa |
   TSRS 1 ve TSRS 2'nin tüm maddeleri tek tek listele.

6. GÜVENCE BEYANI STANDART METNİ:
   "Bu rapor, [Denetim Firması] tarafından GDS 3000/3410 standardı
   kapsamında sınırlı güvence denetimine tabi tutulmuştur."

7. GEÇİŞ MUAFİYETLERİ için:
   "standartların ilk uygulama dönemine özgü kolaylaştırıcı hükümler kapsamında değerlendirilmiştir"

8. SEKTÖRE GÖRE SASB CİLTLERİ:
   Bankacılık: Cilt 16 + Cilt 19 | Çimento: Cilt 10 | Enerji: Cilt 32
   İnşaat: Cilt 33 | Perakende/Gıda: Cilt 22 | Sigorta: Cilt 20+21
   Beyaz Eşya: Cilt 26 | Rafineri: Cilt 31"""


def generate_tsrs_report(
    company_name: str,
    sector: str,
    sasb_volume: str,
    employee_count: int,
    year: int,
    reporting_boundary: str,
    scope1_co2e: float,
    scope2_location_co2e: float,
    scope2_market_co2e: float,
    scope3_co2e: float,
    total_co2e: float,
    natural_gas_m3: float = 0,
    diesel_liters: float = 0,
    electricity_kwh: float = 0,
    electricity_source: str = "grid",
    business_travel_km: float = 0,
    waste_tons: float = 0,
    earthquake_zone: str = "Belirsiz",
    flood_risk: str = "Orta",
    drought_risk: str = "Düşük",
    is_regulated: bool = False,
    is_public: bool = False,
    language: str = "tr",
    assurance_firm: str = "PwC",
    sector_avg_intensity: float = 2.4,
    compliance_score: int = 0,
    missing_items: list[str] | None = None,
) -> tuple[str, dict]:
    """
    TSRS uyumlu tam rapor üret.
    Prompt caching aktif — system prompt cache'te kalır.
    Returns: (rapor metni, usage bilgisi)
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    intensity = round(total_co2e / max(employee_count, 1), 2)
    position = "sektör ortalamasının altında" if intensity < sector_avg_intensity else "sektör ortalamasının üzerinde"

    user_prompt = f"""Aşağıdaki şirket için eksiksiz TSRS 1 & 2 uyumlu sürdürülebilirlik raporu yaz.
Tüm zorunlu bölümleri sistem promptundaki kurallara göre hazırla.

ŞİRKET PROFİLİ:
- Ad: {company_name}
- Sektör: {sector} (SASB Cildi: {sasb_volume})
- Çalışan Sayısı: {employee_count:,}
- Raporlama Yılı: {year}
- Raporlama Sınırı: {reporting_boundary}
- SPK/BDDK Tabi: {'Evet' if is_regulated else 'Hayır'}
- Halka Açık: {'Evet' if is_public else 'Hayır'}
- Güvence Firması: {assurance_firm}

EMİSYON VERİLERİ:
Kapsam 1 (Doğrudan): {scope1_co2e:,.1f} ton CO₂e
  - Doğalgaz: {natural_gas_m3:,.0f} m³
  - Dizel: {diesel_liters:,.0f} litre

Kapsam 2 — Konum Bazlı: {scope2_location_co2e:,.1f} ton CO₂e
Kapsam 2 — Piyasa Bazlı: {scope2_market_co2e:,.1f} ton CO₂e
  - Elektrik: {electricity_kwh:,.0f} kWh
  - Enerji kaynağı: {electricity_source}

Kapsam 3:
  - İş Seyahati: {business_travel_km:,.0f} km uçuş
  - Atık: {waste_tons:,.1f} ton

TOPLAM: {total_co2e:,.1f} ton CO₂e
Karbon yoğunluğu: {intensity:.2f} ton CO₂e/çalışan
Sektör ortalaması: {sector_avg_intensity:.2f} → {position}

FİZİKSEL İKLİM RİSKİ (Uydu & AFAD Verisi):
Deprem Risk Bölgesi: {earthquake_zone}
Sel Risk Seviyesi: {flood_risk}
Kuraklık Riski: {drought_risk}

TSRS UYUMLULUK SKORU: {compliance_score}/100
Eksik alanlar: {', '.join(missing_items or []) or 'Yok'}

Şimdi tam raporu yaz. Tüm bölümleri ekle.
Son bölüm olarak TSRS İçerik Endeksi tablosunu oluştur."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=16000,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_prompt}],
    )

    text = response.content[0].text
    usage = {
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cache_read_input_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
        "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
    }

    return text, usage
