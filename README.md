# CottonID — prototip

O'zbek to'qimachilik eksportchilari uchun Yevropa Ittifoqi talablariga mos raqamli mahsulot pasporti platformasining prototipi. Sayt: cottonid.uz

## Ichida nima bor

| Sahifa | Manzil |
| --- | --- |
| Landing | `/` |
| Fabrika paneli | `/#panel` |
| Pasportlar ro'yxati | `/#pasportlar` |
| Yangi pasport yaratish | `/#yangi` |
| Sertifikatlar | `/#sertifikatlar` |
| Xaridor ko'radigan ochiq pasport (UZ/EN) | `/#CID-UZ-26-00418` |

Yaratilgan pasportlar brauzer xotirasida saqlanadi. Barcha korxona va sertifikat ma'lumotlari namuna (demo).

## Texnologiya

Oddiy HTML, CSS va JavaScript. Build kerak emas. QR kod kutubxonasi `assets/qrcode.js` ichida (qrcode-generator, MIT litsenziyasi).

## GitHub va Vercel'ga joylash

1. GitHub'da yangi repozitoriy oching, masalan `cottonid`.
2. Shu papkadagi barcha fayllarni yuklang: "Add file → Upload files" orqali yoki terminalda:
   ```
   git init
   git add .
   git commit -m "CottonID prototipi"
   git branch -M main
   git remote add origin https://github.com/<login>/cottonid.git
   git push -u origin main
   ```
3. vercel.com → "Add New → Project" → repozitoriyni tanlang.
4. Framework Preset: **Other**. Build Command va Output Directory bo'sh qoladi.
5. "Deploy" ni bosing. Bir daqiqadan keyin `https://cottonid.vercel.app` kabi havola tayyor bo'ladi.

O'z domeningizni (cottonid.uz) ulash: Vercel'da Project → Settings → Domains.

## Lokal ko'rish

`index.html` faylini brauzerda oching yoki papkada `npx serve` ishga tushiring.
