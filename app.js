/* ═══════════════════════════════════════════════════
   ANNU PRINTING PRESS — PUBLIC SITE JS
   File: app.js
   Firebase se data load karke site render karta hai.
═══════════════════════════════════════════════════ */

/* ── FALLBACK DATA (jab Firebase connect na ho ya data na mile) ── */
const FALLBACK = {
  name: "Annu Printing Press",
  heroTitle: "Annu Printing Press — <em>Aapki Har Zaroorat, Ek Hi Jagah</em>",
  heroDesc: "Visa, Train & Air Ticket, Passport Photo, Printing, Photocopy, A4 Framed Photo aur sabhi Sarkari Online Services — Badhni Chafa, Siddharthnagar mein aapki sabse bharosemand dukaan.",
  contact: {
    address: "Badhni Chafa, Siddharthnagar, Uttar Pradesh",
    phone: "+91 XXXXXXXXXX",
    whatsapp: "91XXXXXXXXXX",
    email: "your@email.com",
    csc: "UPXX0000000",
    mapSrc: ""
  },
  stats: {
    customers: "500+",
    services:  "20+",
    tickets:   "5000+",
    rating:    "4.9★"
  },
  services: [
    { ico:"✈️", name:"Air Ticket Booking",      desc:"Domestic & international flights ke liye confirmed booking — sabse saste fare pe.", badge:"All Airlines" },
    { ico:"🚂", name:"Train Ticket Booking",     desc:"Tatkal, regular aur senior citizen quota — IRCTC authorized center.", badge:"IRCTC" },
    { ico:"🌍", name:"Visa Services",            desc:"Tourist, Student, Business visa — documentation, form filling, appointment.", badge:"All Countries" },
    { ico:"📷", name:"Passport Photo",           desc:"Standard size photos — passport, visa, PAN, Aadhaar — instant print.", badge:"Instant" },
    { ico:"🖼️", name:"A4 Framed Photos",         desc:"Premium frame ke saath A4 print — gift ke liye perfect.", badge:"Premium" },
    { ico:"🖨️", name:"Printing & Photocopy",     desc:"Color & B&W printing, bulk photocopy, lamination, spiral binding.", badge:"Color & B&W" },
    { ico:"💳", name:"PAN Card / Aadhaar",       desc:"New PAN apply, correction, Aadhaar address/mobile update.", badge:"Govt. ID" },
    { ico:"📄", name:"Government Forms",         desc:"Income cert, caste cert, ration card, driving license forms.", badge:"All Forms" },
    { ico:"💰", name:"Money Transfer",           desc:"NEFT, IMPS, cash withdrawal, balance enquiry, micro-ATM.", badge:"CSC Banking" },
    { ico:"📱", name:"Recharge & Bill Pay",      desc:"All networks recharge, DTH, electricity & water bill.", badge:"All Operators" },
    { ico:"🎓", name:"Scholarship Forms",        desc:"UP Scholarship, college admission, BTEUP form fill.", badge:"Students" },
    { ico:"📦", name:"Courier Services",         desc:"Important documents ka safe & fast courier.", badge:"Fast Delivery" }
  ],
  prices: {
    printing: [
      { svc:"B&W Photocopy / Print",  detail:"A4 size, single side",  rate:"₹ 1 / page" },
      { svc:"Color Print",             detail:"A4 size",                rate:"₹ 5 / page" },
      { svc:"Photo Print",             detail:"4×6 inch, glossy",       rate:"₹ 10 / photo" },
      { svc:"Lamination",              detail:"A4 size",                rate:"₹ 15 / sheet" },
      { svc:"Spiral Binding",          detail:"Up to 100 pages",        rate:"₹ 30" },
      { svc:"A4 Framed Photo",         detail:"Print + premium frame",  rate:"₹ 80 se" }
    ],
    photo: [
      { svc:"Passport Photo",          detail:"3.5×4.5 cm, set of 6",  rate:"₹ 50" },
      { svc:"Visa Photo",              detail:"Country-specific, set 4",rate:"₹ 60" },
      { svc:"Aadhaar / PAN Photo",     detail:"Set of 6",              rate:"₹ 40" },
      { svc:"A4 Framed Photo",         detail:"Print + frame combo",   rate:"₹ 80 – ₹ 150" },
      { svc:"Wedding Album Print",     detail:"Per page A4",           rate:"₹ 25 / page" }
    ],
    travel: [
      { svc:"Train Ticket (Regular)",  detail:"All classes, all routes",rate:"₹ 30 / ticket" },
      { svc:"Train Ticket (Tatkal)",   detail:"Same day booking",       rate:"₹ 50 / ticket" },
      { svc:"Air Ticket (Domestic)",   detail:"All airlines",           rate:"₹ 100 / ticket" },
      { svc:"Air Ticket (International)",detail:"All destinations",     rate:"₹ 200 / ticket" },
      { svc:"Visa Application Help",   detail:"Documentation + form",  rate:"₹ 300 se" }
    ],
    govt: [
      { svc:"PAN Card (New Apply)",    detail:"Online application",     rate:"₹ 100" },
      { svc:"PAN Card Correction",     detail:"Name / DOB / Address",  rate:"₹ 80" },
      { svc:"Aadhaar Update",          detail:"Address / Mobile",      rate:"₹ 50" },
      { svc:"UP Scholarship Form",     detail:"Fresh / Renewal",       rate:"₹ 50" },
      { svc:"Income / Caste Cert.",    detail:"Form fill + submission", rate:"₹ 40" },
      { svc:"Electricity / Water Bill",detail:"Online payment",        rate:"₹ 10" }
    ]
  },
  photos: [
    { ico:"📷", bg:"bg1", name:"Passport & Visa Photos",  desc:"Govt-approved size mein instant photos — sab prakar ke." },
    { ico:"🖼️", bg:"bg2", name:"A4 Framed Photos",        desc:"A4 print + premium frame — gift ke liye perfect." },
    { ico:"🖨️", bg:"bg3", name:"Bulk Photo Printing",     desc:"Wedding, birthday, events ki bulk print — best quality." },
    { ico:"💍", bg:"bg4", name:"Wedding Album",           desc:"Shaadi ki yaadgaar photos — spiral ya hard-bound." },
    { ico:"🎓", bg:"bg5", name:"ID Card Photos",          desc:"School, college, office ID — instant same day." },
    { ico:"✂️", bg:"bg6", name:"Photo Editing",           desc:"Background change, restoration — available hai." }
  ],
  reviews: []
};

/* ════════════════════════════════════════════════
   MAIN APP OBJECT
════════════════════════════════════════════════ */
const APP = (() => {

  let db, FS;

  /* ── Firebase fetch helper ── */
  async function fetchDoc(path) {
    try {
      const { doc, getDoc } = FS;
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() : null;
    } catch { return null; }
  }

  async function fetchCollection(col) {
    try {
      const { collection, getDocs } = FS;
      const snap = await getDocs(collection(db, col));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  }

  /* ── Render contact info ── */
  function applyContact(c) {
    const waUrl = `https://wa.me/${c.whatsapp}?text=Namaste!%20Annu%20Printing%20Press%20ke%20baare%20mein%20jaankari%20chahiye.`;

    _set('top-csc',       c.csc);
    _set('top-phone',     c.phone);
    _set('ci-address',    c.address);
    _set('ci-csc',        c.csc);

    _href('ci-phone-a',   `tel:${c.phone.replace(/\s/g,'')}`, c.phone);
    _href('ci-email-a',   `mailto:${c.email}`, c.email);
    _href('nav-wa',       waUrl);
    _href('wa-fab',       waUrl);
    _href('wa-form-link', waUrl);
    _href('ft-wa-link',   waUrl);
    _href('ft-wa-link2',  waUrl);
    _href('ft-phone-link',`tel:${c.phone.replace(/\s/g,'')}`, null, 'ft-phone-txt', c.phone);
    _href('ft-email-link',`mailto:${c.email}`, `✉️ ${c.email}`);

    if (c.mapSrc) {
      const iframe = document.getElementById('map-iframe');
      if (iframe) iframe.src = c.mapSrc;
    }
  }

  function _set(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
  function _href(id, href, text, txtId, txtVal) {
    const el = document.getElementById(id);
    if (!el) return;
    el.href = href;
    if (text) el.textContent = text;
    if (txtId) { const t = document.getElementById(txtId); if (t) t.textContent = txtVal; }
  }

  /* ── Render stats ── */
  function applyStats(s) {
    _set('hn-customers', s.customers);
    _set('hn-services',  s.services);
    _set('hn-tickets',   s.tickets);
    _set('hn-rating',    s.rating);
    _set('stat-customers-box', s.customers + ' Santusht Grahak');
    _set('stat-tickets-box',   s.tickets + ' Tickets Booked');
    _set('stat-rating-box',    s.rating + ' Google Rating');
  }

  /* ── Render services ── */
  function renderServices(list) {
    const grid = document.getElementById('svc-grid');
    if (!grid) return;
    grid.innerHTML = list.map((s, i) => `
      <div class="svc-card" style="transition-delay:${i * 40}ms">
        <div class="svc-ico">${s.ico}</div>
        <div class="svc-name">${s.name}</div>
        <div class="svc-desc">${s.desc}</div>
        ${s.badge ? `<span class="svc-badge">${s.badge}</span>` : ''}
      </div>
    `).join('');

    // Hero pills — first 6
    const pills = document.getElementById('hero-pills');
    if (pills) {
      pills.innerHTML = list.slice(0, 6).map(s => `
        <div class="hpill">
          <div class="hpill-ico">${s.ico}</div>
          <div>
            <div class="hpill-name">${s.name}</div>
            <div class="hpill-sub">${s.badge || ''}</div>
          </div>
        </div>
      `).join('');
    }

    // Ticker
    const track = document.getElementById('ticker-track');
    if (track) {
      const doubled = [...list, ...list];
      track.innerHTML = doubled.map(s => `<span class="ticker-item">${s.ico} ${s.name}</span>`).join('');
    }

    observeReveal('.svc-card');
  }

  /* ── Render prices ── */
  function renderPrices(prices) {
    const CATS = [
      { k: 'printing', l: '🖨️ Printing' },
      { k: 'photo',    l: '📷 Photo' },
      { k: 'travel',   l: '✈️ Travel' },
      { k: 'govt',     l: '📄 Govt.' }
    ];
    const tabRow    = document.getElementById('price-tabs');
    const panelsDiv = document.getElementById('price-panels');
    if (!tabRow || !panelsDiv) return;

    tabRow.innerHTML = CATS.map((c, i) =>
      `<button class="tab-btn${i === 0 ? ' on' : ''}" onclick="APP.switchPriceTab('${c.k}',this)">${c.l}</button>`
    ).join('');

    panelsDiv.innerHTML = CATS.map((c, i) => `
      <div class="price-tab${i === 0 ? ' on' : ''}" id="pt-${c.k}">
        <table class="ptable">
          <thead><tr><th>Service</th><th>Details</th><th>Rate</th></tr></thead>
          <tbody>
            ${(prices[c.k] || []).map(p =>
              `<tr><td>${p.svc}</td><td>${p.detail || '—'}</td><td>${p.rate}</td></tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
  }

  /* ── Render photo lab ── */
  function renderPhotos(list) {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    grid.innerHTML = list.map((p, i) => `
      <div class="photo-card" style="transition-delay:${i * 50}ms">
        <div class="photo-card-img ${p.bg || 'bg1'}">${p.ico || '📷'}</div>
        <div class="photo-card-body">
          <div class="photo-card-name">${p.name}</div>
          <div class="photo-card-desc">${p.desc}</div>
        </div>
      </div>
    `).join('');
    observeReveal('.photo-card');
  }

  /* ── Render reviews ── */
  function renderReviews(list) {
    const grid = document.getElementById('rev-grid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = `<p style="color:var(--muted);font-size:.88rem;">Abhi tak koi review nahi. Jaldi aa rahi hain!</p>`;
      return;
    }
    grid.innerHTML = list.map((r, i) => `
      <div class="rev-card" style="transition-delay:${i * 60}ms">
        <div class="rev-stars">${'★'.repeat(r.stars || 5)}</div>
        <p class="rev-text">"${r.text}"</p>
        <div class="rev-foot">
          <div class="rev-av">${r.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="rev-name">${r.name}</div>
            <div class="rev-loc">📍 ${r.loc}</div>
          </div>
        </div>
      </div>
    `).join('');
    observeReveal('.rev-card');
  }

  /* ── Intersection Observer for reveal ── */
  function observeReveal(selector) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll(selector).forEach(el => io.observe(el));
  }

  /* ── Enquiry submit ── */
  async function submitEnquiry() {
    const name  = document.getElementById('f-name')?.value.trim();
    const phone = document.getElementById('f-phone')?.value.trim();
    const svc   = document.getElementById('f-svc')?.value;
    const msg   = document.getElementById('f-msg')?.value.trim();
    const btn   = document.getElementById('f-submit');

    if (!name || !phone || !svc) {
      showToast('⚠️ Naam, Mobile aur Service zaroori hai!');
      return;
    }

    btn.textContent = '⏳ Bhej rahe hain...';
    btn.disabled = true;

    try {
      if (db && FS) {
        await FS.addDoc(FS.collection(db, 'enquiries'), {
          name, phone, service: svc, message: msg || '',
          status: 'new',
          createdAt: FS.serverTimestamp()
        });
      }
      document.getElementById('form-success').style.display = 'block';
      document.getElementById('form-fields').style.display  = 'none';
    } catch (err) {
      console.error('Enquiry error:', err);
      showToast('❌ Error aaya! WhatsApp pe sampark karein.');
      btn.textContent = '📨 Enquiry Submit Karein';
      btn.disabled = false;
    }
  }

  /* ── Toast ── */
  function showToast(msg, dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  /* ── Price tab switch ── */
  function switchPriceTab(cat, btn) {
    document.querySelectorAll('.price-tab').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
    const panel = document.getElementById('pt-' + cat);
    if (panel) panel.classList.add('on');
    btn.classList.add('on');
  }

  /* ── NAV ── */
  function initNav() {
    const ham  = document.getElementById('nav-ham');
    const menu = document.getElementById('mob-nav');
    if (ham && menu) {
      ham.addEventListener('click', () => menu.classList.toggle('open'));
      document.querySelectorAll('.mob-link').forEach(a => {
        a.addEventListener('click', () => menu.classList.remove('open'));
      });
    }
    // Back to top
    window.addEventListener('scroll', () => {
      const btn = document.getElementById('btt');
      if (btn) btn.classList.toggle('show', scrollY > 400);
    });
    // Navbar shadow on scroll
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      if (nav) nav.style.boxShadow = scrollY > 10 ? '0 4px 20px rgba(13,36,97,.12)' : '';
    });
  }

  /* ── BOOT ── */
  async function boot() {
    initNav();

    // Wait for Firebase
    if (!window.__DB) {
      await new Promise(res => document.addEventListener('firebase-ready', res, { once: true }));
    }

    db = window.__DB;
    FS = window.__FS;

    // Load settings from Firebase
    const settings = await fetchDoc('settings/main');
    const contact  = (settings?.contact) || FALLBACK.contact;
    const stats    = (settings?.stats)   || FALLBACK.stats;
    const name     = settings?.name      || FALLBACK.name;
    const heroDesc = settings?.heroDesc  || FALLBACK.heroDesc;

    // Apply name
    _set('site-name',    name);
    _set('ft-name',      name);
    _set('ft-copy-name', name);
    document.title = `${name} | CSC Center – Badhni Chafa, Siddharthnagar UP`;

    // Apply hero desc
    const descEl = document.getElementById('hero-desc');
    if (descEl) descEl.textContent = heroDesc;

    applyContact(contact);
    applyStats(stats);

    // Load collections
    const [svcs, photos, reviews] = await Promise.all([
      fetchCollection('services'),
      fetchCollection('photos'),
      fetchCollection('reviews')
    ]);

    renderServices(svcs.length   ? svcs   : FALLBACK.services);
    renderPhotos  (photos.length  ? photos  : FALLBACK.photos);
    renderReviews (reviews.length ? reviews : FALLBACK.reviews);

    // Prices from settings doc or fallback
    const prices = settings?.prices || FALLBACK.prices;
    renderPrices(prices);
  }

  return { boot, submitEnquiry, switchPriceTab };
})();

/* ── Start ── */
document.addEventListener('DOMContentLoaded', APP.boot);
