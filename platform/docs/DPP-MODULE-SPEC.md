# Dijital Ürün Pasaportu (DPP) — Modül Spesifikasyonu

**Sahibi:** Fevzi Torun (ürün) · **Danışman:** Erbil Hanım (İSO)
**Statü:** Design draft — kod öncesi review bekleniyor
**Hedef pilot:** İSO üyesi 2–3 tekstil firması

---

## 1. Neden Şimdi?

**Regülasyon zemini:**
- **AB ESPR** (Ecodesign for Sustainable Products Regulation — Tüzük (AB) 2024/1781) yürürlükte
- Zorunlu takvim:
  - **Şubat 2027:** Endüstriyel + EV bataryaları
  - **2027–2030:** Tekstil, elektronik, mobilya, demir-çelik, inşaat malzemesi, lastik, deterjan, boya
- Kapsam dışı: gıda, ilaç, hayvan yemi, araç (ayrı rejim)
- **Türk ihracatçısı için:** DPP'siz ürün AB pazarına giremeyecek. Türkiye'nin AB'ye tekstil ihracatı ~10 milyar EUR/yıl → doğrudan risk.

**Rekabet:** Türkiye'de yerelleşmiş, TSRS/CBAM ile aynı platformda konumlanan DPP çözümü **yok**. Circularise, Circulise, EON-DPP küresel ama Türkiye ayağı zayıf.

**İSO açısından:** Erbil Hanım'ın hatırlatması stratejik — üye şirketlere "önden hazırlık" hizmeti sunmak İSO'nun politika söylemine uygun.

---

## 2. Ürün MVP Kapsamı (6 hafta)

### V1 — "İşe yarayan pasaport"
| # | Yetenek | Notlar |
|---|---------|--------|
| 1 | Ürün kaydı (SKU, GTIN, kategori, üretim tarihi, üretim tesisi) | GS1 GTIN doğrulama |
| 2 | Pasaport oluşturma | Otomatik UUID + GS1 Digital Link URL |
| 3 | QR kod üretimi | GS1 uyumlu, PNG + SVG indirilebilir |
| 4 | Malzeme bileşimi (BOM) | %ağırlık, kaynak, geri dönüştürülmüş oran |
| 5 | Karbon ayak izi (PCF) | Sistemde zaten `pcf.py` var — bağlanacak |
| 6 | Tedarik zinciri (Tier 1) | En az menşei ülke + üretici bilgisi |
| 7 | Uygunluk belgeleri (upload) | REACH, RoHS, OEKO-TEX, GOTS için PDF slot |
| 8 | Kamuya açık pasaport görüntüleyici | `/p/product/[dpp_id]` — QR hedefi |
| 9 | JSON-LD export | AB DPP schema'sına eşlenebilir |
| 10 | Yayınla / geri çek (issue / revoke) | Yaşam döngüsü olayları |

### V2 (sonraki sprint)
- Tedarik zinciri Tier 2/3 (tedarikçi davet + veri toplama)
- Onarım kılavuzu + yedek parça bağlantıları
- W3C Verifiable Credentials (dijital imza)
- Tüketici arayüzü çeviri (EN/DE/FR)
- İkinci el/geri dönüşüm olay kaydı

### V3 (kapsam dışı MVP)
- Blockchain (kimse şu an talep etmiyor, gereksiz karmaşıklık)
- IoT sensör beslemesi
- AI onarım asistanı

---

## 3. Veri Modeli (Backend)

### `products` tablosu
```
id (UUID)
company_id (FK)
sku (string, tenant-unique)
gtin (string, GS1 GTIN-13/14, opsiyonel)
name_tr, name_en
category (enum: textile, battery, electronics, furniture, iron_steel, tyre, detergent, paint, construction, other)
subcategory (string)
manufacturing_site_id (FK, opsiyonel)
manufactured_at (date)
created_at, updated_at
```

### `product_passports` tablosu
```
id (UUID)
product_id (FK)
version (int, artan)
status (enum: draft, issued, revoked, superseded)
issued_at, revoked_at
qr_code_url (string, /p/product/{id} kanonik URL)
gs1_digital_link (string, https://id.gs1.org/01/{gtin}/...)
public_slug (string, kısa okunabilir URL için)
data_json (JSON-LD payload — snapshot)
signature (string, ileride VC için)
created_at, updated_at
```

### `passport_materials` tablosu
```
id (UUID)
passport_id (FK)
material_name (string)
percentage_by_weight (float)
source_country (string, ISO 3166)
recycled_content_pct (float, 0-100)
hazardous_substances (JSON, SCIP-benzeri)
```

### `passport_events` tablosu (izlenebilirlik)
```
id (UUID)
passport_id (FK)
event_type (enum: created, updated, issued, transferred, repaired, recycled, revoked)
actor (string, kim tetikledi)
metadata (JSON)
timestamp (datetime)
```

### `passport_documents` tablosu
```
id (UUID)
passport_id (FK)
doc_type (enum: reach, rohs, oekotex, gots, ce, energy_label, other)
file_url (string, S3/local)
issued_by (string)
valid_until (date, opsiyonel)
```

---

## 4. API Yüzeyi

```
POST   /dpp/products                       Ürün oluştur
GET    /dpp/products?company_id=…          Şirketin ürünleri
GET    /dpp/products/{id}                  Ürün detay

POST   /dpp/products/{id}/passport         Pasaport oluştur (draft)
GET    /dpp/passports/{id}                 Pasaport detay (auth'lu)
PATCH  /dpp/passports/{id}                 Draft güncelle
POST   /dpp/passports/{id}/issue           Yayınla (issued)
POST   /dpp/passports/{id}/revoke          Geri çek

POST   /dpp/passports/{id}/materials       Malzeme ekle
POST   /dpp/passports/{id}/documents       Belge yükle
POST   /dpp/passports/{id}/events          Olay kaydı

GET    /dpp/passports/{id}/qr              QR kod (PNG/SVG)
GET    /dpp/passports/{id}/jsonld          JSON-LD export (AB uyumu)

# Kamuya açık (auth yok, rate-limited)
GET    /public/passport/{id}               Kamuya açık pasaport (revoke edilmemişse)
GET    /public/passport/slug/{slug}        Kısa slug ile
```

---

## 5. Standartlar & Uyum Katmanı

| Katman | Standart | Kaynak |
|--------|----------|--------|
| Ürün tanımlayıcı | **GS1 GTIN** + **GS1 Digital Link** | ref.gs1.org |
| Veri modeli (üst) | **AB DPP Data Model** (Delegated Act taslak) | espr-support.eu |
| Payload | **JSON-LD** + schema.org uzantıları | schema.org/Product |
| Malzeme sağlığı | **ECHA SCIP** benzeri alan yapısı | echa.europa.eu |
| Karbon | **ISO 14067** (PCF) — sistemde zaten var | `pcf.py`, `iso14067_engine.py` |
| Tekstil özel | **Ecolabel + OEKO-TEX + GOTS** rozet alanları | textile-ecolabel |
| İmza (V2) | **W3C Verifiable Credentials 2.0** | w3.org/TR/vc-data-model-2.0 |

**Not:** AB DPP final data model henüz taslak (2026 Q3–Q4 kesinleşmesi bekleniyor). Bizim model **esnek JSON alanı** ile başlamalı ki nihai şemaya adaptör yazabilelim.

---

## 6. Frontend Ekranları

### Platform içi (auth'lu)
| Yol | İçerik |
|-----|--------|
| `/(platform)/dpp` | Şirketin tüm ürünleri, pasaport durumu tablosu |
| `/(platform)/dpp/urunler/[id]` | Ürün detay, bağlı pasaport(lar) |
| `/(platform)/dpp/pasaport/[id]/edit` | Draft düzenleme (form: malzeme, PCF, belge) |
| `/(platform)/dpp/pasaport/[id]/preview` | Yayın öncesi önizleme |

### Kamuya açık
| Yol | İçerik |
|-----|--------|
| `/p/product/[dpp_id]` | QR hedefi — tüketici arayüzü |
| `/urunler/dpp` | Pazarlama sayfası + demo |

**QR akışı:** Kullanıcı ürün etiketindeki QR'yi tarar → `https://sustaincomtr.vercel.app/p/product/{uuid}` → responsive pasaport sayfası açılır (menşei, malzeme, karbon, geri dönüşüm bilgisi, indirilebilir belgeler).

**Not (AGENTS.md):** Frontend'de bu proje özel Next.js sürümü kullanıyor. Kod yazmadan önce `node_modules/next/dist/docs/` okunacak.

---

## 7. RBAC & KVKK

| Rol | Yetki |
|-----|-------|
| admin | Tüm CRUD |
| editor | Ürün + pasaport draft, issue yetkisi |
| data_entry | Sadece malzeme/belge ekleme |
| auditor | Read-only, tüm revizyonlar |
| viewer | Sadece kendi şirketinin listesi |

**KVKK/GDPR:** Kamuya açık pasaportta **kişisel veri sıfır** olacak. Sadece şirket + ürün + malzeme verisi. Bu tasarım kararı yazılı kalmalı.

---

## 8. Pilot Kriterleri (İSO üyesi 2–3 tekstil)

**Aday profili:**
- AB'ye ihracat yapan
- 50+ SKU'lu
- Sürdürülebilirlik departmanı olan
- İSO'nun yönlendirmesiyle gelen

**Pilot çıktı taahhüdü:**
- 6 hafta içinde 20 ürün için canlı pasaport
- QR taranınca çalışan kamu sayfa
- Case study (İSO logolu, birlikte yayınlanır)
- Ücretsiz pilot → 12 ay sonra €500/ay/SKU tier veya kurumsal SKU-bazlı paket

---

## 9. Bilinen Riskler

| Risk | Etki | Azaltma |
|------|------|---------|
| AB DPP nihai şema değişir | Model refactor | Esnek `data_json` alanı + adaptör katmanı |
| GTIN alan üye yok | Katılım düşer | Bize özel internal-id fallback |
| Tedarikçi veri vermez | Tier 1 boş kalır | "declared by manufacturer" flag'i |
| QR kod okuma UX'i düşük | Tüketici çıkar | Responsive-first, 3G test |
| PCF hesabı yanlış | Yanıltıcı bilgi | Mevcut `pcf_engine` + human-review flag |

---

## 10. Karar Bekleyen Noktalar

1. **Public URL yolu:** `/p/product/{uuid}` mı, `/dpp/{slug}` mı? (SEO + kısalık)
2. **QR domain:** `sustaincomtr.vercel.app` mı yoksa özel kısa domain `dpp.st` mi?
3. **Pilot fiyatlama:** ücretsiz mi, sembolik mi (1 EUR)? Erbil Hanım'ın görüşü lazım.
4. **Marka:** "SustainHub DPP" mi "SustainPass" gibi alt-marka mı?

---

## 11. Sıradaki Adım

Bu doküman onaylanır onaylanmaz:
1. Gemini push entegrasyonu tamamlanır (Task #1)
2. Backend iskele: model + migration + route + service (Task #3)
3. Frontend: liste + editor + kamu görüntüleyici (Task #4)
4. Pilot müşteri #1 ile ürün seçimi

**Beklenen toplam:** 4–6 hafta MVP canlıya, +2 hafta pilot onboarding.

---

## 12. Gemini Entegrasyon Eki (V1'e eklenenler)

Gemini'nin 3-fazlı öneri + 7-madde teknik tavsiyesi V1'e şu şekilde eklendi:

### Alındı → V1'de canlı
| Gemini önerisi | Uygulama |
|---|---|
| QR ile pasaport verisi | `/public/passport/{id}` — issued'de canlı |
| Sürdürülebilirlik Puanı (0–100) | `ProductPassport.green_score` + `green_score_service.py` (5 kalem: malzeme, karbon, tehlike, belge, onarılabilirlik) |
| İade / kupon akışı | `POST /public/passport/{id}/return-request` — coupon kodu üretir, PassportEvent'e yazar |
| Sürdürülebilirlik Asistanı (Claude) | `POST /passports/{id}/ask` (auth) + `/public/passport/{id}/ask` — cache + statik fallback |
| Cache | Process-içi TTL cache (500 giriş, 1s), Redis'e taşınabilir |
| Fallback | `ANTHROPIC_API_KEY` yoksa veya API 5xx'te statik metin |
| Kural koyucu değil rehber | Sistem prompt'ta yalnızca pasaport verisine dayanma direktifi |

### Ertelendi → V2
| Öneri | Neden |
|---|---|
| Claude Vision ile etiket/QR fotoğrafı analizi | Kapsam büyük; ayrı endpoint + resim upload akışı |
| Google Maps ile en yakın geri dönüşüm noktası | API key + adres çözümleme kütüphanesi; V2 |
| Sandbox test ortamı (10-15 senaryo) | Pilot müşteri onboarding ile birlikte |

### Reddedildi / V3+
| Öneri | Neden |
|---|---|
| Blockchain üretim geçmişi | Şu an talep eden yok, karmaşıklık ROI'yi taşımaz; PassportEvent tablosu zaten değişmez log görevi görüyor |

### Yeşil Skor Formülü (V1)
| Kalem | Puan | Kaynak alan |
|---|---|---|
| Malzeme (ağırlıklı geri dönüştürülmüş içerik) | 30 | `PassportMaterial.recycled_content_pct` |
| Karbon yoğunluğu (sektör benchmark'ına göre) | 25 | `carbon_footprint_kgco2e` + `SECTOR_CARBON_BENCHMARK` |
| Tehlikeli madde (yok = tam puan) | 20 | `PassportMaterial.is_hazardous` |
| Uygunluk belgesi çeşitliliği | 15 | `PassportDocument.doc_type` unique count × 3 |
| Onarılabilirlik | 10 | `repairability_score` (0-10 skala) |

Not: Formül **deterministik**. V2'de Claude ile "yumuşak override" (aynı verilere farklı ağırlıklandırma) eklenebilir; şu an tutarlılık + açıklanabilirlik için sabit ağırlık.

---

## 13. V1.5 Derinleştirme

Ürünleştirme öncesi ikinci pas — sektörel derinlik ve kurumsal özellikler.

### Model genişletme
- **Product:** `name_de`, `name_fr`, `description_tr/en`, `batch_number`, `serial_number`, `weight_kg`, `dimensions` (JSON), `ce_marked`, `energy_class` (A–G), `warranty_months`
- **ProductPassport:** `scan_count`, `ai_query_count`, `return_request_count`, `completeness_pct`
- **Yeni tablo:** `PassportSupplier` — Tier 1 tedarik zinciri (V2'de tier 2/3 + davet)

### Sektör şablonları (`services/dpp_templates.py`)
| Sektör | Zorunlu belge(ler) | Min. malzeme | Min. Tier 1 tedarikçi | Skor ağırlığı (öne çıkan) |
|--------|-------------------|--------------|----------------------|---------------------------|
| textile | OEKO-TEX (veya GOTS/EPD) | 2 | 1 | malzeme 35 + tehlike 25 |
| battery | CE + Energy Label | 3 | 2 | karbon 35 + tehlike 25 |
| electronics | CE + RoHS | 2 | 1 | onarılabilirlik 20 + belge 15 |
| furniture | — | 1 | 0 | malzeme 35 + onarılabilirlik 15 |
| generic | — | 1 | 0 | 30/25/20/15/10 |

Endpoint: `GET /dpp/passports/{id}/validate` — tamamlanma yüzdesi + eksik alan listesi.

### Yeni endpoint'ler
| Method | Yol | İşlev |
|--------|-----|-------|
| PATCH | `/dpp/products/{id}` | Ürün güncelleme |
| PATCH | `/dpp/passports/{id}` | Draft alan güncelleme |
| POST | `/dpp/passports/{id}/suppliers` | Tedarikçi ekle |
| GET | `/dpp/passports/{id}/validate` | Şablona göre tamamlanma |
| GET | `/dpp/templates/{category}` | Sektör şablon şeması |
| GET | `/dpp/passports/{id}/pdf` | Baskı PDF (weasyprint, HTML fallback) |
| GET | `/dpp/passports/{id}/compare/{other}` | İki pasaport metrik diff |
| GET | `/dpp/analytics` | Şirket portföyü metrikleri |
| GET | `/dpp/products/bulk-template` | Toplu içe aktarma CSV şablonu |
| POST | `/dpp/products/bulk-import` | CSV toplu ürün |
| GET | `/public/passport/{id}/qr` | Kamu QR görseli |

### Kamu görüntüleyici zenginleşmesi
- `?lang=tr\|en\|de\|fr` parametresi — TR/EN/DE/FR UI etiketleri
- Her başarılı görüntülemede `scan_count += 1`
- Her AI sorusunda `ai_query_count += 1`
- Her iade talebinde `return_request_count += 1`
- Snapshot şimdi tedarikçileri, boyutları, garantiyi, CE ve enerji sınıfını içeriyor

### Test kapsamı
`tests/test_dpp.py` — 18 test:
- Ürün CRUD + GTIN/enerji/kategori doğrulama (5)
- Pasaport draft→issue→revoke + supersede (4)
- Şablon doğrulama (2)
- Public endpoint + lang + counters (3)
- İade + kupon (1)
- Analytics, compare (2)
- Bulk import başarılı + hatalı (2)
- Tenant izolasyon (1)
