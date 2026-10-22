# Hain Kim? — kelime paketleri

🌐 Tanıtım sitesi: <https://dumkof22.github.io/hainkim-kelimeler/>

**Hain Kim?** parti oyununun kelime ve ipucu listeleri. Uygulama bu depodaki
dosyaları açılışta indirir; burada yapılan bir değişiklik oyunculara mağaza
güncellemesi olmadan ulaşır.

## Yapı

```
index.json            hangi kategoriler var, hangi sırayla
packs/<id>.json       her kategori ayrı bir dosya
schema/               dosya biçimlerinin tanımı
tools/validate.py     her kayıtta otomatik çalışan denetim
```

## Kelime eklemek

1. `packs/` içindeki dosyayı açın, sağ üstteki kalem simgesine basın.
2. `words` listesine yeni bir blok ekleyin (önceki bloğun `}` işaretinden
   sonra virgül koymayı unutmayın):

   ```json
   {
     "word":  { "tr": "Kedi",  "en": "Cat",      "de": "Katze" },
     "clues": [
       { "tr": "Bıyık", "en": "Whiskers", "de": "Schnurrhaare" },
       { "tr": "Pati",  "en": "Paw",      "de": "Pfote" }
     ]
   }
   ```

3. **Commit changes** ile kaydedin.
4. **Actions** sekmesinde yeşil tik görünmeli. Kırmızı çarpı varsa açın;
   mesaj hangi dosyanın hangi satırında sorun olduğunu söyler.

Hain kategoriyi görmez, yalnızca ipucunu görür; hedef dengedir. Kelime ilk
akla gelen olmasın ("Kedi" değil "Kedi kumu", "Çorba" değil "Mercimek
çorbası"). İpucu kelimeyi ele vermesin ama hain onu söylediğinde masumlar
"eh, fena değil" desin: "Kedi kumu" için "Pati" olmaz, "Taneli" iyidir.
Her turda iki ipucundan biri rastgele seçilir.

`packs/mixed.json` (Karışık) ücretsiz sürümün paketidir: sabit 40 kelime,
hepsi çizilebilir. Silmeyin ve kelime sayısını değiştirmeyin.

## Yeni kategori

1. **Add file → Create new file** ile `packs/uzay.json` gibi bir dosya açın:

   ```json
   {
     "id": "uzay",
     "icon": "🚀",
     "name": { "tr": "Uzay", "en": "Space" },
     "words": [ ... ]
   }
   ```

2. `index.json`'daki listeye, görünmesini istediğiniz sıraya
   `{ "id": "uzay", "file": "packs/uzay.json" }` satırını ekleyin.

Bir kategoriyi kapatmak için `index.json`'da satırına `"enabled": false`
eklemek yeterli.

## Kurallar

- `id`: küçük harf, rakam, `-` ve `_`; dosyadaki ile `index.json`'daki aynı olmalı.
- Diller: `tr`, `en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `ar`, `zh`. Eksik
  dilde oyuncuya İngilizcesi, o da yoksa Türkçesi gösterilir.
- Her kelimenin en az bir ipucu olmalı (`clues` listesi ya da tek `clue`).
- Çizilemeyecek kadar soyut kelimelere `"drawable": false` ekleyin; böylece
  Çizim modunda çıkmazlar. Kategorinin tamamı çizime uygun değilse (ör.
  ülkeler) en üstteki `"drawable"` alanını `false` yapın.
- `schemaVersion`'a dokunmayın; biçim değişmedikçe 1 kalır.

## Bozarsam ne olur?

Hiçbir şey çökmez. JSON'u bozuk bir paket uygulama tarafından yok sayılır ve
oyuncular o paketin önceki sürümüyle oynamaya devam eder; düzeltilince yeni
sürüm yine ulaşır. Tek bir hatalı kelime ise yalnızca o kelimeyi atlatır.

## Güncelleme ne zaman ulaşır?

Uygulama her açılışta kontrol eder; oyuncu isterse **Ayarlar → Kelime
paketleri → Şimdi güncelle** ile hemen çekebilir. GitHub dosyaları birkaç
dakika önbellekte tutabilir; GitHub'a erişilemeyen ağlarda kullanılan yedek
adres birkaç saate kadar eski sürümü verebilir.

## Tanıtım sitesi

GitHub Pages bu deponun kökünü yayınlar (`main` dalı; `.nojekyll` sayesinde
dosyalar olduğu gibi sunulur).

```
index.html            ana sayfa (Türkçe metinler burada)
privacy/index.html    gizlilik politikası (PRIVACY.md ile aynı metin)
404.html              bulunamayan sayfalar
assets/css/           base → components → sections (+ privacy)
assets/js/            main.js her bölümü kendi modülünden başlatır
assets/js/i18n/en.js  İngilizce metinler (anahtarlar HTML'deki data-i18n)
assets/img/           uygulamadan üretilen görseller
```

- Kategori listesi ve sayılar sayfa açılırken `index.json` ve `packs/`
  dosyalarından okunur; yeni kategori eklemek siteyi de günceller.
- Gizlilik metnini değiştirirken `PRIVACY.md` ile `privacy/index.html`'i
  birlikte güncelleyin.
- `assets/img/` elle düzenlenmez: uygulama deposunda
  `tool/site/build_site_assets.sh` ekranları ve maskotları yeniden çizip
  buraya yazar.
