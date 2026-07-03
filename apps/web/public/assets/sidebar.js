(function () {
  'use strict';

  var NAV = [
    { section: 'side.workspace', items: [
      { key: 'nav.overview', en: 'Overview', zh: '概览', href: '/dashboard', icon: '<rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/>' },
      { key: 'nav.models', en: 'Model Groups', zh: '模型分组', href: '/models', icon: '<path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.logs', en: 'Call Logs', zh: '调用日志', href: '/logs', icon: '<path d="M2.5 3.5h11v9h-11z" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 7h11" stroke="currentColor" stroke-width="1.3"/><circle cx="5" cy="5.25" r="0.5" fill="currentColor"/><circle cx="7" cy="5.25" r="0.5" fill="currentColor"/>' },
      { key: 'nav.keys', en: 'API Keys', zh: 'API 密钥', href: '/api-keys', icon: '<circle cx="6" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M8.5 8h5M11.5 6v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.status', en: 'Status', zh: '服务状态', href: '/status', icon: '<path d="M1.5 8h3l1.6-4.2L8.6 12l1.7-4.6L11.5 8h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' },
    ]},
    { section: 'side.account', items: [
      { key: 'nav.wallet', en: 'Wallet', zh: '钱包', href: '/billing', icon: '<path d="M2 5.5C2 4.67 2.67 4 3.5 4H12a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 13H3.5A1.5 1.5 0 0 1 2 11.5v-6Z" stroke="currentColor" stroke-width="1.3"/><path d="M2 6.8h11" stroke="currentColor" stroke-width="1.3"/><circle cx="11" cy="9.7" r="0.85" fill="currentColor"/>' },
      { key: 'nav.referral', en: 'Referrals', zh: '推荐计划', href: '/referrals', icon: '<rect x="2.5" y="6.2" width="11" height="6.8" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 9.6h11M8 6.2v6.8" stroke="currentColor" stroke-width="1.3"/><path d="M5.6 6.2c-.95 0-1.7-.65-1.7-1.55 0-.85.55-1.45 1.35-1.45C6.7 3.2 8 6.2 8 6.2M10.4 6.2c.95 0 1.7-.65 1.7-1.55 0-.85-.55-1.45-1.35-1.45C9.3 3.2 8 6.2 8 6.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.plans', en: 'Plans', zh: '订阅套餐', href: '/subscription', icon: '<path d="M8 2.5l5.5 2.4L8 7.4 2.5 4.9 8 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M2.5 7.8 8 10.3l5.5-2.5M2.5 10.7 8 13.2l5.5-2.5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>' },
      { key: 'nav.profile', en: 'Profile', zh: '个人资料', href: '/profile', icon: '<circle cx="8" cy="5.7" r="2.4" stroke="currentColor" stroke-width="1.3"/><path d="M3 13.4c.7-2.3 2.7-3.7 5-3.7s4.3 1.4 5 3.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
    ]},
    { section: 'nav.section.other', items: [
      { key: 'nav.docs', en: 'Docs', zh: '文档', href: 'https://mexion-doc.pages.dev/', external: true, icon: '<path d="M3.5 2.5h5.8L12.5 5.7v7.8h-9v-11z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.3 2.5v3.3h3.2M5.7 8.4h4.6M5.7 10.6h3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.shop', en: 'Buy Credits', zh: '购买兑换码', href: '/billing', icon: '<path d="M3 4.5h10l-1.2 5H4.2L3 4.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 4.5L2.3 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5.5" cy="12" r="1" stroke="currentColor" stroke-width="1.2"/><circle cx="10.5" cy="12" r="1" stroke="currentColor" stroke-width="1.2"/>' },
    ]},
    { section: 'side.admin', adminOnly: true, items: [
      { key: 'nav.channels', en: 'Channels', zh: '渠道管理', href: '/channels/', adminOnly: true, icon: '<path d="M2 5h12M2 8h12M2 11h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.groups', en: 'Groups', zh: '分组管理', href: '/groups/', adminOnly: true, icon: '<rect x="2" y="3" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="3" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>' },
      { key: 'nav.aliases', en: 'Model Aliases', zh: '模型别名', href: '/model-aliases/', adminOnly: true, icon: '<path d="M2 5h4M8 5h6M2 11h6M10 11h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
      { key: 'nav.admin-users', en: 'Users', zh: '用户管理', href: '/admin-users/', adminOnly: true, icon: '<circle cx="6" cy="5" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M2 13c.5-2 2-3 4-3h4c2 0 3.5 1 4 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
    ]},
  ];

  var SECTION_I18N = {
    en: { 'side.workspace': 'Workspace', 'side.account': 'Account', 'nav.section.other': 'Other', 'side.admin': 'Admin', 'side.foot.title': 'All systems normal', 'side.foot.sub': '17/17 · 142 ms avg', 'side.badge.low': 'low' },
    zh: { 'side.workspace': '工作区', 'side.account': '账户', 'nav.section.other': '其他', 'side.admin': '管理', 'side.foot.title': '全部正常', 'side.foot.sub': '17/17 · 142 ms 均值', 'side.badge.low': '偏低' },
  };

  function currentPage() {
    var p = window.location.pathname;
    if (p === '' || p === '/') return '/';
    return p.replace(/\.html$/, '');
  }

  function lang() {
    return (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildNav() {
    function isAdmin() {
      try { return localStorage.getItem('mexion_user_role') === 'admin'; } catch(e) { return false; }
    }
    var l = lang();
    var page = currentPage();
    var html = '';
    var staggerIdx = 0;
    NAV.forEach(function (sec) {
      if (sec.adminOnly && !isAdmin()) return;
      var secLabel = (SECTION_I18N[l] || SECTION_I18N.en)[sec.section] || sec.section;
      html += '<div class="nav-section">' + secLabel + '</div>';
      html += '<ul class="nav-list">';
      sec.items.forEach(function (item) {
        if (item.adminOnly && !isAdmin()) return;
        var normPage = page.replace(/\/+$/, '') || '/';
        var normHref = item.href.replace(/\/+$/, '') || '/';
        var active = (normHref === normPage) ? ' aria-current="page"' : '';
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        html += '<li><a class="nav-item" style="--i:' + staggerIdx + '" href="' + item.href + '"' + active + ext + '>';
        html += '<svg class="nav-item__icon" viewBox="0 0 16 16" fill="none">' + item.icon + '</svg>';
        html += '<span>' + (item[l] || item.en) + '</span>';
        if (item.badge) html += '<span class="nav-item__badge">' + item.badge + '</span>';
        if (item.external) html += '<svg class="nav-item__ext" viewBox="0 0 12 12" fill="none" style="width:10px;height:10px;margin-left:auto;color:var(--mute-3);flex-shrink:0"><path d="M4 2h6v6M10 2L3.5 8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        html += '</a></li>';
        staggerIdx++;
      });
      html += '</ul>';
    });
    return html;
  }

  function buildUserPill() {
    var l = lang();
    var user = (typeof MexionAuth !== 'undefined' && MexionAuth.getUser) ? MexionAuth.getUser() : null;
    var rawName = user && (user.username || (user.email && user.email.split('@')[0]));
    var name = rawName || (l === 'en' ? 'Account' : '账户');
    var email = (user && user.email) || '';
    var initial = (name.charAt(0) || 'A').toUpperCase();
    var planLabel = 'PRO';
    return (
      '<a class="side__userpill" href="/profile" aria-label="' + escapeHtml(name) + '">' +
        '<span class="side__userpill-avatar" aria-hidden="true">' + escapeHtml(initial) + '</span>' +
        '<span class="side__userpill-id">' +
          '<span class="side__userpill-name">' + escapeHtml(name) + '</span>' +
          (email ? '<span class="side__userpill-email">' + escapeHtml(email) + '</span>' : '') +
        '</span>' +
        '<span class="side__userpill-plan">' + planLabel + '</span>' +
        '<svg class="side__userpill-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
          '<path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</a>'
    );
  }

  function buildCollapseButton() {
    var l = lang();
    var label = (l === 'en') ? 'Collapse' : '收起';
    var aria = (l === 'en') ? 'Collapse sidebar' : '收起侧栏';
    var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    var shortcut = isMac ? '⌘\\' : 'Ctrl\\';
    return (
      '<button type="button" class="side__collapse" aria-label="' + aria + '" aria-expanded="true">' +
        '<svg class="side__collapse-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
          '<path d="M9 3l-4 4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span class="side__collapse-label">' + label + '</span>' +
        '<span class="side__collapse-shortcut">' + shortcut + '</span>' +
      '</button>'
    );
  }

  function buildSidebar() {
    var l = lang();
    var closeLabel = (l === 'en') ? 'Close menu' : '关闭菜单';
    return (
      '<div class="side__head">' +
        '<a class="brand" href="/">' +
          '<span class="brand__mark"><img src="/assets/icon-master.png" alt="Mexion"></span>' +
          '<span class="brand__name">Mexion</span>' +
          '<span class="brand__plan">Pro</span>' +
        '</a>' +
        '<button type="button" class="side__close" aria-label="' + closeLabel + '">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
            '<path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="side__body">' +
        buildNav() +
      '</div>' +
      buildCollapseButton() +
      buildUserPill()
    );
  }

  function mount(el) {
    if (typeof el === 'string') el = document.getElementById(el) || document.querySelector(el);
    if (!el) return;
    el.innerHTML = buildSidebar();
  }

  function registerI18n() {
    if (typeof MexionI18n === 'undefined') return;
    var dict = { en: {}, zh: {} };
    NAV.forEach(function (sec) {
      sec.items.forEach(function (item) {
        dict.en[item.key] = item.en;
        dict.zh[item.key] = item.zh;
      });
    });
    dict.en = Object.assign(dict.en, SECTION_I18N.en);
    dict.zh = Object.assign(dict.zh, SECTION_I18N.zh);
    MexionI18n.register(dict);
  }

  /* ── Mobile drawer shell ───────────────────────────────────────
     At ≤860px the sidebar is a fixed off-canvas drawer (see common.css).
     This code injects the hamburger trigger + backdrop and wires the
     open/close state. Idempotent — safe to call again on i18n re-mount.
     ──────────────────────────────────────────────────────────── */

  var HAMBURGER_SVG =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
      '<path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';

  function openDrawer() {
    var side = document.getElementById('mexion-sidebar');
    var bp = document.querySelector('.side-backdrop');
    var btn = document.querySelector('.topbar__hamburger');
    document.body.classList.add('drawer-open');
    if (side) side.classList.add('is-open');
    if (bp)   bp.classList.add('is-open');
    if (btn)  btn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    var side = document.getElementById('mexion-sidebar');
    var bp = document.querySelector('.side-backdrop');
    var btn = document.querySelector('.topbar__hamburger');
    document.body.classList.remove('drawer-open');
    if (side) side.classList.remove('is-open');
    if (bp)   bp.classList.remove('is-open');
    if (btn)  btn.setAttribute('aria-expanded', 'false');
  }

  function toggleDrawer(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (document.body.classList.contains('drawer-open')) closeDrawer();
    else openDrawer();
  }

  function ensureMobileShell() {
    /* 1. Inject hamburger button as first child of .topbar */
    var topbar = document.querySelector('.topbar');
    if (topbar && !topbar.querySelector('.topbar__hamburger')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'topbar__hamburger';
      btn.setAttribute('aria-label', '导航菜单');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'mexion-sidebar');
      btn.innerHTML = HAMBURGER_SVG;
      btn.addEventListener('click', toggleDrawer);
      topbar.insertBefore(btn, topbar.firstChild);
    }

    /* 2. Inject backdrop element */
    if (!document.querySelector('.side-backdrop')) {
      var bp = document.createElement('div');
      bp.className = 'side-backdrop';
      bp.setAttribute('aria-hidden', 'true');
      bp.addEventListener('click', closeDrawer);
      document.body.appendChild(bp);
    }

    /* 3. Auto-close drawer when nav link / brand / close-btn / user pill is tapped */
    var side = document.getElementById('mexion-sidebar');
    if (side && !side.__drawerWired) {
      side.addEventListener('click', function (e) {
        var hit = e.target.closest && e.target.closest(
          'a.nav-item, a.brand, .side__close, .side__userpill'
        );
        if (hit) closeDrawer();
      });
      side.__drawerWired = true;
    }

    /* 4. Global keydown / resize wired once */
    if (!document.__drawerWired) {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
          closeDrawer();
          var b = document.querySelector('.topbar__hamburger');
          if (b) b.focus();
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 860 && document.body.classList.contains('drawer-open')) {
          closeDrawer();
        }
      });
      document.__drawerWired = true;
    }

    /* 5. Swipe-left-to-close on the drawer itself.
       We track the first finger; if horizontal motion dominates and the
       user moves > THRESH px to the left, close. While dragging, follow
       the finger with an inline translate so it feels responsive. */
    if (side && !side.__gestureWired) {
      var THRESH = 60;
      var startX = 0, startY = 0, dragging = false, axisLocked = false, axisIsHorizontal = false;

      side.addEventListener('touchstart', function (e) {
        if (window.innerWidth > 860) return;
        if (!side.classList.contains('is-open')) return;
        var t = e.touches[0];
        startX = t.clientX; startY = t.clientY;
        dragging = true; axisLocked = false; axisIsHorizontal = false;
      }, { passive: true });

      side.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        var t = e.touches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;

        if (!axisLocked) {
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            axisIsHorizontal = Math.abs(dx) > Math.abs(dy);
            axisLocked = true;
          }
        }
        if (!axisIsHorizontal) return;
        if (dx > 0) { side.style.transform = ''; return; }
        side.style.transition = 'none';
        side.style.transform = 'translateX(' + dx + 'px)';
      }, { passive: true });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        side.style.transition = '';
        if (axisIsHorizontal) {
          var t = (e.changedTouches && e.changedTouches[0]) || null;
          var dx = t ? (t.clientX - startX) : 0;
          if (dx < -THRESH) {
            side.style.transform = '';
            closeDrawer();
          } else {
            side.style.transform = '';
          }
        }
      }
      side.addEventListener('touchend', endDrag, { passive: true });
      side.addEventListener('touchcancel', endDrag, { passive: true });
      side.__gestureWired = true;
    }
  }

  /* ── Desktop rail-fold system ─────────────────────────────────
     • Two buttons, only one visible at a time.
     • localStorage mexion_sidebar_rail persists user choice (or "0" for explicit expand).
     • Mac shows ⌘\, others Ctrl+\ — toggle anywhere on the page.
     • Cross-tab storage event keeps multiple tabs in sync (silent — no echo loop).
     • Right-edge mouseproximity adds a subtle border accent hint.
     • Coupled animations: nav stagger on expand, main micro-shift on toggle.
     ─────────────────────────────────────────────────────────── */

  var RAIL_KEY = 'mexion_sidebar_rail';
  var RAIL_MOBILE_MAX = 860;     /* below this → mobile drawer mode, rail no-op */
  var RAIL_SMALL_MAX  = 1180;    /* first-visit auto-rail if width below this */

  function appEl() { return document.querySelector('.app'); }

  function isRailNow() {
    var a = appEl();
    return !!(a && a.classList.contains('is-rail'));
  }

  function shouldDefaultRail() {
    try {
      var stored = localStorage.getItem(RAIL_KEY);
      if (stored !== null) return stored === '1';
    } catch (e) {}
    var w = window.innerWidth;
    return w > RAIL_MOBILE_MAX && w < RAIL_SMALL_MAX;
  }

  function setRailState(rail, opts) {
    opts = opts || {};
    var app = appEl();
    if (!app) return;
    /* mobile breakpoint owns the layout — rail is a no-op there */
    if (window.innerWidth <= RAIL_MOBILE_MAX) return;

    var was = app.classList.contains('is-rail');
    if (rail === was && !opts.force) return;

    if (rail) {
      app.classList.add('is-rail');
      app.classList.remove('is-just-expanded');
    } else {
      app.classList.remove('is-rail');
      if (!opts.skipStagger) {
        app.classList.add('is-just-expanded');
        clearTimeout(setRailState.__staggerTimer);
        setRailState.__staggerTimer = setTimeout(function () {
          app.classList.remove('is-just-expanded');
        }, 820);
      }
    }

    /* Main micro-shift — animation runs once, class removed before next toggle */
    if (!opts.skipShift) {
      var shift = rail ? 'is-shift-collapse' : 'is-shift-expand';
      app.classList.remove('is-shift-collapse', 'is-shift-expand');
      /* Force reflow so animation restarts if user double-toggles */
      void app.offsetWidth;
      app.classList.add(shift);
      clearTimeout(setRailState.__shiftTimer);
      setRailState.__shiftTimer = setTimeout(function () {
        app.classList.remove(shift);
      }, 400);
    }

    if (!opts.silent) {
      try { localStorage.setItem(RAIL_KEY, rail ? '1' : '0'); } catch (e) {}
    }

    /* Sync aria-expanded + aria-label on the single toggle button so screen
       readers + tooltips describe the next action, not the current state. */
    var cb = document.querySelector('.side__collapse');
    if (cb) {
      cb.setAttribute('aria-expanded', rail ? 'false' : 'true');
      var l = lang();
      cb.setAttribute('aria-label', rail
        ? (l === 'en' ? 'Expand sidebar' : '展开侧栏')
        : (l === 'en' ? 'Collapse sidebar' : '收起侧栏'));
    }

    /* Dispatch event so other components can react (e.g. charts that
       resize). Same-thread; consumers can throttle internally if needed. */
    try {
      document.dispatchEvent(new CustomEvent('mexion:rail', { detail: { rail: rail } }));
    } catch (e) {}
  }

  function collapseRail() { setRailState(true);  }
  function expandRail()   { setRailState(false); }
  function toggleRail()   { setRailState(!isRailNow()); }

  /* Annotate nav items with data-label (for CSS tooltip) — runs after mount() */
  function annotateNavItems() {
    var items = document.querySelectorAll('#mexion-sidebar .nav-item');
    items.forEach(function (item) {
      var span = item.querySelector('span:not(.nav-item__badge):not(.nav-item__count)');
      if (!span) return;
      var text = (span.textContent || '').trim();
      if (text) item.setAttribute('data-label', text);
    });
  }

  /* Wire collapse-or-expand button click. The single sidebar-bottom button
     toggles rail state — in expanded mode it collapses, in rail mode it
     expands. CSS rotates the icon 180deg in rail so direction matches.
     (re-wired after each mount). */
  function wireCollapseButton() {
    var btn = document.querySelector('#mexion-sidebar .side__collapse');
    if (!btn || btn.__railWired) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleRail();
    });
    btn.__railWired = true;
  }

  /* Brand also collapses-to-expand: in rail mode, clicking the logo expands. */
  function wireBrandRailExpand() {
    var brand = document.querySelector('#mexion-sidebar .brand');
    if (!brand || brand.__railWired) return;
    brand.addEventListener('click', function (e) {
      if (window.innerWidth <= RAIL_MOBILE_MAX) return;
      if (!isRailNow()) return;
      e.preventDefault();
      expandRail();
    });
    brand.__railWired = true;
  }

  /* ⌘\  /  Ctrl+\  — toggle anywhere; ignored on mobile. */
  function wireRailKeyboard() {
    if (document.__railKbWired) return;
    document.addEventListener('keydown', function (e) {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key !== '\\') return;
      if (window.innerWidth <= RAIL_MOBILE_MAX) return;
      e.preventDefault();
      toggleRail();
    });
    document.__railKbWired = true;
  }

  /* Cross-tab synchronization. Silent flag prevents write-echo. */
  function wireRailStorageSync() {
    if (window.__railStorageWired) return;
    window.addEventListener('storage', function (e) {
      if (!e || e.key !== RAIL_KEY) return;
      var shouldRail = e.newValue === '1';
      setRailState(shouldRail, { silent: true });
    });
    window.__railStorageWired = true;
  }

  /* Right-edge proximity hint — rAF-throttled mousemove. */
  function wireRailEdgeHint() {
    if (document.__railEdgeWired) return;
    var pending = false, lx = 0, ly = 0;
    document.addEventListener('mousemove', function (e) {
      lx = e.clientX; ly = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (window.innerWidth <= RAIL_MOBILE_MAX) return;
        var app = appEl();
        if (!app || app.classList.contains('is-rail')) return;
        var side = document.getElementById('mexion-sidebar');
        if (!side) return;
        var r = side.getBoundingClientRect();
        var distFromRight = r.right - lx;
        var inY = ly >= r.top && ly <= r.bottom;
        var near = distFromRight >= -4 && distFromRight < 14 && inY;
        if (near !== side.classList.contains('is-edge-hover')) {
          side.classList.toggle('is-edge-hover', near);
        }
      });
    }, { passive: true });
    document.__railEdgeWired = true;
  }

  /* Transfer FOUC-guard class on <html> to the .app once JS owns the state.
     Both classes set --side-w:56px, so the swap doesn't trigger a transition.
     We then strip the transition-disabling .mexion-rail-init in the next frame,
     letting normal transitions kick in for subsequent toggles. */
  function transferInitClass() {
    var html = document.documentElement;
    var app = appEl();
    if (!app) return;
    var hadInit = html.classList.contains('mexion-rail-init');
    if (hadInit) {
      app.classList.add('is-rail');
    } else if (shouldDefaultRail()) {
      /* No FOUC class but storage/defaults say rail — apply silently
         without animation by adding both classes before strip. */
      html.classList.add('mexion-rail-init');
      app.classList.add('is-rail');
    }
    /* Strip the init class on the next frame so .app/.side/.main re-acquire
       their normal transitions for future user-triggered toggles. */
    if (html.classList.contains('mexion-rail-init')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          html.classList.remove('mexion-rail-init');
        });
      });
    }
    /* Sync aria-expanded on the freshly mounted toggle button. */
    var cb = document.querySelector('.side__collapse');
    if (cb) cb.setAttribute('aria-expanded', isRailNow() ? 'false' : 'true');
  }

  /* Window-resize guard — if user drags below mobile breakpoint while in rail,
     CSS already overrides layout, but we strip is-rail so re-entering desktop
     gives a clean expanded state unless storage still says rail. */
  function wireRailResize() {
    if (window.__railResizeWired) return;
    var lastBelow = window.innerWidth <= RAIL_MOBILE_MAX;
    window.addEventListener('resize', function () {
      var below = window.innerWidth <= RAIL_MOBILE_MAX;
      if (below === lastBelow) return;
      lastBelow = below;
      if (!below) {
        /* Re-entered desktop — restore rail state from storage. */
        var app = appEl();
        if (!app) return;
        var shouldRail = shouldDefaultRail();
        if (shouldRail && !app.classList.contains('is-rail')) {
          setRailState(true, { skipShift: true, skipStagger: true, silent: true });
        } else if (!shouldRail && app.classList.contains('is-rail')) {
          setRailState(false, { skipShift: true, skipStagger: true, silent: true });
        }
      }
    });
    window.__railResizeWired = true;
  }

  function ensureDesktopRail() {
    annotateNavItems();
    wireCollapseButton();
    wireBrandRailExpand();
    wireRailKeyboard();
    wireRailStorageSync();
    wireRailEdgeHint();
    wireRailResize();
    transferInitClass();
  }

  function init() {
    registerI18n();

    var target = document.getElementById('mexion-sidebar');
    if (target) mount(target);

    ensureMobileShell();
    ensureDesktopRail();

    if (!document.__communityPopWired) {
      document.addEventListener('focusin', function (e) {
        var t = e.target;
        if (!t || !t.matches) return;
        if (!t.matches('.search input, .search input *')) return;
        var pop = document.getElementById('communityPop');
        var btn = document.getElementById('communityBtn');
        if (pop && !pop.hidden) {
          pop.hidden = true;
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
      document.__communityPopWired = true;
    }

    document.addEventListener('user-menu:signout', function () {
      if (typeof MexionAuth !== 'undefined') MexionAuth.logout();
    });

    if (typeof MexionI18n !== 'undefined') {
      MexionI18n.onChange(function () {
        var target = document.getElementById('mexion-sidebar');
        if (target) mount(target);
        /* After re-mount the collapse button & nav data-labels are fresh DOM —
           re-wire and re-annotate without re-registering global listeners. */
        annotateNavItems();
        wireCollapseButton();
        wireBrandRailExpand();
        /* Sync aria state on the freshly mounted toggle. */
        var rail = isRailNow();
        var cb = document.querySelector('.side__collapse');
        if (cb) cb.setAttribute('aria-expanded', rail ? 'false' : 'true');
      });
    }

    if (window.MexionAuth && typeof window.MexionAuth.onChange === 'function' && !window.__mexionSidebarRoleWired) {
      window.MexionAuth.onChange(function () {
        if (window.MexionSidebar && typeof window.MexionSidebar.rebuild === 'function') window.MexionSidebar.rebuild();
      });
      window.__mexionSidebarRoleWired = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MexionSidebar = {
    mount: mount,
    rebuild: function () { init(); },
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    collapseRail: collapseRail,
    expandRail: expandRail,
    toggleRail: toggleRail,
    isRail: isRailNow,
  };
})();
