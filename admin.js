/* ═══════════════════════════════════════════════════
   ANNU PRINTING PRESS — ADMIN PANEL JS
   File: admin.js
   Firebase Auth + Firestore se poora admin kaam karta hai.
═══════════════════════════════════════════════════ */

const ADMIN = (() => {

  /* ── State ── */
  let db, auth, storage, FS, FA;
  let currentUser  = null;
  let editingId    = null;
  let editingType  = null;

  /* ══════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════ */
  async function boot() {
    // Clock
    setInterval(() => {
      const el = document.getElementById('adm-time');
      if (el) el.textContent = new Date().toLocaleTimeString('hi-IN');
    }, 1000);

    // Wait for Firebase
    if (!window.__DB) {
      await new Promise(r => document.addEventListener('firebase-ready', r, { once: true }));
    }

    db      = window.__DB;
    auth    = window.__AUTH;
    storage = window.__STORAGE;
    FS      = window.__FS;
    FA      = window.__FA;

    // Auth state listener
    FA.onAuthStateChanged(auth, user => {
      if (user) {
        currentUser = user;
        document.getElementById('login-screen').style.display  = 'none';
        document.getElementById('admin-shell').style.display   = 'flex';
        const info = document.getElementById('adm-user-info');
        if (info) info.textContent = user.email;
        showPanel('dashboard');
      } else {
        currentUser = null;
        document.getElementById('login-screen').style.display  = 'block';
        document.getElementById('admin-shell').style.display   = 'none';
      }
    });
  }

  /* ══════════════════════════════════════════
     AUTH
  ══════════════════════════════════════════ */
  async function login() {
    const email = document.getElementById('l-email')?.value.trim();
    const pass  = document.getElementById('l-pass')?.value;
    const btn   = document.getElementById('login-btn');
    const err   = document.getElementById('login-err');

    if (!email || !pass) { err.textContent = '❌ Email aur password daalein!'; return; }

    btn.textContent = '⏳ Login ho raha hai...';
    btn.disabled    = true;
    err.textContent = '';

    try {
      await FA.signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      const msgs = {
        'auth/wrong-password':   '❌ Galat password!',
        'auth/user-not-found':   '❌ Email registered nahi hai!',
        'auth/invalid-email':    '❌ Email format galat hai!',
        'auth/too-many-requests':'❌ Bahut zyada attempts — thodi der baad try karein.',
      };
      err.textContent = msgs[e.code] || '❌ Login fail hua. Dobara try karein.';
      btn.textContent = '🔐 Login';
      btn.disabled    = false;
    }
  }

  async function logout() {
    if (!confirm('Logout karein?')) return;
    await FA.signOut(auth);
    document.getElementById('l-pass').value = '';
  }

  function togglePwd() {
    const inp = document.getElementById('l-pass');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  }

  /* ══════════════════════════════════════════
     PANEL ROUTING
  ══════════════════════════════════════════ */
  const PANEL_TITLES = {
    dashboard: '📊 Dashboard',
    services:  '🛠️ Services',
    prices:    '💰 Price List',
    photos:    '📷 Photo Lab',
    reviews:   '⭐ Reviews',
    enquiries: '📩 Enquiries',
    contact:   '📞 Contact Info',
    stats:     '📈 Statistics',
    general:   '⚙️ General Settings',
  };

  function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.adm-link').forEach(l => l.classList.remove('active'));
    const panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.add('active');
    document.querySelectorAll(`[data-panel="${name}"]`).forEach(l => l.classList.add('active'));
    const title = document.getElementById('adm-page-title');
    if (title) title.textContent = PANEL_TITLES[name] || name;

    // Load data per panel
    const loaders = {
      dashboard: loadDashboard,
      services:  loadServices,
      prices:    loadPrices,
      photos:    loadPhotos,
      reviews:   loadReviews,
      enquiries: loadEnquiries,
      contact:   loadContact,
      stats:     loadStats,
      general:   loadGeneral,
    };
    if (loaders[name]) loaders[name]();

    // Close mobile sidebar
    document.getElementById('adm-sidebar')?.classList.remove('mob-open');
  }

  function toggleSidebar() {
    document.getElementById('adm-sidebar')?.classList.toggle('mob-open');
  }

  /* ══════════════════════════════════════════
     FIRESTORE HELPERS
  ══════════════════════════════════════════ */
  async function getCol(col) {
    try {
      const snap = await FS.getDocs(FS.collection(db, col));
      return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    } catch { return []; }
  }

  async function getSettings() {
    try {
      const snap = await FS.getDoc(FS.doc(db, 'settings', 'main'));
      return snap.exists() ? snap.data() : {};
    } catch { return {}; }
  }

  async function setSettings(data) {
    await FS.setDoc(FS.doc(db, 'settings', 'main'), data, { merge: true });
  }

  async function addDoc(col, data) {
    return await FS.addDoc(FS.collection(db, col), { ...data, createdAt: FS.serverTimestamp() });
  }

  async function updateDoc(col, id, data) {
    await FS.updateDoc(FS.doc(db, col, id), { ...data, updatedAt: FS.serverTimestamp() });
  }

  async function deleteDocById(col, id) {
    await FS.deleteDoc(FS.doc(db, col, id));
  }

  /* ══════════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════════ */
  async function loadDashboard() {
    const [svcs, photos, reviews, enqs] = await Promise.all([
      getCol('services'),
      getCol('photos'),
      getCol('reviews'),
      getCol('enquiries'),
    ]);

    const newEnqs = enqs.filter(e => e.status === 'new').length;

    document.getElementById('dash-stats').innerHTML = `
      <div class="dash-card"><div class="dash-card-ico">🛠️</div><div class="dash-card-num">${svcs.length}</div><div class="dash-card-label">Total Services</div></div>
      <div class="dash-card"><div class="dash-card-ico">📷</div><div class="dash-card-num">${photos.length}</div><div class="dash-card-label">Photo Services</div></div>
      <div class="dash-card"><div class="dash-card-ico">⭐</div><div class="dash-card-num">${reviews.length}</div><div class="dash-card-label">Reviews</div></div>
      <div class="dash-card"><div class="dash-card-ico">📩</div><div class="dash-card-num">${enqs.length}</div><div class="dash-card-label">Total Enquiries</div></div>
      <div class="dash-card"><div class="dash-card-ico">🔔</div><div class="dash-card-num" style="color:#DC2626">${newEnqs}</div><div class="dash-card-label">New Enquiries</div></div>
    `;

    // Latest 5 enquiries
    const latest = [...enqs]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);

    const enqEl = document.getElementById('dash-enquiries-list');
    if (enqEl) {
      enqEl.innerHTML = latest.length
        ? latest.map(e => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #E2E8F5;">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:.84rem;color:#0D2461;">${e.name} — ${e.service}</div>
              <div style="font-size:.76rem;color:#64728C;">${e.phone} · ${fmtDate(e.createdAt)}</div>
            </div>
            <span class="enq-badge ${e.status === 'new' ? 'new' : 'seen'}">${e.status === 'new' ? '🆕 New' : '✅ Seen'}</span>
          </div>
        `).join('')
        : '<div class="loading-msg">Koi enquiry nahi abhi tak.</div>';
    }
  }

  /* ══════════════════════════════════════════
     SERVICES
  ══════════════════════════════════════════ */
  async function loadServices() {
    const list = await getCol('services');
    const el   = document.getElementById('adm-svc-list');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="loading-msg">Koi service nahi. ➕ Add karein!</div>';
      return;
    }
    el.innerHTML = list.map(s => `
      <div class="item-card">
        <div class="item-card-ico">${s.ico || '🔧'}</div>
        <div class="item-card-body">
          <div class="item-card-name">${s.name}</div>
          <div class="item-card-sub">${s.desc} ${s.badge ? `· <strong>${s.badge}</strong>` : ''}</div>
        </div>
        <div class="item-card-actions">
          <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="ADMIN.openModal('service','${s._id}')">✏️ Edit</button>
          <button class="adm-btn adm-btn-danger  adm-btn-sm" onclick="ADMIN.deleteItem('services','${s._id}',loadServices)">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  /* ══════════════════════════════════════════
     PRICES
  ══════════════════════════════════════════ */
  async function loadPrices() {
    await renderPriceTable();
  }

  async function renderPriceTable() {
    const cat  = document.getElementById('price-cat-sel')?.value || 'printing';
    const sets = await getSettings();
    const rows = (sets.prices?.[cat]) || [];
    const tbody = document.getElementById('adm-price-tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.length
      ? rows.map((r, i) => `
        <tr>
          <td>${r.svc}</td>
          <td>${r.detail || '—'}</td>
          <td class="td-price">${r.rate}</td>
          <td>
            <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="ADMIN.openModal('price','${cat}:${i}')">✏️</button>
            <button class="adm-btn adm-btn-danger  adm-btn-sm" onclick="ADMIN.deletePrice('${cat}',${i})">🗑️</button>
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="text-align:center;padding:20px;color:#64728C;">Koi rate nahi. ➕ Add karein!</td></tr>`;
  }

  async function deletePrice(cat, idx) {
    if (!confirm('Yeh rate delete karein?')) return;
    const sets = await getSettings();
    if (sets.prices?.[cat]) {
      sets.prices[cat].splice(idx, 1);
      await setSettings({ prices: sets.prices });
      await renderPriceTable();
      toast('🗑️ Rate delete ho gaya!');
    }
  }

  /* ══════════════════════════════════════════
     PHOTOS
  ══════════════════════════════════════════ */
  async function loadPhotos() {
    const list = await getCol('photos');
    const el   = document.getElementById('adm-photo-list');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="loading-msg">Koi photo service nahi. ➕ Add karein!</div>';
      return;
    }
    el.innerHTML = list.map(p => `
      <div class="item-card">
        <div class="item-card-ico">${p.ico || '📷'}</div>
        <div class="item-card-body">
          <div class="item-card-name">${p.name}</div>
          <div class="item-card-sub">${p.desc}</div>
        </div>
        <div class="item-card-actions">
          <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="ADMIN.openModal('photo','${p._id}')">✏️ Edit</button>
          <button class="adm-btn adm-btn-danger  adm-btn-sm" onclick="ADMIN.deleteItem('photos','${p._id}',loadPhotos)">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  /* ══════════════════════════════════════════
     REVIEWS
  ══════════════════════════════════════════ */
  async function loadReviews() {
    const list = await getCol('reviews');
    const el   = document.getElementById('adm-rev-list');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="loading-msg">Koi review nahi. ➕ Add karein!</div>';
      return;
    }
    el.innerHTML = list.map(r => `
      <div class="item-card">
        <div class="item-card-ico">⭐</div>
        <div class="item-card-body">
          <div class="item-card-name">${r.name} — ${r.loc || ''}</div>
          <div class="item-card-sub">${'★'.repeat(r.stars || 5)} &nbsp;|&nbsp; "${(r.text || '').substring(0, 70)}${r.text?.length > 70 ? '...' : ''}"</div>
        </div>
        <div class="item-card-actions">
          <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="ADMIN.openModal('review','${r._id}')">✏️ Edit</button>
          <button class="adm-btn adm-btn-danger  adm-btn-sm" onclick="ADMIN.deleteItem('reviews','${r._id}',loadReviews)">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  /* ══════════════════════════════════════════
     ENQUIRIES
  ══════════════════════════════════════════ */
  async function loadEnquiries() {
    const list = await getCol('enquiries');
    const tbody = document.getElementById('enq-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64728C;">Koi enquiry nahi abhi tak.</td></tr>';
      return;
    }
    const sorted = [...list].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    tbody.innerHTML = sorted.map(e => `
      <tr class="${e.status === 'new' ? 'enq-new' : ''}">
        <td>${fmtDate(e.createdAt)}</td>
        <td><strong>${e.name}</strong></td>
        <td><a href="tel:${e.phone}" style="color:#0D2461;font-weight:700;">${e.phone}</a></td>
        <td>${e.service}</td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.message || '—'}</td>
        <td>
          <span class="enq-badge ${e.status === 'new' ? 'new' : 'seen'}">${e.status === 'new' ? '🆕 New' : '✅ Seen'}</span>
          ${e.status === 'new' ? `<button class="adm-btn adm-btn-outline adm-btn-sm" style="margin-left:6px" onclick="ADMIN.markEnqSeen('${e._id}')">Mark Seen</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  async function markEnqSeen(id) {
    await updateDoc('enquiries', id, { status: 'seen' });
    await loadEnquiries();
    toast('✅ Marked as seen!');
  }

  /* ══════════════════════════════════════════
     CONTACT
  ══════════════════════════════════════════ */
  async function loadContact() {
    const sets = await getSettings();
    const c    = sets.contact || {};
    setValue('ce-address', c.address || '');
    setValue('ce-phone',   c.phone   || '');
    setValue('ce-wa',      c.whatsapp|| '');
    setValue('ce-email',   c.email   || '');
    setValue('ce-csc',     c.csc     || '');
    setValue('ce-map',     c.mapSrc  || '');
  }

  async function saveContactAll() {
    const contact = {
      address:  val('ce-address'),
      phone:    val('ce-phone'),
      whatsapp: val('ce-wa'),
      email:    val('ce-email'),
      csc:      val('ce-csc'),
      mapSrc:   val('ce-map'),
    };
    await setSettings({ contact });
    toast('✅ Contact info save ho gayi! Site reload karein.');
  }

  /* ══════════════════════════════════════════
     STATISTICS
  ══════════════════════════════════════════ */
  async function loadStats() {
    const sets = await getSettings();
    const s    = sets.stats || {};
    setValue('st-customers', s.customers || '');
    setValue('st-services',  s.services  || '');
    setValue('st-tickets',   s.tickets   || '');
    setValue('st-rating',    s.rating    || '');
  }

  async function saveStats() {
    const stats = {
      customers: val('st-customers'),
      services:  val('st-services'),
      tickets:   val('st-tickets'),
      rating:    val('st-rating'),
    };
    await setSettings({ stats });
    toast('✅ Statistics save ho gayi!');
  }

  /* ══════════════════════════════════════════
     GENERAL SETTINGS
  ══════════════════════════════════════════ */
  async function loadGeneral() {
    const sets = await getSettings();
    setValue('gen-name', sets.name    || 'Annu Printing Press');
    setValue('gen-hero', sets.heroTitle|| '');
    setValue('gen-desc', sets.heroDesc || '');
  }

  async function saveGeneral() {
    const data = {
      name:      val('gen-name'),
      heroTitle: val('gen-hero'),
      heroDesc:  val('gen-desc'),
    };
    await setSettings(data);
    toast('✅ General settings save ho gayi!');
  }

  /* ══════════════════════════════════════════
     MODAL SYSTEM
  ══════════════════════════════════════════ */
  async function openModal(type, idOrKey) {
    editingType = type;
    editingId   = idOrKey || null;

    const overlay = document.getElementById('modal-overlay');
    const title   = document.getElementById('modal-title');
    const body    = document.getElementById('modal-body');
    const foot    = document.getElementById('modal-foot');

    overlay.classList.add('open');

    const isEdit = !!idOrKey;

    // Fetch existing data if editing
    let existing = null;
    if (isEdit) {
      if (type === 'service') {
        const list = await getCol('services');
        existing = list.find(s => s._id === idOrKey);
      } else if (type === 'photo') {
        const list = await getCol('photos');
        existing = list.find(p => p._id === idOrKey);
      } else if (type === 'review') {
        const list = await getCol('reviews');
        existing = list.find(r => r._id === idOrKey);
      } else if (type === 'price') {
        // key = "cat:idx"
        const [cat, idx] = idOrKey.split(':');
        const sets = await getSettings();
        existing = { ...(sets.prices?.[cat]?.[parseInt(idx)] || {}), _cat: cat, _idx: parseInt(idx) };
      }
    }

    const BG_OPTIONS = ['bg1','bg2','bg3','bg4','bg5','bg6'];

    // ── Service Modal ──
    if (type === 'service') {
      title.textContent = isEdit ? '✏️ Service Edit Karein' : '➕ Naya Service Add Karein';
      body.innerHTML = `
        <div class="mfg-row">
          <div class="mfg">
            <label>Icon (Emoji) *</label>
            <input type="text" id="m-ico" value="${existing?.ico || '🔧'}" placeholder="🖨️" maxlength="4">
            <div class="mfg-hint">Koi bhi emoji copy-paste karein</div>
          </div>
          <div class="mfg">
            <label>Badge Text</label>
            <input type="text" id="m-badge" value="${existing?.badge || ''}" placeholder="Available">
          </div>
        </div>
        <div class="mfg">
          <label>Service Ka Naam *</label>
          <input type="text" id="m-name" value="${existing?.name || ''}" placeholder="e.g. Air Ticket Booking">
        </div>
        <div class="mfg">
          <label>Description *</label>
          <textarea id="m-desc" rows="3" placeholder="Short description jo website pe dikhegi...">${existing?.desc || ''}</textarea>
        </div>
      `;
      foot.innerHTML = `
        <button class="adm-btn adm-btn-outline" onclick="ADMIN.closeModal()">Cancel</button>
        <button class="adm-btn adm-btn-primary" onclick="ADMIN.saveService()">💾 Save Karein</button>
      `;
    }

    // ── Price Modal ──
    else if (type === 'price') {
      const cats = { printing:'🖨️ Printing', photo:'📷 Photo', travel:'✈️ Travel', govt:'📄 Govt.' };
      const selCat = existing?._cat || document.getElementById('price-cat-sel')?.value || 'printing';
      title.textContent = isEdit ? '✏️ Rate Edit Karein' : '➕ Naya Rate Add Karein';
      body.innerHTML = `
        <div class="mfg">
          <label>Category *</label>
          <select id="m-cat">
            ${Object.entries(cats).map(([k,l]) => `<option value="${k}" ${k===selCat?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="mfg">
          <label>Service Ka Naam *</label>
          <input type="text" id="m-svc" value="${existing?.svc || ''}" placeholder="e.g. Color Print">
        </div>
        <div class="mfg">
          <label>Details</label>
          <input type="text" id="m-detail" value="${existing?.detail || ''}" placeholder="e.g. A4 size, single side">
        </div>
        <div class="mfg">
          <label>Rate *</label>
          <input type="text" id="m-rate" value="${existing?.rate || ''}" placeholder="e.g. ₹ 5 / page">
        </div>
      `;
      foot.innerHTML = `
        <button class="adm-btn adm-btn-outline" onclick="ADMIN.closeModal()">Cancel</button>
        <button class="adm-btn adm-btn-primary" onclick="ADMIN.savePrice()">💾 Save Karein</button>
      `;
    }

    // ── Photo Modal ──
    else if (type === 'photo') {
      title.textContent = isEdit ? '✏️ Photo Service Edit' : '➕ Photo Service Add';
      body.innerHTML = `
        <div class="mfg-row">
          <div class="mfg">
            <label>Icon (Emoji) *</label>
            <input type="text" id="m-ico" value="${existing?.ico || '📷'}" placeholder="📷" maxlength="4">
          </div>
          <div class="mfg">
            <label>Card Background Color</label>
            <select id="m-bg">
              ${BG_OPTIONS.map(b => `<option value="${b}" ${(existing?.bg||'bg1')===b?'selected':''}>${b} ${bgLabel(b)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="mfg">
          <label>Service Ka Naam *</label>
          <input type="text" id="m-name" value="${existing?.name || ''}" placeholder="e.g. Passport Photo">
        </div>
        <div class="mfg">
          <label>Description</label>
          <textarea id="m-desc" rows="3" placeholder="Short description...">${existing?.desc || ''}</textarea>
        </div>
      `;
      foot.innerHTML = `
        <button class="adm-btn adm-btn-outline" onclick="ADMIN.closeModal()">Cancel</button>
        <button class="adm-btn adm-btn-primary" onclick="ADMIN.savePhoto()">💾 Save Karein</button>
      `;
    }

    // ── Review Modal ──
    else if (type === 'review') {
      title.textContent = isEdit ? '✏️ Review Edit Karein' : '➕ Review Add Karein';
      body.innerHTML = `
        <div class="mfg-row">
          <div class="mfg">
            <label>Customer Ka Naam *</label>
            <input type="text" id="m-name" value="${existing?.name || ''}" placeholder="e.g. Ramesh Kumar">
          </div>
          <div class="mfg">
            <label>Location</label>
            <input type="text" id="m-loc" value="${existing?.loc || ''}" placeholder="e.g. Siddharthnagar, UP">
          </div>
        </div>
        <div class="mfg">
          <label>Stars (1 se 5)</label>
          <select id="m-stars">
            ${[5,4,3,2,1].map(n => `<option value="${n}" ${(existing?.stars||5)===n?'selected':''}>${'★'.repeat(n)} (${n})</option>`).join('')}
          </select>
        </div>
        <div class="mfg">
          <label>Review Text *</label>
          <textarea id="m-text" rows="4" placeholder="Customer ne kya kaha...">${existing?.text || ''}</textarea>
        </div>
        <div class="mfg">
          <div class="mfg-hint" style="background:#FFF8E1;padding:10px;border-radius:6px;border-left:3px solid #E8A020;">
            💡 <strong>Tip:</strong> Sirf genuine customer reviews daalo — fake reviews se Google ranking kharab hoti hai.
          </div>
        </div>
      `;
      foot.innerHTML = `
        <button class="adm-btn adm-btn-outline" onclick="ADMIN.closeModal()">Cancel</button>
        <button class="adm-btn adm-btn-primary" onclick="ADMIN.saveReview()">💾 Save Karein</button>
      `;
    }
  }

  function closeModal() {
    document.getElementById('modal-overlay')?.classList.remove('open');
    editingId   = null;
    editingType = null;
  }

  function closeModalOutside(e) {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  }

  /* ══════════════════════════════════════════
     SAVE FUNCTIONS
  ══════════════════════════════════════════ */

  /* ── Save Service ── */
  async function saveService() {
    const ico   = val('m-ico')  || '🔧';
    const name  = val('m-name');
    const desc  = val('m-desc');
    const badge = val('m-badge');
    if (!name || !desc) { toast('❌ Naam aur description zaroori hai!'); return; }

    const data = { ico, name, desc, badge };
    if (editingId) {
      await updateDoc('services', editingId, data);
      toast('✅ Service update ho gayi!');
    } else {
      await addDoc('services', data);
      toast('✅ Naya service add ho gaya!');
    }
    closeModal();
    loadServices();
  }

  /* ── Save Price ── */
  async function savePrice() {
    const cat    = val('m-cat') || document.getElementById('price-cat-sel')?.value || 'printing';
    const svc    = val('m-svc');
    const detail = val('m-detail');
    const rate   = val('m-rate');
    if (!svc || !rate) { toast('❌ Service naam aur rate zaroori!'); return; }

    const sets = await getSettings();
    if (!sets.prices) sets.prices = {};
    if (!sets.prices[cat]) sets.prices[cat] = [];

    if (editingId && editingId.includes(':')) {
      const [, idxStr] = editingId.split(':');
      const idx = parseInt(idxStr);
      if (!isNaN(idx)) sets.prices[cat][idx] = { svc, detail, rate };
    } else {
      sets.prices[cat].push({ svc, detail, rate });
    }

    await setSettings({ prices: sets.prices });
    toast('✅ Rate save ho gaya!');
    closeModal();
    await renderPriceTable();
  }

  /* ── Save Photo ── */
  async function savePhoto() {
    const ico  = val('m-ico')  || '📷';
    const bg   = val('m-bg')   || 'bg1';
    const name = val('m-name');
    const desc = val('m-desc');
    if (!name) { toast('❌ Naam zaroori hai!'); return; }

    const data = { ico, bg, name, desc };
    if (editingId) {
      await updateDoc('photos', editingId, data);
      toast('✅ Photo service update!');
    } else {
      await addDoc('photos', data);
      toast('✅ Photo service add ho gayi!');
    }
    closeModal();
    loadPhotos();
  }

  /* ── Save Review ── */
  async function saveReview() {
    const name  = val('m-name');
    const loc   = val('m-loc');
    const stars = parseInt(val('m-stars')) || 5;
    const text  = val('m-text');
    if (!name || !text) { toast('❌ Naam aur review text zaroori!'); return; }

    const data = { name, loc, stars, text };
    if (editingId) {
      await updateDoc('reviews', editingId, data);
      toast('✅ Review update ho gayi!');
    } else {
      await addDoc('reviews', data);
      toast('✅ Review add ho gayi!');
    }
    closeModal();
    loadReviews();
  }

  /* ── Generic Delete ── */
  async function deleteItem(col, id, reloadFn) {
    if (!confirm('Yeh item delete karein? Yeh action undo nahi ho sakta.')) return;
    await deleteDocById(col, id);
    toast('🗑️ Delete ho gaya!');
    if (reloadFn) reloadFn();
  }

  /* ══════════════════════════════════════════
     UTILITIES
  ══════════════════════════════════════════ */
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setValue(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v;
  }

  function toast(msg, dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  function fmtDate(ts) {
    if (!ts?.seconds) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('hi-IN', {
      day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
  }

  function bgLabel(bg) {
    const map = { bg1:'(Blue)', bg2:'(Orange)', bg3:'(Green)', bg4:'(Pink)', bg5:'(Purple)', bg6:'(Teal)' };
    return map[bg] || '';
  }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */
  return {
    boot,
    login, logout, togglePwd,
    showPanel, toggleSidebar,
    openModal, closeModal, closeModalOutside,
    saveService, savePrice, savePhoto, saveReview,
    deleteItem, deletePrice,
    saveContactAll, saveStats, saveGeneral,
    loadEnquiries, markEnqSeen,
    renderPriceTable,
  };

})();

/* ── Start ── */
document.addEventListener('DOMContentLoaded', ADMIN.boot);
