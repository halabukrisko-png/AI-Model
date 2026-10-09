/* Minimal runtime for the .dc.html template format used by this project.
   Supports {{dotted.lookups}}, <sc-if value>, <sc-for list as>, onClick/onSubmit handlers,
   a DCLogic base class with setState, and in-place DOM updates (no framework). */
(function () {
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;
  var ONLY_HOLE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    var parts = path.split('.');
    var v = scope[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null || v === false ? '' : String(v); });
  }

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this.__render) this.__render();
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__render) this.__render(); };

  function mount(Component) {
    var tpl = document.getElementById('tpl').content;
    var root = document.getElementById('app');
    var handlers = {};
    var hid = 0;

    // <helmet> content goes to <head>
    var helmet = tpl.querySelector('helmet');
    if (helmet) {
      Array.prototype.slice.call(helmet.childNodes).forEach(function (n) { if (n.nodeType === 1) document.head.appendChild(n.cloneNode(true)); });
      helmet.parentNode.removeChild(helmet);
    }

    function renderNode(node, scope, out) {
      if (node.nodeType === 3) { out.push(esc(interp(node.nodeValue, scope))); return; }
      if (node.nodeType !== 1) return;
      var tag = node.localName;
      if (tag === 'sc-if') {
        var m = ONLY_HOLE.exec(node.getAttribute('value') || '');
        var ok = m ? lookup(m[1], scope) : false;
        if (ok) renderChildren(node, scope, out); else out.push('<!--if-->');
        return;
      }
      if (tag === 'sc-for') {
        var lm = ONLY_HOLE.exec(node.getAttribute('list') || '');
        var list = (lm && lookup(lm[1], scope)) || [];
        var as = node.getAttribute('as') || 'item';
        list.forEach(function (item, i) {
          var s = Object.create(scope); s[as] = item; s.index = i;
          renderChildren(node, s, out);
        });
        return;
      }
      out.push('<' + tag);
      for (var i = 0; i < node.attributes.length; i++) {
        var a = node.attributes[i], name = a.name, val = a.value;
        if (/^on[a-z]+$/i.test(name)) {
          var om = ONLY_HOLE.exec(val), fn = om && lookup(om[1], scope);
          if (typeof fn === 'function') {
            var id = 'h' + (hid++); handlers[id] = fn;
            out.push(' data-h-' + name.slice(2).toLowerCase() + '="' + id + '"');
          }
          continue;
        }
        out.push(' ' + name + '="' + escAttr(interp(val, scope)) + '"');
      }
      out.push('>');
      if (!VOID[tag]) { renderChildren(node, scope, out); out.push('</' + tag + '>'); }
    }
    function renderChildren(node, scope, out) {
      for (var c = node.firstChild; c; c = c.nextSibling) renderNode(c, scope, out);
    }

    var inst = new Component({});

    function html() {
      handlers = {}; hid = 0;
      var out = [];
      renderChildren(tpl, inst.renderVals(), out);
      return out.join('');
    }

    var KEEP = ['in', 'go'];
    function syncAttrs(from, to) {
      var i, a;
      for (i = from.attributes.length - 1; i >= 0; i--) {
        a = from.attributes[i];
        if (a.name === 'style' && from.hasAttribute('data-keep-style')) continue;
        if (a.name !== 'class' && !to.hasAttribute(a.name)) from.removeAttribute(a.name);
      }
      for (i = 0; i < to.attributes.length; i++) {
        a = to.attributes[i];
        if (a.name === 'class') continue;
        if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);
      }
      // class: take template classes, keep classes added by scripts
      var want = (to.getAttribute('class') || '').split(/\s+/).filter(Boolean);
      KEEP.forEach(function (k) { if (from.classList.contains(k) && want.indexOf(k) < 0) want.push(k); });
      var cls = want.join(' ');
      if ((from.getAttribute('class') || '') !== cls) { if (cls) from.setAttribute('class', cls); else from.removeAttribute('class'); }
    }
    function morph(from, to) {
      var tn = from.nodeName;
      if (tn === 'INPUT' || tn === 'TEXTAREA' || tn === 'SELECT') return;
      if (tn === 'DETAILS') { var was = from.hasAttribute('open'); syncAttrs(from, to); if (was) from.setAttribute('open', ''); else from.removeAttribute('open'); }
      else syncAttrs(from, to);
      var fc = from.firstChild, tc = to.firstChild;
      while (tc || fc) {
        if (!tc) { var nx = fc.nextSibling; from.removeChild(fc); fc = nx; continue; }
        if (!fc) { from.appendChild(tc.cloneNode(true)); tc = tc.nextSibling; continue; }
        if (fc.nodeType === tc.nodeType && fc.nodeName === tc.nodeName) {
          if (fc.nodeType === 1) morph(fc, tc);
          else if (fc.nodeValue !== tc.nodeValue) fc.nodeValue = tc.nodeValue;
          fc = fc.nextSibling; tc = tc.nextSibling;
        } else {
          var next = fc.nextSibling;
          from.replaceChild(tc.cloneNode(true), fc);
          fc = next; tc = tc.nextSibling;
        }
      }
    }

    function render() {
      var box = document.createElement('div');
      box.innerHTML = html();
      morph(root, box);
    }
    inst.__render = render;

    root.innerHTML = html();
    ['click', 'submit', 'input', 'change'].forEach(function (ev) {
      root.addEventListener(ev, function (e) {
        var el = e.target.closest ? e.target.closest('[data-h-' + ev + ']') : null;
        while (el && root.contains(el)) {
          var fn = handlers[el.getAttribute('data-h-' + ev)];
          if (fn) { fn(e); return; }
          el = el.parentElement && el.parentElement.closest('[data-h-' + ev + ']');
        }
      });
    });
    if (inst.componentDidMount) inst.componentDidMount();
  }

  window.DCLogic = DCLogic;
  window.DC = { mount: mount };
})();
