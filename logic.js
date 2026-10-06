
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { prod: false, page: 'home', sent: false, tab: 0, tsent: false, bundle: 2, thumb: 0, colour: 0, outlet: 0, qty: 1, cf: 0, menu: false };
  }
  componentDidMount() {
    const root = document.documentElement;
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    // scroll-reveal (fade + translate, staggered through --d)
    try {
      const els = document.querySelectorAll('.rv');
      if (els.length && 'IntersectionObserver' in window) {
        root.classList.add('js-rv');
        const io = new IntersectionObserver((es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
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
    const os = [
      { name: 'Type C', desc: 'Fast & modern charging', isUsb: true, isWifi: false },
      { name: 'WiFi', desc: 'Wireless transfer of photos & videos directly to your MemoryOrb', isUsb: false, isWifi: true }
    ];
    const cOutlets = os.map((o, i) => {
      const sel = this.state.outlet === i;
      return { ...o, selected: sel, checked: sel ? 'true' : 'false', border: sel ? '#e8353a' : '#2a2d27', bg: sel ? '#1b0f10' : '#10130e', pick: () => this.setState({ outlet: i }) };
    });
    const cents = 5999 * this.state.qty;
    const ctaTotal = '$' + Math.floor(cents / 100) + '.' + String(cents % 100).padStart(2, '0');
    const cfs = [
      { title: 'Damage Protection Guarantee', text: 'Shop with confidence, risk-free.' },
      { title: 'Free Shipping Today', text: '[DESCRIPTION]' },
      { title: '30-Day Guarantee', text: '[DESCRIPTION]' },
      { title: '5000+ Happy Customers', text: '[DESCRIPTION]' }
    ];
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
      tabOrderLine: this.state.tab === 0 ? '#f3d27a' : '#3a3d38',
      tabTrackLine: this.state.tab === 1 ? '#f3d27a' : '#3a3d38',
      tabOrderColor: this.state.tab === 0 ? '#fff' : '#8a8a84',
      tabTrackColor: this.state.tab === 1 ? '#fff' : '#8a8a84',
      tabOrder: () => this.setState({ tab: 0, tsent: false }),
      tabTrack: () => this.setState({ tab: 1, tsent: false }),
      goTracking: (e) => { this.setState({ page: 'tracking', menu: false, tsent: false }); try { window.scrollTo(0, 0); } catch (x) {} },
      sendTrack: (e) => { try { e.preventDefault(); } catch (x) {} this.setState({ tsent: true }); },
      skyBg: this.state.page === 'home' ? '#113a00' : '#0b0d09',
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
      bundles, thumbs, cColours, cName: cs[this.state.colour].name, cOutlets, cf, cfDots, cfPrev, cfNext, cfPrevColor, cfNextColor, cQty: this.state.qty, ctaTotal,
      cInc: () => this.setState({ qty: Math.min(9, this.state.qty + 1) }),
      cDec: () => this.setState({ qty: Math.max(1, this.state.qty - 1) })
    };
  }
}

DC.mount(Component);
