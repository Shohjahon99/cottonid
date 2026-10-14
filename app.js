/* CottonID — prototip ilova (vanilla JS, build talab qilinmaydi). O'zbek va ingliz tillarida. */
(function () {
  "use strict";

  /* ---------- Yordamchilar ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $("#app");
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const daysUntil = (iso) => Math.ceil((new Date(iso + "T00:00:00") - new Date()) / 86400000);
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("cid:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("cid:" + k, JSON.stringify(v)); } catch (e) { /* xotira yo'q */ } }
  };

  const D = window.CID_DATA;
  const state = {
    passports: (store.get("created", []) || []).concat(clone(D.passports)),
    lang: store.get("lang", "uz"),
    filter: "all"
  };
  if (state.lang !== "uz" && state.lang !== "en") state.lang = "uz";
  const L = () => state.lang;

  const num = (n) => L() === "en" ? Number(n || 0).toLocaleString("en-US") : Number(n || 0).toLocaleString("ru-RU").replace(/[\s,]/g, " ");
  const dec = (n) => (L() === "en" ? String(n) : String(n).replace(".", ","));
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDay = (iso) => { const [y, m, d] = iso.split("-"); return L() === "en" ? `${+d} ${MONTHS_EN[+m - 1]} ${y}` : `${d}.${m}.${y}`; };
  const fmtMonth = (ym) => { if (!ym) return ""; const [y, m] = ym.split("-"); return L() === "en" ? `${MONTHS_EN[+m - 1]} ${y}` : `${m}.${y}`; };

  const certById = (id) => D.certificates.find((c) => c.id === id);
  const certName = (c) => (L() === "en" ? c.name_en || c.name : c.name);
  const findPassport = (id) => state.passports.find((p) => p.id === id);
  const pname = (p) => (L() === "en" ? p.product.en || p.product.uz : p.product.uz || p.product.en);

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2800);
  }

  const passportUrl = (id) => (window.CID_BASE_URL || location.href.split("#")[0]) + "#" + id;

  function mountQR(el, text) {
    if (!el) return;
    if (!window.qrcode) { el.innerHTML = '<div style="display:grid;place-items:center;height:100%;font-size:11px;color:#677189">QR</div>'; return; }
    const q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = el.querySelector("svg");
    if (svg) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "QR: " + text);
      svg.style.width = "100%"; svg.style.height = "100%";
      svg.querySelectorAll("path").forEach((p) => p.setAttribute("fill", "#14213D"));
      svg.querySelectorAll("rect").forEach((r) => r.setAttribute("fill", "#ffffff"));
    }
  }

  /* ---------- Tarjimalar ---------- */
  const TX = {
    uz: {
      skip: "Asosiy qismga o'tish",
      "nav.how": "Qanday ishlaydi", "nav.rules": "Qoidalar", "nav.who": "Kimlar uchun", "nav.pricing": "Narxlar",
      "nav.sample": "Namuna pasport", "nav.demo": "Demo panel", homeAria: "CottonID bosh sahifa",
      "hero.h1": "Har bir kiyimning yo'li bitta QR kodda.",
      "hero.lead": "CottonID O'zbek to'qimachilik fabrikalariga paxta dalasidan tayyor kiyimgacha bo'lgan zanjirni hujjatlashtirib, Yevropa Ittifoqining raqamli mahsulot pasportini bir necha daqiqada yaratishga yordam beradi.",
      "hero.cta1": "Pasport yaratib ko'rish", "hero.cta2": "Xaridor nimani ko'radi",
      "hero.note": "ESPR reglamenti (EU 2024/1781) va to'qimachilik bo'yicha kutilayotgan talablar asosida",
      "chip.a": "Paxta dalasi, tasdiqlangan", "chip.b": "Berlin do'konida skanerlandi", "chip.b2": "2 daqiqa oldin",
      "card.aria": "Raqamli mahsulot pasporti namunasi", "card.verified": "Tasdiqlangan", "card.review": "Tekshiruvda",
      pcs: "dona", stagesShort: "bosqich", certsShort: "sertifikat", productPh: "Mahsulot nomi",
      "reg.h2": "Yevropa bozori pasportsiz kiyimni qabul qilmaydigan bo'ladi.",
      "reg.p": "Pasportni xaridor brend tuzadi, lekin ma'lumotlarni fabrika beradi. Ma'lumoti tayyor ta'minotchi buyurtmani saqlab qoladi.",
      "fact.exp": "2,6 mlrd $", "fact.expL": "O'zbekiston to'qimachilik eksporti, 2025-yil",
      "fact.cL": "mahsulot chiqarilgan davlatlar", "fact.days": "{n} kun", "fact.daysL": "GSP+ imtiyozlari tugashiga (2027-yil 31-dekabr)",
      tl: [
        ["2024-yil iyul", "ESPR reglamenti kuchga kirdi", "Yevropa Ittifoqi raqamli mahsulot pasportining huquqiy asosini yaratdi."],
        ["2026-yil 20-iyul", "Pasportlar reyestri ishga tushdi", "Yevropa Komissiyasining yagona reyestri pasportlarni qabul qila boshladi."],
        ["Hozir", "Brendlar ta'minotchilardan ma'lumot so'ramoqda", "Tola tarkibi, kelib chiqish va sertifikatlar bo'yicha so'rovlar ko'paymoqda."],
        ["2027-yil IV chorak", "To'qimachilik uchun alohida akt", "Kiyim pasportida qaysi ma'lumotlar majburiy bo'lishi aniq belgilanadi."],
        ["Taxminan 2028-yil", "Pasport majburiy bo'ladi", "O'tish davridan keyin pasportsiz kiyimni Yevropa bozoriga chiqarib bo'lmaydi."]
      ],
      "how.h2": "To'rt qadamda pasport", "how.p": "Fabrikada allaqachon bor ma'lumotlar ishlatiladi. Yangi hisob yuritish shart emas.",
      steps: [
        ["Ma'lumotni ulang", "ERP tizimi yoki Excel faylidan partiyalar, tola tarkibi va ta'minotchilar import qilinadi."],
        ["Zanjirni tasdiqlang", "Paxta dalasidan tikuvgacha har bir bosqichga hujjat va sertifikat biriktiriladi."],
        ["Pasport yarating", "Tizim Yevropa talablari bo'yicha tekshiradi, kamchiliklarni ko'rsatadi va QR yorliq beradi."],
        ["Xaridorga yuboring", "Brend bitta havola orqali ma'lumotni o'z formatida oladi, xaridor esa QR'ni skanerlaydi."]
      ],
      "who.f": "Fabrika uchun", "who.fp": "Xaridor so'roviga javob tayyorlash kunlardan daqiqalarga qisqaradi.",
      "who.ft": [["Tayyorlik bahosi.", "Har bir partiya Yevropa talablariga necha foiz tayyorligini ko'rasiz."], ["Sertifikatlar nazorati.", "GOTS, OEKO-TEX va boshqalarning muddati tugashidan oldin ogohlantiradi."], ["O'zbek, rus va ingliz tillarida.", "Mahalliy ERP va Excel bilan ishlaydi."], ["QR va NFC yorliqlar.", "Bosmaga tayyor fayl bir tugmada."]],
      "who.b": "Xaridor brend uchun", "who.bp": "O'zbek ta'minotchilarning ma'lumoti bitta joyda, tekshirilgan holda.",
      "who.bt": [["Kelib chiqish xaritasi.", "Paxta qaysi hududda o'stirilgani va kim qayta ishlagani."], ["Pasport formatiga eksport.", "Ma'lumot Yevropa reyestri talab qiladigan tuzilmada."], ["Hujjatlar arxivi.", "Sertifikat va audit hisobotlari asl nusxada."], ["Bir nechta ta'minotchi.", "Barcha O'zbek fabrikalari bitta panelda."]],
      "price.h2": "Fabrika hajmiga mos narx", "price.p": "14 kun bepul sinov. Yillik to'lovda 2 oy bepul.", perMonth: "/ oy", popular: "Ko'p tanlanadi",
      plans: [
        ["Start", "Eksportni boshlayotgan fabrikalar uchun", ["Oyiga 20 tagacha partiya", "Pasport va QR yorliqlar", "Excel import"], "Sinab ko'rish"],
        ["Eksport", "Muntazam Yevropaga yetkazuvchilar uchun", ["Cheksiz partiyalar", "ERP integratsiyasi", "Sertifikatlar nazorati", "Xaridor portali"], "Demo panelni ochish"],
        ["Klaster", "Paxtadan kiyimgacha to'liq zanjir", ["Bir nechta korxona", "Ta'minotchilarni taklif qilish", "API va maxsus hisobotlar"], "Demo panel"]
      ],
      contact: "Bog'lanish:",
      "close.h2": "Pasport talab qilinishidan oldin tayyor bo'ling.", "close.p": "Birinchi partiyangiz pasportini bugun yaratib ko'ring. Kredit karta talab qilinmaydi.", "close.btn": "Pasport yaratish",
      "foot.a": "cottonid.uz · Toshkent, O'zbekiston · Prototip, 2026", "foot.b": "Barcha korxona nomlari demo ma'lumot",
      "nav.dashboard": "Bosh panel", "nav.passports": "Pasportlar", "nav.new": "Yangi pasport", "nav.certs": "Sertifikatlar", "nav.site": "Bosh sahifa",
      planName: "{p} tarifi", proto: "Prototip · demo ma'lumotlar", menu: "Menyuni ochish", panelNav: "Panel",
      greet: "Xayrli kun, {n}", daysLeft: "kun qoldi", "banner.h": "GSP+ imtiyozlari 2027-yil oxirida tugaydi",
      "banner.p": "To'qimachilik pasporti talablari 2027-yil IV choragida e'lon qilinishi kutilmoqda. Partiyalaringizning {n} tasi hozirdanoq to'liq tayyor.",
      "k.pass": "Pasportlar", "k.passD": "{n} tasi tayyor", "k.avg": "O'rtacha tayyorlik", "k.avgD": "Yevropa talablari bo'yicha",
      "k.scan": "QR skanerlar, 8 hafta", "k.scanD": "+84% oldingi haftaga", "k.exp": "Muddati yaqin sertifikat", "k.expD": "60 kun ichida",
      recent: "Oxirgi partiyalar", viewAll: "Hammasi", scansH: "Xaridorlar QR skanerlari", byWeek: "Haftalar bo'yicha", week: "{w}-h",
      scansAria: "Oxirgi 8 haftada QR skanerlar soni", readyBy: "Talablar bo'yicha tayyorlik",
      checks: ["Tola tarkibi va kelib chiqish", "Ta'minot zanjiri", "Sertifikatlar", "Parvarish belgilari", "Uglerod izi"],
      activity: "So'nggi voqealar",
      feed: [["Nordlicht Apparel polo pasportini 46 marta ochdi", "Bugun, 11:20"], ["GOTS sertifikati muddati {d} kundan keyin tugaydi", "Bugun, 09:00"], ["Pop yigiruv fabrikasi ip partiyasini tasdiqladi", "Kecha, 17:42"], ["OSON ERP'dan 4 ta partiya import qilindi", "12-oktabr"]],
      importBtn: "Import", passportBtn: "Pasport", importToast: "Prototipda ERP ulanishi keyingi versiyada qo'shiladi",
      th: ["Mahsulot", "Xaridor", "Bozor", "Miqdor, dona", "Holat", "Tayyorlik"], empty: "Bu holatda pasport yo'q.", emptyLink: "Yangisini yarating",
      st: { ready: "Tayyor", review: "Tekshiruvda", draft: "Qoralama" }, all: "Hammasi", filterAria: "Holat bo'yicha saralash",
      passSub: "Har bir partiya uchun raqamli mahsulot pasporti", readyAria: "Tayyorlik {n} foiz",
      certSub: "Muddati tugashidan 60 kun oldin ogohlantiramiz", certUp: "Sertifikat yuklash", certToast: "Prototipda fayl yuklash o'chirilgan",
      "c.expired": "Muddati tugagan", "c.left": "{d} kun qoldi", "c.valid": "Amalda", "c.no": "Raqami", "c.by": "Bergan", "c.until": "Amal qiladi", "c.untilV": "{d} gacha", "c.scope": "Qamrovi", "c.used": "Pasportlarda", "c.usedV": "{n} ta",
      newSub: "Partiya ma'lumotlarini kiriting. Pasport o'ngda darhol paydo bo'ladi.",
      "imp.h": "Ma'lumot ERP yoki Excel'da bormi?", "imp.p": "Fayldan import qilsangiz, maydonlar avtomatik to'ladi.", "imp.btn": "Excel'dan import (namuna)",
      "f.product": "Mahsulot", "f.nameUz": "Nomi (o'zbekcha)", "f.nameEn": "Nomi (inglizcha)", "f.nameUzPh": "Masalan, erkaklar futbolkasi", "f.type": "Turi", "f.sku": "Artikul",
      "f.buyer": "Xaridor", "f.buyerPh": "Brend yoki importyor nomi", "f.market": "Bozor", "f.qty": "Miqdor, dona",
      types: { tee: "Futbolka", polo: "Polo", hoodie: "Hudi", dress: "Ko'ylak", pyjama: "Pijama" },
      "f.comp": "Tola tarkibi", "f.fiber": "Tola", "f.pct": "Ulushi, %", "f.origin": "Kelib chiqishi", "f.originPh": "Viloyat, davlat", "f.del": "Tolani o'chirish", "f.add": "+ Tola qo'shish", "f.total": "Jami: {n}%",
      "f.chain": "Ta'minot zanjiri", "f.company": "Korxona", "f.region": "Hudud", "f.date": "sana", "f.verified": "hujjat bilan tasdiqlangan",
      "f.hint": "O'ngdagi tugma bosqich hujjat bilan tasdiqlanganini bildiradi.",
      "f.certs": "Sertifikatlar va parvarish", "f.care": "Parvarish belgilari", "f.co2": "Uglerod izi, kg CO₂e / dona", "f.water": "Suv sarfi, m³ / dona", "f.co2Ph": "Masalan, 3,4", "f.waterPh": "Masalan, 1,8",
      "f.clear": "Tozalash", "f.create": "Pasport yaratish", preview: "Jonli ko'rinish", readiness: "Tayyorlik", euCheck: "Yevropa talablari tekshiruvi",
      "i.name": "Mahsulot nomini kiriting", "i.buyer": "Xaridorni kiriting", "i.ok": "Barcha asosiy talablar bajarilgan",
      "i.sum": "Tola tarkibi yig'indisi {n}%, 100% bo'lishi kerak", "i.origin": "Har bir tola uchun kelib chiqish mamlakatini kiriting",
      "i.empty": "Zanjirda bo'sh bosqich: {l}", "i.unver": "{n} ta bosqich hali hujjat bilan tasdiqlanmagan", "i.expiring": "{c} muddati {d} kundan keyin tugaydi",
      "i.nocert": "Kamida bitta sertifikat biriktiring", "i.care": "Parvarish belgilari to'liq emas (kamida 4 ta)", "i.env": "Uglerod izi hisoblanmagan",
      "t.imported": "Namuna fayldan 6 bosqich, tarkib va sertifikatlar import qilindi", "t.created": "Pasport yaratildi",
      "pp.verified": "CottonID tomonidan tasdiqlangan", "pp.review": "Ma'lumotlar tekshirilmoqda", "pp.maker": "Ishlab chiqaruvchi", "pp.market": "Bozor", "pp.batch": "Partiya", "pp.qty": "Miqdor",
      "pp.comp": "Tola tarkibi", "pp.journey": "Mahsulot yo'li", "pp.vstep": "Hujjat bilan tasdiqlangan", "pp.pending": "Tasdiq kutilmoqda", "pp.empty": "Ma'lumot kiritilmagan",
      "pp.certs": "Sertifikatlar", "pp.until": "gacha amal qiladi", "pp.env": "Atrof-muhitga ta'sir", "pp.co2": "kg CO₂e / dona", "pp.water": "m³ suv / dona", "pp.rec": "qayta ishlangan tola",
      "pp.care": "Parvarish", "pp.share": "Ulashish", "pp.copy": "Havolani nusxalash", "pp.copied": "Havola nusxalandi", "pp.back": "Panelga qaytish",
      "pp.note": "Bu prototip. Korxona va sertifikat ma'lumotlari namuna sifatida berilgan.", "pp.nf": "Pasport topilmadi", "pp.dpp": "Raqamli mahsulot pasporti", "pp.none": "Biriktirilmagan",
      langAria: "Til"
    },
    en: {
      skip: "Skip to main content",
      "nav.how": "How it works", "nav.rules": "Regulation", "nav.who": "Who it's for", "nav.pricing": "Pricing",
      "nav.sample": "Sample passport", "nav.demo": "Demo dashboard", homeAria: "CottonID home",
      "hero.h1": "Every garment's journey in one QR code.",
      "hero.lead": "CottonID helps Uzbek textile factories document the chain from cotton field to finished garment and create an EU Digital Product Passport in minutes.",
      "hero.cta1": "Create a passport", "hero.cta2": "See what buyers see",
      "hero.note": "Built on the ESPR regulation (EU 2024/1781) and the upcoming textile requirements",
      "chip.a": "Cotton field, verified", "chip.b": "Scanned in a Berlin store", "chip.b2": "2 minutes ago",
      "card.aria": "Sample digital product passport", "card.verified": "Verified", "card.review": "In review",
      pcs: "pcs", stagesShort: "stages", certsShort: "certificates", productPh: "Product name",
      "reg.h2": "Soon the EU market won't accept garments without a passport.",
      "reg.p": "The buyer's brand issues the passport, but the data comes from the factory. Suppliers with data ready keep their orders.",
      "fact.exp": "$2.6 bn", "fact.expL": "Uzbekistan textile exports, 2025",
      "fact.cL": "export destination countries", "fact.days": "{n} days", "fact.daysL": "until GSP+ preferences end (31 Dec 2027)",
      tl: [
        ["July 2024", "ESPR regulation enters into force", "The EU created the legal basis for the Digital Product Passport."],
        ["20 July 2026", "Passport registry goes live", "The European Commission's central registry started accepting passports."],
        ["Now", "Brands are asking suppliers for data", "Requests for fibre composition, origin and certificates are growing."],
        ["Q4 2027", "Textile delegated act", "Sets exactly which data a garment passport must contain."],
        ["Around 2028", "Passports become mandatory", "After the transition period, garments without a passport can't be sold in the EU."]
      ],
      "how.h2": "A passport in four steps", "how.p": "It uses data the factory already has. No new bookkeeping needed.",
      steps: [
        ["Connect your data", "Batches, fibre composition and suppliers are imported from your ERP or an Excel file."],
        ["Verify the chain", "Each stage from cotton field to sewing gets its documents and certificates attached."],
        ["Create the passport", "CottonID checks it against EU requirements, flags gaps and issues a QR label."],
        ["Share with buyers", "The brand gets the data in its own format through one link, and shoppers scan the QR."]
      ],
      "who.f": "For factories", "who.fp": "Answering a buyer's data request takes minutes instead of days.",
      "who.ft": [["Readiness score.", "See how ready each batch is for EU requirements."], ["Certificate tracking.", "Get alerts before GOTS, OEKO-TEX and other certificates expire."], ["Uzbek, Russian and English.", "Works with local ERP systems and Excel."], ["QR and NFC labels.", "Print-ready files in one click."]],
      "who.b": "For buyer brands", "who.bp": "Verified data from your Uzbek suppliers in one place.",
      "who.bt": [["Origin map.", "Where the cotton was grown and who processed it."], ["Passport-ready export.", "Data structured the way the EU registry expects."], ["Document archive.", "Original certificates and audit reports."], ["Multiple suppliers.", "All your Uzbek factories in one dashboard."]],
      "price.h2": "Pricing that fits your factory", "price.p": "14-day free trial. Two months free on annual plans.", perMonth: "/ month", popular: "Most popular",
      plans: [
        ["Start", "For factories starting to export", ["Up to 20 batches a month", "Passports and QR labels", "Excel import"], "Try it"],
        ["Export", "For regular EU suppliers", ["Unlimited batches", "ERP integration", "Certificate tracking", "Buyer portal"], "Open the demo"],
        ["Cluster", "The full chain from cotton to garment", ["Multiple companies", "Invite your suppliers", "API and custom reports"], "Demo dashboard"]
      ],
      contact: "Contact:",
      "close.h2": "Be ready before passports are required.", "close.p": "Create a passport for your first batch today. No credit card needed.", "close.btn": "Create a passport",
      "foot.a": "cottonid.uz · Tashkent, Uzbekistan · Prototype, 2026", "foot.b": "All company names are sample data",
      "nav.dashboard": "Dashboard", "nav.passports": "Passports", "nav.new": "New passport", "nav.certs": "Certificates", "nav.site": "Website",
      planName: "{p} plan", proto: "Prototype · sample data", menu: "Open menu", panelNav: "Dashboard",
      greet: "Good afternoon, {n}", daysLeft: "days left", "banner.h": "GSP+ preferences end in late 2027",
      "banner.p": "Textile passport rules are expected in Q4 2027. {n} of your batches are already fully ready.",
      "k.pass": "Passports", "k.passD": "{n} ready", "k.avg": "Average readiness", "k.avgD": "Against EU requirements",
      "k.scan": "QR scans, 8 weeks", "k.scanD": "+84% vs last week", "k.exp": "Certificates expiring", "k.expD": "Within 60 days",
      recent: "Recent batches", viewAll: "View all", scansH: "Buyer QR scans", byWeek: "By week", week: "W{w}",
      scansAria: "QR scans over the last 8 weeks", readyBy: "Readiness by requirement",
      checks: ["Fibre composition and origin", "Supply chain", "Certificates", "Care labels", "Carbon footprint"],
      activity: "Recent activity",
      feed: [["Nordlicht Apparel opened the polo passport 46 times", "Today, 11:20"], ["GOTS certificate expires in {d} days", "Today, 09:00"], ["Pop spinning mill verified a yarn batch", "Yesterday, 17:42"], ["4 batches imported from OSON ERP", "12 October"]],
      importBtn: "Import", passportBtn: "Passport", importToast: "The ERP connection comes in the next version of the prototype",
      th: ["Product", "Buyer", "Market", "Quantity, pcs", "Status", "Readiness"], empty: "No passports with this status.", emptyLink: "Create one",
      st: { ready: "Ready", review: "In review", draft: "Draft" }, all: "All", filterAria: "Filter by status",
      passSub: "A digital product passport for every batch", readyAria: "Readiness {n} percent",
      certSub: "We alert you 60 days before a certificate expires", certUp: "Upload certificate", certToast: "File upload is turned off in the prototype",
      "c.expired": "Expired", "c.left": "{d} days left", "c.valid": "Valid", "c.no": "Number", "c.by": "Issued by", "c.until": "Valid until", "c.untilV": "{d}", "c.scope": "Scope", "c.used": "Used in", "c.usedV": "{n} passports",
      newSub: "Enter the batch details. The passport appears on the right as you type.",
      "imp.h": "Already have the data in ERP or Excel?", "imp.p": "Import a file and the fields fill in automatically.", "imp.btn": "Import from Excel (sample)",
      "f.product": "Product", "f.nameUz": "Name (Uzbek)", "f.nameEn": "Name (English)", "f.nameUzPh": "e.g. erkaklar futbolkasi", "f.type": "Type", "f.sku": "SKU",
      "f.buyer": "Buyer", "f.buyerPh": "Brand or importer", "f.market": "Market", "f.qty": "Quantity, pcs",
      types: { tee: "T-shirt", polo: "Polo", hoodie: "Hoodie", dress: "Dress", pyjama: "Pyjamas" },
      "f.comp": "Fibre composition", "f.fiber": "Fibre", "f.pct": "Share, %", "f.origin": "Origin", "f.originPh": "Region, country", "f.del": "Remove fibre", "f.add": "+ Add fibre", "f.total": "Total: {n}%",
      "f.chain": "Supply chain", "f.company": "Company", "f.region": "Region", "f.date": "date", "f.verified": "verified with documents",
      "f.hint": "The switch on the right marks a stage as verified with documents.",
      "f.certs": "Certificates and care", "f.care": "Care labels", "f.co2": "Carbon footprint, kg CO₂e / item", "f.water": "Water use, m³ / item", "f.co2Ph": "e.g. 3.4", "f.waterPh": "e.g. 1.8",
      "f.clear": "Clear", "f.create": "Create passport", preview: "Live preview", readiness: "Readiness", euCheck: "EU requirements check",
      "i.name": "Enter a product name", "i.buyer": "Enter the buyer", "i.ok": "All key requirements are met",
      "i.sum": "Fibre composition adds up to {n}%, it must be 100%", "i.origin": "Enter the country of origin for each fibre",
      "i.empty": "Empty stages in the chain: {l}", "i.unver": "{n} stages are not yet verified with documents", "i.expiring": "{c} expires in {d} days",
      "i.nocert": "Attach at least one certificate", "i.care": "Care labels are incomplete (at least 4)", "i.env": "Carbon footprint not calculated",
      "t.imported": "Imported 6 stages, composition and certificates from the sample file", "t.created": "Passport created",
      "pp.verified": "Verified by CottonID", "pp.review": "Data under review", "pp.maker": "Manufacturer", "pp.market": "Market", "pp.batch": "Batch", "pp.qty": "Quantity",
      "pp.comp": "Fibre composition", "pp.journey": "Product journey", "pp.vstep": "Verified with documents", "pp.pending": "Awaiting verification", "pp.empty": "Not provided",
      "pp.certs": "Certificates", "pp.until": "valid until", "pp.env": "Environmental impact", "pp.co2": "kg CO₂e / item", "pp.water": "m³ water / item", "pp.rec": "recycled fibre",
      "pp.care": "Care", "pp.share": "Share", "pp.copy": "Copy link", "pp.copied": "Link copied", "pp.back": "Back to dashboard",
      "pp.note": "This is a prototype. Company and certificate data are samples.", "pp.nf": "Passport not found", "pp.dpp": "Digital Product Passport", "pp.none": "None attached",
      langAria: "Language"
    }
  };
  function t(k, vars) {
    let s = TX[L()][k];
    if (s === undefined) s = TX.uz[k];
    if (typeof s === "string" && vars) s = s.replace(/\{(\w+)\}/g, (_, v) => (vars[v] !== undefined ? vars[v] : ""));
    return s;
  }

  /* ---------- Lug'atlar ---------- */
  const FIBERS = {
    cotton:   { uz: "Paxta", en: "Cotton", color: "#2B47DB" },
    organic:  { uz: "Organik paxta", en: "Organic cotton", color: "#23845E" },
    elastane: { uz: "Elastan", en: "Elastane", color: "#E0A914" },
    viscose:  { uz: "Viskoza", en: "Viscose", color: "#8A63D2" },
    recycled: { uz: "Qayta ishlangan paxta", en: "Recycled cotton", color: "#1F9AA5" },
    polyester:{ uz: "Poliester", en: "Polyester", color: "#8A93A8" },
    linen:    { uz: "Zig'ir", en: "Linen", color: "#B0844F" }
  };
  const fiber = (k) => FIBERS[k] || FIBERS.cotton;
  const STAGES = {
    field: { uz: "Paxta dalasi", en: "Cotton field" },
    gin:   { uz: "Paxta tozalash", en: "Ginning" },
    spin:  { uz: "Yigiruv", en: "Spinning" },
    knit:  { uz: "To'qish", en: "Knitting" },
    dye:   { uz: "Bo'yash va pardozlash", en: "Dyeing and finishing" },
    sew:   { uz: "Tikuv", en: "Sewing" }
  };
  const STAGE_ORDER = ["field", "gin", "spin", "knit", "dye", "sew"];
  const MARKETS = {
    DE: { uz: "Germaniya", en: "Germany" }, FR: { uz: "Fransiya", en: "France" },
    NL: { uz: "Niderlandiya", en: "Netherlands" }, IT: { uz: "Italiya", en: "Italy" },
    PL: { uz: "Polsha", en: "Poland" }, ES: { uz: "Ispaniya", en: "Spain" }
  };
  const market = (k) => (MARKETS[k] ? MARKETS[k][L()] : k);
  const CARE = {
    wash30: { uz: "30°C da yuvish", en: "Wash at 30°C" },
    wash40: { uz: "40°C da yuvish", en: "Wash at 40°C" },
    nobleach: { uz: "Oqartirmang", en: "Do not bleach" },
    iron1: { uz: "Past haroratda dazmollash", en: "Iron on low heat" },
    iron2: { uz: "O'rta haroratda dazmollash", en: "Iron on medium heat" },
    nodry: { uz: "Barabanda quritmang", en: "Do not tumble dry" }
  };

  /* ---------- Ikonkalar ---------- */
  const I = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    passport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.5" width="16" height="19" rx="3"/><circle cx="12" cy="10" r="3.2"/><path d="M8.5 17h7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4M12 17.2v.1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5z"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/></svg>',
    // bosqich ikonkalari
    field: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3.2"/><circle cx="15" cy="9" r="3.2"/><circle cx="12" cy="13" r="3.4"/><path d="M12 16.5V21M9 21h6"/></svg>',
    gin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="11" rx="2"/><path d="M7 8V5h10v3M8 13.5h8"/></svg>',
    spin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1.5 3h-5L8 3zM8 21h8l-1.5-3h-5L8 21z"/><path d="M9.5 6h5v12h-5z"/><path d="M9.5 9l5 2M9.5 12l5 2M9.5 15l5 2"/></svg>',
    knit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6c2 0 2 3 4 3s2-3 4-3 2 3 4 3 2-3 4-3M4 12c2 0 2 3 4 3s2-3 4-3 2 3 4 3 2-3 4-3M4 18c2 0 2 3 4 3s2-3 4-3 2 3 4 3 2-3 4-3"/></svg>',
    dye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
    sew: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l-9.5 16.5"/><circle cx="14.6" cy="4.4" r="1"/><path d="M3 17c3 1.5 6 1.5 9 0s6-1.5 9 0" stroke-dasharray="2.5 2.5"/></svg>'
  };

  const GARMENTS = {
    polo: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M24 8l-12 6-6 14 9 4 3-6v30h28V26l3 6 9-4-6-14-12-6"/><path d="M24 8c2 4 5 6 8 6s6-2 8-6M32 14v10"/><circle cx="32" cy="18" r=".8" fill="currentColor"/><circle cx="32" cy="22" r=".8" fill="currentColor"/></svg>',
    pyjama: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M22 6l-10 5-5 12 7 3 3-5v13h30V21l3 5 7-3-5-12-10-5c-1 3-5 5-10 5s-9-2-10-5z"/><path d="M17 36l-2 22h14l3-14 3 14h14l-2-22"/></svg>',
    dress: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M25 6c1 4 4 6 7 6s6-2 7-6l6 4-4 12 2 6 9 30H12l9-30 2-6-4-12 6-4z"/><path d="M23 28h18"/></svg>',
    hoodie: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M22 10c0-4 4-6 10-6s10 2 10 6l10 6 6 22-8 3-4-12v31H18V29l-4 12-8-3 6-22 10-6z"/><path d="M22 10c2 7 6 10 10 10s8-3 10-10M28 20v8M36 20v8M22 44h20v8H22z"/></svg>',
    tee: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M24 8l-12 6-6 14 9 4 3-6v30h28V26l3 6 9-4-6-14-12-6c-1 4-4 6-8 6s-7-2-8-6z"/></svg>'
  };
  const garment = (t) => GARMENTS[t] || GARMENTS.tee;

  const CARE_ICONS = {
    wash30: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9l3 16h18l3-16"/><path d="M4 9c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0"/><text x="16" y="21.5" text-anchor="middle" font-size="8" font-family="Geist, sans-serif" fill="currentColor" stroke="none">30</text></svg>',
    wash40: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 9l3 16h18l3-16"/><path d="M4 9c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0"/><text x="16" y="21.5" text-anchor="middle" font-size="8" font-family="Geist, sans-serif" fill="currentColor" stroke="none">40</text></svg>',
    nobleach: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M16 5l12 21H4z"/><path d="M8 8l16 18M24 8L8 26"/></svg>',
    iron1: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 23h22c0-6-3-11-10-11h-6v-3h8"/><circle cx="16" cy="18" r="1" fill="currentColor"/></svg>',
    iron2: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 23h22c0-6-3-11-10-11h-6v-3h8"/><circle cx="13.5" cy="18" r="1" fill="currentColor"/><circle cx="18.5" cy="18" r="1" fill="currentColor"/></svg>',
    nodry: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="5" y="5" width="22" height="22" rx="2"/><circle cx="16" cy="16" r="7"/><path d="M6 6l20 20M26 6L6 26"/></svg>'
  };

  const LOGO = '<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="currentColor" opacity=".0"/><g fill="currentColor"><circle cx="24" cy="27" r="10"/><circle cx="40" cy="27" r="10"/><circle cx="32" cy="38" r="11"/></g><path d="M32 49v9" stroke="#3FA37A" stroke-width="4.5" stroke-linecap="round"/></svg>';
  const brand = (href = "#bosh") => `<a class="brand" href="${href}" aria-label="${t("homeAria")}">${LOGO}<span>CottonID</span></a>`;

  const langSwitch = (variant) => `
    <div class="lang ${variant || ""}" role="group" aria-label="${t("langAria")}">
      <button type="button" data-lang="uz" aria-pressed="${L() === "uz"}">UZ</button>
      <button type="button" data-lang="en" aria-pressed="${L() === "en"}">EN</button>
    </div>`;

  /* ---------- Tayyorlik bahosi ---------- */
  function readiness(p) {
    const issues = [];
    const sum = p.composition.reduce((a, c) => a + Number(c.pct || 0), 0);
    const originsOk = p.composition.every((c) => c.origin && c.origin !== "Noma'lum");
    let comp = 0;
    if (sum === 100) comp += 60; else issues.push(t("i.sum", { n: sum }));
    if (originsOk) comp += 40; else issues.push(t("i.origin"));

    const filled = p.chain.filter((s) => s.org).length;
    const verified = p.chain.filter((s) => s.org && s.verified).length;
    const chain = Math.round((filled / 6) * 50 + (verified / 6) * 50);
    const missing = p.chain.filter((s) => !s.org).map((s) => STAGES[s.stage][L()].toLowerCase());
    if (missing.length) issues.push(t("i.empty", { l: missing.join(", ") }));
    const unver = p.chain.filter((s) => s.org && !s.verified).length;
    if (unver) issues.push(t("i.unver", { n: unver }));

    let certs = 0;
    if (p.certs.length) {
      const valid = p.certs.filter((id) => { const c = certById(id); return c && daysUntil(c.until) > 0; });
      certs = Math.min(100, valid.length * 45);
      p.certs.forEach((id) => { const c = certById(id); const d = c ? daysUntil(c.until) : 0; if (c && d <= 60 && d > 0) issues.push(t("i.expiring", { c: certName(c), d })); });
    } else issues.push(t("i.nocert"));

    const care = Math.min(100, (p.care.length / 4) * 100);
    if (p.care.length < 4) issues.push(t("i.care"));
    const env = p.env && p.env.co2 > 0 ? 100 : 0;
    if (!env) issues.push(t("i.env"));

    const parts = { comp, chain, certs, care, env };
    const score = Math.round(comp * 0.25 + chain * 0.3 + certs * 0.2 + care * 0.1 + env * 0.15);
    return { score, parts, issues, sum };
  }
  const statusOf = (p) => { const s = readiness(p).score; return s >= 85 ? "ready" : p.status === "draft" && s < 60 ? "draft" : "review"; };
  const ringColor = (s) => (s >= 85 ? "var(--green)" : s >= 60 ? "var(--gold)" : "var(--red)");
  const ring = (s, lg) => `<span class="ring${lg ? " lg" : ""}" style="--p:${s};--c:${ringColor(s)}" data-v="${s}" role="img" aria-label="${t("readyAria", { n: s })}"></span>`;

  function compBar(comp) {
    const bar = comp.map((c, i) => `<span style="width:${Math.max(0, c.pct)}%;background:${fiber(c.fiber).color};--i:${i}"></span>`).join("");
    const leg = comp.map((c) => `<span><i style="background:${fiber(c.fiber).color}"></i>${esc(c.pct)}% ${esc(fiber(c.fiber)[L()])}</span>`).join("");
    return `<div class="compbar" aria-hidden="true">${bar}</div><div class="complegend">${leg}</div>`;
  }

  function passportCard(p, opts = {}) {
    const r = readiness(p);
    const ok = r.score >= 85;
    return `
      <article class="pcard ${opts.cls || ""}" aria-label="${t("card.aria")}">
        <div class="pcard-top">
          <span class="mono">${esc(p.id)}</span>
          <span class="verified ${ok ? "" : "warn"}">${ok ? I.check.replace("<svg", '<svg width="14" height="14"') + " " + t("card.verified") : t("card.review")}</span>
        </div>
        <div class="pcard-body">
          <div>
            <h3>${esc(pname(p) || t("productPh"))}</h3>
            <p class="sub">${esc(D.factory.name)} · ${esc(market(p.market))} · ${num(p.qty)} ${t("pcs")}</p>
          </div>
          <div class="qr" id="${opts.qrId || "qr-card"}"></div>
        </div>
        <div class="pcard-comp">${compBar(p.composition)}</div>
        <div class="pcard-foot">
          <div><b>${p.chain.filter((s) => s.org).length}/6</b><span class="muted">${t("stagesShort")}</span></div>
          <div><b>${p.certs.length}</b><span class="muted">${t("certsShort")}</span></div>
          <div><b>${p.env.co2 ? dec(p.env.co2) : "—"}</b><span class="muted">kg CO₂e</span></div>
        </div>
      </article>`;
  }

  /* ================= LANDING ================= */
  function renderLanding() {
    document.title = L() === "en" ? "CottonID — from cotton to passport" : "CottonID — paxtadan pasportgacha";
    const sample = D.passports[0];
    const gspDays = daysUntil("2027-12-31");
    const words = t("hero.h1").split(" ").map((w, i) => `<span class="w" style="--i:${i}">${esc(w)}</span>`).join(" ");
    const plans = TX[L()].plans;
    const prices = [100, 250, 500];
    app.innerHTML = `
      <header class="site-nav">
        <div class="wrap">
          ${brand()}
          <nav aria-label="Menu">
            <a href="#how">${t("nav.how")}</a>
            <a href="#rules">${t("nav.rules")}</a>
            <a href="#who">${t("nav.who")}</a>
            <a href="#pricing">${t("nav.pricing")}</a>
          </nav>
          <div class="nav-actions">
            ${langSwitch()}
            <a class="btn btn-ghost btn-sm hide-sm" href="#${sample.id}">${t("nav.sample")}</a>
            <a class="btn btn-light btn-sm" href="#panel">${t("nav.demo")}</a>
          </div>
        </div>
      </header>

      <main id="main">
        <section class="hero">
          <div class="wrap">
            <div>
              <h1 class="words">${words}</h1>
              <p class="hero-lead fade-in" style="--d:.55s">${t("hero.lead")}</p>
              <div class="hero-cta fade-in" style="--d:.7s">
                <a class="btn btn-primary" href="#yangi">${I.plus} ${t("hero.cta1")}</a>
                <a class="btn btn-ghost" href="#${sample.id}">${I.scan} ${t("hero.cta2")}</a>
              </div>
              <p class="hero-note fade-in" style="--d:.85s">
                <svg class="eu-ring" viewBox="0 0 40 40" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path transform="translate(${(20 + 14 * Math.cos(a)).toFixed(2)} ${(20 + 14 * Math.sin(a)).toFixed(2)})" d="M0 -2.6l.76 1.56 1.72.25-1.24 1.21.29 1.71L0 1.92l-1.53.81.29-1.71-1.24-1.21 1.72-.25z" fill="#F2C230"/>`; }).join("")}</svg>
                ${t("hero.note")}
              </p>
            </div>

            <div class="showcase">
              <svg class="thread" viewBox="0 0 760 600" aria-hidden="true">
                <path d="M760 40 C 600 60, 520 180, 430 160 S 260 60, 180 210 S 120 420, 260 470 S 520 560, 700 520"/>
                <path class="draw" d="M760 40 C 600 60, 520 180, 430 160 S 260 60, 180 210 S 120 420, 260 470 S 520 560, 700 520"/>
              </svg>
              ${passportCard(sample, { qrId: "qr-hero", cls: "hero-card" })}
              <div class="chip-float chip-a"><span class="dot" style="background:var(--green-soft);color:var(--green)">${I.field.replace("<svg", '<svg width="20" height="20"')}</span><div><b>Chust, Namangan</b><span class="muted">${t("chip.a")}</span></div></div>
              <div class="chip-float chip-b"><span class="dot" style="background:var(--blue-soft);color:var(--blue)">${I.scan.replace("<svg", '<svg width="20" height="20"')}</span><div><b>${t("chip.b")}</b><span class="muted">${t("chip.b2")}</span></div></div>
            </div>
          </div>
        </section>

        <section class="section reg" id="rules">
          <div class="wrap reg-grid">
            <div class="reveal">
              <h2>${t("reg.h2")}</h2>
              <p>${t("reg.p")}</p>
              <div class="reg-facts">
                <div><b>${t("fact.exp")}</b><span>${t("fact.expL")}</span></div>
                <div><b data-count="75">75</b><span>${t("fact.cL")}</span></div>
                <div><b>${t("fact.days", { n: num(gspDays) })}</b><span>${t("fact.daysL")}</span></div>
              </div>
            </div>
            <ol class="tl">
              ${TX[L()].tl.map((x, i) => `<li class="reveal ${["done", "done", "now", "next", ""][i]}"><time>${x[0]}</time><h3>${x[1]}</h3><p>${x[2]}</p></li>`).join("")}
            </ol>
          </div>
        </section>

        <section class="section" id="how">
          <div class="wrap">
            <div class="section-head reveal">
              <h2>${t("how.h2")}</h2>
              <p>${t("how.p")}</p>
            </div>
            <ol class="steps">
              ${TX[L()].steps.map((s, i) => `<li class="reveal"><div class="n">${i + 1}</div><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join("")}
            </ol>
          </div>
        </section>

        <section class="section" id="who" style="padding-top:0">
          <div class="wrap split">
            <div class="panel reveal">
              <h3>${t("who.f")}</h3>
              <p>${t("who.fp")}</p>
              <ul class="ticks">${TX[L()]["who.ft"].map((x) => `<li>${I.check}<span><b>${x[0]}</b> ${x[1]}</span></li>`).join("")}</ul>
            </div>
            <div class="panel dark reveal">
              <h3>${t("who.b")}</h3>
              <p>${t("who.bp")}</p>
              <ul class="ticks">${TX[L()]["who.bt"].map((x) => `<li>${I.check}<span><b>${x[0]}</b> ${x[1]}</span></li>`).join("")}</ul>
            </div>
          </div>
        </section>

        <section class="section" id="pricing" style="padding-top:0">
          <div class="wrap">
            <div class="section-head reveal">
              <h2>${t("price.h2")}</h2>
              <p>${t("price.p")}</p>
            </div>
            <div class="prices">
              ${plans.map((pl, i) => `
                <div class="price reveal ${i === 1 ? "featured" : ""}">
                  ${i === 1 ? `<span class="tag">${t("popular")}</span>` : ""}
                  <h3>${pl[0]}</h3>
                  <div class="amt">$${prices[i]}<small> ${t("perMonth")}</small></div>
                  <p class="per">${pl[1]}</p>
                  <ul>${pl[2].map((x) => `<li>${x}</li>`).join("")}</ul>
                  ${i === 2 ? `<p class="per contact">${t("contact")} <span class="mono" style="user-select:all">salom@cottonid.uz</span></p>` : ""}
                  <a class="btn ${i === 1 ? "btn-primary" : "btn-quiet"}" href="#panel">${pl[3]}</a>
                </div>`).join("")}
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:0">
          <div class="wrap">
            <div class="closing reveal">
              <div>
                <h2>${t("close.h2")}</h2>
                <p>${t("close.p")}</p>
              </div>
              <div class="hero-cta">
                <a class="btn btn-light" href="#yangi">${t("close.btn")}</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-foot">
        <div class="wrap">
          ${brand()}
          <span>${t("foot.a")}</span>
          <span>${t("foot.b")}</span>
        </div>
      </footer>`;
    mountQR($("#qr-hero"), passportUrl(sample.id));
  }

  /* ================= APP SHELL ================= */
  function shell(active, title, subtitle, actions, body) {
    const n = state.passports.length;
    const links = [
      ["dashboard", "#panel", I.grid, t("nav.dashboard"), ""],
      ["passports", "#pasportlar", I.passport, t("nav.passports"), `<span class="count">${n}</span>`],
      ["new", "#yangi", I.plus, t("nav.new"), ""],
      ["certs", "#sertifikatlar", I.shield, t("nav.certs"), ""]
    ];
    const initials = D.factory.user.split(" ").map((w) => w[0]).join("");
    const plan = L() === "en" ? D.factory.plan_en || D.factory.plan : D.factory.plan;
    return `
      <div class="shell">
        <aside class="side" id="side">
          ${brand()}
          <nav aria-label="${t("panelNav")}">
            ${links.map(([k, h, ic, l, extra]) => `<a href="${h}" ${k === active ? 'aria-current="page"' : ""}>${ic}<span>${l}</span>${extra}</a>`).join("")}
          </nav>
          <div class="side-foot">
            <a class="btn btn-ghost btn-sm" href="#bosh" style="color:#fff">${I.home} ${t("nav.site")}</a>
            <div class="factory"><span class="avatar">${esc(initials)}</span><div><b>${esc(D.factory.name)}</b><span>${esc(D.factory.user)} · ${t("planName", { p: esc(plan) })}</span></div></div>
            <p class="proto">${t("proto")}</p>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <div class="topbar-title">
              <button class="icon-btn menu-btn" id="menuBtn" aria-label="${t("menu")}">${I.menu}</button>
              <div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>
            </div>
            <div class="actions">${langSwitch("light")}${actions || ""}</div>
          </header>
          <main class="content" id="main">${body}</main>
        </div>
      </div>`;
  }

  function bindShell() {
    const side = $("#side");
    const btn = $("#menuBtn");
    if (btn) btn.addEventListener("click", () => side.classList.toggle("open"));
    $$("tbody tr[data-href]").forEach((tr) => {
      tr.addEventListener("click", (e) => { if (!e.target.closest("a,button")) location.hash = tr.dataset.href; });
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = tr.dataset.href; });
    });
  }

  function passportRows(list) {
    if (!list.length) return `<tr><td colspan="6"><div class="empty">${t("empty")} <a href="#yangi">${t("emptyLink")}</a>.</div></td></tr>`;
    return list.map((p, i) => {
      const r = readiness(p);
      const st = statusOf(p);
      return `<tr data-href="#${esc(p.id)}" tabindex="0" style="--i:${i}">
        <td><div class="prod"><span class="prod-ico">${garment(p.type)}</span><div><b>${esc(pname(p))}</b><span class="mono">${esc(p.id)}</span></div></div></td>
        <td class="nw">${esc(p.buyer)}</td>
        <td><span class="flag">${esc(p.market)}</span></td>
        <td class="num">${num(p.qty)}</td>
        <td class="nw"><span class="pill ${st}">${TX[L()].st[st]}</span></td>
        <td>${ring(r.score)}</td>
      </tr>`;
    }).join("");
  }
  const tableHead = () => `<thead><tr>${TX[L()].th.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;

  /* ---------- Raqamlarni sanab ko'rsatish ---------- */
  function countUp(root) {
    if (reduced()) return;
    $$("[data-count]", root).forEach((el) => {
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const t0 = performance.now();
      const dur = 900;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = num(Math.round(end * e)) + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Bosh panel ---------- */
  function renderDashboard() {
    document.title = `${t("nav.dashboard")} — CottonID`;
    const ps = state.passports;
    const scores = ps.map((p) => readiness(p).score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const readyN = scores.filter((s) => s >= 85).length;
    const expiring = D.certificates.filter((c) => daysUntil(c.until) <= 60).length;
    const scans = D.scansByWeek.reduce((a, b) => a + b, 0);
    const max = Math.max(...D.scansByWeek);
    const weeks = [34, 35, 36, 37, 38, 39, 40, 41];
    const parts = ["comp", "chain", "certs", "care", "env"].map((k) => Math.round(ps.reduce((a, p) => a + readiness(p).parts[k], 0) / ps.length));
    const cls = (v) => (v >= 85 ? "" : v >= 60 ? "mid" : "low");
    const feedIco = [["var(--blue-soft)", "var(--blue)", I.scan], ["var(--amber-soft)", "var(--amber)", I.alert], ["var(--green-soft)", "var(--green)", I.checkCircle], ["var(--paper)", "var(--ink-2)", I.upload]];
    const gspDays = daysUntil("2027-12-31");

    const body = `
      <section class="ready-banner">
        <div class="days"><b data-count="${gspDays}">${num(gspDays)}</b><span>${t("daysLeft")}</span></div>
        <div><h2>${t("banner.h")}</h2><p>${t("banner.p", { n: readyN })}</p></div>
        <a class="btn btn-primary btn-sm" href="#yangi">${I.plus} ${t("nav.new")}</a>
      </section>

      <section class="kpis">
        <div class="kpi"><div class="lbl">${t("k.pass")}</div><div class="val" data-count="${ps.length}">${ps.length}</div><div class="delta up">${t("k.passD", { n: readyN })}</div></div>
        <div class="kpi"><div class="lbl">${t("k.avg")}</div><div class="val" data-count="${avg}" data-suffix="%">${avg}%</div><div class="delta">${t("k.avgD")}</div></div>
        <div class="kpi"><div class="lbl">${t("k.scan")}</div><div class="val" data-count="${scans}">${num(scans)}</div><div class="delta up">${t("k.scanD")}</div></div>
        <div class="kpi"><div class="lbl">${t("k.exp")}</div><div class="val" data-count="${expiring}">${expiring}</div><div class="delta ${expiring ? "warn" : ""}">${t("k.expD")}</div></div>
      </section>

      <section class="card">
        <div class="card-head"><h2>${t("recent")}</h2><a href="#pasportlar">${t("viewAll")}</a></div>
        <div class="table-wrap"><table>${tableHead()}<tbody>${passportRows(ps.slice(0, 5))}</tbody></table></div>
      </section>

      <div class="grid-3">
        <section class="card">
          <div class="card-head"><h2>${t("scansH")}</h2><span class="muted" style="font-size:13px">${t("byWeek")}</span></div>
          <div class="bars" role="img" aria-label="${t("scansAria")}">
            ${D.scansByWeek.map((v, i) => `<div><em>${v}</em><span class="b" style="height:${Math.round((v / max) * 100)}%;--i:${i}"></span><small>${t("week", { w: weeks[i] })}</small></div>`).join("")}
          </div>
        </section>
        <section class="card">
          <div class="card-head"><h2>${t("readyBy")}</h2></div>
          <div class="checks">
            ${parts.map((v, i) => `<div class="check"><span>${TX[L()].checks[i]}</span><b>${v}%</b><div class="bar"><span class="${cls(v)}" style="width:${v}%;--i:${i}"></span></div></div>`).join("")}
          </div>
        </section>
        <section class="card">
          <div class="card-head"><h2>${t("activity")}</h2></div>
          <ul class="feed">
            ${TX[L()].feed.map((f, i) => `<li style="--i:${i}"><span class="ico" style="background:${feedIco[i][0]};color:${feedIco[i][1]}">${feedIco[i][2]}</span><div>${f[0].replace("{d}", daysUntil("2026-11-20"))}<time>${f[1]}</time></div></li>`).join("")}
          </ul>
        </section>
      </div>`;

    app.innerHTML = shell("dashboard", t("greet", { n: esc(D.factory.user.split(" ")[0]) }), esc(D.factory.legal) + " · " + esc(D.factory.city),
      `<button class="btn btn-quiet btn-sm hide-sm" id="importBtn">${I.upload} ${t("importBtn")}</button><a class="btn btn-primary btn-sm" href="#yangi">${I.plus} ${t("passportBtn")}</a>`, body);
    bindShell();
    $("#importBtn").addEventListener("click", () => toast(t("importToast")));
    countUp(app);
  }

  /* ---------- Pasportlar ro'yxati ---------- */
  function renderPassports() {
    document.title = `${t("nav.passports")} — CottonID`;
    const f = state.filter;
    const withStatus = state.passports.map((p) => ({ p, st: statusOf(p) }));
    const list = withStatus.filter((x) => f === "all" || x.st === f).map((x) => x.p);
    const tabs = [["all", t("all")], ["ready", TX[L()].st.ready], ["review", TX[L()].st.review], ["draft", TX[L()].st.draft]];
    const body = `
      <div class="filters" role="group" aria-label="${t("filterAria")}">
        ${tabs.map(([k, l]) => `<button class="cert-pick" data-f="${k}" aria-pressed="${f === k}">${l} · ${k === "all" ? withStatus.length : withStatus.filter((x) => x.st === k).length}</button>`).join("")}
      </div>
      <section class="card">
        <div class="table-wrap" style="margin-top:-24px"><table>${tableHead()}<tbody>${passportRows(list)}</tbody></table></div>
      </section>`;
    app.innerHTML = shell("passports", t("nav.passports"), t("passSub"), `<a class="btn btn-primary btn-sm" href="#yangi">${I.plus} ${t("nav.new")}</a>`, body);
    bindShell();
    $$("[data-f]").forEach((b) => b.addEventListener("click", () => { state.filter = b.dataset.f; renderPassports(); }));
  }

  /* ---------- Sertifikatlar ---------- */
  function renderCerts() {
    document.title = `${t("nav.certs")} — CottonID`;
    const body = `<div class="cert-grid">${D.certificates.map((c, i) => {
      const d = daysUntil(c.until);
      const st = d <= 0 ? ["bad", t("c.expired")] : d <= 60 ? ["review", t("c.left", { d })] : ["ready", t("c.valid")];
      const used = state.passports.filter((p) => p.certs.includes(c.id)).length;
      return `<article class="cert" style="--i:${i}">
        <div class="cert-top"><h3>${esc(certName(c))}</h3><span class="pill ${st[0]}">${st[1]}</span></div>
        <dl><dt>${t("c.no")}</dt><dd class="mono">${esc(c.number)}</dd><dt>${t("c.by")}</dt><dd>${esc(c.issuer)}</dd><dt>${t("c.until")}</dt><dd>${t("c.untilV", { d: fmtDay(c.until) })}</dd><dt>${t("c.scope")}</dt><dd>${esc(L() === "en" ? c.scope_en || c.scope : c.scope)}</dd><dt>${t("c.used")}</dt><dd>${t("c.usedV", { n: used })}</dd></dl>
      </article>`;
    }).join("")}</div>`;
    app.innerHTML = shell("certs", t("nav.certs"), t("certSub"), `<button class="btn btn-primary btn-sm" id="addCert">${I.upload} ${t("certUp")}</button>`, body);
    bindShell();
    $("#addCert").addEventListener("click", () => toast(t("certToast")));
  }

  /* ---------- Pasport yaratish ---------- */
  const emptyDraft = () => ({
    id: "",
    product: { uz: "", en: "" },
    type: "tee",
    color: { uz: "", en: "" },
    sku: "",
    batch: "",
    qty: 1000,
    buyer: "",
    market: "DE",
    status: "draft",
    created: new Date().toISOString().slice(0, 10),
    scans: 0,
    gsm: 180,
    composition: [{ fiber: "cotton", pct: 100, origin: "" }],
    chain: STAGE_ORDER.map((s) => ({ stage: s, org: "", place: "", date: "", verified: false })),
    certs: [],
    care: ["wash30", "nobleach"],
    env: { co2: 0, water: 0, recycled: 0 }
  });
  let draft = null;
  let lastScore = null;

  function nextId() {
    const nums = state.passports.map((p) => parseInt(p.id.split("-").pop(), 10)).filter((n) => !isNaN(n));
    return "CID-UZ-26-" + String(Math.max(436, ...nums) + 1).padStart(5, "0");
  }

  function renderNew() {
    document.title = `${t("nav.new")} — CottonID`;
    if (!draft) draft = emptyDraft();
    if (!draft.id) draft.id = nextId();
    const d = draft;
    const fiberOpts = (sel) => Object.entries(FIBERS).map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${v[L()]}</option>`).join("");
    const types = TX[L()].types;

    const body = `
      <div class="builder">
        <form class="card form-card" id="pform" novalidate>
          <div class="import-drop">
            <p><b>${t("imp.h")}</b>${t("imp.p")}</p>
            <button type="button" class="btn btn-quiet btn-sm" id="fillDemo">${I.upload} ${t("imp.btn")}</button>
          </div>

          <fieldset class="fs">
            <legend><span class="n">1</span>${t("f.product")}</legend>
            <div class="row">
              <div class="field"><label for="f-name">${t("f.nameUz")}</label><input class="input" id="f-name" data-k="product.uz" value="${esc(d.product.uz)}" placeholder="${t("f.nameUzPh")}"></div>
              <div class="field"><label for="f-name-en">${t("f.nameEn")}</label><input class="input" id="f-name-en" data-k="product.en" value="${esc(d.product.en)}" placeholder="Men's T-shirt"></div>
            </div>
            <div class="row">
              <div class="field"><label for="f-type">${t("f.type")}</label><select class="input" id="f-type" data-k="type">${Object.entries(types).map(([k, l]) => `<option value="${k}" ${d.type === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
              <div class="field"><label for="f-sku">${t("f.sku")}</label><input class="input mono" id="f-sku" data-k="sku" value="${esc(d.sku)}" placeholder="VT-TEE-160"></div>
            </div>
            <div class="row">
              <div class="field"><label for="f-buyer">${t("f.buyer")}</label><input class="input" id="f-buyer" data-k="buyer" value="${esc(d.buyer)}" placeholder="${t("f.buyerPh")}"></div>
              <div class="row">
                <div class="field"><label for="f-market">${t("f.market")}</label><select class="input" id="f-market" data-k="market">${Object.keys(MARKETS).map((k) => `<option value="${k}" ${d.market === k ? "selected" : ""}>${market(k)}</option>`).join("")}</select></div>
                <div class="field"><label for="f-qty">${t("f.qty")}</label><input class="input" id="f-qty" type="number" min="1" data-k="qty" value="${esc(d.qty)}"></div>
              </div>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">2</span>${t("f.comp")}</legend>
            <div id="compRows" class="comp-rows">
              ${d.composition.map((c, i) => `
                <div class="row-3">
                  <div class="field"><label class="lbl-sm" for="c-f-${i}">${t("f.fiber")}</label><select class="input" id="c-f-${i}" data-comp="${i}" data-ck="fiber">${fiberOpts(c.fiber)}</select></div>
                  <div class="field"><label class="lbl-sm" for="c-p-${i}">${t("f.pct")}</label><input class="input" id="c-p-${i}" type="number" min="0" max="100" data-comp="${i}" data-ck="pct" value="${esc(c.pct)}"></div>
                  <div class="field"><label class="lbl-sm" for="c-o-${i}">${t("f.origin")}</label><input class="input" id="c-o-${i}" data-comp="${i}" data-ck="origin" value="${esc(c.origin)}" placeholder="${t("f.originPh")}"></div>
                  <button type="button" class="icon-btn" data-delcomp="${i}" aria-label="${t("f.del")}" ${d.composition.length < 2 ? "disabled" : ""}>${I.trash.replace("<svg", '<svg width="18" height="18"')}</button>
                </div>`).join("")}
            </div>
            <div class="sum-row">
              <button type="button" class="add-link" id="addComp">${t("f.add")}</button>
              <span class="sum-note" id="sumNote"></span>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">3</span>${t("f.chain")}</legend>
            <div class="chain-edit">
              ${d.chain.map((s, i) => {
                const st = STAGES[s.stage][L()];
                return `
                <div class="chain-row">
                  <span class="stage"><i class="${s.org && s.verified ? "on" : ""}" id="dot-${i}"></i>${st}</span>
                  <input class="input" id="ch-o-${i}" aria-label="${st}: ${t("f.company")}" data-chain="${i}" data-sk="org" value="${esc(s.org)}" placeholder="${t("f.company")}">
                  <input class="input" id="ch-p-${i}" aria-label="${st}: ${t("f.region")}" data-chain="${i}" data-sk="place" value="${esc(s.place)}" placeholder="${t("f.region")}">
                  <input class="input" id="ch-d-${i}" type="month" aria-label="${st}: ${t("f.date")}" data-chain="${i}" data-sk="date" value="${esc(s.date)}">
                  <button type="button" class="toggle" data-ver="${i}" aria-pressed="${!!s.verified}" aria-label="${st}: ${t("f.verified")}"></button>
                </div>`;
              }).join("")}
              <p class="muted" style="font-size:13px">${t("f.hint")}</p>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">4</span>${t("f.certs")}</legend>
            <div class="cert-picks">${D.certificates.map((c) => `<button type="button" class="cert-pick" data-cert="${c.id}" aria-pressed="${d.certs.includes(c.id)}">${esc(certName(c).split(" — ")[0])}</button>`).join("")}</div>
            <span class="lbl-sm">${t("f.care")}</span>
            <div class="cert-picks">${Object.entries(CARE).map(([k, v]) => `<button type="button" class="cert-pick" data-care="${k}" aria-pressed="${d.care.includes(k)}">${v[L()]}</button>`).join("")}</div>
            <div class="row">
              <div class="field"><label for="f-co2">${t("f.co2")}</label><input class="input" id="f-co2" type="number" step="0.1" min="0" data-k="env.co2" value="${esc(d.env.co2 || "")}" placeholder="${t("f.co2Ph")}"></div>
              <div class="field"><label for="f-water">${t("f.water")}</label><input class="input" id="f-water" type="number" step="0.1" min="0" data-k="env.water" value="${esc(d.env.water || "")}" placeholder="${t("f.waterPh")}"></div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-quiet" id="resetBtn">${t("f.clear")}</button>
            <button type="submit" class="btn btn-primary">${I.passport} ${t("f.create")}</button>
          </div>
        </form>

        <aside class="preview" aria-label="${t("preview")}">
          <div class="preview-title"><span>${t("preview")}</span><span id="pvScore"></span></div>
          <div id="pvCard"></div>
          <section class="card">
            <div class="card-head" style="margin-bottom:12px"><h2>${t("euCheck")}</h2></div>
            <ul class="issues" id="pvIssues"></ul>
          </section>
        </aside>
      </div>`;

    app.innerHTML = shell("new", t("nav.new"), t("newSub"), "", body);
    bindShell();
    bindBuilder();
    lastScore = null;
    updatePreview();
  }

  function setPath(obj, path, val) {
    const ks = path.split(".");
    let o = obj;
    while (ks.length > 1) o = o[ks.shift()];
    o[ks[0]] = val;
  }

  function updatePreview() {
    const d = draft;
    const r = readiness(d);
    $("#pvCard").innerHTML = passportCard(d, { qrId: "qr-pv", cls: "static" });
    mountQR($("#qr-pv"), passportUrl(d.id));
    const scoreEl = $("#pvScore");
    scoreEl.innerHTML = `${t("readiness")}: <b style="color:${ringColor(r.score)}">${r.score}%</b>`;
    if (lastScore !== null && lastScore !== r.score && !reduced()) {
      scoreEl.classList.remove("bump"); void scoreEl.offsetWidth; scoreEl.classList.add("bump");
    }
    lastScore = r.score;
    const issues = [];
    if (!d.product.uz && !d.product.en) issues.push(t("i.name"));
    if (!d.buyer) issues.push(t("i.buyer"));
    const all = issues.concat(r.issues);
    $("#pvIssues").innerHTML = all.length ? all.map((x) => `<li>${esc(x)}</li>`).join("") : `<li class="ok">${t("i.ok")}</li>`;
    const s = $("#sumNote");
    if (s) { s.textContent = t("f.total", { n: r.sum }); s.className = "sum-note " + (r.sum === 100 ? "ok" : "bad"); }
    d.chain.forEach((c, i) => { const dot = $("#dot-" + i); if (dot) dot.className = c.org && c.verified ? "on" : ""; });
  }

  function bindBuilder() {
    const form = $("#pform");
    const onInput = (e) => {
      const el = e.target;
      if (el.dataset.k) {
        let v = el.value;
        if (el.type === "number") v = v === "" ? 0 : Number(v);
        setPath(draft, el.dataset.k, v);
      } else if (el.dataset.comp !== undefined) {
        const c = draft.composition[+el.dataset.comp];
        c[el.dataset.ck] = el.dataset.ck === "pct" ? Number(el.value || 0) : el.value;
      } else if (el.dataset.chain !== undefined) {
        draft.chain[+el.dataset.chain][el.dataset.sk] = el.value;
      } else return;
      updatePreview();
    };
    form.addEventListener("input", onInput);
    form.addEventListener("change", onInput);
    form.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.ver !== undefined) {
        const s = draft.chain[+b.dataset.ver];
        s.verified = !s.verified;
        b.setAttribute("aria-pressed", s.verified);
        updatePreview();
      } else if (b.dataset.cert) {
        const id = b.dataset.cert;
        draft.certs = draft.certs.includes(id) ? draft.certs.filter((x) => x !== id) : draft.certs.concat(id);
        b.setAttribute("aria-pressed", draft.certs.includes(id));
        updatePreview();
      } else if (b.dataset.care) {
        const id = b.dataset.care;
        draft.care = draft.care.includes(id) ? draft.care.filter((x) => x !== id) : draft.care.concat(id);
        b.setAttribute("aria-pressed", draft.care.includes(id));
        updatePreview();
      } else if (b.dataset.delcomp !== undefined) {
        draft.composition.splice(+b.dataset.delcomp, 1);
        renderNew();
      } else if (b.id === "addComp") {
        const used = draft.composition.reduce((a, c) => a + Number(c.pct || 0), 0);
        draft.composition.push({ fiber: "elastane", pct: Math.max(0, 100 - used), origin: "" });
        renderNew();
      } else if (b.id === "fillDemo") {
        const keepId = draft.id;
        draft = clone(D.passports[0]);
        Object.assign(draft, {
          id: keepId, product: { uz: "Erkaklar futbolkasi", en: "Men's T-shirt" }, type: "tee", sku: "VT-TEE-160", batch: "P-2026-0437",
          qty: 15000, gsm: 160, buyer: "Nordlicht Apparel GmbH (demo)", composition: [{ fiber: "cotton", pct: 100, origin: "Namangan, UZ" }],
          env: { co2: 3.4, water: 1.8, recycled: 0 }, created: new Date().toISOString().slice(0, 10), scans: 0
        });
        renderNew();
        toast(t("t.imported"));
      } else if (b.id === "resetBtn") {
        draft = emptyDraft();
        renderNew();
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!draft.product.uz && !draft.product.en) { toast(t("i.name")); $("#f-name").focus(); return; }
      const p = clone(draft);
      if (!p.product.en) p.product.en = p.product.uz;
      if (!p.product.uz) p.product.uz = p.product.en;
      p.batch = p.batch || "P-" + p.id.split("-").pop();
      p.status = readiness(p).score >= 85 ? "ready" : "review";
      state.passports.unshift(p);
      const created = store.get("created", []) || [];
      created.unshift(p);
      store.set("created", created);
      draft = null;
      toast(t("t.created"));
      location.hash = "#" + p.id;
    });
  }

  /* ================= OCHIQ PASPORT ================= */
  function renderPassport(id) {
    const p = findPassport(id);
    if (!p) {
      app.innerHTML = `<div class="pp"><div class="pp-bar"><div class="wrap">${brand()}${langSwitch()}</div></div><main class="pp-main" id="main"><div class="pp-sec empty"><h2>${t("pp.nf")}</h2><p class="mono">${esc(id)}</p><p style="margin-top:16px"><a class="btn btn-primary" href="#panel">${t("pp.back")}</a></p></div></main></div>`;
      return;
    }
    document.title = `${pname(p)} — ${t("pp.dpp")}`;
    const ok = readiness(p).score >= 85;

    app.innerHTML = `
      <div class="pp">
        <header class="pp-bar"><div class="wrap">
          ${brand()}
          ${langSwitch()}
        </div></header>

        <main class="pp-main" id="main">
          <section class="pp-hero">
            <div class="pp-visual">
              <div>
                <span class="pp-verified ${ok ? "" : "warn"}">${ok ? I.checkCircle.replace("<svg", '<svg width="16" height="16"') : I.alert.replace("<svg", '<svg width="16" height="16"')} ${ok ? t("pp.verified") : t("pp.review")}</span>
                <h1>${esc(pname(p))}</h1>
                <div class="meta"><span>${esc(p.color ? p.color[L()] || p.color.uz || "" : "")}</span><span class="mono">${esc(p.id)}</span><span>${t("pp.dpp")}</span></div>
              </div>
              <div class="garment" aria-hidden="true">${garment(p.type)}</div>
            </div>
            <div class="pp-facts">
              <div><span>${t("pp.maker")}</span><b>${esc(D.factory.legal)}</b></div>
              <div><span>${t("pp.market")}</span><b>${esc(market(p.market))}</b></div>
              <div><span>${t("pp.batch")}</span><b class="mono">${esc(p.batch || "—")}</b></div>
              <div><span>${t("pp.qty")}</span><b>${num(p.qty)} ${t("pcs")}</b></div>
            </div>
          </section>

          <section class="pp-sec">
            <h2>${t("pp.comp")}</h2>
            ${compBar(p.composition)}
            <div class="cert-list" style="margin-top:16px">
              ${p.composition.map((c) => `<div><b>${esc(c.pct)}% ${esc(fiber(c.fiber)[L()])}</b><span>${esc(c.origin || t("pp.empty"))}</span></div>`).join("")}
            </div>
          </section>

          <section class="pp-sec">
            <h2>${t("pp.journey")}</h2>
            <ol class="journey">
              ${p.chain.map((s, i) => `
                <li class="${s.org && s.verified ? "v" : ""}" style="--i:${i}">
                  <span class="node">${I[s.stage]}</span>
                  <div><b>${STAGES[s.stage][L()]}</b><span>${s.org ? esc(s.org) + (s.place ? ", " + esc(s.place) : "") : t("pp.empty")}</span><br><span class="vstate ${s.org && s.verified ? "on" : ""}">${s.org ? (s.verified ? t("pp.vstep") : t("pp.pending")) : ""}</span></div>
                  <span class="when">${esc(fmtMonth(s.date))}</span>
                </li>`).join("")}
            </ol>
          </section>

          <div class="pp-two">
            <section class="pp-sec">
              <h2>${t("pp.certs")}</h2>
              <div class="cert-list">
                ${p.certs.length ? p.certs.map((cid) => { const c = certById(cid); return c ? `<div><div><b>${esc(certName(c).split(" — ")[0])}</b><br><span class="mono">${esc(c.number)}</span></div><span>${L() === "en" ? t("pp.until") + " " + fmtDay(c.until) : fmtDay(c.until) + " " + t("pp.until")}</span></div>` : ""; }).join("") : `<div><span>${t("pp.none")}</span></div>`}
              </div>
            </section>
            <section class="pp-sec">
              <h2>${t("pp.env")}</h2>
              <div class="env">
                <div><b>${p.env.co2 ? dec(p.env.co2) : "—"}</b><span>${t("pp.co2")}</span></div>
                <div><b>${p.env.water ? dec(p.env.water) : "—"}</b><span>${t("pp.water")}</span></div>
                <div><b>${p.env.recycled || 0}%</b><span>${t("pp.rec")}</span></div>
              </div>
              <h2 style="margin-top:22px">${t("pp.care")}</h2>
              <div class="care">${p.care.map((k) => `<div>${CARE_ICONS[k] || ""}<span>${CARE[k] ? CARE[k][L()] : k}</span></div>`).join("")}</div>
            </section>
          </div>

          <section class="pp-sec pp-qr">
            <div class="qr" id="qr-pp"></div>
            <div>
              <h2 style="margin-bottom:6px">${t("pp.share")}</h2>
              <p class="mono muted url" id="ppUrl">${esc(passportUrl(p.id))}</p>
              <div class="btns">
                <button class="btn btn-quiet btn-sm" id="copyBtn">${I.link} ${t("pp.copy")}</button>
                <a class="btn btn-primary btn-sm" href="#panel">${t("pp.back")}</a>
              </div>
            </div>
          </section>

          <footer class="pp-foot">
            ${brand().replace('class="brand"', 'class="brand" style="color:var(--ink);font-size:17px"')}
            <p>${t("pp.note")}</p>
          </footer>
        </main>
      </div>`;

    mountQR($("#qr-pp"), passportUrl(p.id));
    $("#copyBtn").addEventListener("click", () => {
      const url = passportUrl(p.id);
      const done = () => toast(t("pp.copied"));
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#ppUrl")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
      try { navigator.clipboard.writeText(url).then(done, fallback); } catch (e) { fallback(); }
    });
  }

  /* ================= ROUTER ================= */
  // Manzillar oddiy belgi ko'rinishida (#panel, #CID-UZ-26-00418) — har qanday hostingda ishlaydi
  const ROUTES = { panel: renderDashboard, pasportlar: renderPassports, yangi: renderNew, sertifikatlar: renderCerts };
  const SECTIONS = ["how", "rules", "who", "pricing", "main"];
  let current = "";
  let currentKey = "";

  function render(key) {
    if (/^CID-/.test(key)) { renderPassport(key); current = "pp"; }
    else if (ROUTES[key]) { ROUTES[key](); current = key; }
    else { renderLanding(); current = "landing"; }
    currentKey = key;
    document.documentElement.lang = L();
    const sk = $(".skip"); if (sk) sk.textContent = t("skip");
    app.classList.remove("enter"); void app.offsetWidth; app.classList.add("enter");
  }

  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (SECTIONS.includes(h)) {
      if (current !== "landing") render("");
      const el = document.getElementById(h);
      if (el) el.scrollIntoView();
      return;
    }
    render(h);
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", (e) => {
    const lb = e.target.closest("[data-lang]");
    if (lb) {
      if (lb.dataset.lang !== L()) {
        state.lang = lb.dataset.lang;
        store.set("lang", state.lang);
        const y = window.scrollY;
        render(currentKey);
        window.scrollTo(0, y);
      }
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (SECTIONS.includes(id) && current === "landing") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
