/* CottonID prototipi uchun namuna ma'lumotlar.
   Barcha korxona, xaridor va sertifikat raqamlari to'qima (demo). */

window.CID_DATA = {
  factory: {
    name: "Vodiy Trikotaj",
    legal: "Vodiy Trikotaj MChJ (demo)",
    city: "Namangan",
    country: "O'zbekiston",
    stir: "309 000 000",
    plan: "Eksport",
    user: "Dilnoza Karimova",
    role: "Eksport bo'limi"
  },

  certificates: [
    { id: "oekotex", name: "OEKO-TEX Standard 100", number: "22.UZ.04187", issuer: "Hohenstein (demo)", until: "2027-03-31", scope: "Trikotaj mato va tayyor kiyim" },
    { id: "gots", name: "GOTS — organik to'qimachilik", number: "CU-GOTS-829104", issuer: "Control Union (demo)", until: "2026-11-20", scope: "Organik paxta mahsulotlari" },
    { id: "bettercotton", name: "Better Cotton", number: "BC-UZ-55120", issuer: "Better Cotton (demo)", until: "2027-06-30", scope: "Paxta xomashyosi" },
    { id: "iso14001", name: "ISO 14001 — ekologik boshqaruv", number: "EMS-61842", issuer: "TÜV (demo)", until: "2026-12-05", scope: "Butun korxona" },
    { id: "bsci", name: "amfori BSCI auditi", number: "BSCI-UZ-0921", issuer: "amfori (demo)", until: "2027-09-14", scope: "Ijtimoiy muvofiqlik" }
  ],

  passports: [
    {
      id: "CID-UZ-26-00418",
      product: { uz: "Erkaklar polo futbolkasi", en: "Men's polo shirt" },
      type: "polo",
      color: { uz: "To'q ko'k", en: "Navy" },
      sku: "VT-POLO-220",
      batch: "P-2026-0418",
      qty: 12000,
      buyer: "Nordlicht Apparel GmbH (demo)",
      market: "DE",
      status: "ready",
      created: "2026-10-02",
      scans: 214,
      gsm: 220,
      composition: [
        { fiber: "cotton", pct: 95, origin: "Namangan, UZ" },
        { fiber: "elastane", pct: 5, origin: "Bursa, TR" }
      ],
      chain: [
        { stage: "field", org: "Chust paxta klasteri (demo)", place: "Namangan viloyati", date: "2025-09", verified: true },
        { stage: "gin", org: "Chust paxta tozalash zavodi (demo)", place: "Namangan viloyati", date: "2025-11", verified: true },
        { stage: "spin", org: "Pop yigiruv fabrikasi (demo)", place: "Namangan viloyati", date: "2026-03", verified: true },
        { stage: "knit", org: "Vodiy Trikotaj", place: "Namangan", date: "2026-06", verified: true },
        { stage: "dye", org: "Vodiy Trikotaj — bo'yoq sexi", place: "Namangan", date: "2026-06", verified: true },
        { stage: "sew", org: "Vodiy Trikotaj — tikuv sexi", place: "Namangan", date: "2026-08", verified: true }
      ],
      certs: ["oekotex", "bettercotton", "bsci"],
      care: ["wash40", "nobleach", "iron2", "nodry"],
      env: { co2: 4.2, water: 2.1, recycled: 0 }
    },
    {
      id: "CID-UZ-26-00422",
      product: { uz: "Bolalar organik pijamasi", en: "Kids' organic pyjamas" },
      type: "pyjama",
      color: { uz: "Sut rang", en: "Ecru" },
      sku: "VT-KIDS-PJ-04",
      batch: "P-2026-0422",
      qty: 6500,
      buyer: "Petit Coton SAS (demo)",
      market: "FR",
      status: "ready",
      created: "2026-09-26",
      scans: 98,
      gsm: 180,
      composition: [
        { fiber: "organic", pct: 100, origin: "Buxoro, UZ" }
      ],
      chain: [
        { stage: "field", org: "Buxoro organik fermer xo'jaligi (demo)", place: "Buxoro viloyati", date: "2025-09", verified: true },
        { stage: "gin", org: "G'ijduvon paxta zavodi (demo)", place: "Buxoro viloyati", date: "2025-10", verified: true },
        { stage: "spin", org: "Buxoro yigiruv (demo)", place: "Buxoro", date: "2026-02", verified: true },
        { stage: "knit", org: "Vodiy Trikotaj", place: "Namangan", date: "2026-05", verified: true },
        { stage: "dye", org: "Vodiy Trikotaj — bo'yoq sexi", place: "Namangan", date: "2026-05", verified: true },
        { stage: "sew", org: "Vodiy Trikotaj — tikuv sexi", place: "Namangan", date: "2026-07", verified: true }
      ],
      certs: ["gots", "oekotex"],
      care: ["wash30", "nobleach", "iron1", "nodry"],
      env: { co2: 2.6, water: 1.3, recycled: 0 }
    },
    {
      id: "CID-UZ-26-00431",
      product: { uz: "Ayollar trikotaj ko'ylagi", en: "Women's jersey dress" },
      type: "dress",
      color: { uz: "Zaytun", en: "Olive" },
      sku: "VT-DR-118",
      batch: "P-2026-0431",
      qty: 4200,
      buyer: "Kaskade Mode BV (demo)",
      market: "NL",
      status: "review",
      created: "2026-10-09",
      scans: 0,
      gsm: 200,
      composition: [
        { fiber: "cotton", pct: 70, origin: "Farg'ona, UZ" },
        { fiber: "viscose", pct: 25, origin: "Noma'lum" },
        { fiber: "elastane", pct: 5, origin: "Bursa, TR" }
      ],
      chain: [
        { stage: "field", org: "Farg'ona paxta klasteri (demo)", place: "Farg'ona viloyati", date: "2025-09", verified: true },
        { stage: "gin", org: "Quva paxta tozalash (demo)", place: "Farg'ona viloyati", date: "2025-11", verified: true },
        { stage: "spin", org: "Marg'ilon ip fabrikasi (demo)", place: "Farg'ona viloyati", date: "2026-04", verified: false },
        { stage: "knit", org: "Vodiy Trikotaj", place: "Namangan", date: "2026-07", verified: true },
        { stage: "dye", org: "", place: "", date: "", verified: false },
        { stage: "sew", org: "Vodiy Trikotaj — tikuv sexi", place: "Namangan", date: "2026-09", verified: true }
      ],
      certs: ["oekotex"],
      care: ["wash30", "nobleach", "iron1", "nodry"],
      env: { co2: 5.0, water: 2.4, recycled: 0 }
    },
    {
      id: "CID-UZ-26-00436",
      product: { uz: "Uniseks hudi", en: "Unisex hoodie" },
      type: "hoodie",
      color: { uz: "Kulrang melanj", en: "Grey melange" },
      sku: "VT-HD-330",
      batch: "P-2026-0436",
      qty: 8000,
      buyer: "Nordlicht Apparel GmbH (demo)",
      market: "DE",
      status: "draft",
      created: "2026-10-12",
      scans: 0,
      gsm: 330,
      composition: [
        { fiber: "cotton", pct: 80, origin: "Namangan, UZ" },
        { fiber: "recycled", pct: 20, origin: "" }
      ],
      chain: [
        { stage: "field", org: "Chust paxta klasteri (demo)", place: "Namangan viloyati", date: "2025-09", verified: true },
        { stage: "gin", org: "", place: "", date: "", verified: false },
        { stage: "spin", org: "", place: "", date: "", verified: false },
        { stage: "knit", org: "Vodiy Trikotaj", place: "Namangan", date: "2026-09", verified: false },
        { stage: "dye", org: "", place: "", date: "", verified: false },
        { stage: "sew", org: "", place: "", date: "", verified: false }
      ],
      certs: [],
      care: ["wash30"],
      env: { co2: 0, water: 0, recycled: 20 }
    }
  ],

  scansByWeek: [12, 18, 15, 27, 34, 41, 58, 107]
};
