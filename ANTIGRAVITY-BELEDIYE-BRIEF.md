# SustainHub — Belediye (Municipality) Modülü: Mühendislik Brifi

> **Hedef ajan:** Google Antigravity (paralel geliştirme).
> **Referans kütüphane:** [`platform/backend/app/data/municipality_library.md`](platform/backend/app/data/municipality_library.md) — GPC standardı, akademik puanlama metodolojisi, rapor yapısı damıtımı.
> **Durum:** Taksonomi/GAR/materiality düzeltmesi tamamlandı; blocker kalktı. Başlayabilirsin.

---

## 0. BAŞLAMADAN ÖNCE — ZORUNLU

Taksonomi/GAR/materiality düzeltmesi **tamamlandı ve `origin/main`'de** (commit `6514fe9`).

1. **`git pull --rebase origin main` yap.**
2. Yerelinde bu dosyalara dokunan commit'lenmemiş iş varsa **önce stash'le** — yapı değişti, çakışacak.
3. Aşağıdaki yeni yapıyı BOZMA, üzerine yeniden yazma.

---

## 1. Yeni backend yapısı (dokunma / yeniden yazma)

| Öğe | Konum | Not |
|---|---|---|
| Pydantic şemalar | `app/models/taxonomy_schema.py` | `TaxonomyCalculationRequest`, `TaxonomyResult` — şemaları BURADAN import et |
| Motorlar | `app/models/taxonomy_engine.py`, `materiality_engine.py`, `gar_engine.py` | Hesaplama motorları burada |
| Router'lar | `app/routes/taxonomy.py`, `gar.py`, `materiality.py` | Hepsi `main.py`'de kayıtlı |
| Materiality **modeli** | `app/models/materiality.py` | SQLAlchemy `MaterialityAssessment`. **Bunu router ile ASLA ezme** — önceki hata buydu, `__init__` import'u çöküyordu |
| NACE verisi | `app/data/nace_taxonomy.json` | |

**Sahte veri yasak:** GAR motoru gerçek veri yokken `IntegrationNotConfigured` fırlatıyor (mock kaldırıldı). **Belediye modülü de aynı kurala uyacak** — mock envanter / mock skor yok; veri yoksa `IntegrationNotConfigured` fırlat.

---

## 2. Belediye modülü — inşa edilecekler

Referans: `app/data/municipality_library.md` (main'de, commit `48b8ad1`).

- **`app/models/municipality.py`** — SQLAlchemy modeli. GPC envanteri sektörleri: Sabit Enerji / Ulaşım / Atık / IPPU / AFOLU + il/ilçe veri kalemleri (sıfır atık, atıksu arıtma, yeşil alan, su tüketimi, vb.). **Sadece model, router değil.**
- **`app/services/municipality_index_engine.py`** — `kobi_credit_score_engine.py` desenini birebir izle: 0-4 puanlama ölçeği (UNEP/SustainAbility temelli), 3 boyut (Ekonomik / Sosyal / Çevresel), SDG-eşleşmeli kriterler, boyut ortalaması + toplam skor → A–D harf notu (mevcut AAA→D formatıyla tutarlı).
- **`app/routes/municipality.py`** — router; `main.py`'ye `include_router` ile kaydet.
- **Rapor:** `report_template.py`'ye yeni "GPC Belediye Raporu" girdisi + `ai_report_writer.py`'ye belediye promptu (aynı Claude tabanlı üretim, farklı prompt).
- **Frontend:** `app/(platform)/belediye/page.tsx`.

**İki ürün seviyesi** (doğal olarak mevcut fiyat katmanlarıyla eşleşir):
- **Büyükşehir** — tam GPC envanteri + puanlama (Professional/Enterprise).
- **İlçe/küçük belediye** — durum/gap analizi, daha hafif giriş formatı (Starter).

---

## 3. Bitince

`uvicorn app.main:app` ile gerçekten ayağa kalktığını doğrula (import + lifespan hatasız), sonra commit et.

---

## 4. Stratejik not (yol haritası)

Puanlama motoru aynı zamanda pazarlama varlığı: **"Türkiye Belediye Sürdürülebilirlik Endeksi"** — akademik kaynağı olan (Akan & Şendurur 2016, 30 büyükşehir), yıllık yayınlanabilir karşılaştırma. COP31 "Turkey Sustainability Index" fikriyle aynı aile; basın/lead-magnet değeri yüksek.
