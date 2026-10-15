
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { prod: false, page: 'home', sent: false, tab: 0, tsent: false, bundle: 2, thumb: 0, colour: 0, outlet: 0, qty: 1, cf: 0, menu: false, flip: [false, false, false, false], cmp: 1, lt: 0, lsent: false, user: null, cart: [], cnote: false, faqN: 1, descOpen: false, extra: ['', ''], cerr: false };
  }
  componentDidMount() {
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
    // reviews (tablet): endless carousel - there is always a neighbour card on both sides
    try {
      const qt = document.querySelector('.q-track');
      const tab = () => !!(window.matchMedia && window.matchMedia('(min-width:640px) and (max-width:1099px)').matches);
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
        if (target) all().forEach((x) => x.classList.toggle('is-on', x === target));
        qt.style.scrollBehavior = 'auto'; qt.style.scrollSnapType = 'none';
        qt.scrollLeft = left;
        requestAnimationFrame(() => requestAnimationFrame(() => { qt.style.scrollBehavior = ''; qt.style.scrollSnapType = ''; qt.classList.remove('nj'); }));
      };
      const mark = () => {
        const cs = all(); const b = nearest();
        cs.forEach((c, i) => c.classList.toggle('is-on', i === b));
      };
      const ensure = () => {
        const r = real();
        if (r.length < 2) return;
        if (!qt.querySelector('.q-clone')) {
          const mk = (src) => { const c = src.cloneNode(true); c.classList.remove('rv', 'rv-s'); c.classList.add('q-clone', 'in'); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('id'); return c; };
          qt.insertBefore(mk(r[r.length - 1]), r[0]);
          qt.insertBefore(mk(r[0]), r[r.length - 1].nextSibling);
          if (tab()) jump(centerOf(real()[0]));
        }
      };
      let settle;
      const onSettle = () => {
        if (!tab()) return;
        const cs = all(); const n = cs.length - 2; const b = nearest();
        if (b === 0) jump(centerOf(cs[n]), cs[n]);
        else if (b === n + 1) jump(centerOf(cs[1]), cs[1]);
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
        const cs = all(); if (cs.length < 3) return;
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
        const tab = () => !!(window.matchMedia && window.matchMedia('(min-width:640px) and (max-width:1099px)').matches);
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
          if (r.length < 2 || cl.length < 2) return;
          [[cl[0], r[r.length - 1]], [cl[1], r[0]]].forEach(([c, src]) => {
            const a = c.querySelector('img'), b = src.querySelector('img');
            if (a && b && a.getAttribute('src') !== b.getAttribute('src')) { a.setAttribute('src', b.getAttribute('src')); a.alt = b.alt; }
            const ca = c.querySelector('.gcap'), cb = src.querySelector('.gcap');
            if (ca && cb && ca.textContent !== cb.textContent) ca.textContent = cb.textContent;
          });
        };
        const ensure = () => {
          const r = real();
          if (r.length < 2) return;
          if (!gal.querySelector('.g-clone')) {
            const mk = (src) => { const c = src.cloneNode(true); c.classList.remove('is-on'); c.classList.add('g-clone'); c.setAttribute('aria-hidden', 'true'); return c; };
            gal.insertBefore(mk(r[r.length - 1]), r[0]);
            gal.insertBefore(mk(r[0]), r[r.length - 1].nextSibling);
            if (tab()) jump(centerOf(real()[0]));
          }
          sync();
        };
        const upd = () => {
          const cs = vis(); if (!cs.length) return;
          const n = real().length; let idx;
          if (tab() && gal.querySelector('.g-clone')) {
            const b = nearest(); idx = b === 0 ? n - 1 : (b === n + 1 ? 0 : b - 1);
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
          const cs = vis(); const n = cs.length - 2; if (n < 2) return; const b = nearest();
          if (b === 0) jump(centerOf(cs[n]), cs[n]); else if (b === n + 1) jump(centerOf(cs[1]), cs[1]);
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
          const cs = vis(); if (cs.length < 3) return;
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
      const ic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
      const fab = mk('button', 'cb-fab', ic); fab.setAttribute('aria-label', 'Open chat');
      const win = mk('div', 'cb-win'); win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', 'MemoryOrb assistant');
      win.innerHTML = '<div class="cb-hd"><span class="cb-av">' + ic + '</span><span><b>MemoryOrb Assistant</b><small>Ask about orbs, shipping and returns</small></span><button type="button" class="cb-x" aria-label="Close chat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="cb-body"></div><div class="cb-chips"></div><form class="cb-form"><input class="cb-in" type="text" placeholder="Type your question..." aria-label="Your question" autocomplete="off"><button class="cb-send" type="submit" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
      document.body.appendChild(fab); document.body.appendChild(win);
      const body = win.querySelector('.cb-body'), chips = win.querySelector('.cb-chips'), inp = win.querySelector('.cb-in');
      const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const add = (txt, who, html) => { const m = mk('div', 'cb-m ' + who, html ? txt : esc(txt)); body.appendChild(m); body.scrollTop = body.scrollHeight; return m; };
      const go = (page) => { this.setState({ page, menu: false, sent: false, tsent: false }); try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (x) {} win.classList.remove('open'); fab.classList.remove('hide'); };
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
      const intents = [
        { re: /\b(hi|hello|hey|ahoj|good (morning|evening))\b/i, a: 'Hello! I can help with questions about your MemoryOrb, shipping and returns. What would you like to know?' },
        { re: /\b(price|cost|how much|\$|pay|discount|sale|cheap)\b/i, a: 'A single MemoryOrb is $59.99. Pair is $116.38 (save $55) and the Collection of three is $170.97 (save $85). Shipping is free.' },
        { re: /\b(colou?r|black|white|blue|green|red|grey|gray)\b/i, a: 'MemoryOrb comes in six colours: Black, White, Blue, Green, Red and Grey. You can pick a different colour for every orb in a bundle.' },
        { re: /\b(how long|when|how fast|days|time)\b.*\b(ship|deliver|arriv|get here|come)\w*|\b(ship|deliver)\w*\b.*\b(take|long|time|days)\b/i, a: 'We ship worldwide with free shipping. Your estimated delivery dates are shown at checkout and in your order confirmation.' },
        { re: /\b(europe|usa|america|canada|australia|asia|country|countries|international|abroad|overseas)\b/i, a: 'Yes, we ship worldwide, and shipping is free. Delivery times and any local fees are shown at checkout.' },
        { re: /\b(track|where is my|order status|parcel|package)\b/i, a: 'You can follow your order on the <a data-go="tracking">Tracking page</a>.', html: true },
        { re: /\b(human|agent|person|support|contact|email|phone|call|help desk|complain)\b/i, a: 'Our support team is happy to help. Send us a message on the <a data-go="contact">Contact page</a> and we usually reply within one hour.', html: true },
        { re: /\b(thanks|thank you|thx|dakujem|ďakujem)\b/i, a: 'You are welcome! Anything else I can help with?' }
      ];
      const answer = (q) => {
        for (const it of intents) if (it.re.test(q)) return it;
        const qt = tok(q); if (!qt.length) return null;
        const syn = { sound: 'audio', speaker: 'audio', music: 'audio', volume: 'audio', picture: 'photo', image: 'photo', pic: 'photo', video: 'video', charge: 'battery', power: 'battery', deliver: 'ship', delivery: 'ship', post: 'ship', refund: 'return', broken: 'damaged', defective: 'damaged', present: 'gift', store: 'storage', memory: 'storage', space: 'storage', gb: 'storage', format: 'format', file: 'format', setup: 'set', usb: 'upload', wifi: 'upload', transfer: 'upload', copy: 'upload', change: 'replace', delete: 'replace', mobile: 'phone' };
        const qs = qt.map((w) => syn[w] || w);
        let best = null, bs = 0;
        build().forEach((e) => { let sc = 0, hit = 0; qs.forEach((w) => { if (e.qt.includes(w)) { sc += 3; hit++; } else if (e.t.includes(w)) sc += 1; }); if (hit && sc > bs) { bs = sc; best = e; } });
        return best && bs >= 3 ? { a: best.a } : null;
      };
      const reply = (q) => {
        const dots = mk('div', 'cb-dots', '<i></i><i></i><i></i>'); body.appendChild(dots); body.scrollTop = body.scrollHeight;
        const r = answer(q);
        setTimeout(() => {
          dots.remove();
          if (r) add(r.a, 'bot', !!r.html);
          else add('I am not sure about that one. You can reach our team on the <a data-go="contact">Contact page</a>, or pick a topic below.', 'bot', true);
        }, 650 + Math.min(700, (r ? r.a.length : 40) * 4));
      };
      const ask = (q) => { q = q.trim(); if (!q) return; add(q, 'me'); reply(q); };
      const topics = ['How much storage does it have?', 'Do you offer worldwide shipping?', 'What if my MemoryOrb arrives damaged?', 'How long does the battery last?'];
      topics.forEach((t) => { const c = mk('button', 'cb-chip', esc(t)); c.type = 'button'; c.addEventListener('click', () => ask(t)); chips.appendChild(c); });
      body.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[data-go]'); if (a) { e.preventDefault(); go(a.getAttribute('data-go')); } });
      win.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value; inp.value = ''; ask(v); });
      let greeted = false;
      const open = () => {
        win.classList.add('open'); fab.classList.add('hide');
        if (!greeted) { greeted = true; setTimeout(() => add('Hi! I am the MemoryOrb assistant. Ask me anything about the orb, shipping or returns.', 'bot'), 250); }
        setTimeout(() => { try { if (window.innerWidth > 700) inp.focus(); } catch (x) {} }, 400);
      };
      const close = () => { win.classList.remove('open'); fab.classList.remove('hide'); };
      fab.addEventListener('click', open);
      win.querySelector('.cb-x').addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && win.classList.contains('open')) close(); });
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
        const io = new IntersectionObserver((es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = e.target;
          t.classList.add('in');
          if (t.classList.contains('stat')) document.querySelectorAll('.stat').forEach((x) => x.classList.add('in'));
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
    const defs = [
      { id: 1, name: 'Single', save: 'Save $25', price: '$59.99', was: '$85.70' },
      { id: 2, name: 'Pair', save: 'Save $55', price: '$116.38', was: '$171.40', popular: true },
      { id: 3, name: 'Collection', save: 'Save $85', price: '$170.97', was: '$257.10' }
    ];
    const bundles = defs.map((d) => {
      const selected = this.state.bundle === d.id;
      const rows = [];
      const CN = ['Black', 'White', 'Blue', 'Green', 'Red', 'Grey'];
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
        pick: () => this.setState({ bundle: d.id, cerr: false })
      };
    });
    const bgs = [
      'radial-gradient(circle at 70% 55%,#8a6a4a 0,#2a1a0e 70%)',
      'radial-gradient(circle at 50% 50%,#c9856a 0,#3a2216 70%)',
      'radial-gradient(circle at 60% 50%,#d9a64a 0,#1c130a 70%)',
      'linear-gradient(135deg,#1c1c1e,#0c0c0d)',
      'linear-gradient(135deg,#6b4a2c,#3a2616)'
    ];
    const labels = ['Orb on gift box', 'Orb in hand', 'Orb by the tree', 'Charging cable', 'Orb base'];
    const thumbs = bgs.map((bg, i) => ({
      bg,
      label: labels[i],
      dim: this.state.thumb === i ? 0 : 0.25,
      border: this.state.thumb === i ? '2px solid #113a00' : '1px solid #d6d3cd',
      pick: () => this.setState({ thumb: i })
    }));
    const cs = [
      { name: 'Black', color: '#16161a', photo: 'assets/orb-black.webp', life: 'assets/orb-black-life.webp', tree: 'assets/orb-black-tree.webp' }, { name: 'White', color: '#f1efea', photo: 'assets/orb-white.webp', life: 'assets/orb-white-life.webp', tree: 'assets/orb-white-tree.webp' }, { name: 'Blue', color: '#3b86d9', photo: 'assets/orb-blue.webp', life: 'assets/orb-blue-life.webp', tree: 'assets/orb-blue-tree.webp' },
      { name: 'Green', color: '#3f9a5a', photo: 'assets/orb-green.webp', life: 'assets/orb-green-life.webp', tree: 'assets/orb-green-tree.webp' }, { name: 'Red', color: '#d93a3a', photo: 'assets/orb-red.webp', life: 'assets/orb-red-life.webp', tree: 'assets/orb-red-tree.webp' }, { name: 'Grey', color: '#8a8a8f', photo: 'assets/orb-grey.webp', life: 'assets/orb-grey-life.webp', tree: 'assets/orb-grey-tree.webp' }
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
    const cartLines = this.state.cart;
    const cartItems = cartLines.map((l, i) => ({
      name: (l.colours || [l.colour]).map((c) => cs[c].name).join(' + '), color: cs[l.colour].color,
      sub: (l.n === 1 ? 'Single' : l.n === 2 ? 'Pair' : 'Collection') + ' · ' + l.n + (l.n === 1 ? ' orb' : ' orbs'),
      qty: l.qty, price: money(Math.round(l.unit * l.qty)),
      inc: () => this.setState({ cart: cartLines.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x)) }),
      dec: () => this.setState({ cart: cartLines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x)) }),
      remove: () => this.setState({ cart: cartLines.filter((x, j) => j !== i) })
    }));
    const cartTotalCents = cartLines.reduce((a, l) => a + Math.round(l.unit * l.qty), 0);
    const cartCountN = cartLines.reduce((a, l) => a + l.qty, 0);
    const cents = 5999 * this.state.qty;
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
      statsCls: (this.state.page === 'home' || this.state.page === 'products') ? '' : 'st-sm',
      selOrder: this.state.tab === 0 ? 'true' : 'false',
      selTrack: this.state.tab === 1 ? 'true' : 'false',
      trackDisp: this.state.page === 'tracking' ? 'block' : 'none',
      trackBg: this.state.page === 'tracking' ? 'rgba(255,255,255,.07)' : 'transparent',
      trackSentDisp: this.state.tsent ? 'block' : 'none',
      trackLabel: this.state.tab === 0 ? 'Order Number' : 'Tracking Number',
      tabOrderLine: this.state.tab === 0 ? 'rgba(243,210,122,.7)' : 'transparent',
      tabOrderBg: this.state.tab === 0 ? 'rgba(243,210,122,.12)' : 'transparent',
      tabTrackBg: this.state.tab === 1 ? 'rgba(243,210,122,.12)' : 'transparent',
      tabTrackLine: this.state.tab === 1 ? 'rgba(243,210,122,.7)' : 'transparent',
      tabOrderColor: this.state.tab === 0 ? '#f3d27a' : 'rgba(255,255,255,.55)',
      tabTrackColor: this.state.tab === 1 ? '#f3d27a' : 'rgba(255,255,255,.55)',
      tabOrder: () => this.setState({ tab: 0, tsent: false }),
      tabTrack: () => this.setState({ tab: 1, tsent: false }),
      goTracking: (e) => { this.setState({ page: 'tracking', menu: false, tsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      sendTrack: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ tsent: true }); },
      skyBg: '#0a0907',
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
          if (open) requestAnimationFrame(() => requestAnimationFrame(() => { try { const t = document.querySelector('.descwrap .details-sec'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) {} }));
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
      cartItems, cartSub: money(cartTotalCents), cartCount: cartCountN, cartBadgeDisp: cartCountN > 0 ? 'grid' : 'none',
      cartEmptyDisp: cartLines.length ? 'none' : 'flex', cartFullDisp: cartLines.length ? 'block' : 'none',
      cartNoteDisp: this.state.cnote ? 'flex' : 'none',
      cartCheckout: () => this.setState({ cnote: true }),
      goCart: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'cart', menu: false, cnote: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      addToCart: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const totals = [5999, 11638, 17097]; const n = this.state.bundle;
        const extra = this.state.extra || ['', ''];
        const colours = [this.state.colour];
        for (let k = 0; k < n - 1; k++) colours.push(extra[k] === '' ? '' : +extra[k]);
        if (colours.some((c) => c === '')) {
          this.setState({ cerr: true });
          setTimeout(() => { try { const m = document.querySelector('.bundle-row.is-miss'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {} }, 50);
          return;
        }
        const unit = totals[n - 1] / n;
        const key = colours.join(',');
        const ex = cartLines.findIndex((l) => (l.colours || [l.colour]).join(',') === key && l.n === n);
        const next = ex >= 0 ? cartLines.map((l, j) => (j === ex ? { ...l, qty: l.qty + 1 } : l)) : cartLines.concat([{ colour: this.state.colour, colours, n, qty: 1, unit: unit * n }]);
        this.setState({ cart: next, page: 'cart', cnote: false }); try { window.scrollTo(0, 0); } catch (x) {}
      },
      userName: this.state.user ? this.state.user.name : '', userInit: this.state.user ? this.state.user.name.charAt(0).toUpperCase() : '', userMail: this.state.user ? this.state.user.mail : '',
      noop: (e) => { try { e.preventDefault(); } catch (x) {} },
      logout: (e) => { this.setState({ user: null, page: 'login', lt: 0, lsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      goShop: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
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
      trust, bundles, thumbs, cColours, cDot: (() => { const d = { Black: ['#7a7a85', '#25252b'], White: ['#ffffff', '#d8d5ce'], Blue: ['#6c9dff', '#1f50c4'], Green: ['#62d28c', '#237c47'], Red: ['#ff6e6e', '#b11f24'], Grey: ['#cbcbd0', '#6c6c74'] }[cs[this.state.colour].name]; return 'radial-gradient(circle at 34% 28%,' + d[0] + ',' + d[1] + ' 72%)'; })(), heroPhoto: cs[this.state.colour].photo, lifePhoto: cs[this.state.colour].life, treePhoto: cs[this.state.colour].tree, cName: cs[this.state.colour].name, cColor: cs[this.state.colour].color, cOutlets, cf, cfDots, cfPrev, cfNext, cfPrevColor, cfNextColor, cQty: this.state.qty, ctaTotal,
      cInc: () => this.setState({ qty: Math.min(9, this.state.qty + 1) }),
      cDec: () => this.setState({ qty: Math.max(1, this.state.qty - 1) })
    };
  }
}

DC.mount(Component);
