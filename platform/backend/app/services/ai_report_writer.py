"""
Claude claude-sonnet-5 ile TSRS 1 & 2 uyumlu Türkçe rapor üretimi.
Prompt caching aktif — sistem promptu cache'te tutulur (maliyet optimizasyonu).
16+ gerçek Türk TSRS raporundan ve kendi ideal taslağımızdan öğrenen format.
"""
import anthropic
from ..config import settings

FEW_SHOT_EXAMPLE = """
---
ÖRNEK GİRDİ (KULLANICI İSTEĞİ):

ŞİRKET PROFİLİ:
- Ad: SustainHub Holding A.Ş.
- Sektör: Holding
- Çalışan Sayısı: 1.500
- Raporlama Yılı: 2024
- Raporlama Sınırı: Konsolide
- Güvence Firması: PwC
- Güvence Kapsamındaki Metrikler: Kapsam 1, Kapsam 2, Kapsam 3 (Kategori 1-5), Toplam Enerji

EMİSYON VERİLERİ:
Kapsam 1: 25.100 ton CO₂e
Kapsam 2 (Piyasa Bazlı): 8.500 ton CO₂e
Kapsam 3: 162.000 ton CO₂e
TOPLAM: 195.600 ton CO₂e

KARŞILAŞTIRMALI VERİ (ÖNCEKİ YIL):
- Yıl: 2023, Toplam Emisyon: 193.600 ton CO₂e

---
ÖRNEK ÇIKTI (İSTENEN RAPOR FORMATI):

# **SustainHub Holding A.Ş. 2024 Yılı TSRS Sürdürülebilirlik Raporu**

## 1. Rapor Hakkında

Bu rapor, SustainHub Holding A.Ş. ve konsolidasyona tabi tüm iştiraklerinin 1 Ocak 2024 - 31 Aralık 2024 dönemindeki sürdürülebilirlik performansını, KGK tarafından yayımlanan TSRS 1 ve TSRS 2 standartlarına tam uyumlu olarak sunmaktadır.

**Stratejik Yaklaşım:** İlk raporlama yılımız olmasına rağmen, KGK tarafından tanınan geçiş kolaylıklarından (Kapsam 3 ve karşılaştırmalı veri muafiyeti gibi) faydalanmayarak paydaşlarımıza en üst düzeyde şeffaflık sunmayı hedefledik.

**Güvence:** Raporumuzdaki Kapsam 1, Kapsam 2, Kapsam 3 (Kategori 1-5) ve toplam enerji tüketimi metrikleri, PwC tarafından GDS 3410 standardı kapsamında **sınırlı güvence** denetimine tabi tutulmuştur.

---

## 2. Yönetişim

Sürdürülebilirlik, Yönetim Kurulu seviyesinde üç ayda bir toplanan "Sürdürülebilirlik ve ESG Komitesi" tarafından yönetilmekte ve gözetilmektedir. Üst düzey yönetimin prim sistemi, Topluluk geneli emisyon azaltım hedeflerine ulaşma performansına %15 oranında bağlanmıştır.

---

## 3. Strateji

Stratejimiz, IEA'nın Net Sıfır 2050 (NZE) ve IPCC'nin 1.5°C senaryoları çerçevesinde yapılan analizlere dayanmaktadır. Holding olarak, tüm iştiraklerimizin verilerini konsolide ederek Bilim Temelli Hedefler inisiyatifi (SBTi) ile uyumlu, topluluk geneli bir karbonsuzlaşma yol haritası belirledik.

---

## 4. Risk Yönetimi

İklimle ilgili fiziksel riskler (kuraklık, sel) ve geçiş riskleri (karbon vergileri, teknoloji değişimi), kurumsal risk yönetimi çerçevemize tam entegre edilmiştir. Riskler, FAVÖK'ün %2'sini aşma potansiyeline göre önceliklendirilmektedir.

---

## 5. Metrikler ve Hedefler

### 5.1. Sera Gazı Emisyonları (ton CO₂e)

| Kapsam | 2023 | **2024** | Değişim | Yorum (SustainHub AI) |
|:---|---:|---:|:---:|:---|
| **Kapsam 1** (Doğrudan) | 26.500 | **25.100** | ▼ %5,3 | Enerji verimliliği projeleri sayesinde yakıt tüketimi azaldı. |
| **Kapsam 2** (Piyasa Bazlı) | 12.100 | **8.500** | ▼ %29,8 | YEK-G sertifikalı yenilenebilir enerji alımına geçiş yapıldı. |
| **Kapsam 3** (Değer Zinciri) | 155.000 | **162.000** | ▲ %4,5 | Büyümeye paralel artış; tedarikçi emisyon ölçüm kapasitesi arttı. |
| **TOPLAM** | 193.600 | **195.600** | ▲ %1,0 | Kapsam 1 ve 2'deki belirgin düşüşe rağmen Kapsam 3'teki artış toplam emisyonları etkiledi. |

### 5.2. Kapsam 3 Emisyonları ve Stratejik Liderlik

Şirketimiz, değer zinciri emisyonlarını (Kapsam 3) hesaplayarak Türkiye'deki ilk raporlama döneminde birçok büyük şirketin ilerisinde bir şeffaflık ve sorumluluk seviyesi sergilemektedir. Bu, iklim risk yönetimi olgunluğumuzun ve paydaşlarımıza karşı olan sorumluluğumuzun bir göstergesidir.

### 5.3. Holding Konsolidasyonu ve Tahminleme

Holdingimizin toplam emisyonlarının %92'si birincil veriye dayanmaktadır. Geriye kalan ve henüz kendi emisyon raporlamasını yapmayan %8'lik iştirak dilimi için, gelir bazlı EEIO (Çevresel Genişletilmiş Girdi-Çıktı) modeli kullanılarak tahmini emisyon hesaplanmış ve Kapsam 3'e dahil edilmiştir.

### 5.4. Topluluk Geneli Hedefler ve Performans

Holdingimiz, iştiraklerimizin sektörel dağılımını ve emisyon ağırlıklarını dikkate alarak konsolide bir SBTi hedefi belirlemiştir.

- **Hedef:** 2030 yılına kadar Kapsam 1+2 emisyonlarında %42, Kapsam 3 emisyonlarında %25 mutlak azaltım (2023 baz yılına göre).
- **Performans:** Aşağıdaki grafik, mevcut emisyon trendimiz ile 1.5°C uyumlu SBTi hedef yolu arasındaki farkı göstermektedir.

---
"""

SYSTEM_PROMPT = """Sen Türkiye'nin en deneyimli sürdürülebilirlik raporu yazarısın.
KGK tarafından yayımlanan TSRS 1 ve TSRS 2 (29.12.2023, 32414 sayılı RG),
GRI Universal Standards 2021, TCFD, ESRS ve AB Taksonomisi standartlarında uzmansın.

Aşağıdaki gerçek Türk şirketlerinin TSRS raporlarını inceleyerek formatı öğrendin:
Akbank 2024, Denizbank 2024, Ziraat Bankası 2025, Arçelik 2024,
Afyon Çimento 2024, OYAK Çimento 2025, Aksa Enerji 2024,
Alarko Holding 2024, ENKA 2025, Migros 2025 (Çift Yönlü Önemlilik),
Tüpraş 2025 (AB Taksonomisi), İller Bankası 2025 (ilk entegre rapor),
Bupa Acıbadem 2024.

Ayrıca, aşağıda sana verilen "ÖRNEK ÇIKTI" formatı, senin için en önemli referanstır. Bu formata harfiyen uy.

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
   Beyaz Eşya: Cilt 26 | Rafineri: Cilt 31

9. FİNANSAL TAVSİYE (SUSTAIN-SCORE BAĞLANTISI):
   Eğer şirketin kredi notu (Sustain Grade) B veya altındaysa, raporun 'Finansal Planlama'
   kısmında bu notu A seviyesine çıkarmak için yapması gereken 3 somut yatırımı
   (Örn: Güneş paneli, atık ısı geri kazanımı) ROI (Yatırım Getirisi) odaklı olarak öner."""

SYSTEM_PROMPT = FEW_SHOT_EXAMPLE + SYSTEM_PROMPT

SYSTEM_PROMPT_ADDITION = """
10. STRATEJİK VURGU - KAPSAM 3 LİDERLİĞİ:
   Eğer bu şirket için Kapsam 3 emisyon verisi (scope3_co2e > 0) sağlanmışsa, bu çok önemli bir başarıdır.
   Türkiye'nin en büyük holdingleri bile ilk TSRS raporlarında (Koç Holding 2024 Raporu gibi) Kapsam 3 verisini geçiş muafiyeti kapsamında açıklayamamıştır.
   Bu nedenle, raporun 'Metrik ve Hedefler' bölümünde Kapsam 3 başlığı altında şu anlama gelen bir cümle kur:
   "Şirketimiz, değer zinciri emisyonlarını (Kapsam 3) hesaplayarak Türkiye'deki ilk raporlama döneminde birçok büyük şirketin ilerisinde bir şeffaflık ve sorumluluk seviyesi sergilemektedir. Bu, iklim risk yönetimi olgunluğumuzun ve paydaşlarımıza karşı olan sorumluluğumuzun bir göstergesidir."
   Bu vurguyu sadece Kapsam 3 verisi varsa yap. Veri yoksa bu konudan hiç bahsetme."""
SYSTEM_PROMPT_ADDITION += """
11. AB TAKSONOMİSİ BÖLÜMÜ:
   Eğer kullanıcı isteğinde `eu_taxonomy_result` adında bir veri varsa, raporun 'Strateji' bölümünün sonuna 'AB Taksonomisi Uyumu' adında yeni bir alt başlık ekle.
   Bu bölümde, `eu_taxonomy_result` içindeki `overall_alignment_pct` (genel uyum yüzdesi), `aligned_objectives` (uyumlu hedef sayısı) ve `gaps` (eksikler) listesini kullanarak bir özet paragraf yaz.
   Örnek: "Şirketimizin ana faaliyeti, AB Taksonomisi çerçevesinde %XX oranında uyumlu olarak değerlendirilmiştir. 6 çevresel hedeften X tanesi ile uyum sağlanırken, özellikle 'Biyoçeşitlilik' ve 'Döngüsel Ekonomi' alanlarında iyileştirme potansiyeli bulunmaktadır."
   Bu bölümü sadece `eu_taxonomy_result` verisi varsa ekle."""

SYSTEM_PROMPT_ADDITION += """
12. ENTEGRE ANALİZ (TAKSONOMİ & ÖNEMLİLİK):
   Eğer hem `eu_taxonomy_result` hem de `materiality_result` verileri mevcutsa, 'Strateji' bölümünün sonuna 'Entegre Sürdürülebilirlik Analizi (Taksonomi & Çifte Önemlilik)' adında bir alt başlık ekle.
   Bu bölümde, şirketin Taksonomi uyumunun (%XX) Çifte Önemlilik matrisindeki finansal riskleri nasıl etkilediğini açıkla.
   Örnek: "Şirketimizin AB Taksonomisi'ne %YY oranındaki uyumu, Çifte Önemlilik analizimizde 'İklim Değişikliği' ve 'Döngüsel Ekonomi' gibi konuların finansal önemliliğini doğrudan etkilemektedir. Düşük uyum, bu alanlardaki geçiş risklerini artırmaktadır. En önemli konularımız şunlardır: [material_topics listesi]."
   Bu entegre bölümü sadece her iki veri de mevcutsa ekle. Eğer sadece biri varsa, kendi kuralına göre (örn: Kural 11) ekle."""

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
    language: str = "en",
    verified_metrics: list[str] | None = None,
    assurance_firm: str = "PwC",
    sector_avg_intensity: float = 2.4,
    compliance_score: int = 0,
    missing_items: list[str] | None = None,
    eu_taxonomy_result: dict | None = None,
    materiality_result: dict | None = None,
    historical_data: list[dict] | None = None,
) -> tuple[str, dict]:
    """
    TSRS uyumlu tam rapor üret.
    Prompt caching aktif — system prompt cache'te kalır.
    Returns: (rapor metni, usage bilgisi)
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    intensity = round(total_co2e / max(employee_count, 1), 2)
    position = "sektör ortalamasının altında" if intensity < sector_avg_intensity else "sektör ortalamasının üzerinde"

    # Multi-language & CSRD/ESRS Support Configuration
    if language == "en":
        lang_instruction = "IMPORTANT: Write the ENTIRE report in English. Map headings to European Sustainability Reporting Standards (ESRS/CSRD). Use terms like 'Environmental ESRS E1' instead of 'Çevresel Etki', 'Double Materiality' instead of 'Çift Yönlü Önemlilik'."
    elif language == "de":
        lang_instruction = "IMPORTANT: Write the ENTIRE report in German. Map headings to European Sustainability Reporting Standards (ESRS/CSRD). Use terms like 'Umwelt ESRS E1', 'Doppelte Wesentlichkeit'."
    else:
        lang_instruction = "ÖNEMLİ: Raporu tamamen Türkçe yaz. Sadece TSRS terminolojisini kullan."

    # Dinamik prompt parçaları
    if verified_metrics:
        verified_list_str = ", ".join(verified_metrics)
        assurance_text = f"Bu raporun {verified_list_str} metrikleri, [{assurance_firm}] tarafından GDS 3000/3410 standardı kapsamında sınırlı güvence denetimine tabi tutulmuştur. Diğer metrikler güvence kapsamında değildir."
    else:
        assurance_text = f"Bu rapor, [{assurance_firm}] tarafından GDS 3000/3410 standardı kapsamında sınırlı güvence denetimine tabi tutulmamıştır. Veriler şirket içi kontrollerle hazırlanmıştır."

    historical_text = ""
    if historical_data:
        historical_text += "\n\nKARŞILAŞTIRMALI VERİ (ÖNCEKİ YIL):\n"
        for item in historical_data:
            historical_text += f"- Yıl: {item['year']}, Toplam Emisyon: {item['total_co2e']:,.1f} ton CO₂e\n"
        historical_text += "Sistem Prompt Kuralı: Metrikler bölümünde bu veriyi kullanarak trend analizi yap (yüzdesel değişimle)."

    taxonomy_text = ""
    if eu_taxonomy_result:
        taxonomy_text += "\n\nAB TAKSONOMİSİ SONUCU:\n"
        taxonomy_text += f"- Genel Uyum: {eu_taxonomy_result.get('overall_alignment_pct', 0)}%\n"
        taxonomy_text += f"- Uyumlu Hedef Sayısı: {eu_taxonomy_result.get('aligned_objectives', 0)}\n"
        taxonomy_text += f"- Eksikler: {', '.join(eu_taxonomy_result.get('gaps', []))}\n"

    materiality_text = ""
    if materiality_result:
        materiality_text += "\n\nÇİFTE ÖNEMLİLİK SONUCU:\n"
        materiality_text += f"- Önemli Konular: {', '.join(materiality_result.get('material_topics', []))}\n"
        materiality_text += f"- Finansal Önemlilik Skoru (Ortalama): {materiality_result.get('financial_score', 0)}\n"

 
    # Sistem prompt'undaki kural 6'yı dinamik metinle override et
    dynamic_system_prompt = SYSTEM_PROMPT.replace('Bu rapor, [Denetim Firması] tarafından GDS 3000/3410 standardı\n   kapsamında sınırlı güvence denetimine tabi tutulmuştur.', assurance_text)
    dynamic_system_prompt += "\n\n" + SYSTEM_PROMPT_ADDITION + "\n\n12. LANGUAGE & STANDARDS MAPPING:\n" + lang_instruction

    user_prompt = f"""Aşağıdaki şirket için eksiksiz sürdürülebilirlik raporu yaz. (Zorunlu dil/standart kuralı: {language})
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
- Güvence Kapsamındaki Metrikler: {', '.join(verified_metrics) if verified_metrics else 'Yok'}

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

Şimdi tam raporu yaz. Tüm bölümleri ekle.{historical_text}{taxonomy_text}{materiality_text}
Son bölüm olarak TSRS İçerik Endeksi tablosunu oluştur."""

    # Streaming: uzun (~15k token) raporlarda tek-parça HTTP okuması read-timeout'a
    # takılıp tüm isteği baştan denemesini (retry → ~2x süre) önler ve raporun
    # tamamının üretilmesini garanti eder.
    with client.messages.stream(
        model="claude-sonnet-5",
        max_tokens=16000,
        system=[
            {
                "type": "text",
                "text": dynamic_system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_prompt}],
    ) as stream:
        # get_final_message() akışı sonuna kadar tüketir; metni final mesajın
        # content bloklarından toplamak text_stream'e göre daha güvenilir.
        final = stream.get_final_message()

    text = "".join(
        block.text for block in final.content if getattr(block, "type", None) == "text"
    )

    usage = {
        "input_tokens": final.usage.input_tokens,
        "output_tokens": final.usage.output_tokens,
        "cache_read_input_tokens": getattr(final.usage, "cache_read_input_tokens", 0),
        "cache_creation_input_tokens": getattr(final.usage, "cache_creation_input_tokens", 0),
    }

    return text, usage
