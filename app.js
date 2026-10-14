/* CottonID — prototip ilova (vanilla JS, build talab qilinmaydi) */
(function () {
  "use strict";

  /* ---------- Yordamchilar ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $("#app");
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/,/g, " ");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const today = () => new Date();
  const daysUntil = (iso) => Math.ceil((new Date(iso + "T00:00:00") - today()) / 86400000);

  const store = {
    get(k, d) { try { const v = localStorage.getItem("cid:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("cid:" + k, JSON.stringify(v)); } catch (e) { /* storage yo'q */ } }
  };

  const D = window.CID_DATA;
  const state = {
    passports: (store.get("created", []) || []).concat(clone(D.passports)),
    lang: store.get("lang", "uz"),
    filter: "all"
  };
  const certById = (id) => D.certificates.find((c) => c.id === id);
  const findPassport = (id) => state.passports.find((p) => p.id === id);

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2800);
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
      svg.setAttribute("aria-label", "QR kod: " + text);
      svg.style.width = "100%"; svg.style.height = "100%";
      svg.querySelectorAll("path").forEach((p) => p.setAttribute("fill", "#14213D"));
      svg.querySelectorAll("rect").forEach((r) => r.setAttribute("fill", "#ffffff"));
    }
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
  const STAGES = {
    field: { uz: "Paxta dalasi", en: "Cotton field" },
    gin:   { uz: "Paxta tozalash", en: "Ginning" },
    spin:  { uz: "Yigiruv", en: "Spinning" },
    knit:  { uz: "To'qish", en: "Knitting" },
    dye:   { uz: "Bo'yash va pardozlash", en: "Dyeing & finishing" },
    sew:   { uz: "Tikuv", en: "Sewing" }
  };
  const STAGE_ORDER = ["field", "gin", "spin", "knit", "dye", "sew"];
  const MARKETS = {
    DE: { uz: "Germaniya", en: "Germany" }, FR: { uz: "Fransiya", en: "France" },
    NL: { uz: "Niderlandiya", en: "Netherlands" }, IT: { uz: "Italiya", en: "Italy" },
    PL: { uz: "Polsha", en: "Poland" }, ES: { uz: "Ispaniya", en: "Spain" }
  };
  const CARE = {
    wash30: { uz: "30°C da yuvish", en: "Wash at 30°C" },
    wash40: { uz: "40°C da yuvish", en: "Wash at 40°C" },
    nobleach: { uz: "Oqartirmang", en: "Do not bleach" },
    iron1: { uz: "Past haroratda dazmollash", en: "Iron low heat" },
    iron2: { uz: "O'rta haroratda dazmollash", en: "Iron medium heat" },
    nodry: { uz: "Barabanda quritmang", en: "Do not tumble dry" }
  };
  const STATUS = { ready: "Tayyor", review: "Tekshiruvda", draft: "Qoralama" };

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
  const brand = (href = "#/") => `<a class="brand" href="${href}" aria-label="CottonID bosh sahifa">${LOGO}<span>CottonID</span></a>`;

  /* ---------- Tayyorlik bahosi ---------- */
  function readiness(p) {
    const issues = [];
    const sum = p.composition.reduce((a, c) => a + Number(c.pct || 0), 0);
    const originsOk = p.composition.every((c) => c.origin && c.origin !== "Noma'lum");
    let comp = 0;
    if (sum === 100) comp += 60; else issues.push(`Tola tarkibi yig'indisi ${sum}% — 100% bo'lishi kerak`);
    if (originsOk) comp += 40; else issues.push("Har bir tola uchun kelib chiqish mamlakatini kiriting");

    const filled = p.chain.filter((s) => s.org).length;
    const verified = p.chain.filter((s) => s.org && s.verified).length;
    const chain = Math.round((filled / 6) * 50 + (verified / 6) * 50);
    const missing = p.chain.filter((s) => !s.org).map((s) => STAGES[s.stage].uz.toLowerCase());
    if (missing.length) issues.push(`Zanjirda bo'sh bosqich: ${missing.join(", ")}`);
    const unver = p.chain.filter((s) => s.org && !s.verified).length;
    if (unver) issues.push(`${unver} ta bosqich hali hujjat bilan tasdiqlanmagan`);

    let certs = 0;
    if (p.certs.length) {
      const valid = p.certs.filter((id) => { const c = certById(id); return c && daysUntil(c.until) > 0; });
      certs = Math.min(100, valid.length * 45);
      p.certs.forEach((id) => { const c = certById(id); if (c && daysUntil(c.until) <= 60 && daysUntil(c.until) > 0) issues.push(`${c.name} muddati ${daysUntil(c.until)} kundan keyin tugaydi`); });
    } else issues.push("Kamida bitta sertifikat biriktiring");

    const care = Math.min(100, (p.care.length / 4) * 100);
    if (p.care.length < 4) issues.push("Parvarish belgilari to'liq emas (kamida 4 ta)");
    const env = p.env && p.env.co2 > 0 ? 100 : 0;
    if (!env) issues.push("Uglerod izi hisoblanmagan");

    const parts = { comp, chain, certs, care, env };
    const score = Math.round(comp * 0.25 + chain * 0.3 + certs * 0.2 + care * 0.1 + env * 0.15);
    return { score, parts, issues, sum };
  }
  const ringColor = (s) => (s >= 85 ? "var(--green)" : s >= 60 ? "var(--gold)" : "var(--red)");
  const ring = (s, lg) => `<span class="ring${lg ? " lg" : ""}" style="--p:${s};--c:${ringColor(s)}" data-v="${s}${lg ? "" : ""}" role="img" aria-label="Tayyorlik ${s} foiz"></span>`;

  function compBar(comp, lang = "uz") {
    const bar = comp.map((c) => `<span style="width:${Math.max(0, c.pct)}%;background:${(FIBERS[c.fiber] || FIBERS.cotton).color}"></span>`).join("");
    const leg = comp.map((c) => `<span><i style="background:${(FIBERS[c.fiber] || FIBERS.cotton).color}"></i>${esc(c.pct)}% ${esc((FIBERS[c.fiber] || FIBERS.cotton)[lang])}</span>`).join("");
    return `<div class="compbar" aria-hidden="true">${bar}</div><div class="complegend">${leg}</div>`;
  }

  function passportCard(p, opts = {}) {
    const r = readiness(p);
    const ok = r.score >= 85;
    return `
      <article class="pcard" aria-label="Raqamli mahsulot pasporti namunasi">
        <div class="pcard-top">
          <span class="mono">${esc(p.id)}</span>
          <span class="verified" style="${ok ? "" : "color:var(--amber);background:var(--amber-soft)"}">${ok ? I.check.replace("<svg", '<svg width="14" height="14"') + " Tasdiqlangan" : "Tekshiruvda"}</span>
        </div>
        <div class="pcard-body">
          <div>
            <h3>${esc(p.product.uz || "Mahsulot nomi")}</h3>
            <p class="sub">${esc(D.factory.name)} · ${esc(MARKETS[p.market] ? MARKETS[p.market].uz : "")} · ${num(p.qty)} dona</p>
          </div>
          <div class="qr" id="${opts.qrId || "qr-card"}" title="QR kod"></div>
        </div>
        <div class="pcard-comp">${compBar(p.composition)}</div>
        <div class="pcard-foot">
          <div><b>${p.chain.filter((s) => s.org).length}/6</b><span class="muted">bosqich</span></div>
          <div><b>${p.certs.length}</b><span class="muted">sertifikat</span></div>
          <div><b>${p.env.co2 ? String(p.env.co2).replace(".", ",") : "—"}</b><span class="muted">kg CO₂e</span></div>
        </div>
      </article>`;
  }

  /* ================= LANDING ================= */
  function renderLanding() {
    document.title = "CottonID — paxtadan pasportgacha";
    const sample = D.passports[0];
    const gspDays = daysUntil("2027-12-31");
    app.innerHTML = `
      <header class="site-nav">
        <div class="wrap">
          ${brand()}
          <nav aria-label="Asosiy">
            <a href="#how">Qanday ishlaydi</a>
            <a href="#rules">Qoidalar</a>
            <a href="#who">Kimlar uchun</a>
            <a href="#pricing">Narxlar</a>
          </nav>
          <div class="nav-actions">
            <a class="btn btn-ghost btn-sm" href="#${sample.id}">Namuna pasport</a>
            <a class="btn btn-light btn-sm" href="#panel">Demo panel</a>
          </div>
        </div>
      </header>

      <main id="main">
        <section class="hero">
          <div class="wrap">
            <div>
              <h1>Har bir kiyimning yo'li bitta QR kodda.</h1>
              <p class="hero-lead">CottonID O'zbek to'qimachilik fabrikalariga paxta dalasidan tayyor kiyimgacha bo'lgan zanjirni hujjatlashtirib, Yevropa Ittifoqining raqamli mahsulot pasportini bir necha daqiqada yaratishga yordam beradi.</p>
              <div class="hero-cta">
                <a class="btn btn-primary" href="#yangi">${I.plus} Pasport yaratib ko'rish</a>
                <a class="btn btn-ghost" href="#${sample.id}">${I.scan} Xaridor nimani ko'radi</a>
              </div>
              <p class="hero-note">
                <svg class="eu-ring" viewBox="0 0 40 40" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path transform="translate(${20 + 14 * Math.cos(a)} ${20 + 14 * Math.sin(a)})" d="M0 -2.6l.76 1.56 1.72.25-1.24 1.21.29 1.71L0 1.92l-1.53.81.29-1.71-1.24-1.21 1.72-.25z" fill="#F2C230"/>`; }).join("")}</svg>
                ESPR reglamenti (EU 2024/1781) va to'qimachilik bo'yicha kutilayotgan talablar asosida
              </p>
            </div>

            <div class="showcase">
              <svg class="thread" viewBox="0 0 760 600" aria-hidden="true">
                <path d="M760 40 C 600 60, 520 180, 430 160 S 260 60, 180 210 S 120 420, 260 470 S 520 560, 700 520"/>
                <path class="draw" d="M760 40 C 600 60, 520 180, 430 160 S 260 60, 180 210 S 120 420, 260 470 S 520 560, 700 520"/>
              </svg>
              <div class="chip-float chip-a"><span class="dot" style="background:var(--green-soft);color:var(--green)">${I.field.replace("<svg", '<svg width="20" height="20"')}</span><div><b>Chust, Namangan</b><span class="muted">Paxta dalasi · tasdiqlangan</span></div></div>
              ${passportCard(sample, { qrId: "qr-hero" })}
              <div class="chip-float chip-b"><span class="dot" style="background:var(--blue-soft);color:var(--blue)">${I.scan.replace("<svg", '<svg width="20" height="20"')}</span><div><b>Berlin do'konida skanerlandi</b><span class="muted">2 daqiqa oldin</span></div></div>
            </div>
          </div>
        </section>

        <section class="section reg" id="rules">
          <div class="wrap reg-grid">
            <div>
              <h2>Yevropa bozori pasportsiz kiyimni qabul qilmaydigan bo'ladi.</h2>
              <p>Pasportni xaridor brend tuzadi, lekin ma'lumotlarni fabrika beradi. Ma'lumoti tayyor ta'minotchi buyurtmani saqlab qoladi.</p>
              <div class="reg-facts">
                <div><b>2,6 mlrd $</b><span>O'zbekiston to'qimachilik eksporti, 2025-yil</span></div>
                <div><b>75</b><span>mahsulot chiqarilgan davlatlar</span></div>
                <div><b>${num(gspDays)} kun</b><span>GSP+ imtiyozlari tugashiga (2027-yil 31-dekabr)</span></div>
              </div>
            </div>
            <ol class="tl">
              <li class="done"><time>2024-yil iyul</time><h3>ESPR reglamenti kuchga kirdi</h3><p>Yevropa Ittifoqi raqamli mahsulot pasportining huquqiy asosini yaratdi.</p></li>
              <li class="done"><time>2026-yil 20-iyul</time><h3>Pasportlar reyestri ishga tushdi</h3><p>Yevropa Komissiyasining yagona reyestri pasportlarni qabul qila boshladi.</p></li>
              <li class="now"><time>Hozir</time><h3>Brendlar ta'minotchilardan ma'lumot so'ramoqda</h3><p>Tola tarkibi, kelib chiqish va sertifikatlar bo'yicha so'rovlar ko'paymoqda.</p></li>
              <li class="next"><time>2027-yil IV chorak</time><h3>To'qimachilik uchun alohida akt</h3><p>Kiyim pasportida qaysi ma'lumotlar majburiy bo'lishi aniq belgilanadi.</p></li>
              <li><time>Taxminan 2028-yil</time><h3>Pasport majburiy bo'ladi</h3><p>O'tish davridan keyin pasportsiz kiyimni Yevropa bozoriga chiqarib bo'lmaydi.</p></li>
            </ol>
          </div>
        </section>

        <section class="section" id="how">
          <div class="wrap">
            <div class="section-head">
              <h2>To'rt qadamda pasport</h2>
              <p>Fabrikada allaqachon bor ma'lumotlar ishlatiladi. Yangi hisob yuritish shart emas.</p>
            </div>
            <ol class="steps">
              <li><div class="n">1</div><h3>Ma'lumotni ulang</h3><p>ERP tizimi yoki Excel faylidan partiyalar, tola tarkibi va ta'minotchilar import qilinadi.</p></li>
              <li><div class="n">2</div><h3>Zanjirni tasdiqlang</h3><p>Paxta dalasidan tikuvgacha har bir bosqichga hujjat va sertifikat biriktiriladi.</p></li>
              <li><div class="n">3</div><h3>Pasport yarating</h3><p>Tizim Yevropa talablari bo'yicha tekshiradi, kamchiliklarni ko'rsatadi va QR yorliq beradi.</p></li>
              <li><div class="n">4</div><h3>Xaridorga yuboring</h3><p>Brend bitta havola orqali ma'lumotni o'z formatida oladi, xaridor esa QR'ni skanerlaydi.</p></li>
            </ol>
          </div>
        </section>

        <section class="section" id="who" style="padding-top:0">
          <div class="wrap split">
            <div class="panel">
              <h3>Fabrika uchun</h3>
              <p>Xaridor so'roviga javob tayyorlash kunlardan daqiqalarga qisqaradi.</p>
              <ul class="ticks">
                <li>${I.check}<span><b>Tayyorlik bahosi.</b> Har bir partiya Yevropa talablariga necha foiz tayyorligini ko'rasiz.</span></li>
                <li>${I.check}<span><b>Sertifikatlar nazorati.</b> GOTS, OEKO-TEX va boshqalarning muddati tugashidan oldin ogohlantiradi.</span></li>
                <li>${I.check}<span><b>O'zbek, rus va ingliz tillarida.</b> Mahalliy ERP va Excel bilan ishlaydi.</span></li>
                <li>${I.check}<span><b>QR va NFC yorliqlar.</b> Bosmaga tayyor fayl bir tugmada.</span></li>
              </ul>
            </div>
            <div class="panel dark">
              <h3>Xaridor brend uchun</h3>
              <p>O'zbek ta'minotchilarning ma'lumoti bitta joyda, tekshirilgan holda.</p>
              <ul class="ticks">
                <li>${I.check}<span><b>Kelib chiqish xaritasi.</b> Paxta qaysi hududda o'stirilgani va kim qayta ishlagani.</span></li>
                <li>${I.check}<span><b>Pasport formatiga eksport.</b> Ma'lumot Yevropa reyestri talab qiladigan tuzilmada.</span></li>
                <li>${I.check}<span><b>Hujjatlar arxivi.</b> Sertifikat va audit hisobotlari asl nusxada.</span></li>
                <li>${I.check}<span><b>Bir nechta ta'minotchi.</b> Barcha O'zbek fabrikalari bitta panelda.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section" id="pricing" style="padding-top:0">
          <div class="wrap">
            <div class="section-head">
              <h2>Fabrika hajmiga mos narx</h2>
              <p>14 kun bepul sinov. Yillik to'lovda 2 oy bepul.</p>
            </div>
            <div class="prices">
              <div class="price"><h3>Start</h3><div class="amt">$100<small> / oy</small></div><p class="per">Eksportni boshlayotgan fabrikalar uchun</p><ul><li>Oyiga 20 tagacha partiya</li><li>Pasport va QR yorliqlar</li><li>Excel import</li></ul><a class="btn btn-quiet" href="#panel">Sinab ko'rish</a></div>
              <div class="price featured"><span class="tag">Ko'p tanlanadi</span><h3>Eksport</h3><div class="amt">$250<small> / oy</small></div><p class="per">Muntazam Yevropaga yetkazuvchilar uchun</p><ul><li>Cheksiz partiyalar</li><li>ERP integratsiyasi</li><li>Sertifikatlar nazorati</li><li>Xaridor portali</li></ul><a class="btn btn-primary" href="#panel">Demo panelni ochish</a></div>
              <div class="price"><h3>Klaster</h3><div class="amt">$500<small> / oy</small></div><p class="per">Paxtadan kiyimgacha to'liq zanjir</p><ul><li>Bir nechta korxona</li><li>Ta'minotchilarni taklif qilish</li><li>API va maxsus hisobotlar</li></ul><p class="per" style="margin-top:-12px">Bog'lanish: <span class="mono" style="user-select:all">salom@cottonid.uz</span></p><a class="btn btn-quiet" href="#panel">Demo panel</a></div>
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:0">
          <div class="wrap">
            <div class="closing">
              <div>
                <h2>Pasport talab qilinishidan oldin tayyor bo'ling.</h2>
                <p>Birinchi partiyangiz pasportini bugun yaratib ko'ring. Kredit karta talab qilinmaydi.</p>
              </div>
              <div class="hero-cta">
                <a class="btn btn-light" href="#yangi">Pasport yaratish</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-foot">
        <div class="wrap">
          ${brand()}
          <span>cottonid.uz · Toshkent, O'zbekiston · Prototip, 2026</span>
          <span>Barcha korxona nomlari demo ma'lumot</span>
        </div>
      </footer>`;
    mountQR($("#qr-hero"), passportUrl(sample.id));
  }

  /* ================= APP SHELL ================= */
  function shell(active, title, subtitle, actions, body) {
    const n = state.passports.length;
    const links = [
      ["dashboard", "#panel", I.grid, "Bosh panel", ""],
      ["passports", "#pasportlar", I.passport, "Pasportlar", `<span class="count">${n}</span>`],
      ["new", "#yangi", I.plus, "Yangi pasport", ""],
      ["certs", "#sertifikatlar", I.shield, "Sertifikatlar", ""]
    ];
    const initials = D.factory.user.split(" ").map((w) => w[0]).join("");
    return `
      <div class="shell">
        <aside class="side" id="side">
          ${brand("#bosh")}
          <nav aria-label="Panel">
            ${links.map(([k, h, ic, l, extra]) => `<a href="${h}" ${k === active ? 'aria-current="page"' : ""}>${ic}<span>${l}</span>${extra}</a>`).join("")}
          </nav>
          <div class="side-foot">
            <a class="btn btn-ghost btn-sm" href="#bosh" style="color:#fff">${I.home} Bosh sahifa</a>
            <div class="factory"><span class="avatar">${esc(initials)}</span><div><b>${esc(D.factory.name)}</b><span>${esc(D.factory.user)} · ${esc(D.factory.plan)} tarifi</span></div></div>
            <p class="proto">Prototip · demo ma'lumotlar</p>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <div style="display:flex;gap:12px;align-items:center">
              <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menyuni ochish">${I.menu}</button>
              <div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>
            </div>
            <div class="actions">${actions || ""}</div>
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
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Bu holatda pasport yo'q. <a href="#yangi">Yangisini yarating</a>.</div></td></tr>`;
    return list.map((p) => {
      const r = readiness(p);
      const status = r.score >= 85 ? "ready" : p.status === "draft" && r.score < 60 ? "draft" : "review";
      return `<tr data-href="#${esc(p.id)}" tabindex="0">
        <td><div class="prod"><span class="prod-ico">${garment(p.type)}</span><div><b>${esc(p.product.uz)}</b><span class="mono">${esc(p.id)}</span></div></div></td>
        <td class="nw">${esc(p.buyer)}</td>
        <td><span class="flag">${esc(p.market)}</span></td>
        <td>${num(p.qty)}</td>
        <td class="nw"><span class="pill ${status}">${STATUS[status]}</span></td>
        <td>${ring(r.score)}</td>
      </tr>`;
    }).join("");
  }

  const tableHead = `<thead><tr><th>Mahsulot</th><th>Xaridor</th><th>Bozor</th><th>Miqdor, dona</th><th>Holat</th><th>Tayyorlik</th></tr></thead>`;

  /* ---------- Bosh panel ---------- */
  function renderDashboard() {
    document.title = "Bosh panel — CottonID";
    const ps = state.passports;
    const scores = ps.map((p) => readiness(p).score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const readyN = scores.filter((s) => s >= 85).length;
    const expiring = D.certificates.filter((c) => daysUntil(c.until) <= 60).length;
    const scans = D.scansByWeek.reduce((a, b) => a + b, 0);
    const max = Math.max(...D.scansByWeek);
    const weeks = ["34", "35", "36", "37", "38", "39", "40", "41"];

    const parts = ["comp", "chain", "certs", "care", "env"].map((k) => Math.round(ps.reduce((a, p) => a + readiness(p).parts[k], 0) / ps.length));
    const checkNames = ["Tola tarkibi va kelib chiqish", "Ta'minot zanjiri", "Sertifikatlar", "Parvarish belgilari", "Uglerod izi"];
    const cls = (v) => (v >= 85 ? "" : v >= 60 ? "mid" : "low");

    const body = `
      <section class="ready-banner" aria-label="Muddat">
        <div class="days"><b>${num(daysUntil("2027-12-31"))}</b><span>kun qoldi</span></div>
        <div><h2>GSP+ imtiyozlari 2027-yil oxirida tugaydi</h2><p>To'qimachilik pasporti talablari 2027-yil IV choragida e'lon qilinishi kutilmoqda. Partiyalaringizning ${readyN} tasi hozirdanoq to'liq tayyor.</p></div>
        <a class="btn btn-primary btn-sm" href="#yangi">${I.plus} Yangi pasport</a>
      </section>

      <section class="kpis" aria-label="Asosiy ko'rsatkichlar">
        <div class="kpi"><div class="lbl">Pasportlar</div><div class="val">${ps.length}</div><div class="delta up">${readyN} tasi tayyor</div></div>
        <div class="kpi"><div class="lbl">O'rtacha tayyorlik</div><div class="val">${avg}%</div><div class="delta">Yevropa talablari bo'yicha</div></div>
        <div class="kpi"><div class="lbl">QR skanerlar, 8 hafta</div><div class="val">${num(scans)}</div><div class="delta up">+84% oldingi haftaga</div></div>
        <div class="kpi"><div class="lbl">Muddati yaqin sertifikat</div><div class="val">${expiring}</div><div class="delta ${expiring ? "warn" : ""}">60 kun ichida</div></div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Oxirgi partiyalar</h2><a href="#pasportlar">Hammasi</a></div>
        <div class="table-wrap"><table>${tableHead}<tbody>${passportRows(ps.slice(0, 5))}</tbody></table></div>
      </section>

      <div class="grid-3">
        <section class="card">
          <div class="card-head"><h2>Xaridorlar QR skanerlari</h2><span class="muted" style="font-size:13px">Haftalar bo'yicha</span></div>
          <div class="bars" role="img" aria-label="Oxirgi 8 haftada QR skanerlar soni">
            ${D.scansByWeek.map((v, i) => `<div><em>${v}</em><span class="b" style="height:${Math.round((v / max) * 100)}%"></span><small>${weeks[i]}-h</small></div>`).join("")}
          </div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Talablar bo'yicha tayyorlik</h2></div>
          <div class="checks">
            ${parts.map((v, i) => `<div class="check"><span>${checkNames[i]}</span><b>${v}%</b><div class="bar"><span class="${cls(v)}" style="width:${v}%"></span></div></div>`).join("")}
          </div>
        </section>
        <section class="card">
          <div class="card-head"><h2>So'nggi voqealar</h2></div>
          <ul class="feed">
            <li><span class="ico" style="background:var(--blue-soft);color:var(--blue)">${I.scan}</span><div>Nordlicht Apparel polo pasportini 46 marta ochdi<time>Bugun, 11:20</time></div></li>
            <li><span class="ico" style="background:var(--amber-soft);color:var(--amber)">${I.alert}</span><div>GOTS sertifikati muddati ${daysUntil("2026-11-20")} kundan keyin tugaydi<time>Bugun, 09:00</time></div></li>
            <li><span class="ico" style="background:var(--green-soft);color:var(--green)">${I.checkCircle}</span><div>Pop yigiruv fabrikasi ip partiyasini tasdiqladi<time>Kecha, 17:42</time></div></li>
            <li><span class="ico" style="background:var(--paper);color:var(--ink-2)">${I.upload}</span><div>OSON ERP'dan 4 ta partiya import qilindi<time>12-oktabr</time></div></li>
          </ul>
        </section>
      </div>`;

    app.innerHTML = shell("dashboard", "Xayrli kun, " + esc(D.factory.user.split(" ")[0]), esc(D.factory.legal) + " · " + esc(D.factory.city),
      `<button class="btn btn-quiet btn-sm" id="importBtn">${I.upload} Import</button><a class="btn btn-primary btn-sm" href="#yangi">${I.plus} Pasport</a>`, body);
    bindShell();
    $("#importBtn").addEventListener("click", () => toast("Prototipda import namunasi: ERP ulanishi keyingi versiyada"));
  }

  /* ---------- Pasportlar ro'yxati ---------- */
  function renderPassports() {
    document.title = "Pasportlar — CottonID";
    const f = state.filter;
    const withStatus = state.passports.map((p) => { const s = readiness(p).score; return { p, st: s >= 85 ? "ready" : p.status === "draft" && s < 60 ? "draft" : "review" }; });
    const list = withStatus.filter((x) => f === "all" || x.st === f).map((x) => x.p);
    const tabs = [["all", "Hammasi"], ["ready", "Tayyor"], ["review", "Tekshiruvda"], ["draft", "Qoralama"]];
    const body = `
      <div style="display:flex;gap:8px;flex-wrap:wrap" role="tablist" aria-label="Holat bo'yicha saralash">
        ${tabs.map(([k, l]) => `<button class="cert-pick" role="tab" data-f="${k}" aria-pressed="${f === k}">${l} · ${k === "all" ? withStatus.length : withStatus.filter((x) => x.st === k).length}</button>`).join("")}
      </div>
      <section class="card">
        <div class="table-wrap" style="margin-top:-24px"><table>${tableHead}<tbody>${passportRows(list)}</tbody></table></div>
      </section>`;
    app.innerHTML = shell("passports", "Pasportlar", "Har bir partiya uchun raqamli mahsulot pasporti", `<a class="btn btn-primary btn-sm" href="#yangi">${I.plus} Yangi pasport</a>`, body);
    bindShell();
    $$("[data-f]").forEach((b) => b.addEventListener("click", () => { state.filter = b.dataset.f; renderPassports(); }));
  }

  /* ---------- Sertifikatlar ---------- */
  function renderCerts() {
    document.title = "Sertifikatlar — CottonID";
    const body = `<div class="cert-grid">${D.certificates.map((c) => {
      const d = daysUntil(c.until);
      const st = d <= 0 ? ["bad", "Muddati tugagan"] : d <= 60 ? ["review", `${d} kun qoldi`] : ["ready", "Amalda"];
      const used = state.passports.filter((p) => p.certs.includes(c.id)).length;
      return `<article class="cert">
        <div class="cert-top"><h3>${esc(c.name)}</h3><span class="pill ${st[0]}">${st[1]}</span></div>
        <dl><dt>Raqami</dt><dd class="mono">${esc(c.number)}</dd><dt>Bergan</dt><dd>${esc(c.issuer)}</dd><dt>Amal qiladi</dt><dd>${esc(c.until.split("-").reverse().join("."))} gacha</dd><dt>Qamrovi</dt><dd>${esc(c.scope)}</dd><dt>Pasportlarda</dt><dd>${used} ta</dd></dl>
      </article>`;
    }).join("")}</div>`;
    app.innerHTML = shell("certs", "Sertifikatlar", "Muddati tugashidan 60 kun oldin ogohlantiramiz", `<button class="btn btn-primary btn-sm" id="addCert">${I.upload} Sertifikat yuklash</button>`, body);
    bindShell();
    $("#addCert").addEventListener("click", () => toast("Prototipda fayl yuklash o'chirilgan"));
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

  function nextId() {
    const nums = state.passports.map((p) => parseInt(p.id.split("-").pop(), 10)).filter((n) => !isNaN(n));
    return "CID-UZ-26-" + String(Math.max(436, ...nums) + 1).padStart(5, "0");
  }

  function renderNew() {
    document.title = "Yangi pasport — CottonID";
    if (!draft) draft = emptyDraft();
    if (!draft.id) draft.id = nextId();
    const d = draft;
    const fiberOpts = (sel) => Object.entries(FIBERS).map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${v.uz}</option>`).join("");

    const body = `
      <div class="builder">
        <form class="card form-card" id="pform" novalidate>
          <div class="import-drop">
            <p><b>Ma'lumot ERP yoki Excel'da bormi?</b>Fayldan import qilsangiz, maydonlar avtomatik to'ladi.</p>
            <button type="button" class="btn btn-quiet btn-sm" id="fillDemo">${I.upload} Excel'dan import (namuna)</button>
          </div>

          <fieldset class="fs">
            <legend><span class="n">1</span>Mahsulot</legend>
            <div class="row">
              <div class="field"><label for="f-name">Nomi (o'zbekcha)</label><input class="input" id="f-name" data-k="product.uz" value="${esc(d.product.uz)}" placeholder="Masalan, erkaklar futbolkasi"></div>
              <div class="field"><label for="f-name-en">Nomi (inglizcha)</label><input class="input" id="f-name-en" data-k="product.en" value="${esc(d.product.en)}" placeholder="Men's T-shirt"></div>
            </div>
            <div class="row">
              <div class="field"><label for="f-type">Turi</label><select class="input" id="f-type" data-k="type">${[["tee", "Futbolka"], ["polo", "Polo"], ["hoodie", "Hudi"], ["dress", "Ko'ylak"], ["pyjama", "Pijama"]].map(([k, l]) => `<option value="${k}" ${d.type === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
              <div class="field"><label for="f-sku">Artikul</label><input class="input mono" id="f-sku" data-k="sku" value="${esc(d.sku)}" placeholder="VT-TEE-160"></div>
            </div>
            <div class="row">
              <div class="field"><label for="f-buyer">Xaridor</label><input class="input" id="f-buyer" data-k="buyer" value="${esc(d.buyer)}" placeholder="Brend yoki importyor nomi"></div>
              <div class="row">
                <div class="field"><label for="f-market">Bozor</label><select class="input" id="f-market" data-k="market">${Object.entries(MARKETS).map(([k, v]) => `<option value="${k}" ${d.market === k ? "selected" : ""}>${v.uz}</option>`).join("")}</select></div>
                <div class="field"><label for="f-qty">Miqdor, dona</label><input class="input" id="f-qty" type="number" min="1" data-k="qty" value="${esc(d.qty)}"></div>
              </div>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">2</span>Tola tarkibi</legend>
            <div id="compRows" style="display:grid;gap:10px">
              ${d.composition.map((c, i) => `
                <div class="row-3">
                  <div class="field"><label class="lbl-sm" for="c-f-${i}">Tola</label><select class="input" id="c-f-${i}" data-comp="${i}" data-ck="fiber">${fiberOpts(c.fiber)}</select></div>
                  <div class="field"><label class="lbl-sm" for="c-p-${i}">Ulushi, %</label><input class="input" id="c-p-${i}" type="number" min="0" max="100" data-comp="${i}" data-ck="pct" value="${esc(c.pct)}"></div>
                  <div class="field"><label class="lbl-sm" for="c-o-${i}">Kelib chiqishi</label><input class="input" id="c-o-${i}" data-comp="${i}" data-ck="origin" value="${esc(c.origin)}" placeholder="Viloyat, davlat"></div>
                  <button type="button" class="icon-btn" data-delcomp="${i}" aria-label="Tolani o'chirish" ${d.composition.length < 2 ? "disabled" : ""}>${I.trash.replace("<svg", '<svg width="18" height="18"')}</button>
                </div>`).join("")}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
              <button type="button" class="add-link" id="addComp">+ Tola qo'shish</button>
              <span class="sum-note" id="sumNote"></span>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">3</span>Ta'minot zanjiri</legend>
            <div class="chain-edit">
              ${d.chain.map((s, i) => `
                <div class="chain-row">
                  <span class="stage"><i class="${s.org && s.verified ? "on" : ""}" id="dot-${i}"></i>${STAGES[s.stage].uz}</span>
                  <input class="input" aria-label="${STAGES[s.stage].uz}: korxona" data-chain="${i}" data-sk="org" value="${esc(s.org)}" placeholder="Korxona">
                  <input class="input" aria-label="${STAGES[s.stage].uz}: joylashuv" data-chain="${i}" data-sk="place" value="${esc(s.place)}" placeholder="Hudud">
                  <input class="input" type="month" aria-label="${STAGES[s.stage].uz}: sana" data-chain="${i}" data-sk="date" value="${esc(s.date)}">
                  <button type="button" class="toggle" data-ver="${i}" aria-pressed="${!!s.verified}" aria-label="${STAGES[s.stage].uz}: hujjat bilan tasdiqlangan"></button>
                </div>`).join("")}
              <p class="muted" style="font-size:13px">O'ngdagi tugma — bosqich hujjat bilan tasdiqlanganini bildiradi.</p>
            </div>
          </fieldset>

          <hr class="hr">

          <fieldset class="fs">
            <legend><span class="n">4</span>Sertifikatlar va parvarish</legend>
            <div class="cert-picks">${D.certificates.map((c) => `<button type="button" class="cert-pick" data-cert="${c.id}" aria-pressed="${d.certs.includes(c.id)}">${esc(c.name.split(" — ")[0])}</button>`).join("")}</div>
            <span class="lbl-sm">Parvarish belgilari</span>
            <div class="cert-picks">${Object.entries(CARE).map(([k, v]) => `<button type="button" class="cert-pick" data-care="${k}" aria-pressed="${d.care.includes(k)}">${v.uz}</button>`).join("")}</div>
            <div class="row">
              <div class="field"><label for="f-co2">Uglerod izi, kg CO₂e / dona</label><input class="input" id="f-co2" type="number" step="0.1" min="0" data-k="env.co2" value="${esc(d.env.co2 || "")}" placeholder="Masalan, 3,4"></div>
              <div class="field"><label for="f-water">Suv sarfi, m³ / dona</label><input class="input" id="f-water" type="number" step="0.1" min="0" data-k="env.water" value="${esc(d.env.water || "")}" placeholder="Masalan, 1,8"></div>
            </div>
          </fieldset>

          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
            <button type="button" class="btn btn-quiet" id="resetBtn">Tozalash</button>
            <button type="submit" class="btn btn-primary">${I.passport} Pasport yaratish</button>
          </div>
        </form>

        <aside class="preview" aria-label="Jonli ko'rinish">
          <div class="preview-title"><span>Jonli ko'rinish</span><span id="pvScore"></span></div>
          <div id="pvCard"></div>
          <section class="card">
            <div class="card-head" style="margin-bottom:12px"><h2>Yevropa talablari tekshiruvi</h2></div>
            <ul class="issues" id="pvIssues"></ul>
          </section>
        </aside>
      </div>`;

    app.innerHTML = shell("new", "Yangi pasport", "Partiya ma'lumotlarini kiriting — o'ngda pasport darhol paydo bo'ladi", "", body);
    bindShell();
    bindBuilder();
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
    const shown = clone(d);
    if (!shown.product.uz) shown.product.uz = "Mahsulot nomi";
    $("#pvCard").innerHTML = passportCard(shown, { qrId: "qr-pv" });
    mountQR($("#qr-pv"), passportUrl(d.id));
    $("#pvScore").innerHTML = `Tayyorlik: <b style="color:${ringColor(r.score)}">${r.score}%</b>`;
    const issues = [];
    if (!d.product.uz) issues.push("Mahsulot nomini kiriting");
    if (!d.buyer) issues.push("Xaridorni kiriting");
    const all = issues.concat(r.issues);
    $("#pvIssues").innerHTML = all.length ? all.map((t) => `<li>${esc(t)}</li>`).join("") : `<li class="ok">Barcha asosiy talablar bajarilgan</li>`;
    const s = $("#sumNote");
    if (s) { s.textContent = `Jami: ${r.sum}%`; s.className = "sum-note " + (r.sum === 100 ? "ok" : "bad"); }
    d.chain.forEach((c, i) => { const dot = $("#dot-" + i); if (dot) dot.className = c.org && c.verified ? "on" : ""; });
  }

  function bindBuilder() {
    const form = $("#pform");
    form.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.k) {
        let v = t.value;
        if (t.type === "number") v = v === "" ? 0 : Number(v);
        setPath(draft, t.dataset.k, v);
      } else if (t.dataset.comp !== undefined) {
        const c = draft.composition[+t.dataset.comp];
        c[t.dataset.ck] = t.dataset.ck === "pct" ? Number(t.value || 0) : t.value;
      } else if (t.dataset.chain !== undefined) {
        draft.chain[+t.dataset.chain][t.dataset.sk] = t.value;
      }
      updatePreview();
    });
    form.addEventListener("change", (e) => { if (e.target.tagName === "SELECT") form.dispatchEvent(new Event("input")) ; });
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
        draft.id = keepId;
        draft.product = { uz: "Erkaklar futbolkasi", en: "Men's T-shirt" };
        draft.type = "tee";
        draft.sku = "VT-TEE-160";
        draft.batch = "P-2026-0437";
        draft.qty = 15000;
        draft.gsm = 160;
        draft.buyer = "Nordlicht Apparel GmbH (demo)";
        draft.composition = [{ fiber: "cotton", pct: 100, origin: "Namangan, UZ" }];
        draft.env = { co2: 3.4, water: 1.8, recycled: 0 };
        draft.created = new Date().toISOString().slice(0, 10);
        draft.scans = 0;
        renderNew();
        toast("Namuna fayldan 6 bosqich, tarkib va sertifikatlar import qilindi");
      } else if (b.id === "resetBtn") {
        draft = emptyDraft();
        renderNew();
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!draft.product.uz) { toast("Mahsulot nomini kiriting"); $("#f-name").focus(); return; }
      const p = clone(draft);
      if (!p.product.en) p.product.en = p.product.uz;
      p.batch = p.batch || "P-" + p.id.split("-").pop();
      p.status = readiness(p).score >= 85 ? "ready" : "review";
      state.passports.unshift(p);
      const created = store.get("created", []) || [];
      created.unshift(p);
      store.set("created", created);
      draft = null;
      toast("Pasport yaratildi");
      location.hash = "#" + p.id;
    });
  }

  /* ================= OCHIQ PASPORT ================= */
  const PT = {
    uz: {
      verified: "CottonID tomonidan tasdiqlangan", review: "Ma'lumotlar tekshirilmoqda",
      maker: "Ishlab chiqaruvchi", market: "Bozor", batch: "Partiya", qty: "Miqdor",
      composition: "Tola tarkibi", journey: "Mahsulot yo'li", verifiedStep: "Hujjat bilan tasdiqlangan", pending: "Tasdiq kutilmoqda", empty: "Ma'lumot kiritilmagan",
      certs: "Sertifikatlar", until: "gacha amal qiladi", env: "Atrof-muhitga ta'sir", co2: "kg CO₂e / dona", water: "m³ suv / dona", recycled: "qayta ishlangan tola",
      care: "Parvarish", share: "Ulashish", copy: "Havolani nusxalash", print: "Chop etish", copied: "Havola nusxalandi", back: "Panelga qaytish",
      note: "Bu prototip. Korxona va sertifikat ma'lumotlari namuna sifatida berilgan.", pcs: "dona", notFound: "Pasport topilmadi",
      dpp: "Raqamli mahsulot pasporti", none: "Biriktirilmagan"
    },
    en: {
      verified: "Verified by CottonID", review: "Data under review",
      maker: "Manufacturer", market: "Market", batch: "Batch", qty: "Quantity",
      composition: "Fibre composition", journey: "Product journey", verifiedStep: "Verified with documents", pending: "Awaiting verification", empty: "Not provided",
      certs: "Certificates", until: "valid until", env: "Environmental impact", co2: "kg CO₂e / item", water: "m³ water / item", recycled: "recycled fibre",
      care: "Care", share: "Share", copy: "Copy link", print: "Print", copied: "Link copied", back: "Back to dashboard",
      note: "This is a prototype. Company and certificate data are samples.", pcs: "pcs", notFound: "Passport not found",
      dpp: "Digital Product Passport", none: "None attached"
    }
  };

  function renderPassport(id) {
    const p = findPassport(id);
    const L = state.lang;
    const t = PT[L];
    if (!p) {
      app.innerHTML = `<div class="pp"><div class="pp-bar"><div class="wrap">${brand("#bosh")}</div></div><main class="pp-main" id="main"><div class="pp-sec empty"><h2>${t.notFound}</h2><p class="mono">${esc(id)}</p><p style="margin-top:16px"><a class="btn btn-primary" href="#panel">${t.back}</a></p></div></main></div>`;
      return;
    }
    document.title = `${p.product[L] || p.product.uz} — ${t.dpp}`;
    const r = readiness(p);
    const ok = r.score >= 85;
    const fmtDate = (ym) => { if (!ym) return ""; const [y, m] = ym.split("-"); return `${m}.${y}`; };
    const market = MARKETS[p.market] ? MARKETS[p.market][L] : p.market;

    app.innerHTML = `
      <div class="pp">
        <header class="pp-bar"><div class="wrap">
          ${brand("#bosh")}
          <div class="lang" role="group" aria-label="Til / Language">
            <button data-lang="uz" aria-pressed="${L === "uz"}">O'zbek</button>
            <button data-lang="en" aria-pressed="${L === "en"}">English</button>
          </div>
        </div></header>

        <main class="pp-main" id="main">
          <section class="pp-hero">
            <div class="pp-visual">
              <div>
                <span class="pp-verified ${ok ? "" : "warn"}">${ok ? I.checkCircle.replace("<svg", '<svg width="16" height="16"') : I.alert.replace("<svg", '<svg width="16" height="16"')} ${ok ? t.verified : t.review}</span>
                <h1>${esc(p.product[L] || p.product.uz)}</h1>
                <div class="meta"><span>${esc(p.color ? p.color[L] || "" : "")}</span><span class="mono">${esc(p.id)}</span><span>${t.dpp}</span></div>
              </div>
              <div class="garment" aria-hidden="true">${garment(p.type)}</div>
            </div>
            <div class="pp-facts">
              <div><span>${t.maker}</span><b>${esc(D.factory.legal)}</b></div>
              <div><span>${t.market}</span><b>${esc(market)}</b></div>
              <div><span>${t.batch}</span><b class="mono">${esc(p.batch || "—")}</b></div>
              <div><span>${t.qty}</span><b>${num(p.qty)} ${t.pcs}</b></div>
            </div>
          </section>

          <section class="pp-sec">
            <h2>${t.composition}</h2>
            ${compBar(p.composition, L)}
            <div class="cert-list" style="margin-top:16px">
              ${p.composition.map((c) => `<div><b>${esc(c.pct)}% ${esc((FIBERS[c.fiber] || FIBERS.cotton)[L])}</b><span>${esc(c.origin || t.empty)}</span></div>`).join("")}
            </div>
          </section>

          <section class="pp-sec">
            <h2>${t.journey}</h2>
            <ol class="journey">
              ${p.chain.map((s) => `
                <li class="${s.org && s.verified ? "v" : ""}">
                  <span class="node">${I[s.stage]}</span>
                  <div><b>${STAGES[s.stage][L]}</b><span>${s.org ? esc(s.org) + (s.place ? ", " + esc(s.place) : "") : t.empty}</span><br><span style="font-size:12.5px;color:${s.org && s.verified ? "var(--green)" : "var(--muted)"}">${s.org ? (s.verified ? t.verifiedStep : t.pending) : ""}</span></div>
                  <span class="when">${esc(fmtDate(s.date))}</span>
                </li>`).join("")}
            </ol>
          </section>

          <div class="pp-two">
            <section class="pp-sec">
              <h2>${t.certs}</h2>
              <div class="cert-list">
                ${p.certs.length ? p.certs.map((id) => { const c = certById(id); return c ? `<div><div><b>${esc(c.name.split(" — ")[0])}</b><br><span class="mono">${esc(c.number)}</span></div><span>${esc(c.until.split("-").reverse().join("."))} ${t.until}</span></div>` : ""; }).join("") : `<div><span>${t.none}</span></div>`}
              </div>
            </section>
            <section class="pp-sec">
              <h2>${t.env}</h2>
              <div class="env">
                <div><b>${p.env.co2 ? String(p.env.co2).replace(".", L === "uz" ? "," : ".") : "—"}</b><span>${t.co2}</span></div>
                <div><b>${p.env.water ? String(p.env.water).replace(".", L === "uz" ? "," : ".") : "—"}</b><span>${t.water}</span></div>
                <div><b>${p.env.recycled || 0}%</b><span>${t.recycled}</span></div>
              </div>
              <h2 style="margin-top:22px">${t.care}</h2>
              <div class="care">${p.care.map((k) => `<div>${CARE_ICONS[k] || ""}<span>${CARE[k] ? CARE[k][L] : k}</span></div>`).join("")}</div>
            </section>
          </div>

          <section class="pp-sec pp-qr">
            <div class="qr" id="qr-pp"></div>
            <div>
              <h2 style="margin-bottom:6px">${t.share}</h2>
              <p class="mono muted" style="font-size:13px;word-break:break-all">${esc(passportUrl(p.id))}</p>
              <div class="btns">
                <button class="btn btn-quiet btn-sm" id="copyBtn">${I.link} ${t.copy}</button>
                <a class="btn btn-primary btn-sm" href="#panel">${t.back}</a>
              </div>
            </div>
          </section>

          <footer class="pp-foot">
            ${brand("#bosh").replace('class="brand"', 'class="brand" style="color:var(--ink);font-size:17px"')}
            <p>${t.note}</p>
          </footer>
        </main>
      </div>`;

    mountQR($("#qr-pp"), passportUrl(p.id));
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => { state.lang = b.dataset.lang; store.set("lang", state.lang); document.documentElement.lang = state.lang; renderPassport(id); }));
    $("#copyBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(passportUrl(p.id)); toast(t.copied); }
      catch (e) { toast(passportUrl(p.id)); }
    });
  }

  /* ================= ROUTER ================= */
  // Manzillar oddiy belgi ko'rinishida (#panel, #CID-UZ-26-00418) — har qanday hostingda ishlaydi
  const ROUTES = { panel: renderDashboard, pasportlar: renderPassports, yangi: renderNew, sertifikatlar: renderCerts };
  const SECTIONS = ["how", "rules", "who", "pricing", "main"];
  let current = "";
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    document.documentElement.lang = "uz";
    if (SECTIONS.includes(h)) {
      if (current !== "landing") { renderLanding(); current = "landing"; }
      const el = document.getElementById(h);
      if (el) el.scrollIntoView();
      return;
    }
    if (/^CID-/.test(h)) { renderPassport(h); current = "pp"; document.documentElement.lang = state.lang; }
    else if (ROUTES[h]) { ROUTES[h](); current = h; }
    else { renderLanding(); current = "landing"; }
    window.scrollTo(0, 0);
  }

  // landing ichidagi bo'limlarga silliq o'tish
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (SECTIONS.includes(id) && current === "landing") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
