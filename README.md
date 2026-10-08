# Hain Kim? — kelime paketleri

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

İyi bir ipucu kelimeyle ilgilidir ama onu ele vermez: "Kedi" için "Bıyık"
iyi, "Miyav" fazla açık, "Hayvan" fazla genel. Her turda ipuçlarından biri
rastgele seçilir.

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
