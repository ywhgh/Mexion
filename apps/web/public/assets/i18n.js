/* ══════════════════════════════════════════════════════════════════════
   Mexion — unified i18n runtime
   ──────────────────────────────────────────────────────────────────────
   Single source of truth across every page. Each page registers its own
   dictionary via MexionI18n.register({ en: {...}, zh: {...} }) and the
   library handles persistence, toggling, and DOM application.

   Public API (window.MexionI18n):
     t(key)               -> string  (falls back to en then key)
     get lang             -> 'en' | 'zh'
     set(lang)            -> persist + re-apply
     toggle()             -> flip between en/zh
     onChange(fn)         -> subscribe (fn receives new lang)
     register(partialDict) -> merge { en, zh } into the dictionary

   Selectors applied on every change:
     [data-i18n]              -> el.textContent
     [data-i18n-html]         -> el.innerHTML
     [data-i18n-placeholder]  -> el.placeholder
     [data-i18n-title]        -> el.title
     [data-i18n-aria]         -> el.setAttribute('aria-label', …)

   Toggle UI: either of these markups works
     <button class="lang-toggle" id="langToggle">…</button>          (alternating)
     <div class="lang-toggle">
       <button data-lang="zh">中文</button>
       <button data-lang="en">EN</button>
     </div>                                                          (two-button)

   Page bootstrap:
     <script src="assets/i18n.js" defer></script>
     <script defer>
       MexionI18n.register({
         en: { 'page.key': 'English …' },
         zh: { 'page.key': '中文 …' }
       });
     </script>
   ══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'mexion_lang';
  var DEFAULT_LANG = 'zh';
  var SUPPORTED = ['en', 'zh'];

  /* Migrate legacy 'cn' value once. */
  function readStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'cn') {                              /* legacy from dashboard */
        v = 'zh';
        try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
      }
      return SUPPORTED.indexOf(v) >= 0 ? v : DEFAULT_LANG;
    } catch (e) { return DEFAULT_LANG; }
  }

  var dict = { en: Object.create(null), zh: Object.create(null) };
  var listeners = [];
  var lang = readStoredLang();

  function t(key) {
    if (key == null) return '';
    var v = dict[lang] && dict[lang][key];
    if (v !== undefined) return v;
    v = dict.en[key];
    return v !== undefined ? v : key;
  }

  function register(partial) {
    if (!partial) return;
    if (partial.en) for (var k in partial.en) dict.en[k] = partial.en[k];
    if (partial.zh) for (var j in partial.zh) dict.zh[j] = partial.zh[j];
    if (document.readyState !== 'loading') applyDom();
  }

  function applyDom() {
    var html = document.documentElement;
    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    html.setAttribute('data-lang', lang);

    /* textContent — safest, no HTML interpretation */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!k) return;
      var v = dict[lang] && dict[lang][k];
      if (v === undefined) v = dict.en[k];
      if (v !== undefined) el.textContent = v;
    });

    /* innerHTML — when the value contains markup like <em>, <strong>, <sup> */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (!k) return;
      var v = dict[lang] && dict[lang][k];
      if (v === undefined) v = dict.en[k];
      if (v !== undefined) el.innerHTML = v;
    });

    /* attributes */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      var v = dict[lang][k] !== undefined ? dict[lang][k] : dict.en[k];
      if (v !== undefined) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-title');
      var v = dict[lang][k] !== undefined ? dict[lang][k] : dict.en[k];
      if (v !== undefined) el.setAttribute('title', v);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      var v = dict[lang][k] !== undefined ? dict[lang][k] : dict.en[k];
      if (v !== undefined) el.setAttribute('aria-label', v);
    });

    /* sync any single-toggle button labels (index/login pattern) */
    document.querySelectorAll('.lang-toggle [data-lang-active]').forEach(function (el) {
      el.textContent = lang === 'zh' ? '中文' : 'EN';
    });
    document.querySelectorAll('.lang-toggle [data-lang-other]').forEach(function (el) {
      el.textContent = lang === 'zh' ? 'EN' : '中文';
    });
    /* legacy ids from index.html / login.html */
    var active = document.getElementById('langActive');
    if (active) active.textContent = lang === 'zh' ? '中文' : 'EN';
    var other  = document.getElementById('langOther');
    if (other)  other.textContent  = lang === 'zh' ? 'EN' : '中文';

    /* sync two-button toggle (dashboard pattern) */
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      if (!btn.hasAttribute('data-lang')) return;
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    /* fire listeners */
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](lang); } catch (e) {}
    }
  }

  /* — seamless switch —
     • Chrome/Edge/Safari 18+ : document.startViewTransition() runs a 220ms
       crossfade of the viewport snapshot.  Layout shift gets smoothed out
       automatically because the browser interpolates the before/after frames.
     • Reduced-motion users + Firefox (no support yet) : we substitute a tiny
       requestAnimationFrame opacity fade on <html>, so they still get a soft
       transition without the heavier viewport snapshot.
     • A re-entrant guard prevents stacking transitions if the user mashes
       the toggle. */
  var switching = false;
  function reducedMotion() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function fallbackFade(applyFn) {
    var root = document.documentElement;
    root.style.transition = 'opacity 140ms ease';
    root.style.opacity = '0.55';
    requestAnimationFrame(function () {
      applyFn();
      requestAnimationFrame(function () {
        root.style.opacity = '';
        setTimeout(function () { root.style.transition = ''; }, 160);
      });
    });
  }
  function set(next) {
    if (SUPPORTED.indexOf(next) < 0) return;
    if (next === lang) return;
    if (switching) return;                          /* coalesce rapid clicks */
    switching = true;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    var html = document.documentElement;
    html.setAttribute('data-i18n-switching', '');
    var done = function () {
      switching = false;
      html.removeAttribute('data-i18n-switching');
    };

    if (reducedMotion()) {
      applyDom();
      done();
      return;
    }
    if (document.startViewTransition) {
      var t = document.startViewTransition(function () { applyDom(); });
      if (t && t.finished && typeof t.finished.then === 'function') {
        t.finished.then(done, done);
      } else {
        setTimeout(done, 240);
      }
    } else {
      fallbackFade(applyDom);
      setTimeout(done, 320);
    }
  }

  function toggle() { set(lang === 'zh' ? 'en' : 'zh'); }

  function wireToggles() {
    /* single-button alternating toggle (id=langToggle OR class lang-toggle on the button itself) */
    var btn = document.getElementById('langToggle');
    if (btn && btn.tagName === 'BUTTON' && !btn.__mexionI18nWired) {
      btn.__mexionI18nWired = true;
      btn.addEventListener('click', toggle);
    }
    /* two-button toggle: any button with [data-lang="en"|"zh"] */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      if (b.__mexionI18nWired) return;
      if (b.tagName !== 'BUTTON' && b.tagName !== 'A') return;
      var v = b.getAttribute('data-lang');
      if (SUPPORTED.indexOf(v) < 0) return;
      b.__mexionI18nWired = true;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        set(v);
      });
    });
  }

  function injectStyles() {
    if (document.getElementById('mexion-i18n-style')) return;
    var s = document.createElement('style');
    s.id = 'mexion-i18n-style';
    s.textContent =
      '@media (prefers-reduced-motion: no-preference){' +
        '::view-transition-old(root),::view-transition-new(root){' +
          'animation-duration:220ms;' +
          'animation-timing-function:cubic-bezier(.4,0,.2,1);' +
        '}' +
      '}' +
      /* When a switch is in flight, freeze pointer events to avoid
         hover-state flicker between the snapshot and the live tree. */
      'html[data-i18n-switching]{pointer-events:none;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function init() {
    injectStyles();
    wireToggles();
    applyDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* HTML emitter for render functions —
     returns a <span data-i18n="key">current-text</span> blob, so the
     freshly-rendered DOM is BOTH translated now AND auto-updates on
     future language switches via applyDom().  Callers that previously
     wrote `'+MexionI18n.t(k)+'` inside innerHTML can drop in
     `MexionI18n.tspan(k)` and skip re-rendering on language change. */
  function tspan(key) {
    if (key == null) return '';
    var safeKey = String(key).replace(/"/g, '&quot;');
    return '<span data-i18n="' + safeKey + '">' + t(key) + '</span>';
  }

  /* State-preserving wrapper for heavy onChange handlers.  When a page
     MUST re-render large DOM trees during language switch (e.g. lists
     that include dynamic timestamps / quotas), wrap the renderer in
     MexionI18n.preserve(fn) so the user's scroll position and input
     focus survive the rebuild.

     Captures BEFORE  : window scroll, every scrollable container's
                        scrollTop/Left, the active element by id/name,
                        plus its caret + selection range if it's text.
     Restores AFTER   : same — id-keyed so even fully-rebuilt inputs
                        get focus back, with caret + selection intact.

     Scrollable containers are auto-detected (overflow-y:auto/scroll
     plus a non-zero scrollTop) so we don't need every page to opt in. */
  function preserve(fn) {
    var winY = window.scrollY || window.pageYOffset || 0;
    var winX = window.scrollX || window.pageXOffset || 0;

    /* containers that have scrolled — capture id when available so we
       can re-query after rebuilds detach the original node. */
    var scrolls = [];
    document.querySelectorAll('*').forEach(function (el) {
      if ((el.scrollTop && el.scrollTop > 0) || (el.scrollLeft && el.scrollLeft > 0)) {
        if (el === document.scrollingElement || el === document.documentElement) return;
        scrolls.push({ el: el, id: el.id || null, t: el.scrollTop, l: el.scrollLeft });
      }
    });

    /* focus + caret */
    var active = document.activeElement;
    var focusInfo = null;
    if (active && active !== document.body && active.id) {
      focusInfo = { id: active.id };
      if ('selectionStart' in active) {
        try {
          focusInfo.selStart = active.selectionStart;
          focusInfo.selEnd   = active.selectionEnd;
        } catch (e) {}
      }
    }

    try { fn(); } catch (e) { console.error(e); }

    window.scrollTo(winX, winY);
    scrolls.forEach(function (s) {
      var target = (s.el && s.el.isConnected) ? s.el : (s.id ? document.getElementById(s.id) : null);
      if (target) {
        target.scrollTop = s.t;
        target.scrollLeft = s.l;
      }
    });
    if (focusInfo) {
      var el = document.getElementById(focusInfo.id);
      if (el && typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
        if (focusInfo.selStart != null && 'setSelectionRange' in el) {
          try { el.setSelectionRange(focusInfo.selStart, focusInfo.selEnd); } catch (e) {}
        }
      }
    }
  }

  global.MexionI18n = {
    t: t,
    tspan: tspan,
    preserve: preserve,
    register: register,
    set: set,
    toggle: toggle,
    refresh: applyDom,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    get lang() { return lang; }
  };

  /* legacy globals for dashboard.html runtime compatibility */
  global.__T = t;
  global.__lang = function () { return lang; };
  global.__setLang = set;
  global.__onLang = function (fn) { if (typeof fn === 'function') listeners.push(fn); };
})(window);
