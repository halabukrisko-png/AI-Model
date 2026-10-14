
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
    // gallery indicator (three bars, active one is longer and brighter)
    try {
      const gal = document.getElementById('gallery');
      const dots = document.querySelector('.gal-dots');
      if (gal && dots) {
        const upd = () => {
          const sl = gal.querySelectorAll('.slide');
          if (!sl.length) return;
          const step = sl[1] ? sl[1].offsetLeft - sl[0].offsetLeft : gal.clientWidth;
          const idx = Math.max(0, Math.min(sl.length - 1, Math.round(gal.scrollLeft / (step || 1))));
          for (let i = 0; i < 3; i++) dots.style.setProperty('--o' + i, i === idx ? '1' : '.4');
        };
        gal.addEventListener('scroll', upd, { passive: true });
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
          if (!open) {
            if (this.state.descClosing) return;
            const el = document.querySelector('.descwrap');
            const done = () => this.setState({ descOpen: false, descClosing: false });
            if (!el || !el.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
            this.setState({ descClosing: true, menu: false });
            try { const c = document.querySelector('.cta-stack'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {}
            const h = el.getBoundingClientRect().height;
            const an = el.animate([
              { height: h + 'px', opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
              { opacity: .6, offset: .5, filter: 'blur(2px)' },
              { height: '0px', opacity: 0, transform: 'translateY(-18px)', filter: 'blur(8px)' }
            ], { duration: 750, easing: 'cubic-bezier(.55,.05,.25,1)', fill: 'forwards' });
            let fin = false; const end = () => { if (fin) return; fin = true; try { an.cancel(); } catch (x) {} done(); };
            an.onfinish = end;
            return;
          }
          this.setState({ descOpen: open, menu: false });
          if (open) setTimeout(() => { try { const t = document.querySelector('.descwrap .details-sec'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) {} }, 80);
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
        this.setState({ page: 'products', menu: false });
        setTimeout(() => {
          try {
            const sec = document.querySelector('.details-sec');
            const rows = sec ? sec.querySelectorAll('details.ac') : [];
            let target = null;
            rows.forEach((d) => { const t = d.querySelector('summary span'); if (t && /Product Details/.test(t.textContent)) target = d; });
            if (target) { target.open = true; target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          } catch (x) {}
        }, 80);
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
