/* Local offline runtime shim for the mirrored Mexion profile UI.
   It seeds a demo login, mocks the small API surface used by /profile, and keeps the original UI assets intact. */
(function () {
  'use strict';
  var nowSec = Math.floor(Date.now() / 1000);
  var demoUser = {
    id: 10248,
    username: 'codex_demo',
    display_name: 'Codex Demo',
    email: 'demo@mexion.local',
    role: 1,
    status: 1,
    group: 'gpt-codex',
    quota: 128500000,
    used_quota: 46250000,
    request_count: 38426,
    created_at: nowSec - 86400 * 186,
    aff_code: 'MEXION-DEMO',
    effective_rebate_rate_percent: 8,
    aff_count: 3,
    aff_quota: 3250000,
    aff_history_quota: 18900000,
    invitees: [
      { masked_name: 'Luna', created_at: Math.floor(Date.now()/1000) - 86400 * 16, total_rebate: 2.4, invite_status: 2 },
      { masked_name: 'Orion', created_at: Math.floor(Date.now()/1000) - 86400 * 7, total_rebate: 1.1, invite_status: 1 },
      { masked_name: 'Nova', created_at: Math.floor(Date.now()/1000) - 86400 * 2, total_rebate: 0, invite_status: 1 }
    ],
    level: 2,
    level_locked: false,
    used_token: 24800000,
    used_token_month: 1480000,
    total_topup: 42000000,
    github_id: 'codex-demo',
    oidc_id: '',
    wechat_id: '',
    setting: {
      notify_method: 'email',
      notify_email: 'demo@mexion.local',
      notify_webhook_url: '',
      notify_webhook_secret: '',
      notify_bark_url: '',
      notify_gotify_url: '',
      notify_gotify_token: '',
      notify_gotify_priority: 5,
      quota_alert_threshold: 500000,
      quota_exceed: true,
      subscription_quota_exceed: true,
      channel_update: true,
      channel_test: true,
      upstream_update: false
    }
  };
  var levels = [
    { id: 0, name: 'Lv 0 · Seed', req_used_token: 0, req_used_quota: 0, req_total_topup: 0, discount: 0 },
    { id: 1, name: 'Lv 1 · Builder', req_used_token: 1000000, req_used_quota: 5000000, req_total_topup: 0, discount: 1 },
    { id: 2, name: 'Lv 2 · Operator', req_used_token: 10000000, req_used_quota: 25000000, req_total_topup: 15000000, discount: 2 },
    { id: 3, name: 'Lv 3 · Studio', req_used_token: 60000000, req_used_quota: 120000000, req_total_topup: 80000000, discount: 4 },
    { id: 4, name: 'Lv 4 · Scale', req_used_token: 180000000, req_used_quota: 320000000, req_total_topup: 180000000, discount: 6 }
  ];
  var checkin = {
    checked: false,
    amount: 0,
    today_amount: 0,
    streak: 4,
    best_streak: 9,
    month_total: 6.8,
    month_days: 13,
    week_total: 1.35,
    ledger: [
      { date: 'Mon', amount: 0.20, checked: true },
      { date: 'Tue', amount: 0.15, checked: true },
      { date: 'Wed', amount: 0.00, checked: false },
      { date: 'Thu', amount: 0.35, checked: true },
      { date: 'Fri', amount: 0.25, checked: true },
      { date: 'Sat', amount: 0.40, checked: true },
      { date: 'Sun', amount: 0.00, checked: false }
    ]
  };
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function statusSnapshot() {
    var now = Math.floor(Date.now() / 1000);
    function hist(status) {
      var arr = [];
      for (var i = 0; i < 24; i++) arr.push(i > 18 && status === 'degraded' ? 'degraded' : (i === 21 && status === 'down' ? 'down' : 'operational'));
      return arr;
    }
    function group(group, status, latency, ping, extra) {
      extra = extra || {};
      return Object.assign({
        group: group,
        status: status,
        degraded_reason: status === 'degraded' ? 'latency' : '',
        latency_ms: latency,
        ping_ms: ping,
        availability: status === 'down' ? 91.2 : (status === 'degraded' ? 97.4 : 99.96),
        availability_24h: status === 'down' ? 91.2 : (status === 'degraded' ? 97.4 : 99.96),
        availability_7d: status === 'down' ? 96.8 : (status === 'degraded' ? 98.9 : 99.98),
        availability_30d: status === 'down' ? 98.1 : (status === 'degraded' ? 99.2 : 99.99),
        history: hist(status),
        last_error: status === 'operational' ? null : { status_code: status === 'down' ? 503 : 524, at: now - 420, count: status === 'down' ? 6 : 2 }
      }, extra);
    }
    return {
      refresh_second: 45,
      window_minutes: 30,
      availability_days: 7,
      announcement: { kind: 'maintenance', start_at: now + 3600 * 6, end_at: now + 3600 * 7 },
      section_config: {
        sections: [
          { id: 'frontier', name: 'Frontier Models', order: 1 },
          { id: 'domestic', name: 'Domestic Models', order: 2 }
        ],
        assign: { 'pro': 'frontier', 'standard': 'frontier', 'cn-fast': 'domestic' }
      },
      models: [
        { model: 'gpt-4.1', groups: [group('pro', 'operational', 620, 48), group('standard', 'operational', 710, 54)] },
        { model: 'claude-3-7-sonnet', groups: [group('pro', 'degraded', 1880, 82), group('standard', 'operational', 960, 64)] },
        { model: 'gemini-2.5-pro', groups: [group('pro', 'operational', 840, 58)] },
        { model: 'deepseek-chat', groups: [group('cn-fast', 'operational', 520, 42)] },
        { model: 'qwen-max', groups: [group('cn-fast', 'down', 0, 0)] }
      ]
    };
  }

  function normalizeBody(body) {
    if (!body) return Promise.resolve({});
    if (typeof body === 'string') { try { return Promise.resolve(JSON.parse(body)); } catch (e) { return Promise.resolve({}); } }
    if (body instanceof FormData) {
      var out = {}; body.forEach(function (v, k) { out[k] = v; }); return Promise.resolve(out);
    }
    return Promise.resolve(body || {});
  }
  function apiData(data) {
    return new Response(JSON.stringify({ success: true, data: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function apiMessage(message) { return apiData({ message: message || 'ok' }); }
  function updateStoredUser() {
    try {
      localStorage.setItem('mexion_auth_persist', 'local');
      localStorage.setItem('mexion_user_id', String(demoUser.id));
      localStorage.setItem('mexion_user', JSON.stringify({
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.display_name || demoUser.username,
        display_name: demoUser.display_name || demoUser.username,
        role: demoUser.role,
        auth_role: demoUser.role === 100 ? 'admin' : 'user',
        status: 'active',
        auth_status: 'active',
        group: demoUser.group,
        quota: demoUser.quota,
        used_quota: demoUser.used_quota,
        request_count: demoUser.request_count,
        balance: demoUser.quota / 500000,
        level: demoUser.level,
        used_token: demoUser.used_token,
        total_topup: demoUser.total_topup,
        created_at: demoUser.created_at
      }));
    } catch (e) {}
  }
  updateStoredUser();
  window.__MEXION_LOCAL_MOCK__ = { user: demoUser, levels: levels, checkin: checkin };

  var originalFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var path;
    try { path = new URL(url, window.location.origin).pathname; } catch (e) { path = url; }
    if (path.indexOf('/api/') !== 0) return originalFetch ? originalFetch(input, init) : Promise.reject(new Error('fetch unavailable'));

    if (path === '/api/user/self') {
      if (method === 'PUT') {
        return normalizeBody(init && init.body).then(function (body) {
          if (body.display_name) demoUser.display_name = String(body.display_name);
          if (body.password) demoUser.password_changed_at = Math.floor(Date.now()/1000);
          updateStoredUser();
          return apiData(clone(demoUser));
        });
      }
      if (method === 'DELETE') return Promise.resolve(apiMessage('deleted in local mock'));
      return Promise.resolve(apiData(clone(demoUser)));
    }

    if (path === '/api/user/invitees') {
      return Promise.resolve(apiData({
        count: 3,
        invitees: clone(demoUser.invitees || []),
        eligibility: {
          can_invite: true,
          gate_mode: 'or',
          required_tokens: 1000000,
          consumed_tokens: 24800000,
          required_topup: 10,
          topped_up_usd: 84,
          evaluation_hours: 72,
          evaluation_min_tokens: 10000
        }
      }));
    }
    if (path === '/api/user/aff_transfer') {
      var quota = demoUser.aff_quota || 0;
      demoUser.quota += quota;
      demoUser.aff_history_quota = (demoUser.aff_history_quota || 0) + quota;
      demoUser.aff_quota = 0;
      updateStoredUser();
      return Promise.resolve(apiData({ quota: quota }));
    }
    if (path === '/api/status/models') {
      return Promise.resolve(apiData(statusSnapshot()));
    }

    if (path === '/api/user/levels') return Promise.resolve(apiData(clone(levels)));
    if (path === '/api/user/setting') {
      return normalizeBody(init && init.body).then(function (body) {
        demoUser.setting = Object.assign({}, demoUser.setting || {}, body || {});
        return apiData(clone(demoUser.setting));
      });
    }
    if (path === '/api/user/checkin') {
      if (method === 'POST') {
        var amount = +(0.05 + Math.random() * 0.45).toFixed(2);
        checkin.checked = true;
        checkin.amount = amount;
        checkin.today_amount = amount;
        checkin.streak += 1;
        checkin.best_streak = Math.max(checkin.best_streak, checkin.streak);
        checkin.month_total = +(checkin.month_total + amount).toFixed(2);
        checkin.week_total = +(checkin.week_total + amount).toFixed(2);
        demoUser.quota += Math.round(amount * 500000);
        updateStoredUser();
      }
      return Promise.resolve(apiData(clone(checkin)));
    }
    if (path.indexOf('/api/user/oauth/builtin/') === 0) return Promise.resolve(apiMessage('oauth updated'));
    if (path === '/api/user/logout') {
      return Promise.resolve(apiMessage('logged out'));
    }
    if (path === '/api/verification') {
      return Promise.resolve(apiData({ sent: true, code: 'ABC123' }));
    }
    if (path === '/api/reset_password') {
      return Promise.resolve(apiData({ sent: true }));
    }
    if (path === '/api/status') {
      return Promise.resolve(apiData({
        affiliate_enabled: true,
        github_oauth: false,
        oidc_enabled: false,
        email_verification: false,
        github_client_id: '',
        oidc_client_id: '',
        oidc_authorization_endpoint: ''
      }));
    }
    if (path === '/api/oauth/state') return Promise.resolve(apiData('local-oauth-state'));
    if (path === '/api/user/login' || path === '/api/user/register') return Promise.resolve(apiData(clone(demoUser)));
    return Promise.resolve(apiData({}));
  };
})();

