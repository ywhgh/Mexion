/* ══════════════════════════════════════════════
   i18n — registers this page's strings with the
   shared runtime (assets/i18n.js), then restarts
   hero ink animations on language switch.
══════════════════════════════════════════════ */
/* Brush SVG — emphasis underline. Reused across language variants so the
   accent stroke attaches to whichever word actually carries differentiation
   (EN: "worth calling" — quality filter. ZH: "所有" — quantifier, the real
   moat. "语言模型" is a category noun, not a value anchor.) */
var _BRUSH = '<svg class="brush-svg" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M 2,11.8 C 8,10.2 18,12.4 32,11.0 C 48,9.4 68,12.8 86,11.2 C 102,9.6 118,12.6 134,10.8 C 150,9.2 168,12.2 182,10.6 C 190,9.8 196,10.8 198,10.2 L 198,12.4 C 196,13.0 190,12.0 182,13.2 C 168,14.8 150,11.4 134,13.0 C 118,14.6 102,11.6 86,13.4 C 68,15.0 48,11.4 32,13.2 C 18,14.6 8,12.0 2,13.4 Z"/></svg>';

AxiomI18n.register({
  en: {
    'nav.models': 'models', 'nav.docs': 'docs',
    'nav.status': 'status', 'nav.pricing': 'pricing',
    'nav.signin': 'Sign in',
    'nav.dashboardCta': 'Dashboard',
    'label': '§ The Thesis',
    'hero.l1': 'One key,',
    'hero.l2': '<span class="hero__mark">every' + _BRUSH + '</span> language model',
    'hero.l3': 'worth calling',
    'sub.body': "In Euclid's geometry, an axiom is a proposition accepted as self-evidently true—all proofs depart from here. Axiom brings this structure to the age of AI: a single, <strong><em>unified endpoint</em></strong> as the foundation beneath your application, requiring no elaboration. Whether you call Claude, GPT, Gemini or DeepSeek, the form of invocation is <em>henceforth identical</em>.",
    'cta':  'Sign in to Axiom',
    'cta.loggedin': 'Open dashboard',
    'cta2': 'Browse the catalogue →',
    'plate.head': 'Frontispiece · Folio Recto',
    'plate.caption': 'Ink and wash, vermilion-touched.',
    'note.title': 'A Note on the Name',
    'note.body': 'Axiom — from Greek ἀξίωμα, <em class="prop__quote">"that which is thought worthy."</em> A foundational truth, accepted without proof.<span class="prop__end"></span>',
    'status.status': 'Status', 'status.operational': 'operational',
    'status.latency': 'Latency',
    'status.updated': 'Updated',
  },
  zh: {
    'nav.models': '模型', 'nav.docs': '文档',
    'nav.status': '状态', 'nav.pricing': '定价',
    'nav.signin': '登录',
    'nav.dashboardCta': '控制台',
    'label': '§ 论旨',
    'hero.l1': '一把钥匙，',
    'hero.l2': '通往<span class="hero__mark">所有' + _BRUSH + '</span>值得调用的',
    'hero.l3': '语言模型',
    'sub.body': '欧几里得的几何中，公理是被直接接受为真的命题——一切证明从此出发。Axiom 把这种结构带入 AI 时代：一个<strong><em>统一的 endpoint</em></strong>，作为你应用之下、无需多言的基础层。无论你召唤的是 Claude、GPT、Gemini 还是 DeepSeek，调用的形式<em>从此恒等</em>。',
    'cta':  '登录 Axiom',
    'cta.loggedin': '前往控制台',
    'cta2': '浏览模型目录 →',
    'plate.head': '卷首插图 · 正文首页',
    'plate.caption': '工笔淡彩，朱砂点睛。',
    'note.title': '关于「公理」',
    'note.body': '公理——源自希腊语 ἀξίωμα，<em class="prop__quote">「被认为值得相信的事物。」</em>一种基础的真理，无需证明而被接受。<span class="prop__end"></span>',
    'status.status': '状态', 'status.operational': '正常运行',
    'status.latency': '延迟',
    'status.updated': '更新于',
  }
});

/* index-specific: keep the existing `[data-i18n]` blocks using innerHTML
   (the runtime defaults to textContent — but this page has long bodies
   with embedded <em>/<strong>/<sup>). We migrate by stamping each into
   data-i18n-html mode, then deferring to the runtime. */
(function () {
  /* keys whose translated value contains markup (<em>, <strong>, <sup>, <span>) */
  ['sub.body','note.body'].forEach(function (k) {
    document.querySelectorAll('[data-i18n="' + k + '"]').forEach(function (el) {
      el.removeAttribute('data-i18n');
      el.setAttribute('data-i18n-html', k);
    });
  });
})();

AxiomI18n.onChange(function (lang) {
  /* Restart hero ink animations so the brush stroke replays on switch.
     .caret is excluded on purpose: its blink (caret-blink, infinite step-end)
     doesn't depend on language, so there's no value in resetting it — and
     keeping it out of the list means the cursor never flickers mid-switch. */
  ['.brush-svg','.hero__l1','.hero__l2','.hero__l3','.sub','.cta-row'].forEach(function (s) {
    var el = document.querySelector(s);
    if (el) { el.style.animation = 'none'; void el.offsetHeight; el.style.animation = ''; }
  });
});

/* reapply so the newly-stamped [data-i18n-html] attrs pick up content */
AxiomI18n.refresh();

function getStoredUser() {
  try {
    var raw = (window.AxiomAuthStorage && window.AxiomAuthStorage.getItem)
      ? window.AxiomAuthStorage.getItem('axiom_user')
      : ((sessionStorage.getItem('axiom_user') || localStorage.getItem('axiom_user')) || 'null');
    return JSON.parse(raw || 'null');
  }
  catch (err) { return null; }
}

function getStoredUserId() {
  var raw = (window.AxiomAuthStorage && window.AxiomAuthStorage.getItem)
    ? window.AxiomAuthStorage.getItem('axiom_user_id')
    : (sessionStorage.getItem('axiom_user_id') || localStorage.getItem('axiom_user_id') || '');
  if (raw) return raw;
  var user = getStoredUser();
  if (user && user.id) {
    if (window.AxiomAuthStorage && window.AxiomAuthStorage.setItem) {
      window.AxiomAuthStorage.setItem('axiom_user_id', String(user.id));
    } else {
      localStorage.setItem('axiom_user_id', String(user.id));
    }
    return String(user.id);
  }
  return '';
}

function hasSessionCookie() {
  return document.cookie.split(';').some(function (part) {
    return part.trim().indexOf('session=') === 0;
  });
}

function isLoggedIn() {
  return !!getStoredUserId() || hasSessionCookie();
}

function applyLoggedInHomeState(userOverride) {
  if (!isLoggedIn()) return;
  var user = userOverride || getStoredUser() || {};
  var dashboardUrl = '/dashboard';
  var displayName = user.username || (user.email ? user.email.split('@')[0] : '') || AxiomI18n.t('nav.dashboardCta');

  document.querySelectorAll('.nav__brand').forEach(function (el) {
    el.setAttribute('href', dashboardUrl);
  });

  var signin = document.querySelector('.nav__signin');
  if (signin) {
    signin.setAttribute('href', dashboardUrl);
    var label = signin.querySelector('span');
    if (label) {
      label.removeAttribute('data-i18n');
      label.textContent = displayName;
    }
  }

  var cta = document.querySelector('.cta');
  if (cta) {
    cta.setAttribute('href', dashboardUrl);
    var ctaLabel = cta.querySelector('.cta__label');
    if (ctaLabel) {
      ctaLabel.removeAttribute('data-i18n');
      ctaLabel.textContent = AxiomI18n.t('cta.loggedin');
    }
  }

  document.querySelectorAll('a[href="/login"]').forEach(function (el) {
    el.setAttribute('href', dashboardUrl);
  });
}

function bootHomeAuthState() {
  var storedUser = getStoredUser();
  if (storedUser && storedUser.id && !getStoredUserId()) {
    if (window.AxiomAuthStorage && window.AxiomAuthStorage.setItem) {
      window.AxiomAuthStorage.setItem('axiom_user_id', String(storedUser.id));
    } else {
      localStorage.setItem('axiom_user_id', String(storedUser.id));
    }
  }

  if (isLoggedIn()) {
    applyLoggedInHomeState(storedUser || null);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('axiom:user-updated', function (event) {
      var user = event && event.detail ? event.detail.user : null;
      if (user) applyLoggedInHomeState(user);
    });
  }

  if (typeof AxiomAuth !== 'undefined' && AxiomAuth.refreshUser && getStoredUserId()) {
    AxiomAuth.refreshUser({ force: true, source: 'home' }).then(function (user) {
      if (user) applyLoggedInHomeState(user);
    }).catch(function () {
      applyLoggedInHomeState(storedUser || null);
    });
  }
}

bootHomeAuthState();

/* ══════════════════════════════════════════════
   Pointer-tracked ink bloom
══════════════════════════════════════════════ */
(function() {
  var raf = null, mx = 30, my = 70;
  function update() {
    document.body.style.setProperty('--mx', mx + '%');
    document.body.style.setProperty('--my', my + '%');
    raf = null;
  }
  document.addEventListener('mousemove', function(e) {
    mx = (e.clientX / window.innerWidth) * 100;
    my = (e.clientY / window.innerHeight) * 100;
    if (!raf) raf = requestAnimationFrame(update);
  });
})();

/* ══════════════════════════════════════════════
   Mascot subtle parallax on hover
══════════════════════════════════════════════ */
(function() {
  var frame = document.getElementById('plateFrame');
  if (!frame) return;
  var ink = frame.querySelector('.plate__ink');
  if (!ink) return;
  var raf = null, dx = 0, dy = 0;
  function apply() {
    ink.style.transform = 'translate('+dx+'px,'+dy+'px) scale(1.015)';
    raf = null;
  }
  frame.addEventListener('mousemove', function(e) {
    var r = frame.getBoundingClientRect();
    dx = ((e.clientX - r.left) / r.width  - 0.5) * 6;
    dy = ((e.clientY - r.top)  / r.height - 0.5) * 6;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  frame.addEventListener('mouseleave', function() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    ink.style.transform = '';
  });
})();

/* ══════════════════════════════════════════════
   Stamp the seal — ◆ pulses once on sign-in click
   before View Transitions hand the page over.
══════════════════════════════════════════════ */
(function () {
  var diamond = document.querySelector('.nav__brand-mark');
  var triggers = document.querySelectorAll('a[href="/login"]');
  if (!diamond || !triggers.length) return;
  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;
  triggers.forEach(function (a) {
    a.addEventListener('click', function (e) {
      /* Stamp the seal, then hand off to View Transitions. */
      if (a._stamping) return;
      a._stamping = true;
      e.preventDefault();
      diamond.classList.remove('is-stamping');
      void diamond.offsetWidth;
      diamond.classList.add('is-stamping');
      setTimeout(function () {
        a._stamping = false;
        window.location.href = a.getAttribute('href');
      }, 280);
    });
  });
})();

/* ══════════════════════════════════════════════
   Grid overlay
══════════════════════════════════════════════ */
var gridCanvas = document.getElementById('grid-overlay');
var gCtx = gridCanvas.getContext('2d');
var currentGrid = 'none';

function resizeCanvas() {
  gridCanvas.width  = window.innerWidth;
  gridCanvas.height = window.innerHeight;
  drawGrid(currentGrid);
}

function drawGrid(type) {
  currentGrid = type;
  var w = gridCanvas.width, h = gridCanvas.height;
  gCtx.clearRect(0, 0, w, h);
  if (type === 'none') return;

  if (type === 'G1') {
    var spacing = 20;
    gCtx.fillStyle = 'rgba(40,25,10,0.18)';
    for (var x = spacing; x < w; x += spacing) {
      for (var y = spacing; y < h; y += spacing) {
        gCtx.beginPath(); gCtx.arc(x, y, 0.6, 0, Math.PI * 2); gCtx.fill();
      }
    }
  } else if (type === 'G2') {
    gCtx.strokeStyle = 'rgba(60,35,15,0.08)'; gCtx.lineWidth = 0.75;
    for (var y = 28; y < h; y += 28) {
      gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(w, y); gCtx.stroke();
    }
  } else if (type === 'G3') {
    gCtx.strokeStyle = 'rgba(40,25,10,0.07)'; gCtx.lineWidth = 0.5;
    for (var x = 24; x < w; x += 24) {
      gCtx.beginPath(); gCtx.moveTo(x, 0); gCtx.lineTo(x, h); gCtx.stroke();
    }
    for (var y = 24; y < h; y += 24) {
      gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(w, y); gCtx.stroke();
    }
  } else if (type === 'G4') {
    var sp = 60, arm = 5;
    gCtx.strokeStyle = 'rgba(40,25,10,0.20)'; gCtx.lineWidth = 1;
    for (var x = sp; x < w; x += sp) {
      for (var y = sp; y < h; y += sp) {
        gCtx.beginPath(); gCtx.moveTo(x - arm, y); gCtx.lineTo(x + arm, y); gCtx.stroke();
        gCtx.beginPath(); gCtx.moveTo(x, y - arm); gCtx.lineTo(x, y + arm); gCtx.stroke();
      }
    }
  } else if (type === 'G5') {
    for (var y = 20; y < h; y += 20) {
      var thick = (y % 80 === 0);
      gCtx.strokeStyle = thick ? 'rgba(40,25,10,0.10)' : 'rgba(40,25,10,0.055)';
      gCtx.lineWidth   = thick ? 0.8 : 0.5;
      gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(w, y); gCtx.stroke();
    }
  } else if (type === 'G6') {
    var divX = Math.round(w * 0.35);
    gCtx.strokeStyle = 'rgba(40,25,10,0.07)'; gCtx.lineWidth = 0.6;
    for (var y = 28; y < h; y += 28) {
      gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(divX, y); gCtx.stroke();
    }
    gCtx.strokeStyle = 'rgba(181,57,45,0.30)'; gCtx.lineWidth = 1;
    gCtx.beginPath(); gCtx.moveTo(divX, 0); gCtx.lineTo(divX, h); gCtx.stroke();
  }
}

window.addEventListener('resize', function() {
  gridCanvas.width  = window.innerWidth;
  gridCanvas.height = window.innerHeight;
  drawGrid(currentGrid);
});
window.addEventListener('load', function() { resizeCanvas(); });

/* Footer: auto date (latency removed — fetch was causing reflow) */
(function(){
  var dateEl = document.getElementById('footDate');
  if (dateEl) {
    var d = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateEl.textContent = String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
})();

/* Footer: 真实状态 — 仅在 /api/status 异常时翻为"维护中"，健康路径不改 DOM（避免 reflow，原 latency 抓取就是因 reflow 移除的） */
(function(){
  try {
    fetch('/api/status', { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(0); })
      .then(function(j){ if (!j || j.success === false) return Promise.reject(0); })
      .catch(function(){
        var dot = document.getElementById('statusDot');
        var val = document.getElementById('statusVal');
        if (dot) dot.style.background = '#d08700';
        if (val) { val.removeAttribute('data-i18n'); val.textContent = (window.AxiomI18n && AxiomI18n.lang === 'en') ? 'degraded' : '维护中'; }
      });
  } catch (e) {}
})();
