# SustainHub — Belediye (Municipality) Bilgi Kütüphanesi
### Kocaeli İklim Eylem Planı, İzmir B.B. Sürdürülebilirlik Raporu 2024, Karşıyaka Belediyesi Durum Analizi 2022 ve akademik literatürden damıtılmış

> **Amaç:** Belediye modülü için veri modeli, hesaplama metodolojisi ve rapor şablonu referansı.
> **Kaynak:** `belediye/` klasöründeki 4 belge (405 sayfa) — Kocaeli İli İklim Değişikliği Eylem Planı (Kocaeli Büyükşehir, kamuya açık), İzmir Büyükşehir Belediyesi Kurumsal Sürdürülebilirlik Raporu 2024, Karşıyaka Belediyesi Sürdürülebilirlik Durum Analiz Raporu 2022, ve Akan & Şendurur (2016) "Büyükşehir Belediyelerinde Sürdürülebilirlik Raporlaması" akademik bölümü (30 büyükşehir belediyesi 2020 verisi).

---

## 1. RESMİ METODOLOJİ: GPC (Global Protocol for Community-Scale GHG Inventories)

Kocaeli planı, uluslararası standart olan **GPC**'yi kullanıyor — şirket bazlı GHG Protocol'ün **kent/il ölçeğine** uyarlanmış hali. Bu, C40, ICLEI ve CDP-ICLEI Unified Reporting System'in de temel aldığı standart.

**Raporlama seviyeleri:**
- **BASIC:** Enerji (Sabit + Ulaşım) + Atık — zorunlu minimum
- **BASIC+:** BASIC + Endüstriyel Süreçler (IPPU) + Tarım/Orman/Arazi Kullanımı (AFOLU)

**Sektörler (Kapsam 1/2/3 kent karşılığı):**
1. **Sabit Enerji (Stationary Energy)** — konut, ticari, kurumsal, sanayi bina enerjisi
2. **Ulaşım (Transportation)** — karayolu, demiryolu, denizyolu, havayolu
3. **Atık (Waste)** — katı atık, atıksu, kompost
4. **IPPU** (BASIC+) — endüstriyel süreç emisyonları
5. **AFOLU** (BASIC+) — tarım, orman, arazi kullanımı

**Ek il/ilçe verisi kalemleri (Kocaeli planından):** sıfır atık yönetim sistemi, atıksu arıtma tesisleri, yağmur suyu şebekesi, içme/kullanma suyu tüketimi, geri dönüşüm suyu, önemli doğa alanları, kentsel yeşil alanlar, tarım/orman alanları, hayvancılık, su ürünleri, imalat/sanayi.

## 2. BELEDİYE SÜRDÜRÜLEBİLİRLİK PUANLAMA SİSTEMİ (akademik kaynak, savunulabilir metodoloji)

Akan & Şendurur (2016), 30 büyükşehir belediyesinin 2020 faaliyet raporlarını içerik analiziyle puanlamış. **Bu metodoloji doğrudan "SustainHub Belediye Endeksi" özelliğine dönüştürülebilir** — akademik kaynağı olan, savunulabilir bir puanlama sistemi.

**Puanlama ölçeği (0-4, UNEP/SustainAbility 1996 temelli):**
| Puan | Anlamı |
|---|---|
| 0 | Hiç açıklama yok |
| 1 | Minimum seviye, az detay |
| 2 | Dürüst, eksik ve taahhütleri de kapsayan detaylı açıklama |
| 3 | Ana faaliyet + kurumsal süreçleri kapsayan açıklama |
| 4 | Ana faaliyet + süreç + sorumlulukları kapsayan tam açıklama |

**3 boyut, SDG-eşleşmeli kriterler:**

**Ekonomik:** Barış/Adalet/Güçlü Kurumlar · Yatırım Büyüklüğü · Çalışan Sosyal Yardımı · Hedefler İçin Ortaklıklar · İnsana Yakışır İş · Mali Bilgiler · Performans Bilgileri · Sanayi/Yenilikçilik/Altyapı · Sosyal Sermaye · Ürün-Hizmet Analizi

**Sosyal:** Açlığa Son · Barış/Adalet/Güçlü Kurumlar · Çalışan Sosyal Hakları · Eşitsizliklerin Azaltılması · İnsana Yakışır İş · Nitelikli Eğitim · Rüşvetle Mücadele · Sağlıklı Bireyler · Toplumsal Cinsiyet Eşitliği · Yoksulluğa Son

**Çevresel:** Atık Yönetimi · Erişilebilir/Temiz Enerji · İklim Eylemi · Karasal Yaşam · Sağlıklı Bireyler · Sorumlu Tüketim-Üretim · Sudaki Yaşam · Sürdürülebilir Şehir · Temiz Su/Sıhhi Koşullar · Yenilenebilir Enerji

**Uygulama:** Her kriter için 0-4 puan → 3 boyut ortalaması + toplam skor → A-D harf notu (mevcut KOBİ kredi skoru motorumuzdaki AAA→D formatıyla tutarlı).

## 3. RAPOR YAPISI REFERANSI (gerçek yayınlanmış raporlardan)

**İzmir B.B. Kurumsal Sürdürülebilirlik Raporu 2024 (büyükşehir formatı):**
Başkan mesajı → Kurumsal profil → Yönetişim → Çevresel performans (GPC envanteri) → Sosyal performans → Ekonomik performans → Hedefler ve taahhütler → Performans göstergeleri tablosu.

**Karşıyaka Belediyesi Durum Analiz Raporu 2022 (ilçe/küçük belediye formatı — "Kimseyi geride bırakma" temalı):**
Başkan mesajı → Sürdürülebilirlik Ofisi mesajı → Kurum tanıtımı → Rapor kapsamı → Organizasyon şeması → Toplumsal cinsiyet yaklaşımı → durum analizi (gap analysis stili, tam envanter değil — küçük belediyeler için daha hafif giriş formatı).

**Çıkarım:** İki farklı ürün seviyesi gerekli — **büyükşehir (tam GPC envanteri + puanlama)** vs **ilçe/küçük belediye (durum analizi/gap analysis, daha hafif)**. Bu, mevcut fiyatlandırma katmanlarımızla (Starter/Professional/Enterprise) doğal olarak eşleşir.

## 4. SustainHub Belediye Modülü İçin Çıkarımlar

- Yeni müşteri segmenti: **büyükşehir belediyeleri (30 adet) + il/ilçe belediyeleri**. Şirketlerden farklı: yasal zorunluluk yok (TSRS gibi) ama **CDP-ICLEI, Global Covenant of Mayors, itibar ve AB fon başvuruları için** artan bir teşvik var.
- Rapor motoru: mevcut `ai_report_writer.py` + yeni bir "GPC Belediye Raporu" `report_template.py` girdisi ile genişletilebilir (aynı Claude tabanlı üretim, farklı prompt).
- Puanlama: mevcut `kobi_credit_score_engine.py` deseniyle tutarlı yeni bir `municipality_index_engine.py`.
- Pazarlama fırsatı: **"Türkiye Belediye Sürdürülebilirlik Endeksi"** — akademik kaynağı olan, 30 büyükşehir belediyesini karşılaştıran yıllık yayın. COP31 "Turkey Sustainability Index" fikriyle aynı aile, aynı zamanda basın/lead-magnet değeri yüksek.

---
*Kaynak belgeler `belediye/` klasöründe saklanır (gitignore'da, dahili referans). Bu kütüphane birebir kopya değil, metodoloji ve yapı damıtımıdır.*
