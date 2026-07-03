(function () {
  'use strict';
  window.MexionConfig = {
    API_BASE: '/api',
    SITE_NAME: 'Mexion',
    PAGE_SIZE: 20,
    LOGIN_URL: '/login',
    DASHBOARD_URL: '/dashboard',
    MOCK_MODE: false,
  };
  // 前端发布版本号。每次前端发布时递增；nginx 版本闸门(mexion-chat)按此值校验请求头 X-Mexion-Fe-Version，
  // 旧标签页(长期未刷新、仍跑旧 JS)会在调用受闸控的鉴权数据接口时收到 426，前端弹出刷新横幅。
  // ⚠️ 改这里必须同步把 nginx 的 $mexion_fe_ver_ok map 白名单加上新值(否则新页面全站 426)。部署顺序见 share.md。
  window.MEXION_FE_VERSION = '20260614c';
})();
(function () {
  'use strict';

  var TOAST_ID = 'mexion-global-toast';
  var HIDE_TIMER = null;

  function ensureToast() {
    var el = document.getElementById(TOAST_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = TOAST_ID;
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('role', 'status');
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:28px',
      'transform:translate(-50%,12px)',
      'min-width:180px',
      'max-width:min(460px,calc(100vw - 32px))',
      'padding:12px 16px',
      'border:1px solid rgba(20,20,15,0.12)',
      'border-radius:14px',
      'background:rgba(255,252,246,0.96)',
      'color:#14140F',
      'box-shadow:0 12px 32px rgba(20,20,15,0.12)',
      'font-size:13px',
      'line-height:1.45',
      'letter-spacing:0.02em',
      'text-align:center',
      'opacity:0',
      'pointer-events:none',
      'z-index:9999',
      'transition:opacity .18s ease, transform .18s ease'
    ].join(';');
    document.body.appendChild(el);
    return el;
  }

  function showToast(message, options) {
    if (!message) return;
    var el = ensureToast();
    var tone = options && options.tone ? options.tone : 'default';
    el.textContent = message;
    if (tone === 'error') {
      el.style.borderColor = 'rgba(160, 71, 106, 0.22)';
      el.style.color = '#8A2F48';
    } else if (tone === 'success') {
      el.style.borderColor = 'rgba(61, 122, 85, 0.22)';
      el.style.color = '#2E6A49';
    } else {
      el.style.borderColor = 'rgba(20,20,15,0.12)';
      el.style.color = '#14140F';
    }
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%,0)';
    if (HIDE_TIMER) clearTimeout(HIDE_TIMER);
    HIDE_TIMER = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%,12px)';
    }, (options && options.duration) || 2200);
  }

  window.MexionToast = {
    show: showToast
  };

  // 统一复制 + 明显反馈：把按钮图标暂时换成对勾（用户点哪看哪，比底部 toast 更易察觉），并弹 toast。
  // 空内容时给"暂无可复制内容"提示而非静默（如尚无 API Key 时）。所有复制按钮都应走这里。
  function _fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  var COPY_OK_SVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.6 7.4 5.5 10.3 11.4 3.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function copyWithFeedback(text, btn, opts) {
    opts = opts || {};
    var en = (window.MexionI18n && MexionI18n.lang === 'en');
    text = text == null ? '' : String(text);
    if (!text.trim()) {
      showToast(opts.emptyMsg || (en ? 'Nothing to copy' : '暂无可复制内容'));
      return false;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () { _fallbackCopy(text); });
    } else {
      _fallbackCopy(text);
    }
    if (btn) {
      if (btn.getAttribute('data-copy-orig') == null) btn.setAttribute('data-copy-orig', btn.innerHTML);
      btn.classList.add('is-ok');
      btn.innerHTML = COPY_OK_SVG;
      if (btn._copyTimer) clearTimeout(btn._copyTimer);
      btn._copyTimer = setTimeout(function () {
        var orig = btn.getAttribute('data-copy-orig');
        if (orig != null) btn.innerHTML = orig;
        btn.classList.remove('is-ok');
      }, 1100);
    }
    showToast(en ? 'Copied' : '已复制');
    return true;
  }
  window.MexionCopy = copyWithFeedback;
})();
(function () {
  'use strict';

  var QUOTA_PER_USD = 500000;

  function toFiniteNumber(value) {
    var num = Number(value);
    return isFinite(num) ? num : 0;
  }

  function quotaToUsd(quota) {
    return toFiniteNumber(quota) / QUOTA_PER_USD;
  }

  function getUserBalance(user) {
    if (!user || typeof user !== 'object') return 0;
    if (user.quota != null) return quotaToUsd(user.quota);
    if (user.balance != null && isFinite(Number(user.balance))) {
      return toFiniteNumber(user.balance);
    }
    return 0;
  }

  function getUserSpend(user) {
    if (!user || typeof user !== 'object') return 0;
    if (user.used_quota != null) return quotaToUsd(user.used_quota);
    return 0;
  }

  function getMoneyParts(amount) {
    var value = toFiniteNumber(amount);
    var fixed = Math.abs(value).toFixed(2).split('.');
    return {
      value: value,
      negative: value < 0,
      sign: value < 0 ? '-' : '',
      int: fixed[0],
      frac: fixed[1]
    };
  }

  function formatUsd(amount, opts) {
    var parts = getMoneyParts(amount);
    var prefix = opts && opts.currencyFirst
      ? '$' + parts.sign
      : parts.sign + '$';
    return prefix + Number(parts.int).toLocaleString() + '.' + parts.frac;
  }

  window.MexionQuota = {
    perUsd: QUOTA_PER_USD,
    quotaToUsd: quotaToUsd,
    getUserBalance: getUserBalance,
    getUserSpend: getUserSpend,
    getMoneyParts: getMoneyParts,
    formatUsd: formatUsd,
  };
})();
(function () {
  'use strict';

  var PERSIST_KEY = 'mexion_auth_persist';
  var AUTH_KEYS = [
    'mexion_user',
    'mexion_user_id',
    'mexion_user_synced_at',
    PERSIST_KEY
  ];

  function safeGet(store, key) {
    try {
      var value = store.getItem(key);
      return value == null ? '' : value;
    } catch (err) {
      return '';
    }
  }

  function safeSet(store, key, value) {
    try { store.setItem(key, value); } catch (err) {}
  }

  function safeRemove(store, key) {
    try { store.removeItem(key); } catch (err) {}
  }

  function normalizeMode(mode) {
    return mode === 'local' ? 'local' : 'session';
  }

  function readMode() {
    var sessionMode = safeGet(sessionStorage, PERSIST_KEY);
    if (sessionMode === 'local' || sessionMode === 'session') return sessionMode;
    var localMode = safeGet(localStorage, PERSIST_KEY);
    if (localMode === 'local' || localMode === 'session') return localMode;
    return 'session';
  }

  function readUidCookie() {
    try {
      var m = document.cookie.match(/(?:^|; )mexion_uid=([^;]*)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) { return ''; }
  }

  function getItem(key) {
    var sessionValue = safeGet(sessionStorage, key);
    if (sessionValue !== '') return sessionValue;
    var localValue = safeGet(localStorage, key);
    if (localValue !== '') return localValue;
    // user_id 的持久真相源 = mexion_uid cookie(与 session cookie 同寿命):storage 被清/驱逐时
    // 从 cookie 回退,登录态不再依赖易丢的 localStorage。读侧单一收口于此,无需独立的启动期回填。
    if (key === 'mexion_user_id') {
      var fromCookie = readUidCookie();
      if (fromCookie !== '') return fromCookie;
    }
    return '';
  }

  function setMode(mode) {
    var normalized = normalizeMode(mode);
    var target = normalized === 'local' ? localStorage : sessionStorage;
    var other = normalized === 'local' ? sessionStorage : localStorage;
    safeSet(target, PERSIST_KEY, normalized);
    safeRemove(other, PERSIST_KEY);
    return normalized;
  }

  function setItem(key, value, mode) {
    var normalized = setMode(mode || readMode());
    var target = normalized === 'local' ? localStorage : sessionStorage;
    var other = normalized === 'local' ? sessionStorage : localStorage;
    if (value == null || value === '') {
      safeRemove(target, key);
      safeRemove(other, key);
      return;
    }
    safeSet(target, key, String(value));
    safeRemove(other, key);
  }

  function removeItem(key) {
    safeRemove(sessionStorage, key);
    safeRemove(localStorage, key);
  }

  function clearAuth() {
    AUTH_KEYS.forEach(removeItem);
  }

  window.MexionAuthStorage = {
    getMode: readMode,
    getItem: getItem,
    setMode: setMode,
    setItem: setItem,
    removeItem: removeItem,
    clearAuth: clearAuth,
  };
})();
(function () {
  'use strict';

  function headers(extra) {
    var h = { 'Content-Type': 'application/json' };
    var uid = window.MexionAuthStorage.getItem('mexion_user_id');
    if (uid) h['X-Mexion-User'] = uid;
    if (window.MEXION_FE_VERSION) h['X-Mexion-Fe-Version'] = window.MEXION_FE_VERSION;
    if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }
  // 暴露给非 MexionHttp 的裸 fetch（如 login()）复用，使其也带版本头/鉴权头（Codex 修复，合并保留）
  window.MexionHeaders = headers;

  var ERROR_ZH = {
    'EMAIL_EXISTS': '该邮箱已被注册',
    'INVALID_VERIFY_CODE': '验证码无效或已过期',
    'INVALID_CREDENTIALS': '邮箱或密码错误',
    'EMAIL_VERIFY_REQUIRED': '需要邮箱验证',
    'REGISTRATION_DISABLED': '注册功能暂未开放',
    'REDEEM_CODE_NOT_FOUND': '兑换码不存在',
    'REDEEM_CODE_USED': '兑换码已被使用',
    'REDEEM_CODE_EXPIRED': '兑换码已过期',
    'REDEEM_CODE_INVALID': '兑换码无效',
    'TOTP_NOT_ENABLED': '两步验证未启用',
    'TOTP_INVALID': '验证码错误，请重试',
    'AFFILIATE_QUOTA_EMPTY': '暂无可转入的返利额度',
    'USER_NOT_FOUND': '邮箱或密码错误',
    'RATE_LIMIT_EXCEEDED': '请求过于频繁，请稍后再试',
    'PLAN_NOT_FOUND': '套餐不存在',
    'INSUFFICIENT_BALANCE': '余额不足',
    'PASSWORD_INCORRECT': '当前密码不正确',
    'USERNAME_EXISTS': '该用户名已被使用',
    'USERNAME_INVALID': '用户名格式不正确',
    'ACCOUNT_DISABLED': '账号已被停用，请联系管理员',
    'ACCOUNT_SUSPENDED': '账号已被暂停，请联系管理员',
    'INVITATION_CODE_REQUIRED': '需要邀请码',
    'INVITATION_CODE_INVALID': '邀请码无效或已过期',
  };

  var ERROR_EN = {
    'EMAIL_EXISTS': 'This email is already registered',
    'INVALID_VERIFY_CODE': 'Invalid or expired verification code',
    'INVALID_CREDENTIALS': 'Incorrect email or password',
    'EMAIL_VERIFY_REQUIRED': 'Email verification required',
    'REGISTRATION_DISABLED': 'Registration is currently closed',
    'REDEEM_CODE_NOT_FOUND': 'Redeem code not found',
    'REDEEM_CODE_USED': 'Redeem code already used',
    'REDEEM_CODE_EXPIRED': 'Redeem code expired',
    'REDEEM_CODE_INVALID': 'Invalid redeem code',
    'TOTP_NOT_ENABLED': 'Two-factor authentication not enabled',
    'TOTP_INVALID': 'Invalid code, please try again',
    'AFFILIATE_QUOTA_EMPTY': 'No affiliate balance to transfer',
    'USER_NOT_FOUND': 'Incorrect email or password',
    'RATE_LIMIT_EXCEEDED': 'Too many requests, please try again later',
    'PLAN_NOT_FOUND': 'Plan not found',
    'INSUFFICIENT_BALANCE': 'Insufficient balance',
    'PASSWORD_INCORRECT': 'Current password is incorrect',
    'USERNAME_EXISTS': 'This username is already taken',
    'USERNAME_INVALID': 'Invalid username format',
    'ACCOUNT_DISABLED': 'Account disabled, please contact support',
    'ACCOUNT_SUSPENDED': 'Account suspended, please contact support',
    'INVITATION_CODE_REQUIRED': 'Invitation code required',
    'INVITATION_CODE_INVALID': 'Invalid or expired invitation code',
  };

  var VALIDATION_ZH = {
    'Email': '请输入有效的邮箱地址',
    'Password': '密码长度至少 8 位',
    'Username': '用户名格式不正确',
    'VerifyCode': '请输入验证码',
  };

  var VALIDATION_EN = {
    'Email': 'Please enter a valid email address',
    'Password': 'Password must be at least 8 characters',
    'Username': 'Invalid username format',
    'VerifyCode': 'Please enter the verification code',
  };

  function translateValidationMessage(msg, lang) {
    var isZh = lang === 'zh';
    if (!msg) return '';
    if (msg.indexOf('User.Username') !== -1 && msg.indexOf("'max'") !== -1) {
      return isZh ? '用户名最多 20 个字符' : 'Username must be 20 characters or fewer';
    }
    if (msg.indexOf('User.Username') !== -1 && msg.indexOf("'min'") !== -1) {
      return isZh ? '用户名至少 3 个字符' : 'Username must be at least 3 characters';
    }
    if (msg.indexOf('User.Password') !== -1 && msg.indexOf("'min'") !== -1) {
      return isZh ? '密码至少 8 位' : 'Password must be at least 8 characters';
    }
    if (msg.indexOf('User.Password') !== -1 && msg.indexOf("'max'") !== -1) {
      return isZh ? '密码最多 20 个字符' : 'Password must be 20 characters or fewer';
    }
    if (msg.indexOf('User.Email') !== -1 && msg.indexOf("'max'") !== -1) {
      return isZh ? '邮箱长度不能超过 50 个字符' : 'Email must be 50 characters or fewer';
    }
    if (msg.indexOf('User.VerificationCode') !== -1 || msg.indexOf('VerifyCode') !== -1) {
      return isZh ? '请输入 6 位验证码' : 'Please enter the 6-character verification code';
    }
    return '';
  }

  function translateError(json) {
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    var map = lang === 'zh' ? ERROR_ZH : ERROR_EN;
    if (json.reason && map[json.reason]) return map[json.reason];
    var msg = json.message || '';
    var validationMsg = translateValidationMessage(msg, lang);
    if (validationMsg) return validationMsg;
    if (msg.indexOf('Invalid request') === 0) {
      var vMap = lang === 'zh' ? VALIDATION_ZH : VALIDATION_EN;
      for (var field in vMap) {
        if (msg.indexOf(field) !== -1) return vMap[field];
      }
      return lang === 'zh' ? '请检查输入内容' : 'Please check your input';
    }
    return msg || (lang === 'zh' ? '请求失败' : 'Request failed');
  }

  var _feOutdatedShown = false;
  function showFrontendOutdated() {
    if (_feOutdatedShown) return;
    _feOutdatedShown = true;
    try {
      var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
      var isZh = lang === 'zh';
      if (document.getElementById('mexion-fe-outdated')) return;
      var bar = document.createElement('div');
      bar.id = 'mexion-fe-outdated';
      bar.style.cssText = [
        'position:fixed', 'left:0', 'right:0', 'top:0', 'z-index:2147483647',
        'display:flex', 'align-items:center', 'justify-content:center', 'gap:14px',
        'padding:12px 18px', 'background:#14140F', 'color:#FFFCF6',
        'font-size:14px', 'line-height:1.4', 'letter-spacing:0.02em',
        'box-shadow:0 6px 24px rgba(20,20,15,0.28)'
      ].join(';');
      var span = document.createElement('span');
      span.textContent = isZh ? '页面有新版本，请刷新后继续使用' : 'A new version is available — please refresh to continue';
      var btn = document.createElement('button');
      btn.textContent = isZh ? '刷新' : 'Refresh';
      btn.style.cssText = [
        'cursor:pointer', 'border:0', 'border-radius:10px', 'padding:6px 18px',
        'background:#FFFCF6', 'color:#14140F', 'font-size:13px', 'font-weight:600'
      ].join(';');
      btn.onclick = function () { window.location.reload(); };
      bar.appendChild(span);
      bar.appendChild(btn);
      (document.body || document.documentElement).appendChild(bar);
    } catch (e) { /* 兜底：横幅渲染失败也不影响错误向上抛出 */ }
  }

  function handleResponse(res) {
    if (res.status === 426) {
      showFrontendOutdated();
      var _l = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
      var e426 = new Error(_l === 'zh' ? '页面有新版本，请刷新页面' : 'A new version is available — please refresh');
      e426._feOutdated = true;
      return Promise.reject(e426);
    }
    if (res.status === 401) {
      return res.json().then(function (json) {
        var e = new Error(translateError(json));
        e._retry = true;
        return Promise.reject(e);
      }).catch(function (parseErr) {
        if (parseErr._retry) return Promise.reject(parseErr);
        var e = new Error('Unauthorized');
        e._retry = true;
        return Promise.reject(e);
      });
    }
    if (!res.ok) {
      return res.text().then(function (text) {
        var msg = 'HTTP ' + res.status;
        try { var j = JSON.parse(text); msg = translateError(j); } catch(e) {}
        return Promise.reject(new Error(msg));
      });
    }
    var ct = res.headers.get('content-type') || '';
    if (ct.indexOf('json') === -1) {
      return Promise.reject(new Error('HTTP ' + res.status));
    }
    return res.json().then(function (json) {
      if (json.success === false) return Promise.reject(new Error(translateError(json)));
      if (json && json.url && json.data && typeof json.data === 'object' && !Array.isArray(json.data) && json.data.url == null) {
        json.data.url = json.url;
      }
      return json.data;
    });
  }

  var _refreshPromise = null;

  function refreshAuth() {
    return Promise.reject(new Error('Session expired'));
  }

  function clearAuthCookie(name) {
    var host = window.location.hostname || '';
    var base = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = base;
    if (host && host !== 'localhost' && /^\d+\.\d+\.\d+\.\d+$/.test(host) === false && host.indexOf('.') >= 0) {
      document.cookie = base + ';domain=.' + host.replace(/^www\./, '');
    }
  }

  function forceLogout() {
    window.MexionAuthStorage.clearAuth();
    clearAuthCookie('mexion_sso');
    clearAuthCookie('mexion_uid');
    clearAuthCookie('session');
    window.location.href = MexionConfig.LOGIN_URL;
  }

  var AUTH_PATHS = ['/user/login', '/user/register'];

  function request(method, path, body) {
    var url = MexionConfig.API_BASE + path;
    var isAuthPath = AUTH_PATHS.indexOf(path) !== -1;
    function doFetch() {
      var opts = { method: method, headers: headers(), credentials: 'same-origin' };
      if (body && method !== 'GET') opts.body = JSON.stringify(body);
      return fetch(url, opts).then(handleResponse);
    }
    return doFetch().catch(function (err) {
      if (err && err._retry) {
        if (isAuthPath) return Promise.reject(err);
        return refreshAuth().then(doFetch).catch(function () {
          forceLogout();
          return Promise.reject(new Error('Unauthorized'));
        });
      }
      return Promise.reject(err);
    });
  }

  window.MexionHttp = {
    get:    function (path) { return request('GET', path); },
    post:   function (path, body) { return request('POST', path, body); },
    put:    function (path, body) { return request('PUT', path, body); },
    delete: function (path) { return request('DELETE', path); },
  };
})();
(function () {
  'use strict';

  var USER_KEY  = 'mexion_user';
  var USER_SYNC_EVENT = 'mexion:user-updated';
  var USER_SYNC_AT_KEY = 'mexion_user_synced_at';
  var USER_SYNC_INTERVAL_MS = 15000;
  var USER_SYNC_FOCUS_MIN_INTERVAL_MS = 5000;
  var MOCK_USER  = {
    id: 1,
    email: '',
    username: '',
    role: 'user',
    balance: 100000,
    status: 'active',
  };
  var _userRefreshPromise = null;
  var _userSyncStarted = false;
  var _userSyncTimer = null;
  var _lastUserRefreshAt = readStoredSyncAt();

  function readStoredSyncAt() {
    var raw = Number(window.MexionAuthStorage.getItem(USER_SYNC_AT_KEY) || 0);
    return isFinite(raw) && raw > 0 ? raw : 0;
  }

  function markUserSynced(ts) {
    _lastUserRefreshAt = ts;
    window.MexionAuthStorage.setItem(USER_SYNC_AT_KEY, String(ts));
  }

  function emitUserUpdate(user, source) {
    var detail = {
      user: user || null,
      source: source || 'unknown',
      syncedAt: _lastUserRefreshAt
    };
    try {
      window.dispatchEvent(new CustomEvent(USER_SYNC_EVENT, { detail: detail }));
    } catch (err) {
      var ev = document.createEvent('Event');
      ev.initEvent(USER_SYNC_EVENT, false, false);
      ev.detail = detail;
      window.dispatchEvent(ev);
    }
  }

  function setStoredUser(user) {
    window.MexionAuthStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user && user.id) {
      window.MexionAuthStorage.setItem('mexion_user_id', String(user.id));
      setUidCookie(user.id); // 冗余持久 cookie,localStorage 丢失后据此恢复
    }
  }

  function normalizeUser(data) {
    var source = data && typeof data === 'object' ? data : {};
    var user = {};
    Object.keys(source).forEach(function (key) {
      user[key] = source[key];
    });
    user.email = source.email || source.username || '';
    user.username = source.display_name || source.username || '';
    user.display_name = source.display_name || source.username || user.username;
    user.balance = window.MexionQuota.getUserBalance(source);
    user.auth_role = source.role === 100 ? 'admin' : 'user';
    user.auth_status = source.status === 1
      ? 'active'
      : (source.status === 'active' ? 'active' : 'disabled');
    user.group = source.group || 'gpt-codex';
    user.aff_code = source.aff_code || '';
    user.quota = source.quota || 0;
    user.used_quota = source.used_quota || 0;
    user.request_count = source.request_count || 0;
    // 二开：等级体系字段
    user.level = source.level || 0;
    user.level_locked = !!source.level_locked;
    user.used_token = source.used_token || 0;
    user.total_topup = source.total_topup || 0;
    return user;
  }

  function storeSyncedUser(user, source) {
    setStoredUser(user);
    markUserSynced(Date.now());
    emitUserUpdate(user, source);
    return user;
  }

  function isLoggedIn() {
    return !!window.MexionAuthStorage.getItem('mexion_user_id');
  }

  function getUser() {
    try { return JSON.parse(window.MexionAuthStorage.getItem(USER_KEY) || 'null') || null; }
    catch (e) { return null; }
  }

  function currentCookieDomain() {
    var host = window.location.hostname || '';
    if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return '';
    return host.indexOf('.') >= 0 ? ';domain=.' + host.replace(/^www\./, '') : '';
  }

  function cookieSuffix() {
    var secure = window.location.protocol === 'https:' ? ';Secure' : '';
    return ';path=/' + currentCookieDomain() + ';SameSite=Lax' + secure;
  }

  function clearCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT' + cookieSuffix();
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  function setSsoCookie() {
    var d = new Date();
    d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = 'mexion_sso=1' +
      ';expires=' + d.toUTCString() +
      cookieSuffix();
  }

  function clearSsoCookie() {
    clearCookie('mexion_sso');
  }

  // 二开:user_id 的持久真相源 = 前端可读的 mexion_uid cookie(与 session cookie 同寿命/30天)。
  // 写侧在此(登录落、登出清);读侧收口于 MexionAuthStorage.getItem('mexion_user_id') 的 cookie 回退,
  // 使 storage 被清/驱逐(移动端、微信/QQ 内置浏览器常见)时登录态不丢。只存非敏感 user_id,鉴权仍靠 session cookie。
  function setUidCookie(id) {
    if (!id) return;
    // 只在"保持登录"(local 模式)时落持久 cookie;session 模式(关浏览器即登出)清掉,尊重用户意图。
    if (window.MexionAuthStorage.getMode() !== 'local') { clearUidCookie(); return; }
    var d = new Date();
    d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = 'mexion_uid=' + encodeURIComponent(String(id)) +
      ';expires=' + d.toUTCString() +
      cookieSuffix();
  }

  function clearUidCookie() {
    clearCookie('mexion_uid');
  }

  function setSession(token, user, refreshToken, rememberMe) {
    var mode = rememberMe ? 'local' : 'session';
    window.MexionAuthStorage.setMode(mode);
    setStoredUser(user);
    setSsoCookie();
  }

  function clearSession() {
    window.MexionAuthStorage.clearAuth();
    clearSsoCookie();
    clearUidCookie();
    _lastUserRefreshAt = 0;
    emitUserUpdate(null, 'logout');
  }

  function login(email, password, rememberMe) {
    if (MexionConfig.MOCK_MODE) {
      var user = Object.assign({}, MOCK_USER, { email: email, username: email.split('@')[0] });
      setSession(null, user, null, rememberMe);
      return Promise.resolve(user);
    }
    return fetch(MexionConfig.API_BASE + '/user/login', {
      method: 'POST',
      headers: window.MexionHeaders ? window.MexionHeaders() : { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: password }),
      credentials: 'same-origin'
    }).then(function (res) {
      if (!res.ok) {
        return res.json().then(function (j) {
          return Promise.reject(new Error(j.message || 'Login failed'));
        });
      }
      return res.json();
    }).then(function (json) {
      if (json.success === false) return Promise.reject(new Error(json.message || 'Login failed'));
      var loginData = json.data || {};
      var user = {
        id: loginData.id,
        email: email,
        username: loginData.display_name || loginData.username || email.split('@')[0],
        role: loginData.role === 100 || loginData.role === 'admin' ? 'admin' : 'user',
        balance: 0,
        status: loginData.status === 1 ? 'active' : 'disabled'
      };
      setSession('', user, '', rememberMe);
      return fetchUser().then(function (fullUser) { return fullUser; }).catch(function () { return user; });
    });
  }

  function fetchUser(options) {
    if (!isLoggedIn()) return Promise.resolve(null);
    if (_userRefreshPromise) return _userRefreshPromise;
    _userRefreshPromise = MexionHttp.get('/user/self').then(function (data) {
      return storeSyncedUser(
        normalizeUser(data),
        options && options.source ? options.source : 'fetch'
      );
    }).finally(function () {
      _userRefreshPromise = null;
    });
    return _userRefreshPromise;
  }

  function refreshUser(options) {
    if (!isLoggedIn()) return Promise.resolve(null);
    var opts = options || {};
    var minIntervalMs = opts.minIntervalMs || 0;
    var lastSyncedAt = Math.max(_lastUserRefreshAt, readStoredSyncAt());
    if (!opts.force && minIntervalMs > 0 && Date.now() - lastSyncedAt < minIntervalMs) {
      return Promise.resolve(getUser());
    }
    return fetchUser(opts);
  }

  function startUserSync(options) {
    if (_userSyncStarted) return;
    _userSyncStarted = true;

    var opts = options || {};
    var intervalMs = opts.intervalMs || USER_SYNC_INTERVAL_MS;
    var focusMinIntervalMs = opts.focusMinIntervalMs || USER_SYNC_FOCUS_MIN_INTERVAL_MS;

    function syncVisible(source, minIntervalMs) {
      if (!isLoggedIn()) return;
      if (source === 'interval' && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      refreshUser({
        source: source,
        minIntervalMs: minIntervalMs
      }).catch(function () {});
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', function () {
        syncVisible('focus', focusMinIntervalMs);
      });
      window.addEventListener('storage', function (event) {
        if (event.key === USER_SYNC_AT_KEY) {
          _lastUserRefreshAt = readStoredSyncAt();
          return;
        }
        if (event.key === USER_KEY) {
          emitUserUpdate(getUser(), 'storage');
        }
      });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
          syncVisible('visible', focusMinIntervalMs);
        }
      });
    }

    _userSyncTimer = window.setInterval(function () {
      syncVisible('interval', Math.max(0, intervalMs - 1000));
    }, intervalMs);
    syncVisible('init', 0);
  }

  function register(payloadOrEmail, password) {
    if (MexionConfig.MOCK_MODE) {
      return Promise.resolve({ message: 'Registration successful' });
    }
    var payload = typeof payloadOrEmail === 'object' && payloadOrEmail !== null
      ? payloadOrEmail
      : { username: payloadOrEmail, email: payloadOrEmail, password: password };
    return MexionHttp.post('/user/register', payload);
  }

  function logout() {
    clearSession();
    window.location.href = MexionConfig.LOGIN_URL;
  }

  function guard() {
    if (!isLoggedIn()) {
      window.location.replace(MexionConfig.LOGIN_URL);
    }
  }

  function getInitial(user) {
    if (!user) return '?';
    var name = user.username || user.email || '';
    return (name.charAt(0) || '?').toUpperCase();
  }

  function renderAvatar(el) {
    var img = el.querySelector('img');
    if (img) img.remove();
    el.textContent = 'A';
  }

  function hydrateUI() {
    var user = getUser();
    if (!user) return;
    var displayName = user.username || (user.email ? user.email.split('@')[0] : '');
    var email = user.email || '';
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'en';

    var initial = getInitial(user);
    document.querySelectorAll('[data-mexion-avatar]').forEach(function(el) {
      var img = el.querySelector('img');
      if (img) img.remove();
      el.textContent = initial;
    });

    document.querySelectorAll('[data-mexion-user="name"]').forEach(function (el) {
      el.textContent = displayName;
      el.removeAttribute('data-i18n');
      el.removeAttribute('data-i18n-html');
    });
    document.querySelectorAll('[data-mexion-user="email"]').forEach(function (el) {
      el.textContent = email;
    });

    var hero = document.querySelector('.hero__hello');
    if (hero) {
      var h = new Date().getHours();
      var pool = lang === 'zh' ? (
        h < 6  ? ['夜深了','还在忙','辛苦了'] :
        h < 12 ? ['早上好','新的一天','早安'] :
        h < 14 ? ['中午好','午安','忙碌的上午'] :
        h < 18 ? ['下午好','继续前进','加油'] :
        h < 22 ? ['晚上好','辛苦了','晚安'] :
                 ['夜深了','还在工作','注意休息']
      ) : (
        h < 6  ? ['Burning the midnight oil','Late night','Still at it'] :
        h < 12 ? ['Good morning','Rise and build','Morning'] :
        h < 14 ? ['Good afternoon','Lunchtime','Midday'] :
        h < 18 ? ['Good afternoon','Keep going','Afternoon'] :
        h < 22 ? ['Good evening','Evening','Winding down'] :
                 ['Late night','Still building','Night owl']
      );
      var greet = pool[Math.floor(Math.random() * pool.length)];
      var safe = displayName.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&amp;quot;');
      hero.innerHTML = greet + ', <em>' + safe + '.</em>';
      hero.removeAttribute('data-i18n-html');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateUI);
  } else {
    hydrateUI();
  }

  window.MexionAuth = {
    isLoggedIn: isLoggedIn,
    getUser:    getUser,
    getInitial: getInitial,
    fetchUser:  fetchUser,
    refreshUser: refreshUser,
    login:      login,
    register:   register,
    logout:     logout,
    guard:      guard,
    setSession: setSession,
    clearSession: clearSession,
    hydrateUI:  hydrateUI,
    startUserSync: startUserSync,
    userSyncEvent: USER_SYNC_EVENT,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      startUserSync();
    });
  } else {
    startUserSync();
  }
})();
(function(){
  if (typeof MexionI18n === 'undefined') return;
  MexionI18n.register({
    en: {
      'shared.nav.profile': 'Profile',
      'shared.nav.apikeys': 'API Keys',
      'shared.nav.signout': 'Sign out',
      'shared.topbar.notify': 'Notifications',
      'shared.menu.account': 'Account menu',
      'shared.toast.copied': 'Copied',
      'shared.group.select': 'Select a group',
      'shared.group.select.hint': 'Click to choose a group',
    },
    zh: {
      'shared.nav.profile': '个人资料',
      'shared.nav.apikeys': 'API 密钥',
      'shared.nav.signout': '退出登录',
      'shared.topbar.notify': '通知',
      'shared.menu.account': '账户菜单',
      'shared.toast.copied': '已复制',
      'shared.group.select': '选择分组',
      'shared.group.select.hint': '点击选择一个分组',
    }
  });
})();

/* ─── Theme (light/dark) ─── 二开：用户端暗色模式 + 平滑切换。
   - 存储键 mexion_theme: 'light' | 'dark'（未设=跟随系统）。
   - <head> 内联脚本在首帧前已设好 data-theme（防闪烁）；本模块负责注入切换按钮、
     系统偏好跟随、以及切换时的过渡动画（View Transitions 圆形揭示，回退到 .theme-anim 交叉淡入）。 */
(function () {
  'use strict';
  var KEY = 'mexion_theme';
  var root = document.documentElement;

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function systemDark() { try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
  function effective() { var s = stored(); return s === 'dark' || s === 'light' ? s : (systemDark() ? 'dark' : 'light'); }

  function paint(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#15140E' : '#F4F3EE');
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  }

  function commit(theme, ev) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduce) { paint(theme); return; }

    if (document.startViewTransition) {
      var x = ev && ev.clientX ? ev.clientX : window.innerWidth - 40;
      var y = ev && ev.clientY ? ev.clientY : 40;
      var end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      var vt = document.startViewTransition(function () { paint(theme); });
      vt.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    } else {
      root.classList.add('theme-anim');
      paint(theme);
      setTimeout(function () { root.classList.remove('theme-anim'); }, 540);
    }
  }

  function toggle(ev) { commit(effective() === 'dark' ? 'light' : 'dark', ev); }

  function buildButton() {
    var en = (window.MexionI18n && MexionI18n.lang === 'en');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', en ? 'Toggle dark mode' : '切换深色模式');
    btn.title = en ? 'Toggle dark mode' : '深色 / 浅色';
    btn.innerHTML =
      '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    btn.addEventListener('click', toggle);
    return btn;
  }

  function inject() {
    if (document.querySelector('.theme-toggle')) return;
    var lang = document.querySelector('.lang-toggle');
    var btn = buildButton();
    if (lang && lang.parentNode) {
      lang.parentNode.insertBefore(btn, lang); // 放在语言切换左侧
    } else {
      // 无 topbar 的页面：右上角浮动按钮
      btn.style.cssText += ';position:fixed;top:16px;right:16px;z-index:200;box-shadow:var(--shadow-1)';
      document.body.appendChild(btn);
    }
    paint(effective());
  }

  function init() {
    inject();
    // 系统偏好变化：仅当用户未显式选择（跟随系统）时才联动
    try {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onSys = function () { if (!stored()) paint(systemDark() ? 'dark' : 'light'); };
      mq.addEventListener ? mq.addEventListener('change', onSys) : mq.addListener(onSys);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.MexionTheme = { get: effective, set: commit, toggle: toggle };
})();

/* Role persistence bridge for unified user/admin login. Appended without
   changing the auth storage contract: role is non-sensitive UI state used
   only for nav visibility and admin page guards. */
(function () {
  'use strict';
  function clearRole() {
    try { localStorage.removeItem('mexion_user_role'); } catch (e) {}
    try { sessionStorage.removeItem('mexion_user_role'); } catch (e) {}
  }
  function storeRoleFromUser(user) {
    if (!user || !user.role) return;
    try { localStorage.setItem('mexion_user_role', user.role === 'admin' ? 'admin' : 'user'); } catch (e) {}
  }
  function patch() {
    if (!window.MexionAuth || window.MexionAuth.__roleBridgePatched) return;
    var auth = window.MexionAuth;
    var originalSetSession = auth.setSession;
    var originalClearSession = auth.clearSession;
    var originalLogout = auth.logout;
    auth.setSession = function (token, user, refreshToken, rememberMe) {
      var result = originalSetSession.apply(this, arguments);
      storeRoleFromUser(user);
      return result;
    };
    auth.clearSession = function () {
      clearRole();
      return originalClearSession.apply(this, arguments);
    };
    auth.logout = function () {
      clearRole();
      return originalLogout.apply(this, arguments);
    };
    window.MexionAuth.__roleBridgePatched = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch);
  else patch();
})();
