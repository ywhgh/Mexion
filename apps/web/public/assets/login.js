/* Mexion sign-in page: sub2api auth adapter. Pure fetch, no external deps. */
(function () {
  'use strict';

  var API_BASE = '/api/v1';
  var REDIRECT_TO = '/dashboard/';
  var AUTH_KEYS = [
    'auth_token', 'refresh_token', 'auth_user', 'token_expires_at',
    'mexion_user', 'mexion_user_id', 'mexion_user_role', 'mexion_user_synced_at',
    'mexion_auth_persist'
  ];

  function $(id) { return document.getElementById(id); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function lang() { return (window.MexionI18n && window.MexionI18n.lang) || 'zh'; }
  function t(key, vars) {
    var text = window.MexionI18n ? window.MexionI18n.t(key) : key;
    Object.keys(vars || {}).forEach(function (k) { text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
    return text;
  }
  function trim(v) { return String(v == null ? '' : v).trim(); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(v)); }
  function safeRemove(k) { try { localStorage.removeItem(k); } catch (e) {} try { sessionStorage.removeItem(k); } catch (e2) {} }
  function safeSet(k, v, remember) {
    try { (remember === false ? sessionStorage : localStorage).setItem(k, String(v == null ? '' : v)); } catch (e) {}
    try { (remember === false ? localStorage : sessionStorage).removeItem(k); } catch (e2) {}
  }
  function clearAuth() { AUTH_KEYS.forEach(safeRemove); }
  function normalizeRole(role) { return role === 'admin' || role === 100 ? 'admin' : 'user'; }
  function normalizeUser(user) {
    user = user || {};
    return {
      id: user.id,
      username: user.username || user.display_name || user.displayName || (user.email ? String(user.email).split('@')[0] : ''),
      email: user.email || '',
      role: normalizeRole(user.role),
      balance: Number(user.balance || 0),
      status: user.status || 'active',
      created_at: user.created_at || user.createdAt || ''
    };
  }
  function persistAuth(data, remember) {
    data = data || {};
    var user = normalizeUser(data.user || {});
    clearAuth();
    if (data.access_token) safeSet('auth_token', data.access_token, remember);
    if (data.refresh_token) safeSet('refresh_token', data.refresh_token, remember);
    if (data.expires_in) safeSet('token_expires_at', Date.now() + Number(data.expires_in) * 1000, remember);
    safeSet('auth_user', JSON.stringify(user), remember);
    safeSet('mexion_user', JSON.stringify(user), remember);
    if (user.id != null) safeSet('mexion_user_id', user.id, remember);
    safeSet('mexion_user_role', user.role, true);
    safeSet('mexion_auth_persist', remember === false ? 'session' : 'local', remember);
    try { window.dispatchEvent(new CustomEvent('mexion:user-updated', { detail: { user: user, source: 'login' } })); } catch (e) {}
    return user;
  }
  function unwrap(json) {
    if (json && typeof json.code !== 'undefined') {
      if (json.code === 0) return json.data;
      var err = new Error(json.message || 'Request failed');
      err.code = json.code;
      err.data = json;
      throw err;
    }
    if (json && json.ok === false) throw new Error((json.error && json.error.message) || json.message || 'Request failed');
    return json;
  }
  function api(method, path, body) {
    var headers = { 'Content-Type': 'application/json', 'Accept-Language': lang() };
    var token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) headers.Authorization = 'Bearer ' + token;
    var init = { method: method, headers: headers, credentials: 'same-origin' };
    if (body != null) init.body = JSON.stringify(body);
    return fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var json = null;
        if (text) {
          try { json = JSON.parse(text); } catch (e) { throw new Error(text.slice(0, 160)); }
        }
        if (!res.ok) {
          throw new Error((json && (json.message || json.detail || json.error)) || res.statusText || ('HTTP ' + res.status));
        }
        return unwrap(json);
      });
    });
  }
  function patchAuth() {
    var existing = window.MexionAuth || {};
    window.MexionAuth = Object.assign(existing, {
      login: function (email, password, remember) {
        return api('POST', '/auth/login', { email: email, password: password }).then(function (data) {
          persistAuth(data, remember !== false);
          return data;
        });
      },
      register: function (payload) {
        return api('POST', '/auth/register', payload).then(function (data) {
          if (data && data.access_token) persistAuth(data, true);
          return data;
        });
      },
      logout: function () {
        var refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        var done = function () { clearAuth(); };
        if (!refresh) { done(); return Promise.resolve(); }
        return api('POST', '/auth/logout', { refresh_token: refresh }).catch(function () {}).then(done);
      },
      fetchUser: function () {
        return api('GET', '/user/profile').then(function (user) {
          var current = {
            user: user,
            access_token: localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'),
            refresh_token: localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
          };
          persistAuth(current, (localStorage.getItem('mexion_auth_persist') || 'local') !== 'session');
          return normalizeUser(user);
        });
      },
      isLoggedIn: function () { return !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')); },
      isAdmin: function () { return localStorage.getItem('mexion_user_role') === 'admin'; },
      clearSession: clearAuth
    });
  }

  if (window.MexionI18n) {
    window.MexionI18n.register({
      zh: {
        'plate.meta': 'Vol.\u2009I · Issue 01', 'plate.label': '§ 论旨',
        'plate.hero1': '一把钥匙，', 'plate.hero2': '通往所有值得调用的', 'plate.hero3': '语言模型',
        'plate.sub': '欧几里得的几何中，公理是被直接接受为真的命题，一切证明从此出发。Mexion 把这种结构带入 AI 时代：一个<strong>统一的 endpoint</strong>，让一切调用<em>从此恒等</em>。',
        'status.status': '状态', 'status.operational': '正常运行', 'status.latency': '延迟', 'status.updated': '更新于',
        'form.eyebrow': '§ 登录', 'form.title': '欢迎<em>回来</em>。', 'form.lede': '输入你的凭证，进入控制台。',
        'sso.google': 'Google', 'sso.github': 'GitHub', 'divider': '或使用账号',
        'field.email': '邮箱或用户名', 'field.password': '密码', 'field.forgot': '忘记密码？', 'field.show': '显示', 'field.hide': '隐藏', 'field.caps': '⇧ 大写锁定', 'field.remember': '保持登录状态',
        'form.submit': '登录 Mexion', 'form.submit.busy': '正在登录…', 'form.no-account': '还没有账号？', 'form.go-signup': '创建账号',
        'form.error.account': '请输入邮箱或用户名', 'form.error.password': '请输入密码', 'form.error.generic': '操作失败，请重试',
        'trust.compliance': 'SOC 2 TYPE II', 'trust.encryption': '端对端加密', 'trust.uptime': '99.99% 可用性',
        'legal.body': '登录即表示你同意', 'legal.terms': '用户协议', 'legal.and': '与', 'legal.privacy': '隐私政策',
        'colophon.seal': 'MEXION · MMXXVI', 'colophon.set': 'MEXION', 'colophon.edition': '第 0001 号 / 卷 I',
        'signup.eyebrow': '§ 注册', 'signup.title': '立此<em>存照</em>。', 'signup.lede': '三十秒，加入 Mexion，开启你的统一调用。', 'signup.divider': '或自行注册',
        'signup.field.username': '用户名', 'signup.field.username.hint': '3–20 位字符，不含空格', 'signup.field.username.ph': '输入您的用户名',
        'signup.field.password': '密码', 'signup.field.password.ph': '输入密码（8–20 个字符）', 'signup.field.confirm': '确认密码', 'signup.field.confirm.ph': '再次输入密码',
        'signup.field.email': '电子邮件', 'signup.field.email.hint': '需验证', 'signup.field.code': '验证码', 'signup.field.code.ph': '6 位（数字+字母）', 'signup.field.send': '发送验证码', 'signup.field.resend': '重新发送',
        'signup.field.invite': '邀请码', 'signup.field.invite.hint': '通过邀请链接自动带入', 'signup.field.invite.ph': '邀请链接已自动填写',
        'signup.terms': '我已阅读并同意 <a href="/terms/" target="_blank">用户协议</a> 与 <a href="/privacy/" target="_blank">隐私政策</a>。',
        'signup.submit': '创建账户', 'signup.submit.busy': '正在创建账户…', 'signup.foot.have': '已有账户？', 'signup.foot.signin': '登录',
        'signup.err.user.short': '用户名至少 3 个字符', 'signup.err.user.format': '用户名不能含有空格', 'signup.err.pwd.short': '密码至少 8 位', 'signup.err.pwd.mismatch': '两次输入的密码不一致', 'signup.err.pwd.confirm': '请确认密码',
        'signup.err.email.format': '邮箱格式不正确', 'signup.err.email.empty': '请输入邮箱地址', 'signup.err.code.empty': '请输入验证码', 'signup.terms.required': '请先同意条款与政策',
        'signup.code.sent': '已发送至 {email}，请查收邮箱（含垃圾箱）', 'signup.code.frequent': '请 {n} 秒后重试', 'signup.code.invalid': '请先填写有效邮箱',
        'forgot.title': '找回<em>密码</em>。', 'forgot.sub': '输入注册邮箱，我们将发送重置链接。', 'forgot.field.email': '注册邮箱', 'forgot.submit': '发送重置链接', 'forgot.submit.busy': '发送中…',
        'forgot.sent.title': '邮件已发送', 'forgot.sent.hint': '请查收邮箱（含垃圾箱），点击链接重置密码。', 'forgot.foot.remember': '记起来了？', 'forgot.foot.back': '返回登录'
      },
      en: {
        'plate.meta': 'Vol.\u2009I · Issue 01', 'plate.label': '§ The Thesis',
        'plate.hero1': 'One key,', 'plate.hero2': 'every language model', 'plate.hero3': 'worth calling',
        'plate.sub': 'In Euclid geometry, an axiom is accepted as true; every proof starts there. Mexion brings that structure to AI: one <strong>unified endpoint</strong>, where every call becomes <em>identical</em>.',
        'status.status': 'Status', 'status.operational': 'operational', 'status.latency': 'Latency', 'status.updated': 'Updated',
        'form.eyebrow': '§ Sign in', 'form.title': 'Welcome <em>back.</em>', 'form.lede': 'Enter your credentials to continue to the console.',
        'sso.google': 'Google', 'sso.github': 'GitHub', 'divider': 'or with account',
        'field.email': 'Email or username', 'field.password': 'Password', 'field.forgot': 'Forgot?', 'field.show': 'Show', 'field.hide': 'Hide', 'field.caps': '⇧ Caps Lock', 'field.remember': 'Keep me signed in',
        'form.submit': 'Sign in to Mexion', 'form.submit.busy': 'Signing in…', 'form.no-account': 'No account yet?', 'form.go-signup': 'Create one',
        'form.error.account': 'Enter your email or username', 'form.error.password': 'Enter your password', 'form.error.generic': 'Something went wrong, please try again',
        'trust.compliance': 'SOC 2 TYPE II', 'trust.encryption': 'End-to-end encrypted', 'trust.uptime': '99.99% Uptime',
        'legal.body': 'By signing in you agree to our', 'legal.terms': 'User Agreement', 'legal.and': 'and', 'legal.privacy': 'Privacy Policy',
        'colophon.seal': 'MEXION · MMXXVI', 'colophon.set': 'MEXION', 'colophon.edition': 'No. 0001 / Vol. I',
        'signup.eyebrow': '§ Join', 'signup.title': 'Begin <em>here.</em>', 'signup.lede': 'Thirty seconds. Join Mexion and unify every model call.', 'signup.divider': 'or with email',
        'signup.field.username': 'Username', 'signup.field.username.hint': '3–20 characters, no spaces', 'signup.field.username.ph': 'Enter a username',
        'signup.field.password': 'Password', 'signup.field.password.ph': 'Password (8–20 characters)', 'signup.field.confirm': 'Confirm password', 'signup.field.confirm.ph': 'Re-enter password',
        'signup.field.email': 'Email', 'signup.field.email.hint': 'verification required', 'signup.field.code': 'Verification code', 'signup.field.code.ph': '6 chars (letters+digits)', 'signup.field.send': 'Send code', 'signup.field.resend': 'Resend',
        'signup.field.invite': 'Invite code', 'signup.field.invite.hint': 'Auto-filled from invite link', 'signup.field.invite.ph': 'Filled from invite link',
        'signup.terms': 'I have read and agree to the <a href="/terms/" target="_blank">User Agreement</a> and <a href="/privacy/" target="_blank">Privacy Policy</a>.',
        'signup.submit': 'Create account', 'signup.submit.busy': 'Creating account…', 'signup.foot.have': 'Already have an account?', 'signup.foot.signin': 'Sign in',
        'signup.err.user.short': 'At least 3 characters', 'signup.err.user.format': 'No spaces allowed', 'signup.err.pwd.short': 'At least 8 characters', 'signup.err.pwd.mismatch': 'Passwords do not match', 'signup.err.pwd.confirm': 'Please confirm your password',
        'signup.err.email.format': 'Invalid email format', 'signup.err.email.empty': 'Please enter your email', 'signup.err.code.empty': 'Enter the verification code', 'signup.terms.required': 'Please accept the Terms and Privacy Policy',
        'signup.code.sent': 'Sent to {email}, check inbox and spam', 'signup.code.frequent': 'Please wait {n}s', 'signup.code.invalid': 'Enter a valid email first',
        'forgot.title': 'Recover<em>.</em>', 'forgot.sub': 'Enter your registered email and we will send a reset link.', 'forgot.field.email': 'Email', 'forgot.submit': 'Send reset link', 'forgot.submit.busy': 'Sending…',
        'forgot.sent.title': 'Email sent', 'forgot.sent.hint': 'Check your inbox and spam for the reset link.', 'forgot.foot.remember': 'Remember it?', 'forgot.foot.back': 'Back to sign in'
      }
    });
    window.MexionI18n.refresh();
  }

  function setFieldMessage(el, text, tone) {
    if (!el) return;
    el.textContent = text || '';
    el.dataset.tone = tone || '';
    var field = el.closest ? el.closest('.field') : null;
    if (field) {
      field.classList.toggle('is-error', tone === 'error');
      field.classList.toggle('is-ok', tone === 'ok');
    }
  }
  function setBusy(btn, busy, labelKey, busyKey) {
    if (!btn) return;
    btn.disabled = !!busy;
    var span = q('.submit-btn__text', btn) || q('[data-i18n]', btn) || btn;
    span.textContent = t(busy ? busyKey : labelKey);
  }
  function setMode(mode) {
    var card = $('formCard');
    if (card) card.setAttribute('data-mode', mode);
    qa('.mode-pane').forEach(function (pane) {
      var active = pane.classList.contains('mode-pane--' + mode);
      if (active) pane.setAttribute('data-active', ''); else pane.removeAttribute('data-active');
    });
    var first = mode === 'signup' ? $('suUsername') : (mode === 'forgot' ? $('forgotEmail') : $('email'));
    setTimeout(function () { if (first) first.focus(); }, 40);
  }
  function setupPasswordToggle(inputId, toggleId) {
    var input = $(inputId), toggle = $(toggleId);
    if (!input || !toggle) return;
    toggle.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.textContent = t(show ? 'field.hide' : 'field.show');
    });
  }
  function updateSsoButtons(settings) {
    var any = false;
    qa('.sso-btn').forEach(function (btn) {
      var label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
      var isGoogle = label.indexOf('google') >= 0;
      var isGithub = label.indexOf('github') >= 0;
      var enabled = (isGoogle && settings.google_oauth_enabled) || (isGithub && settings.github_oauth_enabled);
      btn.hidden = !enabled;
      btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      if (enabled) {
        any = true;
        btn.href = API_BASE + '/auth/oauth/' + (isGoogle ? 'google' : 'github') + '/start?redirect=' + encodeURIComponent(REDIRECT_TO);
      } else {
        btn.href = '#';
      }
    });
    qa('.sso-row').forEach(function (row) { row.hidden = !any; });
  }
  function applyPublicSettings(settings) {
    settings = settings || {};
    var allowRegister = settings.allow_register !== false;
    var signupPane = q('.mode-pane--signup');
    var goSignup = $('goSignupLink');
    if (signupPane) signupPane.hidden = !allowRegister;
    if (goSignup) {
      var foot = goSignup.closest ? goSignup.closest('.foot-note') : null;
      if (foot) foot.hidden = !allowRegister;
      goSignup.hidden = !allowRegister;
    }
    if (!allowRegister && $('formCard') && $('formCard').getAttribute('data-mode') === 'signup') setMode('login');
    updateSsoButtons(settings);
  }
  function loadPublicSettings() {
    updateSsoButtons({});
    return api('GET', '/settings/public').then(applyPublicSettings).catch(function () {
      applyPublicSettings({ allow_register: true, github_oauth_enabled: false, google_oauth_enabled: false });
    });
  }
  function initInviteCode() {
    var params = new URLSearchParams(location.search);
    var code = params.get('invite_code') || params.get('invite') || params.get('ref') || params.get('aff') || '';
    var input = $('suInviteCode');
    if (!input || !code) return;
    input.value = code;
    var wrap = $('suInviteField');
    if (wrap) wrap.hidden = false;
  }

  function loginSubmit(event) {
    event.preventDefault();
    var account = trim($('email') && $('email').value);
    var password = $('password') ? $('password').value : '';
    var remember = $('remember') ? $('remember').checked : true;
    var ok = true;
    setFieldMessage($('loginEmailMsg'), '', '');
    setFieldMessage($('loginPwdMsg'), '', '');
    if (!account) { setFieldMessage($('loginEmailMsg'), t('form.error.account'), 'error'); ok = false; }
    if (!password) { setFieldMessage($('loginPwdMsg'), t('form.error.password'), 'error'); ok = false; }
    if (!ok) return;
    var btn = q('button[type="submit"]', event.currentTarget);
    setBusy(btn, true, 'form.submit', 'form.submit.busy');
    window.MexionAuth.login(account, password, remember).then(function (data) {
      var user = normalizeUser(data && data.user);
      localStorage.setItem('mexion_user_role', user.role);
      window.location.href = REDIRECT_TO;
    }).catch(function (err) {
      setFieldMessage($('loginPwdMsg'), err && err.message ? err.message : t('form.error.generic'), 'error');
    }).finally(function () {
      setBusy(btn, false, 'form.submit', 'form.submit.busy');
    });
  }
  function sendVerifyCode() {
    var email = trim($('suEmail') && $('suEmail').value);
    var msg = $('suEmailMsg');
    if (!isEmail(email)) { setFieldMessage(msg, t('signup.code.invalid'), 'error'); return; }
    var btn = $('suSendCode');
    if (btn && btn.disabled) return;
    if (btn) btn.disabled = true;
    api('POST', '/auth/send-verify-code', { email: email, type: 'register' }).then(function () {
      setFieldMessage($('suCodeMsg'), t('signup.code.sent', { email: email }), 'ok');
      var left = 60;
      var timer = setInterval(function () {
        left -= 1;
        if (btn) btn.textContent = t('signup.code.frequent', { n: left });
        if (left <= 0) {
          clearInterval(timer);
          if (btn) { btn.disabled = false; btn.textContent = t('signup.field.resend'); }
        }
      }, 1000);
    }).catch(function (err) {
      if (btn) btn.disabled = false;
      setFieldMessage($('suCodeMsg'), err && err.message ? err.message : t('form.error.generic'), 'error');
    });
  }
  function validateSignup() {
    var username = trim($('suUsername') && $('suUsername').value);
    var password = $('suPassword') ? $('suPassword').value : '';
    var confirm = $('suConfirm') ? $('suConfirm').value : '';
    var email = trim($('suEmail') && $('suEmail').value);
    var code = trim($('suCode') && $('suCode').value);
    var ok = true;
    setFieldMessage($('suUsernameMsg'), '', '');
    setFieldMessage($('suPwdMsg'), '', '');
    setFieldMessage($('suConfMsg'), '', '');
    setFieldMessage($('suEmailMsg'), '', '');
    setFieldMessage($('suCodeMsg'), '', '');
    if (username.length < 3) { setFieldMessage($('suUsernameMsg'), t('signup.err.user.short'), 'error'); ok = false; }
    if (/\s/.test(username)) { setFieldMessage($('suUsernameMsg'), t('signup.err.user.format'), 'error'); ok = false; }
    if (password.length < 8) { setFieldMessage($('suPwdMsg'), t('signup.err.pwd.short'), 'error'); ok = false; }
    if (!confirm) { setFieldMessage($('suConfMsg'), t('signup.err.pwd.confirm'), 'error'); ok = false; }
    else if (password !== confirm) { setFieldMessage($('suConfMsg'), t('signup.err.pwd.mismatch'), 'error'); ok = false; }
    if (!email) { setFieldMessage($('suEmailMsg'), t('signup.err.email.empty'), 'error'); ok = false; }
    else if (!isEmail(email)) { setFieldMessage($('suEmailMsg'), t('signup.err.email.format'), 'error'); ok = false; }
    if (!code) { setFieldMessage($('suCodeMsg'), t('signup.err.code.empty'), 'error'); ok = false; }
    if ($('suTerms') && !$('suTerms').checked) { setFieldMessage($('suCodeMsg'), t('signup.terms.required'), 'error'); ok = false; }
    return ok;
  }
  function signupSubmit(event) {
    event.preventDefault();
    if (!validateSignup()) return;
    var btn = $('suSubmit') || q('button[type="submit"]', event.currentTarget);
    setBusy(btn, true, 'signup.submit', 'signup.submit.busy');
    var payload = {
      username: trim($('suUsername').value),
      email: trim($('suEmail').value),
      password: $('suPassword').value,
      verify_code: trim($('suCode').value)
    };
    var invite = trim($('suInviteCode') && $('suInviteCode').value);
    if (invite) payload.invite_code = invite;
    window.MexionAuth.register(payload).then(function (data) {
      var user = normalizeUser(data && data.user);
      localStorage.setItem('mexion_user_role', user.role);
      window.location.href = REDIRECT_TO;
    }).catch(function (err) {
      setFieldMessage($('suCodeMsg'), err && err.message ? err.message : t('form.error.generic'), 'error');
    }).finally(function () {
      setBusy(btn, false, 'signup.submit', 'signup.submit.busy');
    });
  }
  function forgotSubmit(event) {
    event.preventDefault();
    var email = trim($('forgotEmail') && $('forgotEmail').value);
    var msg = $('forgotMsg');
    if (!isEmail(email)) { setFieldMessage(msg, t('signup.err.email.format'), 'error'); return; }
    var btn = $('forgotSubmit');
    setBusy(btn, true, 'forgot.submit', 'forgot.submit.busy');
    api('POST', '/auth/forgot-password', { email: email }).then(function () {
      setFieldMessage(msg, '', '');
      if ($('forgotFields')) $('forgotFields').hidden = true;
      if ($('forgotSuccess')) $('forgotSuccess').hidden = false;
    }).catch(function (err) {
      setFieldMessage(msg, err && err.message ? err.message : t('form.error.generic'), 'error');
    }).finally(function () {
      setBusy(btn, false, 'forgot.submit', 'forgot.submit.busy');
    });
  }

  function init() {
    patchAuth();
    if ((localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) && (localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'))) {
      window.location.replace(REDIRECT_TO);
      return;
    }
    setupPasswordToggle('password', 'pwdToggle');
    setupPasswordToggle('suPassword', 'suPwdToggle');
    setupPasswordToggle('suConfirm', 'suConfirmToggle');
    initInviteCode();
    loadPublicSettings();

    if ($('loginForm')) $('loginForm').addEventListener('submit', loginSubmit);
    if ($('signupForm')) $('signupForm').addEventListener('submit', signupSubmit);
    if ($('forgotForm')) $('forgotForm').addEventListener('submit', forgotSubmit);
    if ($('suSendCode')) $('suSendCode').addEventListener('click', sendVerifyCode);
    if ($('goSignupLink')) $('goSignupLink').addEventListener('click', function (e) { e.preventDefault(); setMode('signup'); });
    if ($('goLoginLink')) $('goLoginLink').addEventListener('click', function (e) { e.preventDefault(); setMode('login'); });
    if ($('forgotLink')) $('forgotLink').addEventListener('click', function (e) { e.preventDefault(); setMode('forgot'); });
    if ($('forgotBackLink')) $('forgotBackLink').addEventListener('click', function (e) { e.preventDefault(); setMode('login'); });

    if (window.MexionI18n) window.MexionI18n.onChange(function () {
      qa('.field__pwd-toggle').forEach(function (btn) {
        var input = btn.id === 'suPwdToggle' ? $('suPassword') : (btn.id === 'suConfirmToggle' ? $('suConfirm') : $('password'));
        if (input) btn.textContent = t(input.type === 'password' ? 'field.show' : 'field.hide');
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
