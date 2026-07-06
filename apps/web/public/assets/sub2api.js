/**
 * sub2api.js — Mexion static UI adapter for sub2api.
 * Bridges legacy MexionHttp/MexionAuth calls to sub2api's /api/v1 API.
 */
(function (global) {
  'use strict';

  var BASE = '/api/v1';
  var AUTH_KEYS = [
    'auth_token', 'refresh_token', 'auth_user', 'token_expires_at',
    'mexion_user', 'mexion_user_id', 'mexion_user_role', 'mexion_user_synced_at',
    'mexion_auth_persist'
  ];
  var refreshPromise = null;
  var listeners = [];

  function safeGet(store, key) {
    try { return store.getItem(key) || ''; } catch (e) { return ''; }
  }
  function safeSet(store, key, value) {
    try { store.setItem(key, String(value == null ? '' : value)); } catch (e) {}
  }
  function safeRemove(store, key) {
    try { store.removeItem(key); } catch (e) {}
  }
  function removeEverywhere(key) {
    safeRemove(localStorage, key);
    safeRemove(sessionStorage, key);
  }
  function getToken() {
    return safeGet(localStorage, 'auth_token') || safeGet(sessionStorage, 'auth_token');
  }
  function getRefreshToken() {
    return safeGet(localStorage, 'refresh_token') || safeGet(sessionStorage, 'refresh_token');
  }
  function getLocale() {
    try {
      return (global.MexionI18n && global.MexionI18n.lang) || document.documentElement.lang || 'zh';
    } catch (e) { return 'zh'; }
  }
  function timezone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; }
  }
  function toQuery(obj) {
    var qs = new URLSearchParams();
    Object.keys(obj || {}).forEach(function (k) {
      var v = obj[k];
      if (v == null || v === '') return;
      qs.set(k, String(v));
    });
    return qs.toString();
  }
  function mergeQuery(path, params) {
    var parts = String(path || '').split('?');
    var qs = new URLSearchParams(parts[1] || '');
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v == null || v === '') return;
      if (!qs.has(k)) qs.set(k, String(v));
    });
    var out = qs.toString();
    return parts[0] + (out ? '?' + out : '');
  }
  function stripBase(input) {
    var path = String(input || '/');
    if (/^https?:\/\//i.test(path)) {
      try {
        var u = new URL(path, location.origin);
        path = u.pathname + u.search;
      } catch (e) {}
    }
    if (path.charAt(0) !== '/') path = '/' + path;
    if (path.indexOf(BASE + '/') === 0) return path.slice(BASE.length) || '/';
    if (path === BASE) return '/';
    if (path.indexOf('/api/v1/') === 0) return path.slice('/api/v1'.length) || '/';
    if (path.indexOf('/api/') === 0) return path.slice('/api'.length) || '/';
    if (path === '/api') return '/';
    return path;
  }
  function apiUrl(path) {
    if (path.indexOf(BASE + '/') === 0 || path === BASE) return path;
    return BASE + (path.charAt(0) === '/' ? path : '/' + path);
  }
  function jsonClone(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
  }
  function asArray(data, keys) {
    if (Array.isArray(data)) return data;
    data = data || {};
    for (var i = 0; i < keys.length; i++) {
      if (Array.isArray(data[keys[i]])) return data[keys[i]];
    }
    return [];
  }
  function normalizeRole(role) {
    return role === 'admin' || role === 100 ? 'admin' : 'user';
  }
  function normalizeStatus(status) {
    if (status === 1 || status === true || status === 'active') return 'active';
    if (status === 'banned' || status === 'disabled' || status === 'inactive' || status === 0 || status === false) return status === 'banned' ? 'banned' : 'disabled';
    return status || 'active';
  }
  function normalizeUser(user) {
    user = user || {};
    return {
      id: user.id,
      username: user.username || user.display_name || user.displayName || (user.email ? String(user.email).split('@')[0] : ''),
      email: user.email || '',
      role: normalizeRole(user.role),
      balance: Number(user.balance || user.quota || 0),
      status: normalizeStatus(user.status),
      created_at: user.created_at || user.createdAt || '',
      avatar_url: user.avatar_url || user.avatarUrl || ''
    };
  }
  function emit(user) {
    listeners.slice().forEach(function (fn) {
      try { fn(user || null); } catch (e) {}
    });
    try { global.dispatchEvent(new CustomEvent('mexion:user-updated', { detail: { user: user || null, source: 'sub2api' } })); } catch (e) {}
  }
  function persistAuth(data, remember) {
    data = data || {};
    var user = normalizeUser(data.user || data);
    var mode = remember === false ? 'session' : 'local';
    var token = data.access_token || data.token || getToken();
    var refresh = data.refresh_token || getRefreshToken();
    var expires = data.expires_in ? String(Date.now() + Number(data.expires_in) * 1000) : safeGet(localStorage, 'token_expires_at');

    AUTH_KEYS.forEach(function (k) { if (mode === 'local') safeRemove(sessionStorage, k); else safeRemove(localStorage, k); });
    var store = mode === 'local' ? localStorage : sessionStorage;
    if (token) safeSet(store, 'auth_token', token);
    if (refresh) safeSet(store, 'refresh_token', refresh);
    if (expires) safeSet(store, 'token_expires_at', expires);
    safeSet(store, 'auth_user', JSON.stringify(user));
    safeSet(store, 'mexion_user', JSON.stringify(user));
    if (user.id != null) safeSet(store, 'mexion_user_id', user.id);
    safeSet(localStorage, 'mexion_user_role', user.role); // sidebar/admin guards read localStorage
    safeSet(store, 'mexion_auth_persist', mode);
    emit(user);
    return user;
  }
  function persistTokens(data, remember) {
    data = data || {};
    var mode = remember === false ? 'session' : 'local';
    var store = mode === 'local' ? localStorage : sessionStorage;
    var other = mode === 'local' ? sessionStorage : localStorage;
    ['auth_token', 'refresh_token', 'token_expires_at', 'mexion_auth_persist'].forEach(function (k) { safeRemove(other, k); });
    if (data.access_token) safeSet(store, 'auth_token', data.access_token);
    if (data.refresh_token) safeSet(store, 'refresh_token', data.refresh_token);
    if (data.expires_in) safeSet(store, 'token_expires_at', String(Date.now() + Number(data.expires_in) * 1000));
    safeSet(store, 'mexion_auth_persist', mode);
  }
  function clearAuth() {
    AUTH_KEYS.forEach(removeEverywhere);
    try { document.cookie = 'mexion_uid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; } catch (e) {}
    emit(null);
  }
  function readUser() {
    var raw = safeGet(localStorage, 'auth_user') || safeGet(sessionStorage, 'auth_user') || safeGet(localStorage, 'mexion_user') || safeGet(sessionStorage, 'mexion_user');
    try { return raw ? normalizeUser(JSON.parse(raw)) : null; } catch (e) { return null; }
  }

  function toLegacyGroup(g, idx) {
    g = g || {};
    var ratio = g.ratio != null ? Number(g.ratio) : (g.rate_multiplier != null ? Number(g.rate_multiplier) / 100 : (g.rateMultiplier != null ? Number(g.rateMultiplier) / 100 : 1));
    if (!isFinite(ratio) || ratio <= 0) ratio = 1;
    return {
      id: g.id,
      name: g.name || ('group_' + (idx + 1)),
      slug: g.slug || g.name || String(g.id || ''),
      description: g.description || g.desc || '',
      desc: g.description || g.desc || '',
      ratio: ratio,
      rateMultiplier: Math.round(ratio * 100),
      rate_multiplier: Math.round(ratio * 100),
      isDefault: !!(g.is_default || g.isDefault),
      isDefaultGroup: !!(g.is_default || g.isDefault),
      is_public: g.is_public,
      created_at: g.created_at || g.createdAt || ''
    };
  }
  function toLegacyKey(k) {
    k = k || {};
    var status = k.status === 'inactive' ? 'disabled' : (k.status || 'active');
    var quota = k.quota != null ? Number(k.quota) : (k.quotaLimit != null ? Number(k.quotaLimit) : null);
    if (quota === 0) quota = null;
    return {
      id: k.id,
      name: k.name || ('Key ' + (k.id || '')),
      key: k.key || k.secret || k.prefix || k.keyPrefix || '',
      secret: k.key || k.secret || '',
      prefix: k.prefix || k.keyPrefix || k.key || '',
      keyPrefix: k.keyPrefix || k.prefix || k.key || '',
      status: status,
      groupId: k.group_id != null ? k.group_id : k.groupId,
      group_id: k.group_id != null ? k.group_id : k.groupId,
      quotaLimit: quota,
      quota_limit: quota,
      usedQuota: k.used_quota != null ? k.used_quota : k.usedQuota,
      quotaUsed: k.used_quota != null ? k.used_quota : k.quotaUsed,
      used_quota: k.used_quota,
      expiresAt: k.expires_at || k.expiresAt || null,
      expires_at: k.expires_at || k.expiresAt || null,
      lastUsedAt: k.last_used_at || k.lastUsedAt || null,
      last_used_at: k.last_used_at || k.lastUsedAt || null,
      createdAt: k.created_at || k.createdAt || null,
      created_at: k.created_at || k.createdAt || null,
      ipAllow: k.ip_whitelist || k.ipAllow || [],
      ipWhitelist: k.ip_whitelist || k.ipWhitelist || [],
      ipBlacklist: k.ip_blacklist || k.ipBlacklist || [],
      modelAllow: k.model_allow || k.modelAllow || [],
      note: k.note || k.notes || ''
    };
  }
  function keyListCompat(d) {
    var items = asArray(d, ['items', 'keys']).map(toLegacyKey);
    return {
      keys: items,
      items: items,
      total: d && d.total != null ? d.total : items.length,
      page: d && d.page || 1,
      page_size: d && d.page_size || items.length
    };
  }
  function groupListCompat(d) {
    var groups = asArray(d, ['items', 'groups']).map(toLegacyGroup);
    return { groups: groups, items: groups, total: d && d.total != null ? d.total : groups.length };
  }
  function usageDaysCompat(d) {
    var items = asArray(d, ['items', 'days']);
    return {
      days: items.map(function (x) {
        return {
          date: x.date || x.day || '',
          calls: Number(x.requests || x.calls || 0),
          tokens: Number(x.total_tokens || x.tokens || 0),
          cost: Number(x.actual_cost || x.cost || 0),
          avgLatency: Number(x.avg_latency || x.avgLatency || x.duration_ms || 0),
          errors: Number(x.errors || x.error_count || 0)
        };
      })
    };
  }
  function logListCompat(d) {
    var items = asArray(d, ['items', 'logs']);
    return { logs: items, items: items, total: d && d.total != null ? d.total : items.length };
  }
  function toSub2KeyPayload(body) {
    body = jsonClone(body || {});
    var out = {};
    if (body.name != null) out.name = body.name;
    if (body.group_id != null) out.group_id = body.group_id;
    if (body.groupId != null) out.group_id = body.groupId;
    if (body.custom_key != null) out.custom_key = body.custom_key;
    if (Array.isArray(body.ip_whitelist)) out.ip_whitelist = body.ip_whitelist;
    if (Array.isArray(body.ipAllow)) out.ip_whitelist = body.ipAllow;
    if (Array.isArray(body.ip_blacklist)) out.ip_blacklist = body.ip_blacklist;
    if (body.quota != null) out.quota = Number(body.quota) || 0;
    if (body.quotaLimit != null) out.quota = Number(body.quotaLimit) || 0;
    if (body.status != null) out.status = body.status === 'disabled' ? 'inactive' : body.status;
    if (body.expires_in_days != null) out.expires_in_days = body.expires_in_days;
    if (body.expiresAt) {
      var days = Math.ceil((new Date(body.expiresAt).getTime() - Date.now()) / 86400000);
      if (isFinite(days) && days > 0) out.expires_in_days = days;
    }
    ['rate_limit_5h', 'rate_limit_1d', 'rate_limit_7d'].forEach(function (k) {
      if (body[k] != null) out[k] = body[k];
    });
    return out;
  }

  function compat(method, originalPath, body) {
    var p = stripBase(originalPath);
    var m = method;
    var b = body;
    var transform = null;
    var publicRequest = false;
    var noRedirect = false;
    var match;

    if (p === '/health') {
      p = '/settings/public';
      publicRequest = true;
      noRedirect = true;
      transform = function () { return { ok: true, status: 'ok' }; };
    } else if (p === '/status') {
      p = '/settings/public';
      publicRequest = true;
    } else if (p === '/user/self') {
      p = '/user/profile';
      transform = function (u) { return { user: normalizeUser(u) }; };
    } else if (p === '/user/profile') {
      transform = function (u) { return normalizeUser(u); };
    } else if (p === '/user/groups') {
      p = '/groups/available';
      transform = groupListCompat;
    } else if (p.indexOf('/admin/groups') === 0 && m === 'GET') {
      p = mergeQuery(p, { page: 1, page_size: 100 });
      transform = groupListCompat;
    } else if (p === '/user/keys' && m === 'GET') {
      p = '/keys?page=1&page_size=100';
      transform = keyListCompat;
    } else if (p === '/user/keys' && m === 'POST') {
      p = '/keys';
      b = toSub2KeyPayload(body);
      transform = function (d) { return toLegacyKey(d); };
    } else if ((match = p.match(/^\/user\/keys\/([^/]+)$/))) {
      p = '/keys/' + encodeURIComponent(match[1]);
      if (m === 'PATCH') m = 'PUT';
      if (m === 'PUT') b = toSub2KeyPayload(body);
      transform = function (d) { return toLegacyKey(d); };
    } else if ((match = p.match(/^\/user\/keys\/([^/]+)\/usage$/))) {
      p = '/user/api-keys/' + encodeURIComponent(match[1]) + '/usage/daily?days=7';
      transform = usageDaysCompat;
    } else if (p.indexOf('/user/logs') === 0) {
      var qs = new URLSearchParams((p.split('?')[1] || ''));
      p = '/usage?page=1&page_size=' + encodeURIComponent(qs.get('limit') || qs.get('page_size') || '100');
      transform = logListCompat;
    } else if (p === '/user/usage') {
      p = '/usage/dashboard/stats';
    } else if (p === '/user/subscriptions') {
      p = '/subscriptions';
      transform = function (d) { var a = asArray(d, ['items', 'subscriptions']); return { subscriptions: a, items: a }; };
    } else if (p === '/user/subscriptions/progress') {
      p = '/subscriptions/progress';
      transform = function (d) { var a = asArray(d, ['items', 'progress']); return { progress: a, items: a }; };
    } else if (p === '/user/subscriptions/summary') {
      p = '/subscriptions/summary';
      transform = function (d) { return { summary: d || {} }; };
    } else if (p === '/reset_password' || p.indexOf('/reset_password?') === 0) {
      var resetEmail = new URLSearchParams((p.split('?')[1] || '')).get('email') || '';
      p = '/auth/forgot-password';
      m = 'POST';
      b = { email: resetEmail };
      publicRequest = true;
    } else if (p === '/verification' || p.indexOf('/verification?') === 0) {
      var email = new URLSearchParams((p.split('?')[1] || '')).get('email') || '';
      p = '/auth/send-verify-code';
      m = 'POST';
      b = { email: email, type: 'register' };
      publicRequest = true;
    } else if (p === '/user/register') {
      p = '/auth/register';
      publicRequest = true;
    } else if (p === '/user/login') {
      p = '/auth/login';
      publicRequest = true;
    } else if (p.indexOf('/status/models') === 0) {
      p = '/channels/available';
      publicRequest = true;
      noRedirect = true;
    }

    return { method: m, path: p, body: b, transform: transform, publicRequest: publicRequest, noRedirect: noRedirect };
  }

  function unwrap(json) {
    if (json && typeof json.code !== 'undefined') {
      if (json.code === 0) return json.data;
      var err = new Error(json.message || ('API error ' + json.code));
      err.code = json.code;
      err.data = json;
      throw err;
    }
    return json;
  }
  function headers(publicRequest) {
    var h = { 'Content-Type': 'application/json', 'Accept-Language': getLocale() };
    if (!publicRequest) {
      var token = getToken();
      if (token) h.Authorization = 'Bearer ' + token;
    }
    return h;
  }
  function refreshToken() {
    if (refreshPromise) return refreshPromise;
    var token = getRefreshToken();
    if (!token) return Promise.reject(new Error('No refresh token'));
    refreshPromise = fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': getLocale() },
      body: JSON.stringify({ refresh_token: token })
    }).then(function (res) {
      return res.json().then(unwrap);
    }).then(function (data) {
      persistTokens(data, true);
      return data.access_token;
    }).finally(function () {
      refreshPromise = null;
    });
    return refreshPromise;
  }
  function fetchJson(prep, retried) {
    var path = prep.path;
    if (prep.method === 'GET') path = mergeQuery(path, { timezone: timezone() });
    var init = {
      method: prep.method,
      credentials: 'same-origin',
      headers: headers(prep.publicRequest)
    };
    if (prep.signal) init.signal = prep.signal;
    if (prep.body != null && prep.method !== 'GET') init.body = JSON.stringify(prep.body);
    return fetch(apiUrl(path), init).then(function (res) {
      if (res.status === 204) return null;
      if (res.status === 401 && !prep.publicRequest && !retried) {
        return refreshToken().then(function () { return fetchJson(prep, true); }).catch(function (err) {
          clearAuth();
          if (!prep.noRedirect && !/\/sign-in\/?$/.test(location.pathname)) location.replace('/sign-in/');
          throw err;
        });
      }
      return res.text().then(function (text) {
        var json = null;
        if (text) {
          try { json = JSON.parse(text); } catch (e) {
            var parseErr = new Error(text.slice(0, 160) || res.statusText || 'Invalid response');
            parseErr.status = res.status;
            throw parseErr;
          }
        }
        if (!res.ok) {
          var err = new Error((json && (json.message || json.detail || json.error)) || res.statusText || ('HTTP ' + res.status));
          err.status = res.status;
          err.data = json;
          throw err;
        }
        return unwrap(json);
      });
    }).then(function (data) {
      return prep.transform ? prep.transform(data) : data;
    });
  }
  function request(method, path, body, opts) {
    var prep = compat(method, path, body);
    if (opts && opts.signal) prep.signal = opts.signal;
    return fetchJson(prep, false);
  }

  var http = {
    get: function (path, opts) { return request('GET', path, null, opts); },
    post: function (path, body, opts) { return request('POST', path, body, opts); },
    put: function (path, body, opts) { return request('PUT', path, body, opts); },
    patch: function (path, body, opts) { return request('PATCH', path, body, opts); },
    delete: function (path, opts) { return request('DELETE', path, null, opts); }
  };

  var auth = {
    isLoggedIn: function () { return !!(getToken() || safeGet(localStorage, 'mexion_user_id') || safeGet(sessionStorage, 'mexion_user_id')); },
    isAdmin: function () { return (safeGet(localStorage, 'mexion_user_role') || safeGet(sessionStorage, 'mexion_user_role')) === 'admin'; },
    getUser: readUser,
    getInitial: function (user) {
      user = user || readUser();
      var name = (user && (user.username || user.email)) || '?';
      return String(name).charAt(0).toUpperCase() || '?';
    },
    setSession: function (_token, user, _refreshToken, remember) {
      return persistAuth({ access_token: _token, refresh_token: _refreshToken, user: user }, remember !== false);
    },
    clearSession: clearAuth,
    login: function (email, password, remember) {
      var payload = (email && typeof email === 'object') ? email : { email: email, password: password };
      return http.post('/auth/login', payload).then(function (data) {
        persistAuth(data, remember !== false);
        return data;
      });
    },
    register: function (payloadOrEmail, password) {
      var payload = (payloadOrEmail && typeof payloadOrEmail === 'object') ? payloadOrEmail : { email: payloadOrEmail, username: payloadOrEmail, password: password };
      return http.post('/auth/register', payload).then(function (data) {
        if (data && data.access_token) persistAuth(data, true);
        return data;
      });
    },
    logout: function () {
      var ref = getRefreshToken();
      var done = function () { clearAuth(); };
      if (!ref) { done(); return Promise.resolve(); }
      return http.post('/auth/logout', { refresh_token: ref }).catch(function () {}).then(done);
    },
    fetchUser: function () {
      if (!auth.isLoggedIn()) return Promise.resolve(null);
      return http.get('/user/profile').then(function (user) {
        var u = normalizeUser(user);
        persistAuth({ user: u, access_token: getToken(), refresh_token: getRefreshToken() }, true);
        return u;
      });
    },
    refreshUser: function () { return auth.fetchUser(); },
    startUserSync: function () {
      if (!auth.isLoggedIn()) return;
      auth.fetchUser().then(function (user) { auth.hydrateUI(user); }).catch(function () {});
    },
    guard: function (url) {
      if (!auth.isLoggedIn()) {
        location.replace(url || '/sign-in/');
        return false;
      }
      return true;
    },
    adminGuard: function () {
      if (!auth.guard('/sign-in/')) return false;
      if (!auth.isAdmin()) { location.replace('/dashboard/'); return false; }
      return true;
    },
    hydrateUI: function (user) {
      user = normalizeUser(user || readUser() || {});
      if (!user || (!user.username && !user.email && user.id == null)) return;
      var name = user.username || (user.email ? user.email.split('@')[0] : '—');
      var email = user.email || '—';
      var initial = (name || email || 'A').charAt(0).toUpperCase();
      document.querySelectorAll('[data-mexion-avatar]').forEach(function (el) { el.textContent = initial; });
      document.querySelectorAll('[data-mexion-user="name"]').forEach(function (el) { el.textContent = name; });
      document.querySelectorAll('[data-mexion-user="email"]').forEach(function (el) { el.textContent = email; });
    },
    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
      return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
    },
    userSyncEvent: 'mexion:user-updated'
  };

  global.Sub2API = { http: http, auth: auth, normalizeUser: normalizeUser };
  global.MexionHttp = http;
  global.MexionAuth = auth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { auth.hydrateUI(); });
  } else {
    auth.hydrateUI();
  }
  global.addEventListener('storage', function (event) {
    if (event.key === 'auth_user' || event.key === 'mexion_user' || event.key === 'mexion_user_role') emit(readUser());
  });
})(window);
