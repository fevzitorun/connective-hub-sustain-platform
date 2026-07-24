# SustainHub — Belediye (Municipality) Modülü Brifi

> **Hedef ajan:** Google Antigravity (paralel geliştirme).

## 0. BAŞLAMADAN ÖNCE — ZORUNLU (durum güncellemesi)

**Taksonomi/GAR/materiality düzeltmesi TAMAMLANDI ve `origin/main`'de** (commit `6514fe9`). Bu iş bitti — aşağıdaki "önce taksonomiyi düzelt" notu artık geçersiz.

1. **`git pull --rebase origin main` yap.** Yerelinde eski kırık `materiality.py`/`taxonomy.py` olabilir; güncel yapı main'de.
2. Bu dosyalara dokunan commit'lenmemiş işin varsa **önce stash'le** — yapı değişti, çakışır.
3. Yeni yapıyı BOZMA:
   - Pydantic şemalar: `app/models/taxonomy_schema.py`.
   - Motorlar `app/models/`'da: `taxonomy_engine.py`, `materiality_engine.py`, `gar_engine.py`.
   - Router'lar `app/routes/`'ta: `taxonomy.py`, `gar.py`, `materiality.py` (hepsi `main.py`'de kayıtlı).
   - `app/models/materiality.py` = SQLAlchemy `MaterialityAssessment` **modeli** — bunu bir router ile **ASLA** ezme (önceki hata buydu).
   - **Sahte veri yasak:** GAR motoru gerçek veri yokken `IntegrationNotConfigured` fırlatıyor. Belediye modülü de aynı kurala uyar — mock envanter/mock skor yok.

---

## Bağlam

`belediye/` klasöründe (gitignore'da, dahili) 4 gerçek referans belge incelendi ve **`platform/backend/app/data/municipality_library.md`** dosyasına damıtıldı — **o dosyayı önce oku, tüm metodoloji ve kaynak orada.** Bu, `policy_library.md` (Koç/Sabancı) ile aynı desen: gerçek belgelerden çıkarılmış, savunulabilir metodoloji.

Yeni müşteri segmenti: belediyeler (30 büyükşehir + il/ilçe belediyeleri). Mevcut şirket/banka odaklı üründen farklı olarak yasal zorunluluk yok ama CDP-ICLEI, Global Covenant of Mayors ve AB fonlama başvuruları için artan teşvik var.

---

## Yapılacaklar

### 1. Veri modeli — `app/models/municipality.py`

```python
class Municipality(Base):
    __tablename__ = "municipalities"
    id, name, type (büyükşehir/il/ilçe), population, region
    # GPC envanteri alanları — Kocaeli planı formatı
    stationary_energy_tco2e, transportation_tco2e, waste_tco2e
    ippu_tco2e, afolu_tco2e  # BASIC+ opsiyonel
    reporting_level (basic/basic_plus)
    year

class MunicipalityIndexScore(Base):
    __tablename__ = "municipality_index_scores"
    municipality_id, year
    economic_score, social_score, environmental_score, total_score  # 0-4 ölçek, municipality_library.md Bölüm 2
    grade  # A-D, kobi_credit_score_engine.py deseniyle tutarlı
```

> **Sadece model, router değil.** Router `app/routes/municipality.py`'ye yazılır.

### 2. Hesaplama motoru — `app/services/municipality_index_engine.py`

`municipality_library.md` Bölüm 2'deki puanlama kriterlerini (Ekonomik/Sosyal/Çevresel, her biri SDG-eşleşmeli alt kriterlerle) kodla. `kobi_credit_score_engine.py`'nin yapısını referans al — aynı A-D notlandırma deseni.

### 3. GPC envanteri hesaplayıcı — mevcut `calculation_engine.py`'ye ek

Kent ölçeğinde GHG hesaplaması: Sabit Enerji + Ulaşım + Atık (BASIC), opsiyonel IPPU + AFOLU (BASIC+). `municipality_library.md` Bölüm 1'deki sektör tanımlarını kullan.

### 4. Rapor şablonu — `report_template.py`'ye ekle

İki seviye (İzmir formatından büyükşehir tam envanter, Karşıyaka formatından ilçe/küçük belediye durum analizi — `municipality_library.md` Bölüm 3):

```python
{
    "id": "gpc-municipality-metropolitan-v1",
    "name": "Büyükşehir Belediyesi Sürdürülebilirlik Raporu (GPC)",
    "standard": "gpc_municipality",
    "required_sections": ["Kurumsal Profil", "Yönetişim", "GPC Sera Gazı Envanteri",
        "Sosyal Performans", "Ekonomik Performans", "Hedefler ve Taahhütler",
        "Performans Göstergeleri Tablosu"],
    ...
},
{
    "id": "gpc-municipality-district-v1",
    "name": "İlçe Belediyesi Durum Analiz Raporu",
    "standard": "gpc_municipality_light",
    "required_sections": ["Kurum Tanıtımı", "Rapor Kapsamı", "Mevcut Durum Analizi",
        "Öncelikli Alanlar", "Yol Haritası"],
    ...
}
```

### 5. `ai_report_writer.py`'ye entegrasyon

`eu_taxonomy_result` / `materiality_result` deseniyle aynı şekilde `municipality_gpc_result` parametresi ekle, sistem promptuna GPC terminolojisiyle yazım kuralı ekle.

### 6. Frontend — yeni sayfa `/belediye`

Sayfayı `(platform)` grup route'unda oluştur: **`app/(platform)/belediye/page.tsx`**. Mevcut `app/(platform)/university/page.tsx` yapısını referans al (benzer B2G/kurumsal segment sayfası). İçerik: GPC envanteri özelliği, Belediye Endeksi tanıtımı, örnek rapor, "Pilot Belediye" başvuru formu — mevcut demo başvuru altyapısına bağla (`/request-demo` sayfası + `demo_request` router).

### 7. Pazarlama fırsatı (ayrı iş, öncelik değil)

"Türkiye Belediye Sürdürülebilirlik Endeksi" — 30 büyükşehir belediyesini karşılaştıran yıllık yayın, akademik kaynaklı metodoloji. COP31 içerik takvimiyle birleştirilebilir (bkz. `IS-PLANI-2026.md` Bölüm 6).

---

## Doğrulama

Yerelde `uvicorn app.main:app` ile başlat (import + lifespan hatasız kalkmalı), yeni endpoint'leri (`/municipality/calculate`, `/municipality/index-score`) test et. Uçtan uca bir büyükşehir raporu üret: `municipality_library.md`'deki Kocaeli plan yapısını referans al — birebir sayısal 2021 envanteri gerekiyorsa `belediye/İklim Değişikliği Eylem Planı.pdf`'ten çek (kütüphane metodolojiyi/yapıyı damıtır, ham sayıları değil).

## Not

Önceki brifteki "taksonomi/GAR düzeltmesi önce tamamlanmalı" şartı **karşılandı** — düzeltme main'de (`6514fe9`). §0'daki `git pull --rebase` adımını atlamadan başla.
