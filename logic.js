
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { prod: false, page: 'home', sent: false, tab: 0, tsent: false, bundle: 2, thumb: 0, colour: 0, outlet: 0, qty: 1, cf: 0, menu: false, flip: [false, false, false, false], cmp: 1, lt: 0, lsent: false, user: null, cart: [], cnote: false };
  }
  componentDidMount() {
    const root = document.documentElement;
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
      { id: 1, name: 'Adopt 1', save: 'Save $25', price: '$59.99', was: '$85.70' },
      { id: 2, name: 'Adopt 2', save: 'Save $55', price: '$116.38', was: '$171.40', popular: true },
      { id: 3, name: 'Adopt 3', save: 'Save $85', price: '$170.97', was: '$257.10' }
    ];
    const bundles = defs.map((d) => {
      const selected = this.state.bundle === d.id;
      const rows = [];
      for (let i = 1; i <= d.id; i++) rows.push({ n: i });
      return {
        ...d,
        selected,
        checked: selected ? 'true' : 'false',
        popular: !!d.popular,
        rows,
        borderColor: selected ? '#f3d27a' : '#6f6339',
        bg: selected ? '#16130a' : '#000',
        ringColor: selected ? '#f3d27a' : '#8a7a4a',
        cls: selected ? 'is-on' : '',
        pick: () => this.setState({ bundle: d.id })
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
      { name: 'Black', color: '#16161a' }, { name: 'White', color: '#f1efea' }, { name: 'Blue', color: '#3b86d9' },
      { name: 'Pink', color: '#e58aa8' }, { name: 'Orange', color: '#f08a2a' }
    ];
    const cColours = cs.map((c, i) => {
      const sel = this.state.colour === i;
      return { ...c, hasPhoto: c.name === 'Black', selected: sel, checked: sel ? 'true' : 'false', border: sel ? '#e8353a' : 'transparent', ringW: sel ? 5 : 3, ringC: sel ? '#113a00' : 'transparent', pick: () => this.setState({ colour: i }) };
    });
    const shopItems = cs.map((c, i) => ({ name: c.name, color: c.color, hasPhoto: c.name === 'Black', tag: i === 0 ? 'Bestseller' : (i === 1 ? 'New' : ''), pick: () => { this.setState({ colour: i, page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} } }));
    const os = [
      { name: 'Type C', desc: 'Fast & modern charging', isUsb: true, isWifi: false },
      { name: 'WiFi', desc: 'Wireless transfer of photos & videos directly to your MemoryOrb', isUsb: false, isWifi: true }
    ];
    const cOutlets = os.map((o, i) => {
      const sel = this.state.outlet === i;
      return { ...o, selected: sel, checked: sel ? 'true' : 'false', border: sel ? '#e8353a' : '#2a2d27', bg: sel ? '#1b0f10' : '#10130e', pick: () => this.setState({ outlet: i }) };
    });
    const money = (c) => '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0');
    const cartLines = this.state.cart;
    const cartItems = cartLines.map((l, i) => ({
      name: cs[l.colour].name, color: cs[l.colour].color,
      sub: l.n === 1 ? 'Adopt 1' : 'Adopt ' + l.n + ' bundle',
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
      skyBg: this.state.page === 'home' ? '#100e0b' : '#0a0907',
      colDisp: (this.state.page === 'home' || this.state.page === 'products') ? 'block' : 'none',
      prodDisp: this.state.page === 'products' ? 'block' : 'none',
      prodExp: this.state.page === 'products' ? 'true' : 'false',
      prodRot: this.state.page === 'products' ? '180deg' : '0deg',
      prodBtnBg: this.state.page === 'products' ? '#f3d27a' : '#000',
      prodBtnColor: this.state.page === 'products' ? '#1b1405' : '#f3d27a',
      toggleProd: () => { this.setState({ page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      showProd: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'products', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      galDisp: (this.state.page === 'home' || this.state.page === 'products') ? 'block' : 'none',
      infoDisp: this.state.page === 'home' ? 'block' : 'none',
      homeDisp: (this.state.page === 'home' || this.state.page === 'products') ? 'block' : 'none',
      contactDisp: this.state.page === 'contact' ? 'block' : 'none',
      sentDisp: this.state.sent ? 'block' : 'none',
      homeBg: this.state.page === 'home' ? 'rgba(255,255,255,.07)' : 'transparent',
      contactBg: this.state.page === 'contact' ? 'rgba(255,255,255,.07)' : 'transparent',
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
      curShop: this.state.page === 'shop' ? 'page' : 'false',
      curLogin: (this.state.page === 'login' || this.state.page === 'account') ? 'page' : 'false',
      shopDisp: this.state.page === 'shop' ? 'block' : 'none',
      loginDisp: this.state.page === 'login' ? 'block' : 'none',
      accountDisp: this.state.page === 'account' ? 'block' : 'none',
      cartDisp: this.state.page === 'cart' ? 'block' : 'none',
      cartItems, cartSub: money(cartTotalCents), cartCount: cartCountN, cartBadgeDisp: cartCountN > 0 ? 'grid' : 'none',
      cartEmptyDisp: cartLines.length ? 'none' : 'flex', cartFullDisp: cartLines.length ? 'block' : 'none',
      cartNoteDisp: this.state.cnote ? 'flex' : 'none',
      cartCheckout: () => this.setState({ cnote: true }),
      goCart: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ page: 'cart', menu: false, cnote: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      addToCart: (e) => {
        try { e.preventDefault(); } catch (x) {}
        const totals = [5999, 11638, 17097]; const n = this.state.bundle;
        const unit = totals[n - 1] / n;
        const ex = cartLines.findIndex((l) => l.colour === this.state.colour && l.n === n);
        const next = ex >= 0 ? cartLines.map((l, j) => (j === ex ? { ...l, qty: l.qty + 1 } : l)) : cartLines.concat([{ colour: this.state.colour, n, qty: 1, unit: unit * n }]);
        this.setState({ cart: next, page: 'cart', cnote: false }); try { window.scrollTo(0, 0); } catch (x) {}
      },
      userName: this.state.user ? this.state.user.name : '', userInit: this.state.user ? this.state.user.name.charAt(0).toUpperCase() : '', userMail: this.state.user ? this.state.user.mail : '',
      noop: (e) => { try { e.preventDefault(); } catch (x) {} },
      logout: (e) => { this.setState({ user: null, page: 'login', lt: 0, lsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      goShop: (e) => { this.setState({ page: 'shop', menu: false }); try { window.scrollTo(0, 0); } catch (x) {} },
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
      trust, bundles, thumbs, cColours, cName: cs[this.state.colour].name, cOutlets, cf, cfDots, cfPrev, cfNext, cfPrevColor, cfNextColor, cQty: this.state.qty, ctaTotal,
      cInc: () => this.setState({ qty: Math.min(9, this.state.qty + 1) }),
      cDec: () => this.setState({ qty: Math.max(1, this.state.qty - 1) })
    };
  }
}

DC.mount(Component);
