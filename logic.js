
// Shopify checkout: cart lines are sent to the store as a cart permalink (variant ID : quantity); ?checkout skips the Shopify cart page.
const SHOPIFY_DOMAIN = 'w5xfi9-hn.myshopify.com';
const SHOPIFY_VARIANTS = { Black: '58279901266302', White: '58279901233534', Blue: '58279901331838' };

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { prod: false, page: 'home', sent: false, tab: 1, tsent: false, tload: false, terr: '', tres: null, bundle: 0, thumb: 0, colour: 0, outlet: 0, qty: 1, cf: 0, menu: false, flip: [false, false, false, false], cmp: 1, lt: 0, lsent: false, user: null, cart: [], cnote: false, faqN: 1, descOpen: false, extra: ['', ''], cerr: false };
  }
  setState(patch) {
    super.setState(patch);
    try { localStorage.setItem('mo-cart', JSON.stringify(this.state.cart || [])); } catch (x) {}
  }
  applyCartHash() {
    try {
      const saved = JSON.parse(localStorage.getItem('mo-cart') || '[]');
      const cart = Array.isArray(saved) ? saved.filter((l) => l && l.qty > 0 && l.colour >= 0 && l.colour < 3) : [];
      const hm = /^#cart(?:=([\w:,]*))?$/.exec(location.hash);
      const open = !!hm;
      // #cart=<variantId>:<qty>,... is the cart held by Shopify; it wins over the locally saved one
      const names = ['Black', 'White', 'Blue'];
      const fromShopify = [];
      ((hm && hm[1]) || '').split(',').forEach((pair) => {
        const [id, q] = pair.split(':');
        const colour = names.findIndex((n) => SHOPIFY_VARIANTS[n] === id);
        if (colour >= 0 && +q > 0) fromShopify.push({ colour: colour, qty: Math.min(9, +q) });
      });
      const use = fromShopify.length ? fromShopify : (this.state.cart && this.state.cart.length ? this.state.cart : cart);
      if (use.length || open) this.setState({ cart: use, page: open ? 'cart' : this.state.page, menu: false });
      if (open) window.scrollTo(0, 0);
    } catch (x) {}
  }
  componentDidMount() {
    // restore the cart saved in this browser; a #cart link (e.g. from Shopify checkout) opens it
    this.applyCartHash();
    window.addEventListener('hashchange', () => this.applyCartHash());
    const root = document.documentElement;
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    // description items: click to highlight (one per group, click again to clear)
    try {
      document.addEventListener('click', (e) => {
        const it = e.target.closest && e.target.closest('.ac-rich li, .ship-tl .st, .ac-rich .spec');
        if (!it) return;
        const group = it.parentElement;
        const on = it.classList.contains('on');
        group.querySelectorAll(':scope > .on').forEach((x) => x.classList.remove('on'));
        if (!on) it.classList.add('on');
      });
    } catch (e) {}
    // accordions (FAQ + description): smooth open / close, opening one closes the others
    try {
      const reduceA = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const closeAnim = (d) => {
        if (!d.open || d.__closing) return;
        const sm = d.querySelector(':scope > summary');
        if (!d.animate || reduceA()) { d.open = false; return; }
        if (d.__anim) { try { d.__anim.cancel(); } catch (x) {} }
        d.__closing = true;
        const start = d.offsetHeight, end = sm.offsetHeight;
        d.style.overflow = 'hidden';
        const an = d.__anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' });
        an.onfinish = () => { d.open = false; d.style.overflow = ''; d.__anim = null; d.__closing = false; };
        an.oncancel = () => { d.style.overflow = ''; d.__closing = false; };
      };
      document.addEventListener('click', (e) => {
        const sm = e.target.closest && e.target.closest('.faq details.ac > summary, .details-sec details.ac > summary');
        if (!sm) return;
        const d = sm.parentElement;
        e.preventDefault();
        if (d.open && !d.__closing) { closeAnim(d); return; }
        if (d.__closing) { try { d.__anim.cancel(); } catch (x) {} d.__closing = false; }
        // close the others in the same list
        const sibs = [...d.parentElement.querySelectorAll(':scope > details.ac[open]')].filter((o) => o !== d);
        sibs.forEach(closeAnim);
        const start = d.offsetHeight;
        if (!d.animate || reduceA()) { d.open = true; return; }
        if (d.__anim) { try { d.__anim.cancel(); } catch (x) {} }
        d.style.overflow = 'hidden';
        d.open = true;
        const end = d.offsetHeight;
        const an = d.__anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 480, easing: 'cubic-bezier(.22,.8,.2,1)' });
        an.onfinish = () => { d.style.overflow = ''; d.__anim = null; };
        an.oncancel = () => { d.style.overflow = ''; };
        // if the one that closed above pushed this one under the header, bring it back into view
        if (sibs.length) setTimeout(() => {
          const r = sm.getBoundingClientRect();
          if (r.top < 70 || r.top > window.innerHeight - 80) window.scrollTo({ top: window.scrollY + r.top - 90, behavior: 'smooth' });
        }, 420);
      });
    } catch (e) {}
    // trust boxes: click to highlight (one at a time, click again to clear)
    try {
      document.addEventListener('click', (e) => {
        const box = e.target.closest && e.target.closest('.trio > div');
        if (!box) return;
        const on = box.classList.contains('on');
        document.querySelectorAll('.trio > div.on').forEach((x) => x.classList.remove('on'));
        if (!on) box.classList.add('on');
      });
    } catch (e) {}
    // photo viewer: tap a gallery photo to enlarge it; close with the X, a tap outside, or Esc
    try {
      let box = null, back = null;
      const close = () => {
        if (!box) return;
        const b = box; box = null;
        b.classList.remove('on');
        document.documentElement.style.overflow = '';
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => { try { b.remove(); } catch (x) {} }, reduce ? 0 : 300);
        try { if (back) back.focus({ preventScroll: true }); } catch (x) {}
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
      document.addEventListener('click', (e) => {
        const sl = e.target.closest && e.target.closest('#gallery .slide');
        if (!sl || box) return;
        const img = sl.querySelector('img'); if (!img) return;
        back = document.activeElement;
        const cap = sl.querySelector('.gcap');
        box = document.createElement('div');
        box.className = 'lbx'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo viewer');
        box.innerHTML = '<button type="button" class="lbx-x" aria-label="Close photo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';
        const big = box.querySelector('img'); big.src = img.currentSrc || img.src; big.alt = img.alt || '';
        box.querySelector('figcaption').textContent = cap ? cap.textContent : '';
        box.addEventListener('click', (ev) => { if (!ev.target.closest('img')) close(); });
        document.body.appendChild(box);
        document.documentElement.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey, true);
        requestAnimationFrame(() => { if (box) { box.classList.add('on'); const x = box.querySelector('.lbx-x'); if (x) x.focus({ preventScroll: true }); } });
      });
    } catch (e) {}
    // reviews: turn to the next one by itself after a while (pauses on hover / touch / when out of view / when the tab is hidden)
    try {
      let hold = false, lastAct = 0, vis = false;
      const qs = document.querySelector('.quote-sec');
      if (qs && !reduce) {
        const bump = () => { lastAct = Date.now(); };
        ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin'].forEach((ev) => qs.addEventListener(ev, bump, { passive: true }));
        qs.addEventListener('mouseenter', () => { hold = true; }); qs.addEventListener('mouseleave', () => { hold = false; bump(); });
        if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; }), { threshold: 0.4 }).observe(qs); else vis = true;
        setInterval(() => {
          if (hold || !vis || document.hidden || Date.now() - lastAct < 7000) return;
          const nx = qs.querySelector('.q-next'); if (nx && nx.offsetParent !== null) nx.click();
        }, 5500);
      }
    } catch (e) {}
    // reviews (tablet): endless carousel - there is always a neighbour card on both sides
    try {
      const qt = document.querySelector('.q-track');
      const tab = () => true;
      const real = () => [...qt.querySelectorAll('.quote:not(.q-clone)')];
      const all = () => [...qt.querySelectorAll('.quote')];
      const centerOf = (c) => c.offsetLeft + c.offsetWidth / 2 - qt.clientWidth / 2;
      const nearest = () => {
        const cs = all(); let best = 0, bd = 1e9;
        cs.forEach((c, i) => { const d = Math.abs(centerOf(c) - qt.scrollLeft); if (d < bd) { bd = d; best = i; } });
        return best;
      };
      const jump = (left, target) => {
        qt.classList.add('nj');
        if (target) { all().forEach((x) => x.classList.toggle('is-on', x === target)); syncFrames(); }
        qt.style.scrollBehavior = 'auto'; qt.style.scrollSnapType = 'none';
        qt.scrollLeft = left;
        requestAnimationFrame(() => requestAnimationFrame(() => { qt.style.scrollBehavior = ''; qt.style.scrollSnapType = ''; qt.classList.remove('nj'); }));
      };
      const qkey = (c) => { const n = c && c.querySelector('.by-n'); return n ? n.textContent : ''; };
      let curKey = null, frAnim = 0;
      const setPf = (c, v) => c.style.setProperty('--pf', String(v));
      const syncFrames = () => {
        const cs = all(); const on = cs.find((c) => c.classList.contains('is-on'));
        if (!on) return;
        const k = qkey(on);
        if (k === curKey) { cs.forEach((c) => { if (c !== on) setPf(c, 0); }); if (!frAnim) setPf(on, 1); return; }
        cs.forEach((c) => { if (c !== on) setPf(c, 0); });
        const wrapJump = qt.classList.contains('nj');
        curKey = k; cancelAnimationFrame(frAnim); frAnim = 0;
        if (reduce || wrapJump) { setPf(on, 1); return; }
        setPf(on, 0);
        const T0 = performance.now(), DUR = 1500, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const step = (now) => { const kk = Math.min(1, (now - T0) / DUR); setPf(on, ease(kk).toFixed(3)); if (kk < 1) frAnim = requestAnimationFrame(step); else frAnim = 0; };
        frAnim = requestAnimationFrame(step);
      };
      const mark = () => {
        const cs = all(); const b = nearest();
        cs.forEach((c, i) => c.classList.toggle('is-on', i === b));
        syncFrames();
      };
      const ensure = () => {
        const r = real();
        r.forEach((c) => { if (!c.querySelector('.pframe')) c.insertAdjacentHTML('beforeend', '<span class="pframe" aria-hidden="true"><i></i></span><span class="pdot" aria-hidden="true"></span>'); });
        if (r.length < 3) return;
        if (!qt.querySelector('.q-clone')) {
          const n = r.length;
          const mk = (src) => { const c = src.cloneNode(true); c.classList.remove('rv', 'rv-s'); c.classList.add('q-clone', 'in'); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('id'); return c; };
          qt.insertBefore(mk(r[n - 2]), r[0]);
          qt.insertBefore(mk(r[n - 1]), r[0]);
          const after = r[n - 1].nextSibling;
          qt.insertBefore(mk(r[0]), after);
          qt.insertBefore(mk(r[1]), after);
          if (tab()) jump(centerOf(real()[0]));
        }
      };
      let settle;
      const onSettle = () => {
        if (!tab()) return;
        const cs = all(); const n = cs.length - 4; if (n < 3) return; const b = nearest();
        if (b <= 1) jump(centerOf(cs[b + n]), cs[b + n]);
        else if (b >= n + 2) jump(centerOf(cs[b - n]), cs[b - n]);
        mark();
      };
      if (qt) {
        ensure();
        new MutationObserver(() => { if (!qt.querySelector('.q-clone')) ensure(); }).observe(qt, { childList: true });
        qt.addEventListener('scroll', () => { mark(); clearTimeout(settle); settle = setTimeout(onSettle, 140); }, { passive: true });
        window.addEventListener('resize', () => { ensure(); if (tab()) jump(centerOf(all()[nearest()])); mark(); });
        window.addEventListener('load', () => { ensure(); if (tab()) jump(centerOf(real()[0])); mark(); });
        setTimeout(() => { ensure(); mark(); }, 300);
        mark();
      }
      document.addEventListener('click', (e) => {
        const b = e.target.closest && e.target.closest('.q-arr');
        if (!b || !qt) return;
        ensure();
        const cs = all(); if (cs.length < 5) return;
        const idx = nearest(); const next = b.classList.contains('q-next');
        const t = Math.max(0, Math.min(cs.length - 1, idx + (next ? 1 : -1)));
        qt.scrollTo({ left: centerOf(cs[t]), behavior: reduce ? 'auto' : 'smooth' });
        if (reduce) onSettle();
      });
    } catch (e) {}
    // gallery: indicator bars + highlighted frame; on tablet an endless carousel with neighbour photos on both sides
    try {
      const gal = document.getElementById('gallery');
      const dots = document.querySelector('.gal-dots');
      if (gal && dots) {
        const tab = () => true;
        const real = () => [...gal.querySelectorAll('.slide:not(.g-clone)')];
        const vis = () => [...gal.querySelectorAll('.slide')].filter((x) => x.offsetWidth > 0);
        const centerOf = (c) => c.offsetLeft + c.offsetWidth / 2 - gal.clientWidth / 2;
        const nearest = () => {
          const cs = vis(); let best = 0, bd = 1e9;
          cs.forEach((c, i) => { const d = Math.abs(centerOf(c) - gal.scrollLeft); if (d < bd) { bd = d; best = i; } });
          return best;
        };
        const jump = (left, target) => {
          gal.classList.add('nj');
          if (target) vis().forEach((x) => x.classList.toggle('is-on', x === target));
          gal.style.scrollBehavior = 'auto'; gal.style.scrollSnapType = 'none';
          gal.scrollLeft = left;
          requestAnimationFrame(() => requestAnimationFrame(() => { gal.style.scrollBehavior = ''; gal.style.scrollSnapType = ''; gal.classList.remove('nj'); }));
        };
        const sync = () => {
          const r = real(); const cl = gal.querySelectorAll('.g-clone');
          if (r.length < 3 || cl.length < 4) return;
          const n = r.length;
          [[cl[0], r[n - 2]], [cl[1], r[n - 1]], [cl[2], r[0]], [cl[3], r[1]]].forEach(([c, src]) => {
            const a = c.querySelector('img'), b = src.querySelector('img');
            if (a && b && a.getAttribute('src') !== b.getAttribute('src')) { a.setAttribute('src', b.getAttribute('src')); a.alt = b.alt; }
            const ca = c.querySelector('.gcap'), cb = src.querySelector('.gcap');
            if (ca && cb && ca.textContent !== cb.textContent) ca.textContent = cb.textContent;
          });
        };
        const ensure = () => {
          const r = real();
          if (r.length < 3) return;
          if (!gal.querySelector('.g-clone')) {
            const n = r.length;
            const mk = (src) => { const c = src.cloneNode(true); c.classList.remove('is-on'); c.classList.add('g-clone'); c.setAttribute('aria-hidden', 'true'); return c; };
            gal.insertBefore(mk(r[n - 2]), r[0]);
            gal.insertBefore(mk(r[n - 1]), r[0]);
            const after = r[n - 1].nextSibling;
            gal.insertBefore(mk(r[0]), after);
            gal.insertBefore(mk(r[1]), after);
            if (tab()) jump(centerOf(real()[0]));
          }
          sync();
        };
        const upd = () => {
          const cs = vis(); if (!cs.length) return;
          const n = real().length; let idx;
          if (tab() && gal.querySelector('.g-clone') && cs.length > n) {
            const b = nearest(); idx = (((b - 2) % n) + n) % n;
            cs.forEach((x, i) => x.classList.toggle('is-on', i === b));
          } else {
            const step = cs[1] ? cs[1].offsetLeft - cs[0].offsetLeft : gal.clientWidth;
            idx = Math.max(0, Math.min(cs.length - 1, Math.round(gal.scrollLeft / (step || 1))));
            cs.forEach((x, i) => x.classList.toggle('is-on', i === idx));
          }
          for (let i = 0; i < 3; i++) dots.style.setProperty('--o' + i, i === idx ? '1' : '.4');
        };
        let settle;
        const onSettle = () => {
          if (!tab()) return;
          const cs = vis(); const n = cs.length - 4; if (n < 3) return; const b = nearest();
          if (b <= 1) jump(centerOf(cs[b + n]), cs[b + n]); else if (b >= n + 2) jump(centerOf(cs[b - n]), cs[b - n]);
          upd();
        };
        ensure();
        gal.addEventListener('scroll', () => { upd(); clearTimeout(settle); settle = setTimeout(onSettle, 140); }, { passive: true });
        // re-apply clones, photos and highlighted frame whenever the page re-renders the slides
        try { new MutationObserver(() => { ensure(); upd(); }).observe(gal, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'src'] }); } catch (e) {}
        window.addEventListener('load', () => { ensure(); if (tab()) jump(centerOf(real()[0])); upd(); });
        setTimeout(() => { ensure(); upd(); }, 300);
        window.addEventListener('resize', () => { ensure(); if (tab() && gal.querySelector('.g-clone')) jump(centerOf(vis()[nearest()])); upd(); });
        document.addEventListener('click', (e) => {
          const b = e.target.closest && e.target.closest('.gal-arr');
          if (!b || !tab()) return;
          ensure();
          const cs = vis(); if (cs.length < 5) return;
          const t = Math.max(0, Math.min(cs.length - 1, nearest() + (b.classList.contains('gal-next') ? 1 : -1)));
          gal.scrollTo({ left: centerOf(cs[t]), behavior: reduce ? 'auto' : 'smooth' });
          if (reduce) onSettle();
        });
        upd();
      }
    } catch (e) {}
    // page switch: the new section fades and rises in slowly
    try {
      const base = this.setState.bind(this);
      let lastPage = this.state.page;
      this.setState = (patch) => {
        const before = lastPage;
        base(patch);
        if (this.state.page === before) return;
        lastPage = this.state.page;
        if (reduce) return;
        const hd = document.querySelector('header.hdr');
        const app = hd && hd.parentElement;
        if (!app || !app.animate) return;
        try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (x) {}
        const kids = [...app.children].filter((el) => el.offsetParent && !/^(HEADER|STYLE)$/.test(el.tagName) && !el.classList.contains('ann') && !el.classList.contains('gz'));
        kids.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translate3d(0,44px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 1900, delay: 150 + k * 220, easing: 'cubic-bezier(.25,.6,.25,1)', fill: 'backwards' }));
      };
    } catch (e) {}
    // chat assistant (answers from the FAQ on this page, no external service)
    try {
      const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
      const SK = (() => { try { return localStorage.getItem('mo-lang') === 'sk'; } catch (x) { return false; } })();
      const D = {"We currently sell one product, MemoryOrb, in three colours: Black, White and Blue. You can buy a single one, a Pair or a Collection of three. We do not sell any other products.": "Aktuálne predávame jediný produkt, MemoryOrb, v troch farbách: čierna, biela a modrá. Môžete si kúpiť jeden kus, set Pair alebo Collection s tromi kusmi. Iné produkty nepredávame.", "Need help? <b>Ask me</b>": "Potrebujete poradiť? <b>Opýtajte sa</b>", "Open chat": "Otvoriť chat", "MemoryOrb assistant": "MemoryOrb asistent", "MemoryOrb – Assistant": "MemoryOrb – Asistent", "Online · replies instantly": "Online · odpovedá okamžite", "Close chat": "Zavrieť chat", "Buy now": "Kúpiť teraz", "Track order": "Sledovať objednávku", "Contact us": "Kontakt", "Ask about MemoryOrb...": "Opýtajte sa na MemoryOrb...", "Your question": "Vaša otázka", "Send": "Odoslať", "Hi! I am the MemoryOrb assistant. What would you like to do? 🙂": "Ahoj! Som asistent MemoryOrb. Čo by ste chceli urobiť? 🙂", "Buy a MemoryOrb": "Kúpiť MemoryOrb", "Choose colours and a set.": "Vyberte si farby a set.", "Track my order": "Sledovať objednávku", "See where it is.": "Pozrite, kde je.", "We reply within an hour.": "Odpovedáme do hodiny.", "Product details": "Detaily produktu", "Specs, care and more.": "Parametre, starostlivosť a viac.", "Additional questions ›": "Ďalšie otázky ›", "More ›": "Viac ›", "‹ Back": "‹ Späť", "‹ Back to main menu": "‹ Späť do hlavného menu", "For this question, please contact our team through the <a data-go=\"contact\">contact page</a>.": "Na túto otázku radšej kontaktujte náš tím cez <a data-go=\"contact\">kontakt</a>.", "Which set should I choose?": "Ktorý set si mám vybrať?", "How much storage does it have?": "Koľko má úložiska?", "Do you offer worldwide shipping?": "Posielate do celého sveta?", "What if my MemoryOrb arrives damaged?": "Čo ak môj MemoryOrb dorazí poškodený?", "How long does the battery last?": "Ako dlho vydrží batéria?", "Is it a good gift?": "Je to dobrý darček?", "What colours are there?": "Aké sú dostupné farby?", "Can I return it?": "Môžem ho vrátiť?", "How do I upload photos?": "Ako nahrám fotky?", "How long does shipping take?": "Ako dlho trvá doručenie?", "What if it arrives damaged?": "Čo ak dorazí poškodený?", "What is MemoryOrb?": "Čo je MemoryOrb?", "How much storage does MemoryOrb have?": "Koľko úložiska má MemoryOrb?", "How do I upload photos and videos to MemoryOrb?": "Ako nahrám fotky a videá do MemoryOrb?", "Can I transfer photos and videos from my phone or computer?": "Môžem preniesť fotky a videá z telefónu alebo počítača?", "What photo and video formats does MemoryOrb support?": "Aké formáty fotiek a videí MemoryOrb podporuje?", "Can I update or replace my photos and videos later?": "Môžem fotky a videá neskôr aktualizovať alebo vymeniť?", "Can I play audio through MemoryOrb?": "Môžem cez MemoryOrb prehrávať zvuk?", "Is MemoryOrb easy to set up?": "Dá sa MemoryOrb jednoducho nastaviť?", "Is MemoryOrb a good gift?": "Je MemoryOrb dobrý darček?", "Is MemoryOrb a good Christmas gift?": "Je MemoryOrb dobrý vianočný darček?", "Can I return MemoryOrb if I'm not satisfied?": "Môžem MemoryOrb vrátiť, ak nie som spokojný?", "How quickly does customer support respond?": "Ako rýchlo odpovedá zákaznícka podpora?", "MemoryOrb is a personalized glass globe that brings your favorite photos and videos to life. Turn your most meaningful moments into a beautiful keepsake you can display at home or give to someone special.": "MemoryOrb je personalizovaná digitálna sklenená guľa, ktorá oživí vaše obľúbené fotky a videá. Premeňte svoje najvýznamnejšie chvíle na krásnu pamiatku, ktorú si môžete vystaviť doma alebo darovať niekomu výnimočnému.", "MemoryOrb comes with 4GB of built-in storage, giving you space to keep your favorite photos and videos together in one special place.": "MemoryOrb má 4 GB vstavaného úložiska, takže máte miesto na uloženie svojich obľúbených fotiek a videí na jednom výnimočnom mieste.", "Choose Wi-Fi or USB Type-C, then follow the instructions in the included user manual to transfer your favorite photos and videos to MemoryOrb.": "Vyberte Wi-Fi alebo USB Type-C a podľa pokynov v priloženom návode prenesiete svoje obľúbené fotky a videá do MemoryOrb.", "Yes! You can transfer your favorite memories from compatible mobile phones and computers. Follow the included user manual for instructions on connecting your device and transferring your files.": "Áno! Svoje obľúbené spomienky môžete preniesť z kompatibilných mobilných telefónov a počítačov. Pokyny na pripojenie zariadenia a prenos súborov nájdete v priloženom návode.", "MemoryOrb is designed to display your favorite photos and videos. For the best experience, check the supported file formats in the product instructions before transferring your files.": "MemoryOrb je určený na zobrazovanie vašich obľúbených fotiek a videí. Pre najlepší zážitok si pred prenosom súborov pozrite podporované formáty v návode k produktu.", "Absolutely! You can add new memories or replace old ones whenever you like. Keep your MemoryOrb updated with new moments as life happens.": "Samozrejme! Nové spomienky môžete pridať alebo staré vymeniť kedykoľvek budete chcieť. Svoj MemoryOrb aktualizujte novými chvíľami, ako ich život prináša.", "Yes! Videos can play with their original sound through the built-in speaker, letting you relive both the sights and sounds of your favorite moments. You can also turn the sound off whenever you prefer.": "Áno! Videá sa môžu prehrávať s pôvodným zvukom cez vstavaný reproduktor, takže si môžete znovu prežiť obraz aj zvuk svojich obľúbených chvíľ. Zvuk môžete kedykoľvek vypnúť.", "MemoryOrb features a rechargeable 800mAh battery. Battery life depends on how you use the device, including screen time and video playback.": "MemoryOrb má nabíjateľnú batériu s kapacitou 800 mAh. Výdrž batérie závisí od používania zariadenia.", "Yes! Simply follow the included user manual to transfer your photos and videos, then use the controls to enjoy your saved memories.": "Áno! Stačí podľa priloženého návodu preniesť fotky a videá a potom pomocou ovládania sledovať uložené spomienky.", "Absolutely! MemoryOrb is a thoughtful, personalized gift for birthdays, anniversaries, weddings, and other special occasions. Fill it with meaningful photos or videos to create a heartfelt gift for someone you love.": "Určite! MemoryOrb je premyslený, osobný darček k narodeninám, výročiam, svadbám a iným výnimočným príležitostiam. Naplňte ho zmysluplnými fotkami alebo videami a vytvorte srdečný darček pre niekoho, koho máte radi.", "It's a beautiful Christmas gift! Fill it with favorite family moments, adorable pet videos, or special memories with someone you love. Place it beside the Christmas tree or give it as a thoughtful present they'll treasure long after the holidays.": "Je to krásny vianočný darček! Naplňte ho obľúbenými rodinnými chvíľami, milými videami zvieratiek alebo výnimočnými spomienkami s blízkym človekom. Postavte ho vedľa vianočného stromčeka alebo ho darujte ako premyslený darček, ktorý bude potešením dlho po sviatkoch.", "We ship worldwide to bring meaningful memories closer to you and your loved ones. Available destinations, delivery estimates, and shipping costs are displayed at checkout.": "Posielame do celého sveta, aby sme vám a vašim blízkym priblížili zmysluplné spomienky.", "We're here to help! If your order arrives damaged or defective, contact our support team with your order number and photos of the issue. We'll review your request and help you find an appropriate solution.": "Radi pomôžeme! Ak vaša objednávka dorazí poškodená alebo chybná, kontaktujte našu podporu s číslom objednávky a fotkami problému. Vašu žiadosť posúdime a pomôžeme nájsť vhodné riešenie.", "We want you to love your MemoryOrb! If you're not completely satisfied, contact our support team to discuss your options under our Returns & Refunds Policy. We'll guide you through the next steps.": "Chceme, aby sa vám váš MemoryOrb páčil! Ak nie ste úplne spokojní, kontaktujte našu podporu a prejdeme možnosti podľa našich zásad vrátenia tovaru a peňazí. Prevedieme vás ďalšími krokmi.", "We're always happy to help! Our support team typically responds within one hour. Whether you have a question about your order, setup, or transferring your memories, we're here to make your experience as smooth as possible.": "Vždy radi pomôžeme! Naša podpora zvyčajne odpovedá do jednej hodiny. Či už ide o otázku k objednávke, nastaveniu alebo prenosu spomienok, urobíme všetko pre to, aby bol váš zážitok čo najplynulejší.", "MemoryOrb has 4GB of built-in storage, enough space to keep your favourite photos and videos together in one place.": "MemoryOrb má 4 GB vstavaného úložiska, čo stačí na to, aby ste mali svoje obľúbené fotky a videá na jednom mieste.", "Yes, we ship worldwide and shipping is free. Orders are usually processed within 1–3 business days, and you get a tracking number by email once your order ships.": "Áno, posielame do celého sveta a poštovné je zadarmo. Objednávky spracúvame zvyčajne do 1–3 pracovných dní a po odoslaní vám príde e-mailom číslo zásielky.", "MemoryOrb comes in three colours: Black, White and Blue. In a Pair or Collection you can pick a different colour for each MemoryOrb.": "MemoryOrb je v troch farbách: čierna, biela a modrá. V sete Pair alebo Collection si môžete zvoliť inú farbu pre každý MemoryOrb.", "We are here to help! If your order arrives damaged or defective, contact our support team with your order number and photos of the issue and we will make it right.": "Radi pomôžeme! Ak vaša objednávka dorazí poškodená alebo chybná, kontaktujte našu podporu s číslom objednávky a fotkami problému a postaráme sa o nápravu.", "MemoryOrb supports JPG, JPEG, PNG, MP4 and other compatible photo and video formats. Check the product instructions before transferring your files.": "MemoryOrb podporuje JPG, JPEG, PNG, MP4 a ďalšie kompatibilné formáty fotiek a videí. Pred prenosom súborov si pozrite návod k produktu.", "You can pick your colours and set in the <a data-go=\"buy\">shop section</a>. Shipping is free and every order has a 30-day guarantee.": "Farby a set si môžete vybrať v <a data-go=\"buy\">sekcii obchodu</a>. Poštovné je zadarmo a každá objednávka má 30-dňovú záruku.", "Hello, I am the MemoryOrb assistant. I can help you with questions about MemoryOrb.": "Dobrý deň, som MemoryOrb asistent. Pomôžem vám s otázkami ohľadom MemoryOrb.", "Most customers pick the <b>Pair ($126.08)</b>, one for you and one as a gift. The <b>Single ($64.99)</b> is perfect to start, and the <b>Collection ($185.22)</b> is the best value for families. Either way, the more you choose, the more you save. You can choose a different colour for every MemoryOrb.": "Najviac zákazníkov si vyberá set <b>Pair ($126.08)</b>, jeden pre vás a jeden ako darček. <b>Single ($64.99)</b> je ideálny na začiatok a <b>Collection ($185.22)</b> je najvýhodnejšia pre rodiny. Každopádne, ak si vyberiete viac kusov, ušetríte. Pre každý MemoryOrb si môžete zvoliť inú farbu.", "A single MemoryOrb is $64.99. The Pair is $126.08 (save $45) and the Collection of three is $185.22 (save $71). Shipping is free.": "Jeden MemoryOrb stojí $64.99. Set Pair stojí $126.08 (ušetríte $45) a Collection s tromi kusmi $185.22 (ušetríte $71). Poštovné je zadarmo.", "You can follow your order on the <a data-go=\"tracking\">Tracking page</a>. Enter the tracking number from your shipping email.": "Objednávku môžete sledovať na <a data-go=\"tracking\">stránke Sledovanie</a>. Zadajte číslo zásielky z e-mailu o odoslaní.", "We ship worldwide with free shipping. Your estimated delivery dates are shown at checkout and in your order confirmation.": "Posielame do celého sveta s bezplatným poštovným. Odhadované dátumy doručenia uvidíte v pokladni a v potvrdení objednávky.", "Yes, we ship worldwide, and shipping is free. Delivery times and any local fees are shown at checkout.": "Áno, posielame do celého sveta a poštovné je zadarmo. Doby doručenia a prípadné miestne poplatky uvidíte v pokladni.", "Every order has a 30-day guarantee and Damage Protection. If your MemoryOrb arrives damaged or defective, we fix it.": "Každá objednávka má 30-dňovú záruku a ochranu Damage Protection. Ak váš MemoryOrb dorazí poškodený alebo chybný, vyriešime to.", "Checkout is secure and encrypted. You can pay by card and the usual wallets. The final options are shown at checkout.": "Pokladňa je bezpečná a šifrovaná. Platiť môžete kartou a bežnými peňaženkami. Konečné možnosti uvidíte v pokladni.", "Our support team is happy to help. Send us a message on the <a data-go=\"contact\">Contact page</a> and we usually reply within one hour.": "Naša podpora vám rada pomôže. Napíšte nám cez <a data-go=\"contact\">stránku Kontakt</a> a zvyčajne odpovieme do jednej hodiny.", "You are welcome! Anything else I can help with?": "Rado sa stalo! Pomôcť vám ešte s niečím?"};
      const T = (t) => (SK && D[t]) || t;
      const SKEN = {}; if (SK) Object.keys(D).forEach((k) => { SKEN[D[k]] = k; });
      const skIn = (q) => { if (!SK) return q; let x = ' ' + q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + ' ';
        [[/ (ahoj|dobry den|cau|zdravim)\b/g, ' hello '], [/ (kupit|objednat|kupim|objednam)\w*/g, ' buy '], [/ (cena|cenu|kolko stoji|stoji|zlava|akcia|kupon)\w*/g, ' price '], [/ (farb|zelen|cerven|siv|ruzov|zlt|oranz|fialov|cierna|biela|modra)\w*/g, ' colour '], [/ (predavat|predavate|sortiment|produkt)\w*/g, ' what do you sell '], [/ (ulozisk|pamat|gb)\w*/g, ' storage '], [/ (sledovat|sledovanie|kde je|zasielk|balik)\w*/g, ' track '], [/ (dorucen|posielat|poslat|postovne|doprav|prepravca)\w*/g, ' ship worldwide '], [/ (zaruk|ochran)\w*/g, ' guarantee '], [/ (platb|plati|kartou|zaplatit)\w*/g, ' payment '], [/ (kontakt|podpor|operator|clovek|email|telefon)\w*/g, ' contact '], [/ (dakujem|dakujeme|vdaka)\w*/g, ' thanks '], [/ (batéri|bateri|nabij|vydrz)\w*/g, ' battery '], [/ (darcek|darceka|darovat)\w*/g, ' gift '], [/ (vratit|vratenie|refund|vrátenie)\w*/g, ' return '], [/ (poskoden|rozbit|pokazen)\w*/g, ' damaged '], [/ (nahrat|nahrav|prenos|preniest|wifi)\w*/g, ' upload photos '], [/ (format)\w*/g, ' format '], [/ (set|balenie|ktory)\w*/g, ' which set should i choose ']].forEach(([r, e]) => { x = x.replace(r, e); });
        return x.trim(); };
      const ic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
      const fab = mk('button', 'cb-fab', ic + '<i class="cb-ping"></i>'); fab.setAttribute('aria-label', T('Open chat'));
      const tip = mk('div', 'cb-tip', T('Need help? <b>Ask me</b>')); tip.setAttribute('aria-hidden', 'true');
      const win = mk('div', 'cb-win'); win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', T('MemoryOrb assistant'));
      win.innerHTML = '<div class="cb-hd"><span class="cb-av">' + ic + '<i class="cb-on"></i></span><span><b>' + T('MemoryOrb – Assistant') + '</b><small>' + T('Online · replies instantly') + '</small></span><button type="button" class="cb-x" aria-label="' + T('Close chat') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="cb-pin"></div><div class="cb-body"></div><div class="cb-chipwrap"><button type="button" class="cb-ca l" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><div class="cb-chips"></div><button type="button" class="cb-ca r" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div><div class="cb-more"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div><div class="cb-links"><a data-go="buy">' + T('Buy now') + '</a><a data-go="tracking">' + (SK ? 'Sledovanie' : 'Track order') + '</a><a data-go="contact">' + (SK ? 'Kontakt' : 'Contact us') + '</a></div><form class="cb-form"><input class="cb-in" type="text" placeholder="' + T('Ask about MemoryOrb...') + '" aria-label="' + T('Your question') + '" autocomplete="off"><button class="cb-send" type="submit" aria-label="' + T('Send') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
      fab.classList.add('late'); setTimeout(() => { fab.classList.remove('late'); fab.classList.add('enter'); setTimeout(() => fab.classList.remove('enter'), 1000); }, 5000); document.body.appendChild(fab); document.body.appendChild(tip); document.body.appendChild(win);
      const body = win.querySelector('.cb-body'), chips = win.querySelector('.cb-chips'), inp = win.querySelector('.cb-in');
      const IC = { buy: '<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>', track: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>', contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', desc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>' };
      const card = (go, t, sub) => '<a class="cb-card" data-go="' + go + '"><span class="cb-ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + IC[go === 'tracking' ? 'track' : go] + '</svg></span><span class="cb-ct"><b>' + t + '</b><small>' + sub + '</small></span></a>';
      const g = mk('div', 'cb-cards', card('buy', T('Buy a MemoryOrb'), T('Choose colours and a set.')) + card('tracking', T('Track my order'), T('See where it is.')) + card('contact', SK ? 'Kontaktujte nás' : 'Contact us', T('We reply within an hour.')) + card('desc', T('Product details'), T('Specs, care and more.')));
      const hi = mk('div', 'cb-m bot cb-hi', T('Hi! I am the MemoryOrb assistant. What would you like to do? 🙂'));
      const pin = win.querySelector('.cb-pin'); pin.appendChild(hi); pin.appendChild(g);
      const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      // a fresh chat always shows the welcome message at the top; once the visitor has written, follow the newest message
      const scrollEnd = () => { body.scrollTop = body.querySelector('.cb-m.me') ? body.scrollHeight : 0; };
      const add = (txt, who, html) => { if (who === 'me') win.classList.add('talk'); const m = mk('div', 'cb-m ' + who, html ? txt : esc(txt)); body.appendChild(m); scrollEnd(); return m; };
      const go = (page) => {
        close();
        if (page === 'buy' || page === 'desc') {
          this.setState({ page: 'home', menu: false });
          setTimeout(() => {
            try {
              if (page === 'buy') { const t = document.getElementById('colours'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
              else { const vb = [...document.querySelectorAll('.cta-stack .btn-ghost')].find((x) => /View description/i.test(x.textContent)); if (vb) vb.click(); }
            } catch (x) {}
          }, 450);
          return;
        }
        this.setState({ page, menu: false, sent: false, tsent: false }); try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (x) {}
      };
      const stop = new Set('a an the is are do does can i my me you your of to for in on and or it be how what when where which with at as if this that there we our about have has get'.split(' '));
      const tok = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !stop.has(w)).map((w) => w.replace(/(ing|es|s)$/, '').replace(/(.)\1$/, '$1'));
      let kb = null;
      const build = () => {
        if (kb) return kb;
        kb = [];
        document.querySelectorAll('.faq details.ac').forEach((d) => {
          const q = d.querySelector('summary span'), a = d.querySelector('p');
          if (q && a) kb.push({ q: q.textContent.trim(), a: a.textContent.replace(/Check Product Details/g, '').replace(/\s+/g, ' ').trim(), t: tok(q.textContent + ' ' + a.textContent), qt: tok(q.textContent) });
        });
        return kb;
      };
      const C = '<a data-go="contact">Contact page</a>';
      const norm = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const CUR = {
        'how much storage does it have': 'MemoryOrb has 4GB of built-in storage, enough space to keep your favourite photos and videos together in one place.',
        'do you offer worldwide shipping': 'Yes, we ship worldwide and shipping is free. Orders are usually processed within 1–3 business days, and you get a tracking number by email once your order ships.',
        'what colours are there': 'MemoryOrb comes in three colours: Black, White and Blue. In a Pair or Collection you can pick a different colour for each MemoryOrb.',
        'what if my memoryorb arrives damaged': 'We are here to help! If your order arrives damaged or defective, contact our support team with your order number and photos of the issue and we will make it right.'
      };
      const intents = [
        { re: /\b(storage|gb|gigabyte|space|capacity)\b/i, a: CUR['how much storage does it have'], next: ['How do I upload photos?', 'How long does the battery last?'] },
        { re: /\b(format|jpg|jpeg|png|mp4|file type)\w*/i, a: 'MemoryOrb supports JPG, JPEG, PNG, MP4 and other compatible photo and video formats. Check the product instructions before transferring your files.', next: ['How do I upload photos?', 'How much storage does it have?'] },
        { re: /\b(worldwide|international|abroad|overseas)\b|\b(do|can) you (ship|deliver)\b/i, a: CUR['do you offer worldwide shipping'], next: ['What if my MemoryOrb arrives damaged?', 'Can I return it?'] },
        { re: /\b(what do you sell|do you sell|other products?|more products?|accessor\w*|catalogu?e|product range|sortiment)\b/i, a: 'We currently sell one product, MemoryOrb, in three colours: Black, White and Blue. You can buy a single one, a Pair or a Collection of three. We do not sell any other products.', next: ['What colours are there?', 'Which set should I choose?'] },
        { re: /\b(buy|purchase|order now|get one|add to cart|where can i (get|buy))\b/i, a: 'You can pick your colours and set in the <a data-go="buy">shop section</a>. Shipping is free and every order has a 30-day guarantee.', html: true, next: ['Which set should I choose?', 'What colours are there?'] },
        { re: /\b(hi|hello|hey|ahoj|good (morning|evening|day))\b/i, a: 'Hello, I am the MemoryOrb assistant. I can help you with questions about MemoryOrb.', next: ['Which set should I choose?', 'How much storage does it have?'] },
        { re: /(which|what).*\b(set|bundle|pack|option|one|choose|pick|best|recommend)\b|\bshould i (get|buy|choose)|recommend/i, a: 'Most customers pick the <b>Pair ($126.08)</b>, one for you and one as a gift. The <b>Single ($64.99)</b> is perfect to start, and the <b>Collection ($185.22)</b> is the best value for families. Either way, the more you choose, the more you save. You can choose a different colour for every MemoryOrb.', html: true, next: ['What colours are there?', 'Is it a good gift?'] },
        { re: /\b(price|cost|how much|\$|pay|discount|sale|cheap|offer|coupon|code)\b/i, a: 'A single MemoryOrb is $64.99. The Pair is $126.08 (save $45) and the Collection of three is $185.22 (save $71). Shipping is free.', next: ['Which set should I choose?', 'How long does shipping take?'] },
        { re: /\b(colou?rs?|black|white|blue|green|red|grey|gray|pink|purple|yellow|orange|silver|gold)\b/i, a: 'MemoryOrb comes in three colours: Black, White and Blue. In a Pair or Collection you can pick a different colour for each MemoryOrb.', next: ['Which set should I choose?', 'Is it a good gift?'] },
        { re: /\b(track|where is my|order status|parcel|package|my order)\b/i, a: 'You can follow your order on the <a data-go="tracking">Tracking page</a>. Enter the tracking number from your shipping email.', html: true },
        { re: /\b(how long|when|how fast|days|time)\b.*\b(ship|deliver|arriv|get here|come)\w*|\b(ship|deliver)\w*\b.*\b(take|long|time|days)\b/i, a: 'We ship worldwide with free shipping. Your estimated delivery dates are shown at checkout and in your order confirmation.', next: ['What if it arrives damaged?', 'Can I return it?'] },
        { re: /\b(europe|usa|america|canada|australia|asia|country|countries|international|abroad|overseas|worldwide)\b/i, a: 'Yes, we ship worldwide, and shipping is free. Delivery times and any local fees are shown at checkout.' },
        { re: /\b(warranty|guarantee|protection|insurance)\b/i, a: 'Every order has a 30-day guarantee and Damage Protection. If your MemoryOrb arrives damaged or defective, we fix it.', next: ['What if it arrives damaged?', 'Can I return it?'] },
        { re: /\b(payment|card|visa|mastercard|paypal|apple pay|google pay|checkout|secure)\b/i, a: 'Checkout is secure and encrypted. You can pay by card and the usual wallets. The final options are shown at checkout.' },
        { re: /\b(human|agent|person|support|contact|email|phone|call|help desk|complain|speak)\b/i, a: 'Our support team is happy to help. Send us a message on the ' + C + ' and we usually reply within one hour.', html: true },
        { re: /\b(thanks|thank you|thx|dakujem|ďakujem|great|perfect|nice)\b/i, a: 'You are welcome! Anything else I can help with?' }
      ];
      const answer = (q) => {
        if (!D[q]) q = skIn(q);
        const nq = norm(q);
        const ex = build().find((e) => norm(e.q) === nq); if (ex) return { a: ex.a, q: ex.q };
        if (CUR[nq]) return { a: CUR[nq] };
        for (const it of intents) if (it.re.test(q)) return it;
        const qt = tok(q); if (!qt.length) return null;
        const syn = { sound: 'audio', speaker: 'audio', music: 'audio', volume: 'audio', picture: 'photo', image: 'photo', pic: 'photo', video: 'video', charge: 'battery', power: 'battery', deliver: 'ship', delivery: 'ship', post: 'ship', refund: 'return', broken: 'damaged', defective: 'damaged', present: 'gift', store: 'storage', memory: 'storage', space: 'storage', gb: 'storage', format: 'format', file: 'format', setup: 'set', usb: 'upload', wifi: 'upload', transfer: 'upload', copy: 'upload', change: 'replace', delete: 'replace', mobile: 'phone' };
        const qs = qt.map((w) => syn[w] || w);
        let best = null, bs = 0;
        build().forEach((e) => { let sc = 0, hit = 0; qs.forEach((w) => { if (e.qt.includes(w)) { sc += 3; hit++; } else if (e.t.includes(w)) sc += 1; }); if (hit && sc > bs) { bs = sc; best = e; } });
        return best && bs >= 3 ? { a: best.a, q: best.q } : null;
      };
      const topics = ['Which set should I choose?', 'How much storage does it have?', 'Do you offer worldwide shipping?', 'What if my MemoryOrb arrives damaged?', 'How long does the battery last?', 'Is it a good gift?', 'What colours are there?', 'Can I return it?'];
      const asked = new Set();
      const MAIN = ['Which set should I choose?', 'How much storage does it have?', 'Do you offer worldwide shipping?', 'What if my MemoryOrb arrives damaged?'];
      const EXTRA = ['How long does the battery last?', 'Is it a good gift?', 'What colours are there?', 'Can I return it?', 'How do I upload photos?'];
      const REL = {
        'Which set should I choose?': ['What colours are there?', 'Is it a good gift?'],
        'How much storage does it have?': ['How do I upload photos?', 'How long does the battery last?'],
        'Do you offer worldwide shipping?': ['What if my MemoryOrb arrives damaged?', 'Can I return it?'],
        'What if my MemoryOrb arrives damaged?': ['Can I return it?', 'Do you offer worldwide shipping?'],
        'How long does the battery last?': ['How much storage does it have?', 'How do I upload photos?'],
        'Is it a good gift?': ['Which set should I choose?', 'What colours are there?'],
        'What colours are there?': ['Which set should I choose?', 'Is it a good gift?'],
        'Can I return it?': ['What if my MemoryOrb arrives damaged?', 'Do you offer worldwide shipping?'],
        'How do I upload photos?': ['How much storage does it have?', 'How long does the battery last?']
      };
      const allQs = () => { const f = build().map((e) => e.q); return [...new Set([...MAIN, ...EXTRA, ...f])]; };
      const related = (q, r) => {
        const out = []; const push = (t) => { if (t && t !== q && !out.includes(t) && !asked.has(t)) out.push(t); };
        (REL[q] || []).forEach(push);
        (r && r.next || []).forEach(push);
        if (out.length < 2) {
          const qt = tok(q + ' ' + (r ? r.a : '')); const sc = allQs().filter((t) => t !== q && !out.includes(t) && !asked.has(t)).map((t) => [t, tok(t).filter((w) => qt.includes(w)).length]).sort((a, b) => b[1] - a[1]);
          sc.forEach(([t]) => push(t));
        }
        return out.slice(0, 2);
      };
      const nav = (label, fn, cls) => { const c = mk('button', 'cb-chip nav ' + (cls || ''), T(label)); c.type = 'button'; c.addEventListener('click', fn); return c; };
      const qchip = (t) => { const c = mk('button', 'cb-chip', esc(T(t))); c.type = 'button'; c.addEventListener('click', () => ask(t)); return c; };
      // views: main -> additional -> more (all FAQ), plus 'rel' (two related questions after an answer)
      const more = win.querySelector('.cb-more');
      const updMore = () => more.classList.toggle('on', chips.classList.contains('scroll') && chips.scrollTop + chips.clientHeight < chips.scrollHeight - 6);
      const caL = win.querySelector('.cb-ca.l'), caR = win.querySelector('.cb-ca.r');
      const updArr = () => { caL.classList.toggle('on', chips.scrollLeft > 6); caR.classList.toggle('on', chips.scrollLeft + chips.clientWidth < chips.scrollWidth - 6); };
      caL.addEventListener('click', () => chips.scrollBy({ left: -Math.round(chips.clientWidth * 0.7), behavior: 'smooth' }));
      caR.addEventListener('click', () => chips.scrollBy({ left: Math.round(chips.clientWidth * 0.7), behavior: 'smooth' }));
      chips.addEventListener('scroll', () => { updMore(); updArr(); }, { passive: true });
      window.addEventListener('resize', updArr);
      chips.addEventListener('wheel', (e) => { if (chips.scrollWidth > chips.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { chips.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
      let dragX = null, dragMoved = false;
      chips.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { dragX = e.clientX; dragMoved = false; } });
      window.addEventListener('pointermove', (e) => { if (dragX == null) return; const dx = e.clientX - dragX; if (Math.abs(dx) > 4) { dragMoved = true; chips.classList.add('dragging'); } if (dragMoved) { chips.scrollLeft -= dx; dragX = e.clientX; } });
      window.addEventListener('pointerup', () => { dragX = null; setTimeout(() => chips.classList.remove('dragging'), 0); });
      chips.addEventListener('click', (e) => { if (dragMoved) { e.stopPropagation(); e.preventDefault(); dragMoved = false; } }, true);
      const showChips = (view, relList) => {
        chips.innerHTML = ''; chips.classList.add('wide'); chips.classList.toggle('scroll', view === 'all'); win.classList.toggle('sc', view === 'all');
        if (view === 'main') { MAIN.forEach((t) => chips.appendChild(qchip(t))); chips.appendChild(nav('Additional questions ›', () => showChips('extra'), 'go')); }
        else if (view === 'extra') { EXTRA.forEach((t) => chips.appendChild(qchip(t))); chips.appendChild(nav('More ›', () => showChips('all'), 'go')); chips.appendChild(nav('‹ Back', () => showChips('main'))); }
        else if (view === 'all') { allQs().forEach((t) => chips.appendChild(qchip(t))); chips.appendChild(nav('‹ Back', () => showChips('extra'))); }
        else { (relList || []).forEach((t) => chips.appendChild(qchip(t))); chips.appendChild(nav('‹ Back to main menu', () => showChips('main'))); }
        chips.scrollTop = 0; chips.scrollLeft = 0; setTimeout(scrollEnd, 30); setTimeout(updMore, 60); setTimeout(updArr, 80);
      };
      const setChips = () => showChips('main');
      // typed reply: the text appears word by word
      const type = (m, html, done) => {
        const plain = html; const words = plain.split(/(\s+)/); let i = 0;
        if (reduce || /<a |<b>/.test(plain)) { m.innerHTML = plain; scrollEnd(); done(); return; }
        const step = () => { i += 2; m.textContent = words.slice(0, i).join(''); scrollEnd(); if (i < words.length) setTimeout(step, 28); else done(); };
        step();
      };
      let busy = false;
      const reply = (q) => {
        busy = true;
        const dots = mk('div', 'cb-dots', '<i></i><i></i><i></i>'); body.appendChild(dots); scrollEnd();
        const r = answer(q);
        setTimeout(() => {
          dots.remove();
          const m = add('', 'bot', true);
          const enFix = (t) => SK ? t : t.replace(' Available destinations, delivery estimates, and shipping costs are displayed at checkout.', '').replace(', including screen time and video playback', '').replace('personalized glass globe', 'personalized digital glass globe');
          const txt = r ? (r.html ? enFix(T(r.a)) : esc(enFix(T(r.a)))) : T('For this question, please contact our team through the <a data-go="contact">contact page</a>.');
          type(m, txt, () => { busy = false; if (r && r.q) asked.add(r.q); showChips('rel', related(q, r)); save(); });
        }, 500 + Math.min(500, (r ? r.a.length : 40) * 3));
      };
      const ask = (q) => { q = q.trim(); if (!q || busy) return; const shown = q; q = SKEN[q] || q; asked.add(q); add(shown, 'me'); chips.innerHTML = ''; reply(q); };
      const save = () => { try { sessionStorage.setItem('mo-chat', JSON.stringify([...body.querySelectorAll('.cb-m')].map((m) => [m.classList.contains('me') ? 1 : 0, m.innerHTML]))); } catch (x) {} };
      win.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.getAttribute('data-go')); } });
      win.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value; inp.value = ''; ask(v); });
      let greeted = false;
      try { const old = JSON.parse(sessionStorage.getItem('mo-chat') || '[]'); if (old.length) { greeted = true; old.forEach(([me, h]) => { if (me) win.classList.add('talk'); if (!me && h === esc(T('Hi! I am the MemoryOrb assistant. What would you like to do? 🙂'))) return; const m = mk('div', 'cb-m ' + (me ? 'me' : 'bot'), h); body.appendChild(m); }); } } catch (x) {}
      const open = () => {
        win.classList.add('open'); fab.classList.add('hide'); tip.classList.remove('show'); tipDone = true;
        if (!greeted) { greeted = true; setTimeout(() => { scrollEnd(); setChips(); }, 250); }
        else setChips();
        setTimeout(() => { scrollEnd(); try { if (window.innerWidth > 700) inp.focus(); } catch (x) {} }, 400);
      };
      function close() { win.classList.remove('open'); fab.classList.remove('hide'); }
      let tipDone = false;
      setTimeout(() => { if (!tipDone && !win.classList.contains('open')) { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 7000); tipDone = true; } }, 7500);
      tip.addEventListener('click', open);
      fab.addEventListener('click', open);
      win.querySelector('.cb-x').addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && win.classList.contains('open')) close(); });
    } catch (e) {}
    // custom colour menu instead of the browser's native select popup
    try {
      const NAMES = ['Black', 'White', 'Blue'];
      let pop = null, src = null;
      const closePop = () => { if (!pop) return; const p = pop; pop = null; src = null; p.classList.remove('open'); setTimeout(() => p.remove(), 260); };
      const openPop = (sel) => {
        closePop();
        src = sel;
        const cur = sel.value;
        const el = document.createElement('div'); el.className = 'cm-pop'; el.setAttribute('role', 'listbox');
        el.innerHTML = '<div class="cm-ttl">Choose colour</div>' + NAMES.map((n, i) => '<button type="button" class="cm-opt' + (String(i) === cur ? ' on' : '') + '" role="option" data-v="' + i + '"><span class="cm-th" style="background-image:url(assets/orb-' + n.toLowerCase() + '-mini.webp)"></span><span>' + n + '</span><svg class="cm-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>').join('');
        document.body.appendChild(el);
        const r = sel.getBoundingClientRect(), h = el.offsetHeight, vh = window.innerHeight;
        const below = vh - r.bottom, up = below < h + 16 && r.top > below;
        el.style.left = r.left + 'px'; el.style.width = r.width + 'px';
        el.style.top = (up ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
        if (up) el.classList.add('up');
        pop = el;
        requestAnimationFrame(() => el.classList.add('open'));
        el.addEventListener('click', (e) => {
          const b = e.target.closest('.cm-opt'); if (!b) return;
          sel.value = b.getAttribute('data-v');
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          closePop();
        });
      };
      document.addEventListener('mousedown', (e) => { const sel = e.target.closest && e.target.closest('.bundle-row select'); if (sel) { e.preventDefault(); } }, true);
      document.addEventListener('click', (e) => {
        const sel = e.target.closest && e.target.closest('.bundle-row select, .bundle-row .select');
        if (sel) { const s2 = sel.tagName === 'SELECT' ? sel : sel.querySelector('select'); if (s2) { e.preventDefault(); if (pop && src === s2) closePop(); else openPop(s2); return; } }
        if (pop && !e.target.closest('.cm-pop')) closePop();
      }, true);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); const sel = e.target && e.target.matches && e.target.matches('.bundle-row select'); if (sel && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openPop(e.target); } });
      window.addEventListener('scroll', closePop, { passive: true });
      window.addEventListener('resize', closePop);
    } catch (e) {}
    // "Moments that stay with you": photo -> arrow -> video
    try {
      const st = document.querySelector('.lens-stage'); if (st) {
        const ph = st.querySelector('.lens-photo'), vd = st.querySelector('.lens-vid'), vid = vd && vd.querySelector('video');
        const ctl = st.parentElement.querySelector('.lens-ctl'); const nx = ctl.querySelector('.lens-next'), pv = ctl.querySelector('.lens-prev'), sn = ctl.querySelector('.lens-snd'), tabs = [...ctl.querySelectorAll('.lens-tab')];
        let showVid = false, vis = true;
        const sync = () => {
          if (ph) ph.style.opacity = showVid ? '0' : '1';
          if (vd) { vd.style.opacity = showVid ? '1' : '0'; vd.style.pointerEvents = showVid ? 'auto' : 'none'; }
          nx.classList.toggle('off', showVid); pv.classList.toggle('off', !showVid); sn.classList.toggle('on', showVid);
          tabs.forEach((t, i) => t.classList.toggle('on', (i === 1) === showVid));
          if (vid) { if (showVid && vis) { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); } else vid.pause(); }
        };
        nx.addEventListener('click', () => { showVid = true; sync(); });
        pv.addEventListener('click', () => { showVid = false; sync(); });
        tabs.forEach((t, i) => t.addEventListener('click', () => { showVid = i === 1; sync(); }));
        sn.addEventListener('click', () => { if (!vid) return; vid.muted = !vid.muted; sn.classList.toggle('un', !vid.muted); if (!vid.muted && vid.paused) vid.play().catch(() => {}); });
        if (vid) { vid.muted = true; }
        if ('IntersectionObserver' in window) new IntersectionObserver((es) => { vis = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(st);
        sync();
      }
    } catch (e) {}
    // stripes keep clear of the round photo: tell the CSS where the circle is
    try {
      const ls = document.querySelector('.lens-sec');
      const place = () => {
        const st = ls && ls.querySelector('.lens-stage'); if (!st) return;
        const a = ls.getBoundingClientRect(), b = st.getBoundingClientRect();
        if (!b.width) return;
        // scale-invariant: browsers disagree on whether getBoundingClientRect() includes the page's CSS zoom (tablet), so convert to the section's own CSS px
        const sx = a.width ? ls.offsetWidth / a.width : 1, sy = a.height ? ls.offsetHeight / a.height : 1;
        ls.style.setProperty('--cx', ((b.left - a.left + b.width / 2) * sx) + 'px');
        ls.style.setProperty('--cy', ((b.top - a.top + b.height / 2) * sy) + 'px');
        // keep the stripe layers of the photo section and the "Why choose" section one continuous pattern (tile height 37.86px)
        const why = document.querySelector('.why');
        if (why) { const H = 37.86, lh = a.height * (ls.offsetWidth / (a.width || 1)); why.style.setProperty('--sy', ((H - (lh % H)) % H).toFixed(2) + 'px'); }
        const pg = document.querySelector('.page');
        if (pg) { const H2 = 37.86, pr = pg.getBoundingClientRect(), k = a.height ? ls.offsetHeight / a.height : 1; const ph = (el) => { const r = el.getBoundingClientRect(); const t = (r.top - pr.top) * k; return ((H2 - (((t % H2) + H2) % H2)) % H2).toFixed(2) + 'px'; }; ls.style.setProperty('--ly', ph(ls)); if (why) why.style.setProperty('--sy2', ph(why)); }
        ls.style.setProperty('--cr', (Math.min(b.width * sx, b.height * sy) * 0.5) + 'px');
      };
      if (ls) { place(); setTimeout(place, 400); window.addEventListener('load', place); window.addEventListener('resize', place); setInterval(place, 1500); }
    } catch (e) {}
    // stripes above the white wave line continue the page pattern
    try {
      const phase = () => { const sk = document.querySelector('.gz .sky'), pg = document.querySelector('.page'); if (!sk || !pg) return; const H2 = 37.86, a = sk.getBoundingClientRect(), pr = pg.getBoundingClientRect(); if (!a.height) return; const k = sk.offsetHeight / a.height; const t = (a.top - pr.top) * k; sk.style.setProperty('--gy', ((H2 - (((t % H2) + H2) % H2)) % H2).toFixed(2) + 'px'); };
      phase(); setTimeout(phase, 500); window.addEventListener('resize', phase); window.addEventListener('load', phase); setInterval(phase, 1200);
    } catch (e) {}
    // footer garland: the lights drop in from above when it scrolls into view
    try {
      const gar = document.querySelector('svg.gar');
      if (gar && 'IntersectionObserver' in window) {
        root.classList.add('js-rv');
        const go = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { go.disconnect(); setTimeout(() => gar.classList.add('fall'), 120); } }), { threshold: 0.3 });
        go.observe(gar);
      } else if (gar) gar.classList.add('fall');
    } catch (e) {}
    // FAQ frame: gold outline draws itself when the list scrolls into view (like the colour panel)
    try {
      const fr = document.querySelector('.faq-frame');
      if (fr && 'IntersectionObserver' in window) {
        const run = () => {
          if (reduce) { fr.style.setProperty('--pf', '1'); return; }
          const T0 = performance.now(), DUR = 2600, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
          const step = (now) => { const k = Math.min(1, (now - T0) / DUR); fr.style.setProperty('--pf', ease(k).toFixed(3)); if (k < 1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        };
        const fo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fo.disconnect(); setTimeout(run, 150); } }), { threshold: 0.2 });
        fo.observe(fr);
      }
    } catch (e) {}
    // FAQ rows: reveal on scroll, one after another
    try {
      if ('IntersectionObserver' in window && !reduce) {
        root.classList.add('js-rv');
        let q = 0, tmr = null;
        const fio = new IntersectionObserver((es) => {
          es.filter((e) => e.isIntersecting).forEach((e) => { const t = e.target; fio.unobserve(t); setTimeout(() => t.classList.add('in'), (q++ % 5) * 110); });
          clearTimeout(tmr); tmr = setTimeout(() => { q = 0; }, 400);
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        const watch = () => document.querySelectorAll('.faq details.ac:not(.in)').forEach((d) => { if (!d.__w) { d.__w = 1; fio.observe(d); } });
        watch();
        const lst = document.querySelector('.faq .ac-list');
        if (lst && window.MutationObserver) new MutationObserver(watch).observe(lst, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        else setInterval(watch, 700);
      }
    } catch (e) {}
    // scroll-reveal (fade + translate, staggered through --d)
    try {
      const els = document.querySelectorAll('.rvt, .hg, .lg-ftr, .mo-ul, .panel, .stat');
      if (els.length && 'IntersectionObserver' in window) {
        root.classList.add('js-rv');
        let statQ = 0, statT = null;
        const io = new IntersectionObserver((es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = e.target;
          if (t.classList.contains('stat')) {
            // stat cards appear one after another as they scroll into view
            const k = statQ++;
            setTimeout(() => t.classList.add('in'), reduce ? 0 : k * 480);
            clearTimeout(statT); statT = setTimeout(() => { statQ = 0; }, 400);
          } else t.classList.add('in');
          if (t.classList.contains('panel')) {
            // frame draws itself automatically (time based, independent of scroll)
            if (reduce) { this._pf = '1'; t.style.setProperty('--pf', '1'); }
            else {
              const T0 = performance.now(), DUR = 2600, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
              const step = (now) => { const k = Math.min(1, (now - T0) / DUR); const v = ease(k).toFixed(3); this._pf = v; t.style.setProperty('--pf', v); if (k < 1) requestAnimationFrame(step); };
              setTimeout(() => requestAnimationFrame(step), 250);
            }
          }
          if (t.classList.contains('lg-ftr')) t.classList.add('go');
          if (t.classList.contains('hg')) {
            document.querySelectorAll('.rvf').forEach((x) => x.classList.add('in'));
            setTimeout(() => document.querySelectorAll('.rvs').forEach((x) => x.classList.add('in')), 1500);
          }
          io.unobserve(t);
        }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        els.forEach((el) => io.observe(el));
      }
    } catch (err) {}
    // header compact state + very light parallax (transform only, rAF-throttled)
    try {
      let tick = false;
      const frame = () => {
        tick = false;
        root.classList.toggle('is-scrolled', (window.scrollY || 0) > 24);
        if (reduce) return;
        const vh = window.innerHeight;
        document.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -240 || r.top > vh + 240) return;
          el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-px'))).toFixed(1) + 'px,0)';
        });
      };
      const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(frame); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      frame();
    } catch (err) {}
  }
  renderVals() {
    const SK = (() => { try { const m = /[?&]lang=(\w+)/.exec(location.search); if (m) localStorage.setItem('mo-lang', m[1]); return (m ? m[1] : localStorage.getItem('mo-lang')) === 'sk'; } catch (x) { return false; } })();
    const defs = [
      { id: 1, name: 'Single', save: 'Save $20', price: '$64.99', was: '$85.70' },
      { id: 2, name: 'Pair', save: 'Save $45', price: '$126.08', was: '$171.40', popular: true },
      { id: 3, name: 'Collection', save: 'Save $71', price: '$185.22', was: '$257.10' }
    ];
    const bundles = defs.map((d) => {
      const selected = this.state.bundle === d.id;
      const rows = [];
      const CN = ['Black', 'White', 'Blue'];
      const DOTS = [['#7a7a85', '#25252b'], ['#ffffff', '#d8d5ce'], ['#6c9dff', '#1f50c4'], ['#62d28c', '#237c47'], ['#ff6e6e', '#b11f24'], ['#cbcbd0', '#6c6c74']];
      const opts = CN.map((name, v) => ({ v: String(v), name }));
      const extra = this.state.extra || ['', ''];
      let miss = 0;
      for (let i = 1; i <= d.id; i++) {
        const v = i === 1 ? String(this.state.colour) : String(extra[i - 2]);
        const empty = v === '';
        if (empty) miss++;
        rows.push({
          n: i, label: String(i), val: v, opts,
          ball: empty ? 'transparent' : 'url(assets/orb-' + CN[+v].toLowerCase() + '-mini.webp) center/contain no-repeat',
          cls: (empty ? 'is-empty' : '') + (empty && this.state.cerr ? ' is-miss' : ''),
          pick: (e) => { const val = e.target.value; if (i === 1) this.setState({ colour: +val }); else { const nx = (this.state.extra || ['', '']).slice(); nx[i - 2] = val; this.setState({ extra: nx, cerr: false }); } }
        });
      }
      return {
        ...d,
        selected,
        checked: selected ? 'true' : 'false',
        popular: !!d.popular,
        tag: d.id === 1 ? 'Perfect to Start' : d.id === 2 ? 'Most Popular' : 'Best Value',
        tagShow: selected,
        rows,
        errDisp: selected && this.state.cerr ? 'block' : 'none',
        borderColor: selected ? '#f3d27a' : '#6f6339',
        bg: selected ? '#16130a' : '#000',
        ringColor: selected ? '#f3d27a' : '#8a7a4a',
        cls: selected ? 'is-on' : '',
        pick: () => this.setState({ bundle: d.id, cerr: false, berr: false })
      };
    });
    const bgs = [
      'radial-gradient(circle at 70% 55%,#8a6a4a 0,#2a1a0e 70%)',
      'radial-gradient(circle at 50% 50%,#c9856a 0,#3a2216 70%)',
      'radial-gradient(circle at 60% 50%,#d9a64a 0,#1c130a 70%)',
      'linear-gradient(135deg,#1c1c1e,#0c0c0d)',
      'linear-gradient(135deg,#6b4a2c,#3a2616)'
    ];
    const labels = ['MemoryOrb on gift box', 'MemoryOrb in hand', 'MemoryOrb by the tree', 'Charging cable', 'MemoryOrb base'];
    const thumbs = bgs.map((bg, i) => ({
      bg,
      label: labels[i],
      dim: this.state.thumb === i ? 0 : 0.25,
      border: this.state.thumb === i ? '2px solid #113a00' : '1px solid #d6d3cd',
      pick: () => this.setState({ thumb: i })
    }));
    const cs = [
      { name: 'Black', color: '#16161a', photo: 'assets/orb-black.webp', life: 'assets/orb-black-life2.webp', tree: 'assets/orb-black-tree2.webp' }, { name: 'White', color: '#f1efea', photo: 'assets/orb-white.webp', life: 'assets/orb-white-life2.webp', tree: 'assets/orb-white-tree2.webp' }, { name: 'Blue', color: '#3b86d9', photo: 'assets/orb-blue.webp', life: 'assets/orb-blue-life2.webp', tree: 'assets/orb-blue-tree2.webp' }
    ];
    const cColours = cs.map((c, i) => {
      const sel = this.state.colour === i;
      return { ...c, tile: c.photo, hasPhoto: true, selected: sel, checked: sel ? 'true' : 'false', border: sel ? '#e8353a' : 'transparent', ringW: sel ? 5 : 3, ringC: sel ? '#113a00' : 'transparent', pick: () => { this.setState({ colour: i }); try { const g = document.getElementById('gallery'); if (g) g.scrollTo({ left: 0, behavior: 'smooth' }); } catch (x) {} } };
    });
    const shopItems = cs.map((c, i) => ({ name: c.name, color: c.color, photo: c.photo, tile: c.photo, hasPhoto: true, tag: i === 0 ? 'Bestseller' : (i === 1 ? 'New' : ''), pick: () => { this.setState({ colour: i, page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} } }));
    const os = [
      { name: 'Type C', desc: 'Fast & modern charging', isUsb: true, isWifi: false },
      { name: 'WiFi', desc: 'Wireless transfer of photos & videos directly to your MemoryOrb', isUsb: false, isWifi: true }
    ];
    const cOutlets = os.map((o, i) => {
      const sel = this.state.outlet === i;
      return { ...o, selected: sel, checked: sel ? 'true' : 'false', border: sel ? '#e8353a' : '#2a2d27', bg: sel ? '#1b0f10' : '#10130e', pick: () => this.setState({ outlet: i }) };
    });
    const ord = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const shipDay = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return mon[t.getMonth()] + ' ' + ord(t.getDate()); };
    const bizDay = (n) => { const t = new Date(); let k = 0; while (k < n) { t.setDate(t.getDate() + 1); const w = t.getDay(); if (w !== 0 && w !== 6) k++; } return mon[t.getMonth()] + ' ' + ord(t.getDate()); };
    const bizRange = (a, b) => { const x = bizDay(a), y = bizDay(b); return x.slice(0, 3) === y.slice(0, 3) ? x + ' - ' + y.slice(4) : x + ' - ' + y; };
    const shipRange = (a, b) => { const x = shipDay(a), y = shipDay(b); return x.slice(0, 3) === y.slice(0, 3) ? x + ' - ' + y.slice(4) : x + ' - ' + y; };
    const money = (c) => '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0');
    // cart: one line per colour (qty each); pair / collection prices apply by the total number of orbs
    const cartLines = (this.state.cart || []).filter((l) => l && l.qty > 0).slice().sort((a, b) => a.colour - b.colour);
    const cartN = cartLines.reduce((a, l) => a + l.qty, 0);
    const cartUnit = cartN >= 3 ? 6174 : (cartN === 2 ? 6304 : 6499);
    const setCart = (next) => this.setState({ cart: next, cnote: false });
    const moveColour = (from, to) => {
      if (from === to) return;
      const merged = {};
      cartLines.forEach((l) => { const c = l.colour === from ? to : l.colour; merged[c] = (merged[c] || 0) + l.qty; });
      setCart(Object.keys(merged).map((c) => ({ colour: +c, qty: merged[c] })));
    };
    const cartItems = cartLines.map((l, i) => ({
      name: cs[l.colour].name, color: cs[l.colour].color, photo: cs[l.colour].photo,
      sub: money(cartUnit) + ' each',
      qty: l.qty, price: money(cartUnit * l.qty),
      inc: () => setCart(cartLines.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x))),
      dec: () => setCart(cartLines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x))),
      remove: () => setCart(cartLines.filter((x, j) => j !== i)),
      swatches: cs.map((c, k) => ({ name: c.name, color: c.color, checked: k === l.colour ? 'true' : 'false', cur: k === l.colour ? 'on' : '', pick: () => moveColour(l.colour, k) }))
    }));
    const freeColour = cs.findIndex((c, k) => !cartLines.some((l) => l.colour === k));
    const cartAddDisp = freeColour >= 0 ? 'flex' : 'none';
    const cartAdd = () => { if (freeColour >= 0) setCart(cartLines.concat([{ colour: freeColour, qty: 1 }])); };
    const cartTotalCents = cartUnit * cartN;
    const cartCountN = cartLines.reduce((a, l) => a + l.qty, 0);
    const cents = 6499 * this.state.qty;
    const ctaTotal = '$' + Math.floor(cents / 100) + '.' + String(cents % 100).padStart(2, '0');
    const cfs = [
      { title: 'Damage Protection Guarantee', text: '' },
      { title: 'Free Shipping Today', text: '' },
      { title: '30-Day Guarantee', text: '' },
      { title: '5000+ Happy Customers', text: '' }
    ];
    const trustDefs = [
      { title: 'Damage Protection Guarantee', text: '', kicker: 'Guarantee', back: 'If your MemoryOrb ever arrives damaged, we make it right. Shop with confidence, risk-free.', main: true },
      { title: 'Free Shipping Today', text: '', kicker: 'Shipping', back: 'Free shipping today. Track it on the Tracking page.' },
      { title: '30-Day Guarantee', text: '', kicker: 'Returns', back: 'Not happy? You have 30 days to decide.' },
      { title: '5000+ Happy Customers', text: '', kicker: 'Reviews', back: '92% say it helps them relive memories vividly.' }
    ];
    const trust = trustDefs.map((d, i) => {
      const on = !!this.state.flip[i];
      return { ...d, cls: (d.main ? 'main ' : '') + (on ? 'is-flipped' : ''), pressed: on ? 'true' : 'false', backHidden: on ? 'false' : 'true', i0: i === 0, i1: i === 1, i2: i === 2, i3: i === 3, toggle: () => { const f = this.state.flip.slice(); f[i] = !f[i]; this.setState({ flip: f }); } };
    });
    const ci = this.state.cf;
    const cf = { ...cfs[ci], ic0: ci === 0, ic1: ci === 1, ic2: ci === 2, ic3: ci === 3 };
    const cfDots = cfs.map((s, i) => ({
      label: 'Slide ' + (i + 1),
      size: i === ci ? 14 : 9,
      bg: i === ci ? '#fff' : 'rgba(255,255,255,.35)',
      pick: () => this.setState({ cf: i })
    }));
    const cfPrev = () => this.setState({ cf: Math.max(0, ci - 1) });
    const cfNext = () => this.setState({ cf: Math.min(cfs.length - 1, ci + 1) });
    const cfPrevColor = ci === 0 ? 'rgba(111,208,122,.3)' : '#6fd07a';
    const cfNextColor = ci === cfs.length - 1 ? 'rgba(111,208,122,.3)' : '#6fd07a';
    return {
      heroCls: this.state.page === 'products' ? 'is-compact' : '',
      curHome: this.state.page === 'home' ? 'page' : 'false',
      curContact: this.state.page === 'contact' ? 'page' : 'false',
      curTrack: this.state.page === 'tracking' ? 'page' : 'false',
      curCart: this.state.page === 'cart' ? 'page' : 'false',
      berrDisp: this.state.berr && !this.state.bundle ? 'block' : 'none',
      statsCls: (this.state.page === 'home' || this.state.page === 'products') ? '' : 'st-sm',
      selOrder: this.state.tab === 0 ? 'true' : 'false',
      selTrack: this.state.tab === 1 ? 'true' : 'false',
      trackDisp: this.state.page === 'tracking' ? 'block' : 'none',
      trackBg: this.state.page === 'tracking' ? 'rgba(255,255,255,.07)' : 'transparent',
      trackSentDisp: 'none',
      trackContactDisp: this.state.tab === 0 ? 'block' : 'none',
      trackErr: this.state.terr, trackErrDisp: this.state.terr ? 'block' : 'none',
      trackLoadDisp: this.state.tload ? 'block' : 'none',
      trackResDisp: (this.state.tres && this.state.tres.length) ? 'block' : 'none',
      trackResults: (this.state.tres || []).map((r) => ({
        no: r.trackingNumber, carrier: r.carrier || '', text: r.text, cls: r.issue ? 'issue' : '',
        s0: r.step >= 0 ? 'on' : '', s1: r.step >= 1 ? 'on' : '', s2: r.step >= 2 ? 'on' : '', s3: r.step >= 3 ? 'on' : '', s4: r.step >= 4 ? 'on' : '',
        events: (r.events || []).map((e) => ({ text: e.text, when: e.when, where: e.where ? '· ' + e.where : '' })),
        noEvDisp: (r.events || []).length ? 'none' : 'block'
      })),
      trackLabel: 'Tracking Number',
      tabOrderLine: this.state.tab === 0 ? 'rgba(243,210,122,.7)' : 'transparent',
      tabOrderBg: this.state.tab === 0 ? 'rgba(243,210,122,.12)' : 'transparent',
      tabTrackBg: this.state.tab === 1 ? 'rgba(243,210,122,.12)' : 'transparent',
      tabTrackLine: this.state.tab === 1 ? 'rgba(243,210,122,.7)' : 'transparent',
      tabOrderColor: this.state.tab === 0 ? '#f3d27a' : 'rgba(255,255,255,.55)',
      tabTrackColor: this.state.tab === 1 ? '#f3d27a' : 'rgba(255,255,255,.55)',
      tabOrder: () => this.setState({ tab: 0, tsent: false, terr: '', tres: null }),
      tabTrack: () => this.setState({ tab: 1, tsent: false, terr: '', tres: null }),
      goTracking: (e) => { this.setState({ page: 'tracking', menu: false, tsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      sendTrack: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const form = e.target, ins = form.querySelectorAll('input');
        const v1 = (ins[0] && ins[0].value || '').trim(), v2 = (ins[1] && ins[1].value || '').trim();
        const byOrder = false;
        const msg = { not_found: 'We could not find that order. Please check the order number and your email or phone number.', not_shipped_yet: 'Your order has not shipped yet. We will email you the tracking number as soon as it does.', invalid_number: 'That tracking number does not look right. Please check it and try again.', order_lookup_disabled: 'Order lookup is not available yet. Please use the tracking number from your shipping email.', rate_limited: 'Too many tries. Please wait a minute and try again.' };
        if (!v1 || (byOrder && !v2)) { this.setState({ terr: byOrder ? 'Please enter your order number and your email or phone number.' : 'Please enter your tracking number.', tres: null }); return; }
        this.setState({ tload: true, terr: '', tres: null });
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(byOrder ? { order: v1, contact: v2 } : { trackingNumber: v1 }) })
          .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
          .then(({ ok, j }) => {
            if (ok && j && j.results) this.setState({ tload: false, tres: j.results, terr: '' });
            else this.setState({ tload: false, tres: null, terr: (!byOrder && j && j.error === 'not_found') ? 'We could not find that tracking number. Please check it and try again.' : (msg[j && j.error] || 'Tracking is temporarily unavailable. Please try again later.') });
          })
          .catch(() => this.setState({ tload: false, tres: null, terr: 'Tracking is temporarily unavailable. Please try again later.' }));
      },
      skyBg: '#0a0907',
      skyCls: ['contact', 'tracking', 'cart', 'login', 'account', 'shipping', 'privacy', 'refund', 'terms'].includes(this.state.page) ? 'sky-st' : '',
      colDisp: this.state.page === 'home' ? 'block' : 'none',
      prodDisp: this.state.page === 'products' ? 'block' : 'none',
      faqDisp: (this.state.page === 'products' || this.state.page === 'home') ? 'block' : 'none',
      prodExp: this.state.page === 'products' ? 'true' : 'false',
      prodRot: this.state.page === 'products' ? '180deg' : '0deg',
      prodBtnBg: this.state.page === 'products' ? '#f3d27a' : '#000',
      prodBtnColor: this.state.page === 'products' ? '#1b1405' : '#f3d27a',
      toggleProd: () => {
        if (this.state.page === 'home') {
          const open = !this.state.descOpen;
          // cheap path: flip the DOM directly (the next full render agrees with it) instead of re-rendering the whole page
          const quick = (isOpen, closing) => {
            this.state.descOpen = isOpen; this.state.descClosing = !!closing; this.state.menu = false;
            const w = document.querySelector('.descwrap');
            if (w) { w.style.display = isOpen ? 'block' : 'none'; w.className = 'descwrap ' + (closing ? 'dh out' : 'dh'); }
            document.querySelectorAll('.cta-stack .btn-ghost, .cta-stack .btn-ghost').forEach((b) => { const sp = b.querySelector('span'); if (sp && /description/i.test(sp.textContent)) { sp.textContent = (isOpen && !closing) ? 'Hide description' : 'View description'; b.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); } });
          };
          if (!open) {
            if (this.state.descClosing) return;
            const el = document.querySelector('.descwrap');
            const done = () => quick(false, false);
            if (!el || !el.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
            quick(true, true);
            requestAnimationFrame(() => { try { const c = document.querySelector('.cta-stack'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {} });
            const an = el.animate([
              { opacity: 1, transform: 'translate3d(0,0,0)' },
              { opacity: 0, transform: 'translate3d(0,-26px,0)' }
            ], { duration: 520, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' });
            let fin = false; const end = () => { if (fin) return; fin = true; try { an.cancel(); } catch (x) {} done(); };
            an.onfinish = end;
            return;
          }
          quick(true, false);
          if (open) requestAnimationFrame(() => requestAnimationFrame(() => { try { const h = document.querySelector('.descwrap .details-sec .sec-head'), hd = document.querySelector('header.hdr'); if (h) { const hb = hd ? hd.getBoundingClientRect().bottom : 56; window.scrollTo({ top: Math.max(0, window.scrollY + h.getBoundingClientRect().top - hb - 12), behavior: 'smooth' }); } } catch (x) {} }));
          return;
        }
        this.setState({ page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {}
      },
      descDisp: (this.state.page === 'products' || (this.state.page === 'home' && this.state.descOpen)) ? 'block' : 'none',
      descExp: (this.state.page === 'products' || (this.state.page === 'home' && this.state.descOpen)) ? 'true' : 'false',
      descCls: this.state.page === 'home' ? (this.state.descClosing ? 'dh out' : 'dh') : '',
      descLabel: (this.state.page === 'home' && this.state.descOpen && !this.state.descClosing) ? 'Hide description' : 'View description',
      showProd: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      galDisp: (this.state.page === 'home' || this.state.page === 'products') ? 'block' : 'none',
      infoDisp: this.state.page === 'home' ? 'block' : 'none',
      homeDisp: (this.state.page === 'home' || this.state.page === 'products') ? 'block' : 'none',
      shipUpd: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      privPolDisp: this.state.page === 'privacy' && !SK ? 'block' : 'none',
      refPolDisp: this.state.page === 'refund' && !SK ? 'block' : 'none',
      goBuy: (e) => { try { if (e && e.preventDefault) e.preventDefault(); const t = document.getElementById('colours'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) {} },
      openChat: (e) => { try { const f = document.querySelector('.cb-fab'); if (f) f.click(); } catch (x) {} },
      goPrivPol: (e) => { this.setState({ page: 'privacy', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      goRefPol: (e) => { this.setState({ page: 'refund', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      termsPolDisp: this.state.page === 'terms' && !SK ? 'block' : 'none',
      goTermsPol: (e) => { this.setState({ page: 'terms', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      giftDisp: (this.state.page === 'home' || this.state.page === 'products') && !SK ? 'block' : 'none',
      giftDispSk: (this.state.page === 'home' || this.state.page === 'products') && SK ? 'block' : 'none',
      shipPolDisp: this.state.page === 'shipping' && !SK ? 'block' : 'none',
      shipPolDispSk: this.state.page === 'shipping' && SK ? 'block' : 'none',
      privPolDispSk: this.state.page === 'privacy' && SK ? 'block' : 'none',
      refPolDispSk: this.state.page === 'refund' && SK ? 'block' : 'none',
      termsPolDispSk: this.state.page === 'terms' && SK ? 'block' : 'none',
      shipUpdSk: new Date().toLocaleDateString('sk-SK', { year: 'numeric', month: 'long', day: 'numeric' }),
      ftQuick: SK ? 'Rýchle odkazy' : 'Quick links',
      ftPriv: SK ? 'Zásady ochrany osobných údajov' : 'Privacy Policy',
      ftRef: SK ? 'Zásady vrátenia peňazí' : 'Refund Policy',
      ftShip: SK ? 'Zásady doručenia' : 'Shipping Policy',
      ftTerms: SK ? 'Obchodné podmienky' : 'Terms of Service',
      ftContact: SK ? 'Kontaktné informácie' : 'Contact Information',
      goShipPol: (e) => { this.setState({ page: 'shipping', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      contactDisp: this.state.page === 'contact' ? 'block' : 'none',
      sentDisp: this.state.sent ? 'block' : 'none',
      homeBg: this.state.page === 'home' ? 'rgba(255,255,255,.07)' : 'transparent',
      contactBg: this.state.page === 'contact' ? 'rgba(255,255,255,.07)' : 'transparent',
      openSpecs: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const inline = this.state.page === 'home';
        if (inline) { if (!this.state.descOpen) { const vb = [...document.querySelectorAll('.cta-stack .btn-ghost')].find((x) => /View description/i.test(x.textContent)); if (vb) vb.click(); } }
        else this.setState({ page: 'products', menu: false });
        // the description reveals itself (same animation as View description), then Product Details opens and scrolls into place
        setTimeout(() => {
          try {
            const sec = document.querySelector('.details-sec');
            const rows = sec ? [...sec.querySelectorAll('details.ac')] : [];
            const target = rows.find((d) => { const t = d.querySelector('summary span'); return t && /Product Details/.test(t.textContent); });
            if (!target) return;
            const sm = target.querySelector(':scope > summary');
            if (!target.open) sm.click();
            setTimeout(() => { const r = sm.getBoundingClientRect(); window.scrollTo({ top: window.scrollY + r.top - 90, behavior: 'smooth' }); }, 120);
          } catch (x) {}
        }, inline ? 1000 : 650);
      },
      faqCls: this.state.faqN === 1 ? 'f1' : this.state.faqN === 2 ? 'f2' : 'f3',
      faqMoreBtn: this.state.faqN < 3 ? 'inline-flex' : 'none',
      faqLessBtn: this.state.faqN === 3 ? 'inline-flex' : 'none',
      faqMoreLabel: this.state.faqN === 1 ? 'Show 5 more questions' : 'Show more',
      faqMore: () => {
        if (this._lessBusy) { this._lessGen = (this._lessGen || 0) + 1; this._lessBusy = false; try { if (this._lessAnim) { this._lessAnim.cancel(); this._lessAnim = null; } const l1 = document.querySelector('.faq .ac-list'); if (l1) l1.style.overflow = ''; } catch (x) {} document.querySelectorAll('.faq details.ac.out').forEach((d) => { d.classList.remove('out'); d.style.transitionDelay = ''; d.style.transform = ''; }); }
        const shown = [...document.querySelectorAll('.faq details.ac')].filter((d) => d.offsetParent).length;
        this.setState({ faqN: Math.min(3, this.state.faqN + 1) });
        setTimeout(() => {
          const fresh = [...document.querySelectorAll('.faq details.ac')].slice(shown).filter((d) => d.offsetParent);
          if (!fresh.length) return;
          const reduceM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          fresh.forEach((d) => { d.classList.remove('in'); d.style.transitionDelay = ''; });
          void document.body.offsetHeight;
          fresh.forEach((d, k) => setTimeout(() => d.classList.add('in'), reduceM ? 0 : 140 + k * 120));
          const mb = [...document.querySelectorAll('.faq .faq-more button')].find((x) => x.offsetParent);
          const y = mb ? mb.getBoundingClientRect().bottom + window.scrollY - (window.innerHeight - 36) : fresh[0].getBoundingClientRect().top + window.scrollY - 110;
          window.scrollTo({ top: y, behavior: reduceM ? 'auto' : 'smooth' });
        }, 40);
      },
      faqLess: () => {
        if (this._lessBusy) return;
        const f = document.querySelector('section.faq');
        const frame = f && f.querySelector('.faq-frame');
        const more = f && f.querySelector('.faq-more');
        const list = f && f.querySelector('.ac-list');
        const reduceM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const all = () => [...document.querySelectorAll('.faq details.ac')];
        const swap = () => {
          all().forEach((d, k) => { if (k >= 5) { d.classList.remove('in', 'out'); d.__w = 0; d.open = false; } d.style.transitionDelay = ''; d.style.transform = ''; });
          this.setState({ faqN: 1 });
        };
        if (!f || !frame || reduceM || !frame.animate) {
          swap();
          if (f) { const l = f.querySelector('.ac-list'); window.scrollTo({ top: Math.max(0, (l || f).getBoundingClientRect().top + window.scrollY - (l ? 196 : 70)), behavior: 'instant' }); }
          return;
        }
        this._lessBusy = true;
        const gen = this._lessGen = (this._lessGen || 0) + 1;
        const fade = [frame, more].filter(Boolean);
        // dissolve: the long list melts away where it is ...
        const outs = fade.map((el) => el.animate([{ opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }, { opacity: 0, transform: 'translate3d(0,14px,0) scale(.985)' }], { duration: 380, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }));
        setTimeout(() => {
          if (this._lessGen !== gen) return;
          // ... the short list is set up out of sight and the page is put in place ...
          swap();
          requestAnimationFrame(() => {
            const l = f.querySelector('.ac-list');
            const target = Math.max(0, (l || f).getBoundingClientRect().top + window.scrollY - (l ? 196 : 70));
            window.scrollTo({ top: target, behavior: 'instant' });
            // ... and rises into view
            const kids = [...f.querySelectorAll('.faq-frame, .faq-more')];
            kids.forEach((el) => { el.getAnimations().forEach((a) => a.cancel()); });
            kids.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translate3d(0,-18px,0) scale(.985)' }, { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }], { duration: 620, delay: k * 90, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'backwards' }));
            const ff = f.querySelector('.faq-frame');
            if (ff && !reduceM) {
              const T0 = performance.now() + 150, DUR = 1400, ez = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
              const st = (now) => { const k2 = Math.min(1, Math.max(0, (now - T0) / DUR)); ff.style.setProperty('--pf', ez(k2).toFixed(3)); if (k2 < 1) requestAnimationFrame(st); };
              ff.style.setProperty('--pf', '0'); requestAnimationFrame(st);
            }
            this._lessBusy = false;
          });
        }, 400);
      },
      goColours: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'home', menu: false }); setTimeout(() => { try { const t = document.getElementById('colours'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) {} }, 60); },
      goHome: (e) => { this.setState({ page: 'home', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      goContact: (e) => { this.setState({ page: 'contact', menu: false, sent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      sendContact: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ sent: true }); },
      menuOpen: this.state.menu, openMenu: () => this.setState({ menu: true }), closeMenu: () => this.setState({ menu: false }),
      pfv: this._pf || '0',
      cmpCls: 'c' + this.state.cmp,
      cmpPick: (e) => {
        try {
          const box = document.querySelector('.compare').getBoundingClientRect();
          const w = box.width, x = e.clientX - box.left, wide = window.innerWidth >= 640;
          const yw = wide ? 170 : 108, nw = wide ? 120 : 74;
          this.setState({ cmp: x < w - yw - nw ? 0 : (x < w - nw ? 1 : 2) });
        } catch (err) {}
      },
      curShop: this.state.page === 'products' ? 'page' : 'false',
      curLogin: (this.state.page === 'login' || this.state.page === 'account') ? 'page' : 'false',
      shopDisp: this.state.page === 'shop' ? 'block' : 'none',
      loginDisp: this.state.page === 'login' ? 'block' : 'none',
      accountDisp: this.state.page === 'account' ? 'block' : 'none',
      shipD1: shipDay(0), shipD2: bizRange(1, 3), shipD3: shipRange(10, 12),
      cartDisp: this.state.page === 'cart' ? 'block' : 'none',
      cartItems, cartAdd, cartAddDisp, cartSub: money(cartTotalCents), cartCount: cartCountN, cartBadgeDisp: cartCountN > 0 ? 'grid' : 'none',
      cartEmptyDisp: cartLines.length ? 'none' : 'flex', cartFullDisp: cartLines.length ? 'block' : 'none',
      cartNoteDisp: this.state.cnote ? 'flex' : 'none',
      cartCheckout: () => {
        const items = [];
        for (const l of cartLines) {
          const id = SHOPIFY_VARIANTS[cs[l.colour].name];
          if (!id) { this.setState({ cnote: true }); return; }
          items.push(id + ':' + l.qty);
        }
        if (items.length) window.location.href = 'https://' + SHOPIFY_DOMAIN + '/cart/' + items.join(',') + '?checkout';
      },
      goCart: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'cart', menu: false, cnote: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      addToCart: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const totals = [6499, 12608, 18522]; const n = this.state.bundle;
        if (!n) { this.setState({ berr: true }); setTimeout(() => { try { const m = document.getElementById('bundles'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {} }, 50); return; }
        const extra = this.state.extra || ['', ''];
        const colours = [this.state.colour];
        for (let k = 0; k < n - 1; k++) colours.push(extra[k] === '' ? '' : +extra[k]);
        if (colours.some((c) => c === '')) {
          this.setState({ cerr: true });
          setTimeout(() => { try { const m = document.querySelector('.bundle-row.is-miss'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {} }, 50);
          return;
        }
        const merged = {};
        (this.state.cart || []).forEach((l) => { merged[l.colour] = (merged[l.colour] || 0) + l.qty; });
        colours.forEach((c) => { merged[c] = (merged[c] || 0) + 1; });
        const next = Object.keys(merged).map((c) => ({ colour: +c, qty: merged[c] }));
        this.setState({ cart: next, page: 'cart', cnote: false }); try { window.scrollTo(0, 0); } catch (x) {}
      },
      userName: this.state.user ? this.state.user.name : '', userInit: this.state.user ? this.state.user.name.charAt(0).toUpperCase() : '', userMail: this.state.user ? this.state.user.mail : '',
      noop: (e) => { try { e.preventDefault(); } catch (x) {} },
      logout: (e) => { this.setState({ user: null, page: 'login', lt: 0, lsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      goShop: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'home', menu: false });
        // jump to the "Choose your MemoryOrb" (colours) section once the page has switched
        const toColours = () => { try { const el = document.getElementById('colours'); if (el && el.offsetParent !== null) { const hd = document.querySelector('header.hdr'); const off = (hd ? hd.offsetHeight : 0) + 14; window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + (window.scrollY || 0) - off)); return true; } } catch (x) {} return false; };
        let n = 0; const tryScroll = () => { if (toColours() || ++n > 12) return; setTimeout(tryScroll, 80); };
        try { window.scrollTo(0, 0); } catch (x) {} setTimeout(tryScroll, 60); },
      goLogin: (e) => { this.setState({ page: this.state.user ? 'account' : 'login', menu: false, lsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      lgNameDisp0: this.state.lt === 0 ? 'block' : 'none',
      lgIn: this.state.lt === 0 ? 'true' : 'false', lgUp: this.state.lt === 1 ? 'true' : 'false',
      lgTabIn: () => this.setState({ lt: 0, lsent: false }), lgTabUp: () => this.setState({ lt: 1, lsent: false }),
      lgNameDisp: this.state.lt === 1 ? 'block' : 'none', lgForgotDisp: this.state.lt === 0 ? 'inline-block' : 'none',
      lgBtn: this.state.lt === 0 ? 'Log in' : 'Create account', lgSentDisp: this.state.lsent ? 'flex' : 'none',
      sendLogin: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const val = (id) => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
        const mail = val('l-mail') || 'you@example.com';
        const nm = (this.state.lt === 1 ? val('l-name') : '') || mail.split('@')[0];
        this.setState({ user: { name: nm.charAt(0).toUpperCase() + nm.slice(1), mail }, page: 'account', lsent: false });
        try { window.scrollTo(0, 0); } catch (x) {}
      },
      shopItems,
      trust, bundles, thumbs, cColours, cDot: (() => { const d = { Black: ['#7a7a85', '#25252b'], White: ['#ffffff', '#d8d5ce'], Blue: ['#6c9dff', '#1f50c4'] }[cs[this.state.colour].name]; return 'radial-gradient(circle at 34% 28%,' + d[0] + ',' + d[1] + ' 72%)'; })(), heroPhoto: cs[this.state.colour].photo, lifePhoto: cs[this.state.colour].life, treePhoto: cs[this.state.colour].tree, cName: cs[this.state.colour].name, cColor: cs[this.state.colour].color, cOutlets, cf, cfDots, cfPrev, cfNext, cfPrevColor, cfNextColor, cQty: this.state.qty, ctaTotal,
      cInc: () => this.setState({ qty: Math.min(9, this.state.qty + 1) }),
      cDec: () => this.setState({ qty: Math.max(1, this.state.qty - 1) })
    };
  }
}

DC.mount(Component);
