/*
 * Bootstrap used only by the standalone legacy-skin preview server.
 * It seeds a disposable local session and returns predictable read-only data so
 * the archived HTML can be inspected without logging in or calling production APIs.
 */
(function () {
  'use strict';

  var PREVIEW_KEY = '__MEXION_STATIC_PREVIEW__';
  var previewUser = {
    id: 'static-preview',
    email: 'preview@mexion.local',
    username: '皮肤预览',
    display_name: '皮肤预览',
    role: 'admin',
    status: 'active',
    balance: 128.56,
    quota: 128560000,
    used_quota: 32460000,
    request_count: 12842,
    group: 'default'
  };

  window[PREVIEW_KEY] = true;
  document.documentElement.setAttribute('data-mexion-static-preview', 'true');

  function seed(storage) {
    try {
      storage.setItem('mexion_user_id', String(previewUser.id));
      storage.setItem('mexion_user_role', 'admin');
      storage.setItem('mexion_user', JSON.stringify(previewUser));
      storage.setItem('auth_token', 'mexion-static-preview-token');
      storage.setItem('auth_user', JSON.stringify(previewUser));
      storage.setItem('token_expires_at', String(Date.now() + 24 * 60 * 60 * 1000));
    } catch (error) {
      // Preview remains usable in browsers that block persistent storage.
    }
  }

  seed(window.localStorage);
  seed(window.sessionStorage);

  function days(count) {
    var result = [];
    var today = new Date();
    for (var i = count - 1; i >= 0; i -= 1) {
      var day = new Date(today);
      day.setDate(today.getDate() - i);
      var n = count - i;
      result.push({
        date: day.toISOString().slice(0, 10),
        requests: 30 + ((n * 29) % 170),
        tokens: 12000 + ((n * 9137) % 82000),
        cost: Number((0.08 + ((n * 37) % 240) / 1000).toFixed(4)),
        total_requests: 30 + ((n * 29) % 170),
        total_tokens: 12000 + ((n * 9137) % 82000),
        total_cost: Number((0.08 + ((n * 37) % 240) / 1000).toFixed(4))
      });
    }
    return result;
  }

  function mockData(path) {
    var normalized = path.replace(/^\/api(?:\/v\d+)?/, '');
    if (/^\/user\/(?:self|profile)(?:\/|$)/.test(normalized)) return previewUser;
    if (/dashboard|snapshot/.test(normalized)) {
      return {
        today_requests: 146,
        today_tokens: 68420,
        average_duration_ms: 386,
        total_requests: 12842,
        trend: days(90),
        models: [
          { model: 'gpt-4.1-mini', count: 64, requests: 64, percentage: 44 },
          { model: 'claude-sonnet-4', count: 41, requests: 41, percentage: 28 },
          { model: 'gemini-2.5-pro', count: 27, requests: 27, percentage: 18 }
        ]
      };
    }
    if (/\/usage/.test(normalized)) {
      return { total: 0, items: [], logs: [], trend: days(30), models: [] };
    }
    if (/\/keys/.test(normalized)) {
      return { total: 1, items: [{ id: 'preview-key', name: 'Preview Key', key: 'sk-preview-••••••••', status: 'active', last_used_at: null, created_at: new Date().toISOString() }] };
    }
    if (/\/groups/.test(normalized)) {
      return { total: 1, items: [{ id: 'default', name: 'Default', platform: 'openai', enabled: true }] };
    }
    if (/\/models/.test(normalized)) {
      return { total: 3, items: [{ id: 'gpt-4.1-mini', name: 'gpt-4.1-mini' }, { id: 'claude-sonnet-4', name: 'claude-sonnet-4' }, { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro' }] };
    }
    return { total: 0, items: [] };
  }

  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (nativeFetch) {
    window.fetch = function (input, init) {
      var rawUrl = typeof input === 'string' ? input : input && input.url;
      var url;
      try { url = new URL(rawUrl, window.location.href); } catch (error) { return nativeFetch(input, init); }
      if (url.origin === window.location.origin && /^\/api(?:\/|$)/.test(url.pathname)) {
        return Promise.resolve(new Response(JSON.stringify({ success: true, code: 0, data: mockData(url.pathname) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Mexion-Static-Preview': '1' }
        }));
      }
      return nativeFetch(input, init);
    };
  }

  // The archived pages register their guard on DOMContentLoaded. This listener is
  // registered before deferred legacy scripts, so it can keep the preview route
  // open even after a user clicks the archived sign-out control.
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.MexionAuth) return;
    window.MexionAuth.guard = function () { return true; };
    window.MexionAuth.isLoggedIn = function () { return true; };
    window.MexionAuth.getUser = function () { return previewUser; };
    window.MexionAuth.fetchUser = function () { return Promise.resolve(previewUser); };
    window.MexionAuth.refreshUser = function () { return Promise.resolve(previewUser); };
    window.MexionAuth.logout = function () {
      seed(window.localStorage);
      seed(window.sessionStorage);
      if (window.MexionToast && window.MexionToast.show) window.MexionToast.show('静态皮肤预览模式不会退出登录');
    };
    if (window.MexionAuth.hydrateUI) window.MexionAuth.hydrateUI();
  }, { once: true });
})();



