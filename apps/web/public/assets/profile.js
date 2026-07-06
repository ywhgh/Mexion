(function () {
  /* ── API ── */
  function getProfileBalance(u) {
    return typeof window.MexionQuota !== 'undefined'
      ? window.MexionQuota.getUserBalance(u)
      : ((Number(u && u.quota) || 0) / 500000);
  }

  function applyProfileBalance(u, passive) {
    if (!u) return;
    var userBalance = getProfileBalance(u);
    var ticket = document.getElementById('ticket');
    if (ticket) ticket.dataset.balance = String(userBalance);
    if (passive && ticket && ticket.classList.contains('is-revealing')) return;
    var revBal = document.getElementById('rev-balance');
    if (revBal) {
      revBal.textContent = typeof window.MexionQuota !== 'undefined'
        ? window.MexionQuota.formatUsd(userBalance, { currencyFirst: true })
        : ('$' + userBalance.toFixed(2));
    }
  }

  // OAuth 绑定回跳：oauth-callback 把结果带在 /profile?bind=ok|taken|error，提示后清掉 query
  function notifyBindResult() {
    try {
      var sp = new URLSearchParams(window.location.search);
      var b = sp.get('bind');
      if (!b) return;
      var bmsg = sp.get('bindmsg') || '';
      sp.delete('bind'); sp.delete('bindmsg');
      window.history.replaceState(null, '', window.location.pathname + (sp.toString() ? '?' + sp.toString() : ''));
      if (b === 'ok') toast(t('toast.binding.connected','已绑定'));
      else if (b === 'taken') toast(t('binding.connect.taken','该账号已被其它账户绑定，无法重复绑定'), 'error');
      else toast(bmsg || t('binding.connect.failed','绑定失败，请稍后重试'), 'error');
    } catch (e) {}
  }
  function loadProfile() {
    notifyBindResult();
    if (typeof MexionAuth !== 'undefined' && MexionAuth.refreshUser) {
      MexionAuth.refreshUser({ source: 'profile-load', force: true }).then(populatePage).catch(function(){});
      return;
    }
    if (typeof MexionHttp === 'undefined') return;
    MexionHttp.get('/user/self').then(function(data){ populatePage(data.user || data); }).catch(function(){});
  }
  // 二开：升级进度 = 三项门槛里"已达比例"的最短板(AND 语义)。无门槛=0(需管理员手动设级)。
  function quotaValue(u, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = u && u[keys[i]];
      if (v !== undefined && v !== null && v !== '') return Number(v) || 0;
    }
    return 0;
  }
  function populateTier(u) {
    window.__mexionTierUser = u;
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    var badge = document.querySelector('[data-i18n="profile.idcard.chip.tier"]');
    var quotaUsed = quotaValue(u, ['quotaUsed', 'quota_used', 'used_quota']);
    if (badge) { badge.removeAttribute('data-i18n'); badge.textContent = lang === 'zh' ? '探索者' : 'Explorer'; }
    if (typeof MexionHttp === 'undefined') return;
    MexionHttp.get('/user/levels').then(function (data) {
      var levels = Array.isArray(data) ? data : (data && data.levels) || [];
      if (!levels.length) return;
      levels = levels.slice().sort(function (a, b) { return (a.minQuota || 0) - (b.minQuota || 0); });
      window.__mexionTierLevels = levels;
      var cur = (data && data.currentLevel) || levels[0], next = null;
      for (var i = 0; i < levels.length; i++) {
        if (quotaUsed >= (levels[i].minQuota || 0)) cur = levels[i];
        else { next = levels[i]; break; }
      }
      if (badge) badge.textContent = cur.name || (lang === 'zh' ? '等级 ' + cur.id : 'Lv ' + cur.id);
      var prog = document.querySelector('.id-card__progress');
      if (!prog) return;
      prog.hidden = false;
      prog.classList.remove('id-card__progress--dormant');
      var fromEl = prog.querySelector('.from'); if (fromEl) { fromEl.removeAttribute('data-i18n'); fromEl.textContent = cur.name || 'Lv ' + cur.id; }
      var bar = prog.querySelector('.tier-bar'); if (bar) bar.classList.remove('tier-bar--dormant');
      var toEl = prog.querySelector('.to');
      var pctEl = prog.querySelector('.pct');
      var stripes = prog.querySelector('.tier-bar__stripes');
      var hintEl = prog.querySelector('.tier-rail__hint');
      if (next) {
        var span = Math.max(1, (next.minQuota || 0) - (cur.minQuota || 0));
        var pct = Math.max(0, Math.min(1, (quotaUsed - (cur.minQuota || 0)) / span));
        if (toEl) { toEl.removeAttribute('data-i18n'); toEl.textContent = next.name; }
        if (pctEl) { pctEl.removeAttribute('data-i18n'); pctEl.textContent = Math.floor(pct * 100) + '%'; }
        if (stripes) stripes.style.width = Math.max(4, Math.floor(pct * 100)) + '%';
        if (hintEl) { hintEl.removeAttribute('data-i18n-html'); hintEl.textContent = lang === 'zh' ? ('已用配额 ' + quotaUsed.toLocaleString() + ' / ' + (next.minQuota || 0).toLocaleString()) : ('Quota used ' + quotaUsed.toLocaleString() + ' / ' + (next.minQuota || 0).toLocaleString()); }
      } else {
        if (toEl) { toEl.removeAttribute('data-i18n'); toEl.textContent = lang === 'zh' ? '已达最高段位' : 'Top tier'; }
        if (pctEl) { pctEl.removeAttribute('data-i18n'); pctEl.textContent = '100%'; }
        if (stripes) stripes.style.width = '100%';
        if (hintEl) { hintEl.removeAttribute('data-i18n-html'); hintEl.textContent = lang === 'zh' ? '你已是最高段位 🏆' : 'You are at the top tier 🏆'; }
      }
    }).catch(function () {});
  }

  function populatePage(u) {
    if (!u) return;
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    var name = u.display_name || u.username || (u.email ? u.email.split('@')[0] : '');
    var initial = (name.charAt(0) || '?').toUpperCase();
    document.querySelectorAll('[data-field="name"], [data-field="display-name"]').forEach(function(el) { el.textContent = name; });
    document.querySelectorAll('[data-field="email"]').forEach(function(el) { el.textContent = u.email || ''; });
    var roleMap = { 1: lang === 'zh' ? '注册会员' : 'Member', 10: lang === 'zh' ? '高级会员' : 'Premium', 100: lang === 'zh' ? '管理员' : 'Admin' };
    document.querySelectorAll('[data-field="role"]').forEach(function(el) { el.textContent = roleMap[u.role] || roleMap[1]; });
    var createdTs = u.created_at;
    var createdDate = (typeof createdTs === 'number' && createdTs > 1e9) ? new Date(createdTs * 1000) : (createdTs ? new Date(createdTs) : null);
    var joinDaysEl = document.getElementById('plaque-joined-days');
    if (createdDate) {
      localStorage.setItem('mexion_join_ts', String(createdDate.getTime()));
      document.querySelectorAll('[data-field="joined"]').forEach(function(el) { el.textContent = createdDate.toLocaleDateString(); });
      var days = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 86400000));
      if (joinDaysEl) joinDaysEl.textContent = days.toLocaleString();
      var joinDateEl = document.getElementById('plaque-joined-date');
      if (joinDateEl) joinDateEl.textContent = createdDate.getFullYear() + '/' + (createdDate.getMonth()+1) + '/' + createdDate.getDate();
    } else {
      // 二开修复:后端没返回 created_at 时不再伪造 now(原会显示错误的"0 天"),隐藏整张"加入时间"卡
      var jp = joinDaysEl && joinDaysEl.closest('.plaque');
      if (jp) jp.style.display = 'none';
    }
    document.querySelectorAll('[data-mexion-avatar]').forEach(function(el) { el.textContent = initial; });
    document.querySelectorAll('[data-mexion-user="name"]').forEach(function(el) { el.textContent = name; });
    document.querySelectorAll('[data-mexion-user="email"]').forEach(function(el) { el.textContent = u.email || ''; });
    var idPlaque = document.querySelector('.plaque:first-child .plaque__val');
    // 会员编号同时展示裸 user id（#N）——管理员在 newapi 面板按 #N 数字即可反查到用户
    // （SearchUsers 仅整数命中 id；AX- 装饰串无法被搜索）。
    if (idPlaque) idPlaque.textContent = 'AX-' + String(u.id).padStart(7, '0') + ' · #' + u.id;
    var concurrencyEl = document.getElementById('plaque-concurrency') || document.getElementById('plaque-group');
    if (concurrencyEl) {
      var limit = u.effective_concurrency;
      if (limit === undefined || limit === null) limit = u.concurrency_limit;
      var n = Number(limit);
      concurrencyEl.textContent = Number.isFinite(n)
        ? (n <= 0 ? (lang === 'zh' ? '不限' : 'Unlimited') : String(Math.trunc(n)))
        : '--';
    }
    // 累计调用
    if (typeof MexionHttp !== 'undefined') {
      MexionHttp.get('/user/usage').then(function(stats) {
        var total = stats.totalCalls || stats.total_requests || stats.request_count || u.request_count || 0;
        var callsEl = document.getElementById('plaque-calls');
        if (callsEl) callsEl.textContent = total.toLocaleString();
        var subEl = document.getElementById('plaque-calls-sub');
        if (subEl && createdDate) {
          var d = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 86400000));
          var avg = Math.round(total / d);
          subEl.textContent = lang === 'zh' ? '日均 ' + avg + ' 次' : 'Avg ' + avg + '/day';
        }
      }).catch(function(){
        var callsEl = document.getElementById('plaque-calls');
        if (callsEl) callsEl.textContent = (u.request_count || 0).toLocaleString();
      });
    }
    applyProfileBalance(u, false);
    populateTier(u); // 二开：等级徽章 + 进度
    var bindings = u.identity_bindings || u.auth_bindings || {};
    if (!Object.keys(bindings).length) {
      bindings = {};
      if (u.email) bindings.email = { bound: true, display_name: 'Email', subject_hint: u.email };
      if (u.github_id) bindings.github = { bound: true, display_name: 'GitHub', subject_hint: u.github_id };
      else bindings.github = { bound: false };
      if (u.google_id || u.oidc_id) bindings.google = { bound: true, display_name: 'Google', subject_hint: '' };
      else bindings.google = { bound: false };
      // 仅展示 email + 已配置的 GitHub/Google。未配置的微信/Linux DO/Telegram 不进绑定网格
      // （系统未启用，展示「连接」也无从绑定）；若用户确已绑定它们，仍会从 identity_bindings 真实路径显示。
    }
    var bindGrid = document.getElementById('bind-grid');
    var bindMeta = document.getElementById('bindings-meta');
    if (bindGrid) {
      var PROVIDERS = {
        email:   { name: 'Email',    logoBg: '#FFF;border:1px solid var(--border)', logoSvg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1" stroke="#181717" stroke-width="1.3"/><path d="M2 4l6 4.5L14 4" stroke="#181717" stroke-width="1.3" stroke-linecap="round"/></svg>' },
        github:  { name: 'GitHub',   logoBg: '#FFF;border:1px solid var(--border)', logoSvg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.6c-3.6 0-6.4 2.8-6.4 6.4 0 2.8 1.8 5.2 4.3 6 .3.06.4-.14.4-.3v-1.2c-1.8.4-2.2-.8-2.2-.8-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.7 0 1 .7 1 .7.6 1 1.6.7 2 .5.06-.4.2-.7.4-.86-1.4-.16-2.9-.7-2.9-3.2 0-.7.3-1.3.7-1.7-.07-.16-.3-.86.06-1.8 0 0 .56-.16 1.8.7.5-.14 1.1-.2 1.6-.2s1.1.06 1.6.2c1.2-.86 1.8-.7 1.8-.7.36.94.14 1.64.06 1.8.44.4.7 1 .7 1.7 0 2.5-1.5 3-2.9 3.2.24.2.4.6.4 1.2v1.7c0 .2.1.36.4.3 2.5-.8 4.3-3.2 4.3-6 0-3.6-2.8-6.4-6.4-6.4z" fill="#181717"/></svg>' },
        google:  { name: 'Google',   logoBg: '#FFF;border:1px solid var(--border)', logoSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853"/><path d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/></svg>' },
        wechat:  { name: '微信',      logoBg: '#07C160', logoSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8.7 4C4 4 0 7 0 11c0 2.3 1.4 4.3 3.6 5.7-.1.4-.6 2-.7 2.3 0 0 0 .2.1.2h.1c.2 0 2.4-1.5 2.8-1.7.9.2 1.8.3 2.8.3.3 0 .6 0 .8-.1-.2-.6-.3-1.2-.3-1.8 0-3.6 3.6-6.6 8-6.6.3 0 .6 0 .9.1C17.5 6 13.5 4 8.7 4zm-2.4 5.4c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2zm5 0c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2zM24 16.3c0-3-3-5.5-6.6-5.5-3.7 0-6.6 2.5-6.6 5.5 0 3 3 5.5 6.6 5.5.8 0 1.6-.1 2.3-.3.3.2 2.1 1.4 2.2 1.4 0 0 .1 0 .1-.1 0-.1-.4-1.4-.5-1.8 1.6-1 2.5-2.6 2.5-4.7zm-8.7-1c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.5 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"/></svg>' },
        linuxdo: { name: 'Linux DO', logoBg: '#1a1a2e', logoSvg: '<svg width="14" height="14" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="5.5" stroke="white" stroke-width="1.3" fill="none"/><text x="8" y="11" text-anchor="middle" font-size="6" font-family="sans-serif" font-weight="bold">LD</text></svg>' },
        oidc:    { name: 'OIDC',     logoBg: '#2F5C8C', logoSvg: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="white" stroke-width="1.3"/><path d="M5 8h6M8 5v6" stroke="white" stroke-width="1.3" stroke-linecap="round"/></svg>' },
      };
      var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
      var boundCount = 0, totalCount = 0;
      var html = '';
      for (var provider in bindings) {
        var b = bindings[provider];
        var pm = PROVIDERS[provider] || { name: provider, logoBg: '#5C5851', logoSvg: '' };
        totalCount++;
        if (b.bound) boundCount++;
        var sub = b.bound
          ? (b.display_name || b.subject_hint || (lang === 'zh' ? '已绑定' : 'Connected'))
          : (lang === 'zh' ? '未绑定' : 'Not linked');
        // email 为主登录身份，无操作；已绑定 → 管理（可解绑）；未绑定 → 连接（真实 OAuth 绑定）
        var action = provider === 'email'
          ? ''
          : (b.bound
            ? '<button class="bind__act" type="button" data-action="binding-manage">' + (lang === 'zh' ? '管理' : 'Manage') + '</button>'
            : '<button class="bind__act bind__act--connect" type="button" data-action="binding-connect">' + (lang === 'zh' ? '连接' : 'Connect') + '</button>');
        var bindName = b.display_name || pm.name || provider;
        var bindHandle = b.subject_hint || '';
        var bindDays = b.bound_days || '';
        html += '<div class="bind" data-bind="' + provider + '" data-bind-name="' + bindName.replace(/"/g,'&quot;') + '" data-bind-handle="' + bindHandle.replace(/"/g,'&quot;') + '" data-bind-days="' + bindDays + '" data-linked="' + (b.bound ? 'true' : 'false') + '">' +
          '<div class="bind__logo" style="background:' + pm.logoBg + '">' + pm.logoSvg + '</div>' +
          '<div class="bind__info">' +
            '<div class="bind__name">' + pm.name + (b.bound && provider === 'email' ? ' <span class="chip chip--green" style="font-size:10px;padding:1px 6px">' + (lang === 'zh' ? '主登录' : 'Primary') + '</span>' : '') + '</div>' +
            '<div class="bind__sub">' + sub + '</div>' +
          '</div>' +
          action +
        '</div>';
      }
      bindGrid.innerHTML = html;
      if (bindMeta) bindMeta.textContent = boundCount + ' / ' + totalCount + (lang === 'zh' ? ' 已绑定' : ' linked');
    }
    if (typeof MexionAuth !== 'undefined' && MexionAuth.hydrateUI) MexionAuth.hydrateUI();
    u.balance = getProfileBalance(u);
    window.__mexionUser = u;
    syncNotificationSettings(u);
  }
  function hideUnsupported() {
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    // 手机号隐藏
    var phoneRow = document.querySelector('[data-row="phone"]');
    if (phoneRow) phoneRow.style.display = 'none';
    // 头像更换按钮隐藏（无上传 API）
    var avatarBtn = document.querySelector('[data-action="change-avatar"]');
    if (avatarBtn) avatarBtn.style.display = 'none';
    // 二开：真实注销账户入口(接后端 DELETE /api/user/self 物理删除),绑定多步确认流程。
    var dangerBtn = document.querySelector('[data-action="delete-account"]');
    if (dangerBtn) dangerBtn.addEventListener('click', function (e) { e.preventDefault(); deleteAccountFlow(); });
    // 二开：可折叠面板(偏好设置)——点击标题头切换 is-collapsed,grid-rows 动画在 CSS。默认收起减少冗杂/留白。
    document.querySelectorAll('[data-collapse-toggle]').forEach(function (head) {
      head.addEventListener('click', function () {
        var panel = head.closest('[data-collapsible]');
        if (!panel) return;
        var collapsed = panel.classList.toggle('is-collapsed');
        head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
      });
    });
    // API 二级密码：显示但点击提示暂不支持
    var apiPassBtn = document.querySelector('[data-action="set-apipass"]');
    if (apiPassBtn) {
      apiPassBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        toast(lang === 'zh' ? '暂不支持设置 API 二级密码' : 'API secondary password not available yet');
      }, true);
    }
    // 邮箱更换按钮：改为提示
    var emailBtn = document.querySelector('[data-action="change-email"]');
    if (emailBtn) {
      emailBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        toast(MexionI18n ? MexionI18n.t('toast.email.unsupported') : '暂不支持修改邮箱');
      }, true);
    }
    // 活动会话：渲染当前浏览器真实信息
    var sessList = document.getElementById('sessions-list');
    var sessMeta = document.getElementById('session-meta');
    if (sessList) {
      var ua = navigator.userAgent;
      var browserMatch = ua.match(/Edg\/(\d+)/)||ua.match(/Chrome\/(\d+)/)||ua.match(/Firefox\/(\d+)/)||ua.match(/Version\/(\d+).*Safari/);
      var browserName = /Edg/.test(ua)?'Edge':/Chrome/.test(ua)?'Chrome':/Firefox/.test(ua)?'Firefox':/Safari/.test(ua)?'Safari':'Browser';
      var browserVer = browserMatch ? browserMatch[1] : '';
      var os = /Windows/.test(ua)?'Windows':/Mac/.test(ua)?'macOS':/Linux/.test(ua)&&!/Android/.test(ua)?'Linux':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':'Unknown';
      var isMobile = /Mobile|Android|iPhone/.test(ua);
      var deviceIcon = isMobile
        ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="4.5" y="2" width="7" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="12" r="0.7" fill="currentColor"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="8.5" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 14h5M8 11.5V14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
      var resolution = screen.width + '×' + screen.height;
      var langLabel = navigator.language || '';

      sessList.innerHTML = '<div class="sess">' +
        '<div class="sess__icon">' + deviceIcon + '</div>' +
        '<div class="sess__info">' +
          '<div class="sess__title">' + os + ' · ' + browserName + ' ' + browserVer + ' <span class="live">' + (lang === 'zh' ? '当前' : 'Current') + '</span></div>' +
          '<div class="sess__sub">' + (isMobile ? (lang === 'zh' ? '移动端' : 'Mobile') : (lang === 'zh' ? '桌面端' : 'Desktop')) + ' · ' + resolution + ' · ' + langLabel + '</div>' +
        '</div>' +
        '<span style="font-family:var(--f-mono);font-size:11px;color:var(--mute-2)">' + (lang === 'zh' ? '本机' : 'This device') + '</span>' +
      '</div>';

      if (sessMeta) sessMeta.textContent = lang === 'zh' ? '1 处登录' : '1 active session';
    }
  }

  const NOTIFY_DEFAULTS = {
    notify_type: 'email',
    quota_warning_threshold: 500000,
    notification_email: '',
    webhook_url: '',
    webhook_secret: '',
    bark_url: '',
    gotify_url: '',
    gotify_token: '',
    gotify_priority: 5,
    disabled_notify_types: [],
    upstream_model_update_notify_enabled: false,
    accept_unset_model_ratio_model: false,
    record_ip_log: false
  };
  const NOTIFY_TYPES = ['email','webhook','bark','gotify','none'];
  const NOTIFY_CATEGORY_TYPES = [
    'quota_exceed',
    'subscription_quota_exceed',
    'channel_update',
    'channel_test',
    'upstream_model_update'
  ];
  let notifyState = Object.assign({}, NOTIFY_DEFAULTS);
  let notifyUiWired = false;

  function parseUserSetting(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function normalizeNotifySettings(user) {
    const raw = parseUserSetting(user && user.setting);
    const next = Object.assign({}, NOTIFY_DEFAULTS, raw);
    if (NOTIFY_TYPES.indexOf(next.notify_type) < 0) next.notify_type = NOTIFY_DEFAULTS.notify_type;
    next.quota_warning_threshold = Number(next.quota_warning_threshold) > 0
      ? Number(next.quota_warning_threshold)
      : NOTIFY_DEFAULTS.quota_warning_threshold;
    next.gotify_priority = Number(next.gotify_priority);
    if (!isFinite(next.gotify_priority)) next.gotify_priority = NOTIFY_DEFAULTS.gotify_priority;
    next.disabled_notify_types = Array.isArray(next.disabled_notify_types)
      ? next.disabled_notify_types.filter(function (type) { return NOTIFY_CATEGORY_TYPES.indexOf(type) >= 0; })
      : [];
    next.upstream_model_update_notify_enabled = !!next.upstream_model_update_notify_enabled;
    next.accept_unset_model_ratio_model = !!next.accept_unset_model_ratio_model;
    next.record_ip_log = !!next.record_ip_log;
    return next;
  }

  function isAdminUser(user) {
    if (!user) return false;
    if (String(user.auth_role || '').toLowerCase() === 'admin') return true;
    return Number(user.role) >= 100;
  }

  function setNotifyStatus(text, tone) {
    const el = document.getElementById('notify-status');
    if (!el) return;
    el.textContent = text;
    el.dataset.tone = tone || 'idle';
  }

  function setNotifyFieldVisibility(method) {
    document.querySelectorAll('[data-notify-field]').forEach(function (el) {
      el.hidden = el.getAttribute('data-notify-field') !== method;
    });
    const noneHint = document.getElementById('notify-none-hint');
    if (noneHint) noneHint.hidden = method !== 'none';
  }

  function setNotifyMethod(method) {
    if (NOTIFY_TYPES.indexOf(method) < 0) method = 'email';
    notifyState.notify_type = method;
    document.querySelectorAll('[data-notify-method]').forEach(function (btn) {
      const active = btn.getAttribute('data-notify-method') === method;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
    setNotifyFieldVisibility(method);
  }

  function isNotifyCategoryEnabled(type) {
    return notifyState.disabled_notify_types.indexOf(type) < 0;
  }

  function setNotifyToggle(type, enabled) {
    const clean = notifyState.disabled_notify_types.filter(function (item) { return item !== type; });
    notifyState.disabled_notify_types = enabled ? clean : clean.concat(type);
    document.querySelectorAll('[data-notify-toggle="' + type + '"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  }

  function readNotifyInputs() {
    function val(id) {
      const el = document.getElementById(id);
      return el ? (el.value || '').trim() : '';
    }
    notifyState.notification_email = val('notify-email');
    notifyState.webhook_url = val('notify-webhook-url');
    notifyState.webhook_secret = val('notify-webhook-secret');
    notifyState.bark_url = val('notify-bark-url');
    notifyState.gotify_url = val('notify-gotify-url');
    notifyState.gotify_token = val('notify-gotify-token');
    notifyState.gotify_priority = Number(val('notify-gotify-priority') || 5);
    const threshold = Number(val('notify-threshold'));
    notifyState.quota_warning_threshold = threshold > 0 ? threshold : NOTIFY_DEFAULTS.quota_warning_threshold;
  }

  function fillNotifyInputs() {
    function setVal(id, value) {
      const el = document.getElementById(id);
      if (el) el.value = value == null ? '' : String(value);
    }
    setVal('notify-email', notifyState.notification_email || '');
    setVal('notify-webhook-url', notifyState.webhook_url || '');
    setVal('notify-webhook-secret', notifyState.webhook_secret || '');
    setVal('notify-bark-url', notifyState.bark_url || '');
    setVal('notify-gotify-url', notifyState.gotify_url || '');
    setVal('notify-gotify-token', notifyState.gotify_token || '');
    setVal('notify-gotify-priority', notifyState.gotify_priority || 5);
    setVal('notify-threshold', notifyState.quota_warning_threshold || NOTIFY_DEFAULTS.quota_warning_threshold);
  }

  function applyNotifyUi(user) {
    if (!document.getElementById('notify-methods')) return;
    const admin = isAdminUser(user || window.__mexionUser);
    document.querySelectorAll('[data-admin-notify]').forEach(function (el) {
      el.hidden = !admin;
    });
    fillNotifyInputs();
    setNotifyMethod(notifyState.notify_type);
    NOTIFY_CATEGORY_TYPES.forEach(function (type) {
      setNotifyToggle(type, isNotifyCategoryEnabled(type));
    });
    const upstream = document.querySelector('[data-upstream-notify]');
    if (upstream) upstream.setAttribute('aria-pressed', notifyState.upstream_model_update_notify_enabled ? 'true' : 'false');
    setNotifyStatus(t('profile.notify.status.ready','修改后保存生效'), 'idle');
  }

  function syncNotificationSettings(user) {
    notifyState = normalizeNotifySettings(user || window.__mexionUser);
    applyNotifyUi(user);
  }

  function buildNotifyPayload() {
    readNotifyInputs();
    const payload = {
      notify_type: notifyState.notify_type,
      quota_warning_threshold: notifyState.quota_warning_threshold,
      notification_email: notifyState.notification_email,
      webhook_url: notifyState.webhook_url,
      webhook_secret: notifyState.webhook_secret,
      bark_url: notifyState.bark_url,
      gotify_url: notifyState.gotify_url,
      gotify_token: notifyState.gotify_token,
      gotify_priority: notifyState.gotify_priority,
      disabled_notify_types: notifyState.disabled_notify_types,
      upstream_model_update_notify_enabled: notifyState.upstream_model_update_notify_enabled,
      accept_unset_model_ratio_model: notifyState.accept_unset_model_ratio_model,
      record_ip_log: notifyState.record_ip_log
    };
    return payload;
  }

  function initNotificationSettings() {
    if (notifyUiWired || !document.getElementById('notify-methods')) return;
    notifyUiWired = true;
    const saveBtn = document.getElementById('notify-save');
    function markDirty() {
      setNotifyStatus(t('profile.notify.status.dirty','有未保存的通知设置'), 'dirty');
    }
    document.querySelectorAll('[data-notify-method]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setNotifyMethod(btn.getAttribute('data-notify-method'));
        markDirty();
      });
    });
    document.querySelectorAll('[data-notify-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const type = btn.getAttribute('data-notify-toggle');
        setNotifyToggle(type, btn.getAttribute('aria-pressed') !== 'true');
        markDirty();
      });
    });
    const upstream = document.querySelector('[data-upstream-notify]');
    if (upstream) {
      upstream.addEventListener('click', function () {
        notifyState.upstream_model_update_notify_enabled = upstream.getAttribute('aria-pressed') !== 'true';
        upstream.setAttribute('aria-pressed', notifyState.upstream_model_update_notify_enabled ? 'true' : 'false');
        markDirty();
      });
    }
    document.querySelectorAll('.notify-input,.notify-threshold').forEach(function (input) {
      input.addEventListener('input', markDirty);
      input.addEventListener('change', markDirty);
    });
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (typeof MexionHttp === 'undefined') return;
        const payload = buildNotifyPayload();
        saveBtn.disabled = true;
        setNotifyStatus(t('profile.notify.status.saving','正在保存...'), 'saving');
        MexionHttp.patch('/user/setting', payload).then(function () {
          setNotifyStatus(t('profile.notify.status.saved','通知设置已保存'), 'saved');
          toast(t('profile.notify.toast.saved','通知设置已保存'));
          if (typeof MexionAuth !== 'undefined' && MexionAuth.refreshUser) {
            MexionAuth.refreshUser({ source: 'profile-notify-save', force: true }).then(syncNotificationSettings).catch(function(){});
          }
        }).catch(function (err) {
          setNotifyStatus(err && err.message ? err.message : t('profile.notify.status.failed','保存失败'), 'error');
          toast(err && err.message ? err.message : t('profile.notify.status.failed','保存失败'));
        }).finally(function () {
          saveBtn.disabled = false;
        });
      });
    }
    syncNotificationSettings(window.__mexionUser || (typeof MexionAuth !== 'undefined' && MexionAuth.getUser ? MexionAuth.getUser() : null));
  }

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  }

  function focusWhenAppropriate(el, delay) {
    if (!el || typeof el.focus !== 'function') return;
    const isTextField = /^(INPUT|TEXTAREA)$/i.test(el.tagName || '');
    if (isMobileViewport() && isTextField) return;
    setTimeout(() => el.focus({ preventScroll: true }), delay == null ? 120 : delay);
  }

  /* ─── CUSTOM SELECT ─── */
  function initSelect(wrap) {
    const trigger = wrap.querySelector('.select');
    const menu = wrap.querySelector('.select__menu');
    const label = wrap.querySelector('.select__value');
    const flag = wrap.querySelector('.select > .select__flag');
    if (!trigger || !menu) return;

    let open = false;
    let opts = Array.from(menu.querySelectorAll('.select__opt'));

    function setOpen(state) {
      if (open === state) return;
      open = state;
      trigger.setAttribute('aria-expanded', state ? 'true' : 'false');
      menu.classList.toggle('is-open', state);
      if (state) {
        const sel = menu.querySelector('[aria-selected="true"]') || opts[0];
        requestAnimationFrame(() => {
          if (!isMobileViewport() && sel) sel.focus();
        });
      }
    }
    function pick(opt) {
      opts.forEach(o => o.setAttribute('aria-selected', o === opt ? 'true' : 'false'));
      const text = opt.querySelector('span:not(.select__flag):not(.select__opt-meta)');
      if (text && label) label.textContent = text.textContent.trim();
      if (flag) flag.textContent = opt.dataset.flag || flag.textContent;
      setOpen(false);
      if (!isMobileViewport()) trigger.focus();
      wrap.dispatchEvent(new CustomEvent('select:change', {
        detail: { value: opt.dataset.value }, bubbles: true
      }));
    }

    trigger.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); setOpen(true);
      }
    });

    opts.forEach(opt => {
      opt.addEventListener('click', (e) => { e.stopPropagation(); pick(opt); });
      opt.addEventListener('keydown', (e) => {
        const i = opts.indexOf(opt);
        if (e.key === 'ArrowDown') { e.preventDefault(); (opts[(i + 1) % opts.length]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (opts[(i - 1 + opts.length) % opts.length]).focus(); }
        else if (e.key === 'Home') { e.preventDefault(); opts[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(opt); }
        else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.focus(); }
        else if (e.key === 'Tab') { setOpen(false); }
      });
    });

    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
  }

  /* ─── MODAL ─── */
  let modalCloseTimer = null;
  let lastTrigger = null;
  function openModal(id, trigger) {
    const m = document.getElementById(id);
    if (!m) return;
    if (modalCloseTimer) { clearTimeout(modalCloseTimer); modalCloseTimer = null; }
    lastTrigger = trigger || document.activeElement;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      m.classList.add('is-open');
      const f = m.querySelector('[data-modal-close]') || m.querySelector('button');
      f && f.focus({ preventScroll: true });
    });
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove('is-open');
    document.body.style.overflow = '';
    modalCloseTimer = setTimeout(() => { m.hidden = true; }, 240);
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }
  }
  function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('modal-' + btn.dataset.modalOpen, btn);
      });
    });
    document.querySelectorAll('.modal-backdrop').forEach(bd => {
      bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(bd); });
      bd.querySelectorAll('[data-modal-close]').forEach(c => {
        c.addEventListener('click', () => closeModal(bd));
      });
      bd.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = bd.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = document.querySelector('.modal-backdrop.is-open');
      if (open) closeModal(open);
    });
  }

  /* ─── TOAST ─── */
  let toastTimer = null;
  function toast(text, tone) {
    const el = document.getElementById('toast');
    const t = document.getElementById('toast-text');
    if (!el || !t) return;
    t.textContent = text;
    // 二开:失败态显示红色 ✕ 并加 is-error;原来 #toast 图标恒为绿色对号,
    // 导致「显示名更新失败」这类报错也带对号。成功/默认仍是对号。
    const isErr = tone === 'error';
    el.classList.toggle('is-error', isErr);
    const path = el.querySelector('svg path');
    if (path) path.setAttribute('d', isErr ? 'M4 4l6 6M10 4l-6 6' : 'M3 7l2.5 2.5L11 4');
    el.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), isErr ? 2600 : 1800);
  }

  /* ─── COPY ─── */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const target = document.querySelector(btn.dataset.copy);
        if (!target) return;
        const text = (target.textContent || '').trim().replace(/\s+/g, '');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          btn.classList.add('is-ok');
          toast(window.MexionI18n ? MexionI18n.t('toast.copied') : '已复制密钥');
          setTimeout(() => btn.classList.remove('is-ok'), 1200);
        } catch (err) {
          toast('复制失败 · 请手动复制', 'error');
        }
      });
    });
  }

  /* ─── BACKUP CODES regenerate ─── */
  function initCodes() {
    const grid = document.getElementById('codes-grid');
    const btn = document.getElementById('codes-regen');
    if (!grid || !btn) return;
    const charset = 'abcdefghjkmnpqrstuvwxyz23456789';
    function newCode() {
      let s = '';
      for (let i = 0; i < 8; i++) {
        if (i === 4) s += '-';
        s += charset[Math.floor(Math.random() * charset.length)];
      }
      return s;
    }
    btn.addEventListener('click', () => {
      const cells = grid.querySelectorAll('.code-cell');
      cells.forEach((c, i) => {
        c.classList.remove('code-cell--used');
        c.style.opacity = '0';
        setTimeout(() => {
          c.textContent = newCode();
          c.style.transition = 'opacity .22s';
          c.style.opacity = '1';
        }, 80 + i * 30);
      });
      const meta = document.querySelector('.codes-head .meta b');
      if (meta) meta.textContent = '0';
      toast(window.MexionI18n ? MexionI18n.t('toast.codes.regen') : '已重新生成 8 个备用码');
    });
  }
  function initCheckIn() {
    const ticket = document.getElementById('ticket');
    const claimBtn = document.getElementById('claim-btn');
    if (!ticket || !claimBtn) return;

    /* 从 API 加载签到历史 → 填充统计 */
    if (typeof MexionHttp !== 'undefined') {
      MexionHttp.get('/user/self').then(function(data) {
        var user = data.user || data || {};
        var todayKey = new Date().toISOString().slice(0, 10);
        data = { stats: { checked_in_today: !!(user.lastCheckinAt && String(user.lastCheckinAt).slice(0, 10) === todayKey), records: user.lastCheckinAt ? [{ checkin_date: String(user.lastCheckinAt).slice(0, 10), quota_awarded: 0 }] : [] } };
        var stats = data.stats || {};
        data.checked_today = stats.checked_in_today || stats.checked_today || false;
        var rawList = stats.records || data.records || [];
        if (!Array.isArray(rawList) && data.checkin_date) rawList = [data];
        var records = rawList.map(function(r) {
          return { date: r.checkin_date || r.date, amount: (r.quota_awarded || 0) / 500000 };
        });

        // 统一用 UTC+8（中国时间）计算，和签到服务一致
        function cnNow() {
          var d = new Date();
          var utc = d.getTime() + d.getTimezoneOffset() * 60000;
          return new Date(utc + 8 * 3600000);
        }
        function cnDate(dateStr) {
          var parts = dateStr.split('-');
          return new Date(+parts[0], +parts[1] - 1, +parts[2]);
        }
        var now = cnNow();
        var thisMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        var daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        var monthRecords = records.filter(function(r) { return r.date && r.date.startsWith(thisMonth); });
        var monthTotal = monthRecords.reduce(function(s, r) { return s + (r.amount || 0); }, 0);

        // 计算连击和最长连击
        var dates = records.map(function(r) { return r.date; }).sort();
        var bestStreak = 0, curStreak = 0;
        for (var i = 0; i < dates.length; i++) {
          if (i === 0) { curStreak = 1; }
          else {
            var diff = Math.round((cnDate(dates[i]) - cnDate(dates[i-1])) / 86400000);
            curStreak = diff === 1 ? curStreak + 1 : 1;
          }
          if (curStreak > bestStreak) bestStreak = curStreak;
        }
        // 当前连击
        var todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var streak = 0;
        for (var k = dates.length - 1; k >= 0; k--) {
          var exp = new Date(todayDate.getTime() - streak * 86400000);
          if (cnDate(dates[k]).getTime() === exp.getTime()) streak++;
          else break;
        }

        // 填充 DOM
        var el;
        el = document.getElementById('month-total'); if (el) el.textContent = '$' + monthTotal.toFixed(2);
        el = document.getElementById('month-total-2'); if (el) el.textContent = '$' + monthTotal.toFixed(2);
        el = document.getElementById('month-days'); if (el) el.textContent = monthRecords.length;
        el = document.getElementById('month-days-total'); if (el) { var _l = (typeof MexionI18n!=='undefined'&&MexionI18n.lang)||'zh'; el.textContent = '/ ' + daysInMonth + (_l==='zh'?' 天':' days'); }
        el = document.getElementById('streak-num'); if (el) el.textContent = streak;
        el = document.getElementById('best-streak'); if (el) el.textContent = bestStreak;
        el = document.getElementById('rev-streak'); if (el) el.textContent = streak;
        if (noEl) noEl.textContent = String(records.length + (data.checked_today ? 0 : 1)).padStart(5, '0');

        // 动态渲染本周 ledger（UTC+8）
        var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var dow = now.getDay();
        var weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dow === 0 ? 6 : dow - 1));
        var todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
        var recMap = {};
        records.forEach(function(r) { recMap[r.date] = r; });
        var weekTotal = 0;

        var ledgerList = document.getElementById('ledger-list');
        if (ledgerList) {
          var html = '';
          for (var w = 0; w < 7; w++) {
            var day = new Date(weekStart);
            day.setDate(weekStart.getDate() + w);
            var ds = day.getFullYear() + '-' + String(day.getMonth()+1).padStart(2,'0') + '-' + String(day.getDate()).padStart(2,'0');
            var dayLabel = dayNames[day.getDay()];
            var dateLabel = String(day.getMonth()+1).padStart(2,'0') + '/' + String(day.getDate()).padStart(2,'0');
            var rec = recMap[ds];
            var isToday = ds === todayStr;
            var isPast = day < now && !isToday;
            var isFuture = day > now;

            var rowClass = 'ledger__row';
            var amtHtml = '—';
            if (rec) {
              rowClass += ' ledger__row--done';
              if (rec.amount >= 0.50) rowClass += ' ledger__row--best';
              amtHtml = '$' + rec.amount.toFixed(2);
              if (rec.amount >= 0.50) amtHtml += '<span class="ledger__star">★</span>';
              weekTotal += rec.amount;
            } else if (isToday) {
              rowClass += ' ledger__row--today';
              amtHtml = data.checked_today ? '$' + (recMap[todayStr] || {amount:0}).amount.toFixed(2) : '<i></i><i></i><i></i>';
              if (data.checked_today && recMap[todayStr]) {
                rowClass = rowClass.replace('ledger__row--today', 'ledger__row--done');
                weekTotal += recMap[todayStr].amount;
              }
            } else if (isPast) {
              amtHtml = '--';
            } else {
              rowClass += ' ledger__row--upcoming';
            }

            var idAttr = isToday ? ' id="ledger-today"' : '';
            html += '<li class="' + rowClass + '"' + idAttr + '>' +
              '<span class="ledger__day">' + dayLabel + '</span>' +
              '<span class="ledger__date">' + dateLabel + '</span>' +
              '<span class="ledger__leader"></span>' +
              '<span class="ledger__amt">' + amtHtml + '</span></li>';
          }
          ledgerList.innerHTML = html;

          // 周合计
          var weekEl = document.getElementById('week-total');
          if (weekEl) weekEl.textContent = '$' + weekTotal.toFixed(2);

          // 周标题
          var weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
          var weekHeader = ledgerList.closest('.ledger');
          if (weekHeader) {
            var wh = weekHeader.querySelector('.ledger__week');
            if (wh) {
              var monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
              wh.textContent = 'WEEK ' + weekNum + ' · ' + monthNames[now.getMonth()];
            }
          }
        }

        // 如果今天已签到，显示已签到状态 + 禁用按钮
        if (data.checked_today) {
          ticket.dataset.state = 'revealed';
          claimBtn.disabled = true;
          var revNum = document.getElementById('rev-num');
          var todayRec = recMap[todayStr];
          if (revNum && todayRec) revNum.textContent = todayRec.amount.toFixed(2);
        }
      }).catch(function(){});
    }

    const reduceMotion = (() => {
      try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
      catch (e) { return false; }
    })();

    /* 签到序号：从历史总次数计算 */
    const noEl = document.getElementById('ticket-no');

    /* 票根日期：动态显示今天 */
    var dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    /* 票根日期用 UTC+8 */
    var _cnNow = (function(){ var d=new Date(); return new Date(d.getTime()+d.getTimezoneOffset()*60000+8*3600000); })();
    var _dayLabels = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var dateStr = _cnNow.getFullYear() + ' · ' + String(_cnNow.getMonth()+1).padStart(2,'0') + ' · ' + String(_cnNow.getDate()).padStart(2,'0') + ' · ' + _dayLabels[_cnNow.getDay()];
    document.querySelectorAll('[data-i18n="profile.checkin.ticket.date"]').forEach(function(el) { el.textContent = dateStr; });

    function fmt(n) { return '$' + n.toFixed(2); }
    function parseYen(s) {
      const m = (s || '').match(/-?\d+\.?\d*/);
      return m ? parseFloat(m[0]) : 0;
    }

    function rollNumber(el, target, dur) {
      if (reduceMotion) { el.textContent = target.toFixed(2); return; }
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const v = target * easeOut(t);
        el.textContent = v.toFixed(2);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(2);
      }
      requestAnimationFrame(tick);
    }

    /* animate any element with a tabular numeric currency value from -> to */
    function rollMoney(el, from, to, dur) {
      if (!el) return;
      if (reduceMotion || dur <= 0) { el.textContent = fmt(to); return; }
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const v = from + (to - from) * easeOut(t);
        el.textContent = fmt(v);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(to);
      }
      requestAnimationFrame(tick);
    }

    function pulse(el, cls) {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), 700);
    }

    function floatAmount(amount, lucky) {
      const host = ticket.querySelector('.ticket__face--revealed') || ticket;
      const node = document.createElement('span');
      node.className = 'ticket__credit-float' + (lucky ? ' ticket__credit-float--lucky' : '');
      node.textContent = '+' + fmt(amount);
      host.appendChild(node);
      setTimeout(() => node.remove(), 1500);
    }

    function sparkBurst() {
      const host = ticket.querySelector('.ticket__face--revealed') || ticket;
      const wrap = document.createElement('span');
      wrap.className = 'ticket__burst';
      wrap.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 7; i++) {
        const dot = document.createElement('i');
        const ang = (i / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = 36 + Math.random() * 18;
        dot.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        dot.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
        dot.style.setProperty('--d', (i * 30) + 'ms');
        wrap.appendChild(dot);
      }
      host.appendChild(wrap);
      setTimeout(() => wrap.remove(), 1100);
    }

    function fetchCurrentBalance() {
      if (typeof MexionHttp === 'undefined') return Promise.resolve(null);
      return MexionHttp.get('/user/self').then(function(user) {
        return getProfileBalance(user);
      }).catch(function() {
        return null;
      });
    }

    function revealWithFreshBalance(amt) {
      fetchCurrentBalance().then(function(newBal) {
        doReveal(amt, typeof newBal === 'number' ? newBal : null);
      });
    }

    function claim() {
      if (claimBtn.disabled) return;
      claimBtn.disabled = true;

      // 调真实签到 API
      if (typeof MexionHttp !== 'undefined') {
        MexionHttp.post('/user/checkin', {}).then(function(data) {
          var amt = ((data.granted != null ? data.granted : data.quota_awarded) || 0) / 500000;
          revealWithFreshBalance(amt);
        }).catch(function(err) {
          claimBtn.disabled = false;
          var msg = (err && err.message) || '';
          if (msg.indexOf('已签到') !== -1 || msg.indexOf('already') !== -1) {
            claimBtn.disabled = true;
            MexionHttp.get('/user/self').then(function(info) {
              var user = info.user || info || {};
              var st = { records: user.lastCheckinAt ? [{ checkin_date: String(user.lastCheckinAt).slice(0, 10), quota_awarded: 0 }] : [] };
              var recs = st.records || [];
              var now = new Date(); var utc = now.getTime() + now.getTimezoneOffset() * 60000; var cn = new Date(utc + 8 * 3600000);
              var todayKey = cn.getFullYear() + '-' + String(cn.getMonth()+1).padStart(2,'0') + '-' + String(cn.getDate()).padStart(2,'0');
              var todayRec = recs.find(function(r){ return r.checkin_date === todayKey; });
              var amt = todayRec ? (todayRec.quota_awarded || 0) / 500000 : 0;
              if (amt > 0) { revealWithFreshBalance(amt); }
              else { ticket.dataset.state = 'revealed'; toast(MexionI18n ? MexionI18n.t('toast.checkin.already') : '今日已签到'); }
            }).catch(function(){ ticket.dataset.state = 'revealed'; });
          } else if (msg.indexOf('HTTP 404') !== -1 || msg.indexOf('Unexpected') !== -1) {
            toast(t('toast.checkin.unavailable', '签到服务暂不可用'));
          } else {
            toast(msg || t('toast.checkin.fail', '签到失败'));
          }
        });
        return;
      }
      // no API available
      claimBtn.disabled = false;
      toast(t('toast.checkin.unavailable', '签到服务暂不可用'));
    }

    function doReveal(amt, newBalFromApi) {
      const lucky = amt >= 0.50;
      const i18n = window.MexionI18n;

      if (lucky) ticket.classList.add('ticket--lucky');

      /* ticket wobble + foil sweep — functional moment-marker, runs always */
      ticket.classList.add('is-revealing');
      setTimeout(() => ticket.classList.remove('is-revealing'), 1200);

      /* swap state (CSS hides ready / shows revealed) */
      ticket.dataset.state = 'revealed';

      /* roll the big number after the foil sweep peaks */
      const revNum = document.getElementById('rev-num');
      if (revNum) {
        revNum.textContent = '0.00';
        setTimeout(() => rollNumber(revNum, amt, 720), reduceMotion ? 0 : 580);
      }

      /* floating "+$0.23" rises from the ticket face */
      setTimeout(() => floatAmount(amt, lucky), reduceMotion ? 0 : 640);
      if (lucky && !reduceMotion) setTimeout(sparkBurst, 720);

      /* update streak +1 (with pop) */
      const streakEl = document.getElementById('streak-num');
      const newStreak = (parseInt((streakEl && streakEl.textContent) || '0', 10) || 0) + 1;
      if (streakEl) {
        setTimeout(() => {
          streakEl.textContent = String(newStreak);
          pulse(streakEl, 'is-bumped');
          pulse(streakEl.closest('.streak-pill'), 'streak-pill--pulse');
        }, reduceMotion ? 0 : 700);
      }
      const revStreak = document.getElementById('rev-streak');
      if (revStreak) setTimeout(() => { revStreak.textContent = String(newStreak); pulse(revStreak, 'is-bumped'); }, reduceMotion ? 0 : 700);

      /* roll the balance counter — 优先用 API 返回的真实余额 */
      const startBal = parseFloat(ticket.dataset.balance || '0') || 0;
      const newBal = typeof newBalFromApi === 'number' ? newBalFromApi : (startBal + amt);
      ticket.dataset.balance = newBal.toFixed(2);
      const revBal = document.getElementById('rev-balance');
      setTimeout(() => rollMoney(revBal, startBal, newBal, 720), reduceMotion ? 0 : 640);
      setTimeout(() => {
        if (typeof MexionAuth !== 'undefined' && MexionAuth.refreshUser) {
          MexionAuth.refreshUser({ source: 'checkin-settle', force: true }).catch(function(){});
        }
      }, reduceMotion ? 0 : 900);

      /* roll month total (both pill + foot) */
      const monthCur = parseYen(document.getElementById('month-total') && document.getElementById('month-total').textContent);
      const monthNew = monthCur + amt;
      ['month-total', 'month-total-2'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) setTimeout(() => rollMoney(el, monthCur, monthNew, 720), reduceMotion ? 0 : 640);
      });

      /* month days +1 (with pulse) */
      const mDays = document.getElementById('month-days');
      if (mDays) setTimeout(() => { mDays.textContent = String((parseInt(mDays.textContent, 10) || 0) + 1); pulse(mDays, 'is-bumped'); }, reduceMotion ? 0 : 700);

      /* update ledger today row — transition pop */
      const ledgerToday = document.getElementById('ledger-today');
      if (ledgerToday) {
        setTimeout(() => {
          ledgerToday.classList.remove('ledger__row--today');
          ledgerToday.classList.add('ledger__row--done', 'ledger__row--landing');
          if (lucky) ledgerToday.classList.add('ledger__row--best');
          const amtCell = ledgerToday.querySelector('.ledger__amt');
          if (amtCell) {
            amtCell.classList.remove('ledger__amt--pulse');
            amtCell.innerHTML = lucky
              ? (fmt(amt) + '<span class="ledger__star">★</span>')
              : fmt(amt);
          }
          setTimeout(() => ledgerToday.classList.remove('ledger__row--landing'), 900);
        }, reduceMotion ? 0 : 760);
      }

      /* roll week total */
      const weekEl = document.getElementById('week-total');
      if (weekEl) {
        const cur = parseYen(weekEl.textContent);
        setTimeout(() => rollMoney(weekEl, cur, cur + amt, 720), reduceMotion ? 0 : 760);
      }

      /* button state */
      if (i18n) claimBtn.setAttribute('aria-label', i18n.t('profile.checkin.claim.done'));

      /* toast */
      const toastKey = lucky ? 'toast.checkin.lucky' : 'toast.checkin.done';
      const prefix = i18n ? i18n.t(toastKey) : (lucky ? '幸运日！已存入账户余额 · ' : '已存入账户余额 · ');
      setTimeout(() => toast(prefix + fmt(amt)), reduceMotion ? 0 : 820);
    }

    claimBtn.addEventListener('click', claim);
    claimBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); claim(); }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     DIALOG FRAMEWORK — dynamic modal mount/close, reusing modal CSS
     ═══════════════════════════════════════════════════════════════ */
  function t(key, fallback) {
    if (window.MexionI18n && MexionI18n.t) {
      const v = MexionI18n.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function svgIcon(name) {
    const icons = {
      user:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="2.8" stroke="currentColor" stroke-width="1.4"/><path d="M3 15.5c.6-2.6 3-4.2 6-4.2s5.4 1.6 6 4.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
      mail:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="4" width="13" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 5l6 4.5L15 5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
      phone: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="5.5" y="2" width="7" height="14" rx="1.6" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="14" r="0.7" fill="currentColor"/></svg>',
      lock:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3.5" y="8" width="11" height="8" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.4"/></svg>',
      key:   '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="6" cy="9" r="3.2" stroke="currentColor" stroke-width="1.4"/><path d="M8.8 9h6.5M14 7v4M11.6 9v2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
      avatar:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="7.5" r="2.4" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 14c.6-1.8 2.5-2.8 4.5-2.8s3.9 1 4.5 2.8" stroke="currentColor" stroke-width="1.4"/></svg>',
      tier:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5l2.2 5 5.3.5-4 3.7 1.2 5.3L9 13.4l-4.7 2.6 1.2-5.3-4-3.7 5.3-.5L9 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
      link:  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M8 10l2-2M5.5 12.5a2.8 2.8 0 0 1 0-4l2.3-2.3a2.8 2.8 0 0 1 4 4M12.5 5.5a2.8 2.8 0 0 1 0 4l-2.3 2.3a2.8 2.8 0 0 1-4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
      logout:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4.5V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.5M8 9h8M13 6l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      danger:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l7 12.5H2L9 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 7v3.5M9 12.6v.05" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    };
    return icons[name] || icons.user;
  }

  let dlgOpenCount = 0;
  function mountDialog(opts) {
    const {
      title = '',
      sub = '',
      icon = 'user',
      status = null,      // {label, kind: 'on'|'off'|'warn'}
      size = 'sm',        // 'sm' | '' (default md) | 'lg'
      bodyHtml = '',
      footHtml = '',
      bodyClass = '',
      headDanger = false,
      onMount = null
    } = opts;

    const trigger = document.activeElement;
    const root = document.createElement('div');
    root.className = 'modal-backdrop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.hidden = true;

    const statusHtml = status
      ? `<span class="modal__status modal__status--${status.kind || 'on'}"><span class="dot"></span><span>${status.label}</span></span>`
      : '';
    const modalSizeClass = size === 'lg' ? 'modal--lg' : (size === 'sm' ? 'modal--sm' : '');
    const headTint = headDanger ? 'style="color:var(--verm-2)"' : '';

    root.innerHTML = `
      <div class="modal ${modalSizeClass}" role="document">
        <button class="modal__close" type="button" data-modal-close aria-label="${t('modal.close.aria','关闭')}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <header class="modal__head">
          <div class="modal__icon" aria-hidden="true" ${headTint}>${svgIcon(icon)}</div>
          <div class="modal__id">
            <h3 class="modal__title">${title}${statusHtml}</h3>
            ${sub ? `<span class="modal__sub">${sub}</span>` : ''}
          </div>
        </header>
        <div class="modal__body ${bodyClass}">${bodyHtml}</div>
        ${footHtml ? `<footer class="modal__foot">${footHtml}</footer>` : ''}
      </div>
    `;

    document.body.appendChild(root);

    function close() {
      root.classList.remove('is-open');
      document.body.style.overflow = dlgOpenCount > 1 ? 'hidden' : '';
      setTimeout(() => { try { root.remove(); } catch(e){} }, 260);
      dlgOpenCount = Math.max(0, dlgOpenCount - 1);
      if (trigger && typeof trigger.focus === 'function') {
        setTimeout(() => trigger.focus({ preventScroll: true }), 50);
      }
    }

    /* close wiring */
    root.querySelectorAll('[data-modal-close]').forEach(c => {
      c.addEventListener('click', (e) => { e.preventDefault(); close(); });
    });
    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const focusables = root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const visible = Array.from(focusables).filter(el => !el.disabled && el.offsetParent !== null);
      if (!visible.length) return;
      const first = visible[0], last = visible[visible.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* open with animation */
    dlgOpenCount++;
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      root.classList.add('is-open');
      const target = isMobileViewport()
        ? (root.querySelector('[data-primary]') || root.querySelector('[data-modal-close]') || root.querySelector('button:not([data-modal-close])'))
        : (root.querySelector('input:not([disabled]), textarea:not([disabled])')
            || root.querySelector('[data-primary]')
            || root.querySelector('button:not([data-modal-close])'));
      focusWhenAppropriate(target, 120);
    });

    if (onMount) onMount({ root, body: root.querySelector('.modal__body'), foot: root.querySelector('.modal__foot'), close });
    return { root, close };
  }

  /* ── confirm dialog (small) ────────────────────────────────── */
  function confirmDialog({title, sub, icon = 'danger', message, primaryLabel, danger = false, onConfirm}) {
    const bodyHtml = `<div class="dlg-msg">${message}</div>`;
    const footHtml = `
      <button class="btn btn--ghost btn--sm" type="button" data-modal-close>${t('modal.cancel','取消')}</button>
      <button class="btn btn--sm ${danger ? 'btn--danger' : ''}" type="button" data-primary>${primaryLabel}</button>
    `;
    mountDialog({
      title, sub, icon, size: 'sm',
      headDanger: danger,
      bodyHtml, footHtml,
      bodyClass: 'modal__body--tight',
      onMount: ({ root, close }) => {
        const p = root.querySelector('[data-primary]');
        p.addEventListener('click', () => {
          if (onConfirm) onConfirm();
          close();
        });
      }
    });
  }

  // 二开：真实注销账户。后端 DELETE /api/user/self(级联清理 + 物理删除,root 账户后端拒绝)。
  // 阅读后果 + 输入 DELETE 激活 → 调接口 → 成功即退出登录(会话失效)。与管理面板/后端注销系统对齐。
  function deleteAccountFlow() {
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    var zh = lang === 'zh';
    var u = window.__mexionUser || (typeof MexionAuth !== 'undefined' && MexionAuth.getUser ? MexionAuth.getUser() : null) || {};
    var bal = '$' + (((u.quota || 0) / 500000)).toFixed(2);
    var idTxt = '#' + (u.id != null ? u.id : '--');
    var esc = function (s) { return String(s).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); };
    var cons = [
      (zh ? '账户 ' : 'Account ') + idTxt + (zh ? ' 与所有个人数据将被永久删除' : ' and all personal data are permanently deleted'),
      (zh ? '当前余额 ' : 'Balance ') + bal + (zh ? ' 自动失效,不可退款、不可转移' : ' expires — non-refundable, non-transferable'),
      zh ? '所有 API 密钥立即吊销,应用将无法继续访问' : 'All API keys are revoked immediately',
      zh ? '此操作永久且不可恢复' : 'This action is permanent and irreversible',
    ];
    var bodyHtml =
      '<div class="dlg-msg">' +
        '<p style="color:var(--verm-2);font-weight:600;margin:0 0 8px">' + (zh ? '注销账户是永久且不可恢复的操作,请仔细阅读:' : 'Deleting your account is permanent and irreversible:') + '</p>' +
        '<ul style="margin:0 0 12px;padding-left:18px;line-height:1.9;font-size:13px">' + cons.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
        '<p style="margin:0 0 6px;font-size:13px">' + (zh ? '请输入 <b>DELETE</b> 以确认。' : 'Type <b>DELETE</b> to confirm.') + '</p>' +
        '<input type="text" data-del-confirm autocomplete="off" spellcheck="false" placeholder="DELETE" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);font-family:var(--f-mono);letter-spacing:0.1em">' +
      '</div>';
    var footHtml =
      '<button class="btn btn--ghost btn--sm" type="button" data-modal-close>' + (zh ? '取消' : 'Cancel') + '</button>' +
      '<button class="btn btn--sm btn--danger" type="button" data-del-go disabled>' + (zh ? '永久注销账户' : 'Permanently delete') + '</button>';
    mountDialog({
      title: zh ? '注销 <em>账户</em>' : 'Delete <em>account</em>',
      sub: zh ? '此操作永久且不可恢复' : 'Permanent and irreversible',
      icon: 'danger', size: 'sm', headDanger: true,
      bodyHtml: bodyHtml, footHtml: footHtml,
      onMount: function (ctx) {
        var root = ctx.root;
        var inp = root.querySelector('[data-del-confirm]');
        var go = root.querySelector('[data-del-go]');
        if (!inp || !go) return;
        try { inp.focus(); } catch (e) {}
        inp.addEventListener('input', function () { go.disabled = inp.value.trim().toUpperCase() !== 'DELETE'; });
        go.addEventListener('click', function () {
          if (go.disabled) return;
          go.disabled = true; go.textContent = zh ? '注销中…' : 'Deleting…';
          Promise.reject(new Error(zh ? '演示版暂不支持注销账户' : 'Account deletion is not available in this demo')).then(function () {
            toast(zh ? '账户已注销 · 即将退出' : 'Account deleted · signing out');
            setTimeout(function () {
              if (typeof MexionAuth !== 'undefined' && MexionAuth.logout) MexionAuth.logout();
              else location.replace('/login');
            }, 900);
          }).catch(function (err) {
            go.disabled = false; go.textContent = zh ? '永久注销账户' : 'Permanently delete';
            toast((err && err.message) ? err.message : (zh ? '注销失败,请重试或联系客服' : 'Failed, please retry'));
          });
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     INLINE EDIT — display name
     ═══════════════════════════════════════════════════════════════ */
  function initInlineEdit() {
    document.querySelectorAll('[data-action="edit-name"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.kv');
        if (!row || row.classList.contains('is-editing')) return;
        const valEl = row.querySelector('[data-field="display-name"]');
        const actBtn = btn;
        const original = (valEl.textContent || '').trim();
        const MAX = 20; // 对齐后端 User.DisplayName validate:"max=20"，否则 21~24 字会被后端 4xx 拒绝

        const editWrap = document.createElement('div');
        editWrap.className = 'kv__edit';
        editWrap.innerHTML = `
          <input class="kv__edit-input" type="text" value="${original.replace(/"/g,'&quot;')}" maxlength="${MAX}" aria-label="${t('inline.name.aria','显示名')}">
          <span class="kv__edit-cap"><b class="kv__edit-cap-n">${original.length}</b>/${MAX}</span>
          <span class="kv__edit-act">
            <button class="kv__edit-btn" type="button" data-act="cancel">${t('inline.cancel','取消')}</button>
            <button class="kv__edit-btn kv__edit-btn--save" type="button" data-act="save">${t('inline.save','保存')}</button>
          </span>
        `;

        valEl.style.display = 'none';
        actBtn.style.display = 'none';
        row.classList.add('is-editing');
        row.insertBefore(editWrap, actBtn);

        const input = editWrap.querySelector('input');
        const cap = editWrap.querySelector('.kv__edit-cap-n');
        const capWrap = editWrap.querySelector('.kv__edit-cap');
        const saveBtn = editWrap.querySelector('[data-act="save"]');
        const cancelBtn = editWrap.querySelector('[data-act="cancel"]');

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        function update() {
          const v = input.value.trim();
          cap.textContent = input.value.length;
          capWrap.classList.toggle('is-warn', input.value.length >= MAX - 2);
          saveBtn.disabled = !v || v === original;
        }
        update();

        function teardown() {
          row.classList.remove('is-editing');
          editWrap.remove();
          valEl.style.display = '';
          actBtn.style.display = '';
        }
        function commit() {
          const v = input.value.trim();
          if (!v || v === original) { teardown(); return; }
          teardown();
          if (typeof MexionHttp === 'undefined') return;
          // 等后端确认再落值 + 回写缓存,避免"先变后弹回":成功才改 DOM、刷新 mexion_user(让顶栏/首页/其它页同步)、弹成功;
          // 失败保留原值 + 如实报错(不再用空 catch 吞错 + 无条件谎报成功)。
          Promise.reject(new Error(t('toast.name.unsupported','演示版暂不支持修改昵称'))).then(function() {
            valEl.textContent = v;
            document.querySelectorAll('[data-mexion-user="name"]').forEach(function(el) { el.textContent = v; });
            document.querySelectorAll('[data-field="name"]').forEach(function(el) { el.textContent = v; });
            if (typeof MexionAuth !== 'undefined' && MexionAuth.refreshUser) {
              MexionAuth.refreshUser({ source: 'profile-name-save', force: true }).catch(function(){});
            }
            toast(t('toast.name.saved','显示名已更新'));
          }).catch(function(err) {
            // 二开:如实回报后端原因(原来吞掉 err 只显示通用「请重试」),并用错误态(红 ✕)。
            var msg = (err && err.message) ? err.message : t('toast.name.failed','显示名更新失败，请重试');
            toast(msg, 'error');
          });
        }

        input.addEventListener('input', update);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (!saveBtn.disabled) commit(); }
          else if (e.key === 'Escape') { e.preventDefault(); teardown(); }
        });
        saveBtn.addEventListener('click', commit);
        cancelBtn.addEventListener('click', teardown);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     OTP helper — builds + wires a 6-cell input
  function scorePw(v) {
    if (!v) return 0;
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    return Math.max(1, Math.min(4, s));
  }
  function pwLabel(level) {
    return [t('pw.lv0','—'), t('pw.lv1','弱'), t('pw.lv2','一般'), t('pw.lv3','强'), t('pw.lv4','极强')][level] || '';
  }
  /* ═══════════════════════════════════════════════════════════════
     CHANGE PASSWORD (or set API secondary password)
     ═══════════════════════════════════════════════════════════════ */
  function dlgPasswordChange(mode) {
    /* mode: 'login' | 'api' */
    const isApi = mode === 'api';

    const title = isApi ? t('apipass.dlg.title','设置 <em>API 二级密码</em>') : t('pw.dlg.title','修改 <em>登录密码</em>');
    const sub = isApi ? t('apipass.dlg.sub','保护你的 API 密钥与计费操作 · 不可恢复，请妥善保存') : t('pw.dlg.sub','建议 12 位以上 · 字母+数字+符号混合');
    const icon = isApi ? 'key' : 'lock';

    const curRow = isApi ? '' : `
      <div class="form-row">
        <div class="form-row__head"><label class="form-row__label" for="dlg-cur-pw">${t('pw.cur','当前密码')} <span class="req">*</span></label></div>
        <div class="field-wrap"><input class="field field--mono" type="password" id="dlg-cur-pw" autocomplete="current-password" placeholder="••••••••"><button type="button" class="field-prefix" data-toggle-cur style="border-radius:0 8px 8px 0;border-left:none;border:1px solid var(--border);border-left:none;cursor:pointer">${t('pw.show','显示')}</button></div>
        <span class="form-row__hint" data-cur-hint>${t('pw.cur.hint','请输入你当前的登录密码')}</span>
      </div>
    `;

    const bodyHtml = `
      ${curRow}
      <div class="form-row">
        <div class="form-row__head"><label class="form-row__label" for="dlg-new-pw">${isApi ? t('apipass.new','API 二级密码') : t('pw.new','新密码')} <span class="req">*</span></label></div>
        <div class="field-wrap"><input class="field field--mono" type="password" id="dlg-new-pw" autocomplete="new-password" placeholder="••••••••••"><button type="button" class="field-prefix" data-toggle-new style="border-radius:0 8px 8px 0;border-left:none;border:1px solid var(--border);border-left:none;cursor:pointer">${t('pw.show','显示')}</button></div>
        <div class="strength" data-strength data-level="0"><span class="strength__bar"><i></i></span><span class="strength__bar"><i></i></span><span class="strength__bar"><i></i></span><span class="strength__bar"><i></i></span><span class="strength__label" data-pw-label>—</span></div>
        <span class="form-row__hint">${t('pw.rules','至少 8 字符 · 推荐 12 位混合大小写、数字、符号')}</span>
      </div>
      <div class="form-row">
        <div class="form-row__head"><label class="form-row__label" for="dlg-confirm-pw">${t('pw.confirm','确认新密码')} <span class="req">*</span></label></div>
        <input class="field field--mono" type="password" id="dlg-confirm-pw" autocomplete="new-password" placeholder="••••••••••">
        <span class="form-row__hint" data-confirm-hint>${t('pw.confirm.hint','再次输入以确认无误')}</span>
      </div>
    `;
    const footHtml = `
      <button class="btn btn--ghost btn--sm" type="button" data-modal-close>${t('modal.cancel','取消')}</button>
      <button class="btn btn--sm" type="button" data-primary disabled>${isApi ? t('apipass.set','设置密码') : t('pw.save','保存修改')}</button>
    `;

    mountDialog({
      title, sub, icon, size: 'sm',
      bodyHtml, footHtml,
      onMount: ({root, close}) => {
        const curIn = root.querySelector('#dlg-cur-pw');
        const newIn = root.querySelector('#dlg-new-pw');
        const confIn = root.querySelector('#dlg-confirm-pw');
        const strength = root.querySelector('[data-strength]');
        const pwLbl = root.querySelector('[data-pw-label]');
        const primary = root.querySelector('[data-primary]');
        const confirmHint = root.querySelector('[data-confirm-hint]');

        function toggleEye(inputEl, btn) {
          if (!btn) return;
          btn.addEventListener('click', () => {
            const showing = inputEl.type === 'text';
            inputEl.type = showing ? 'password' : 'text';
            btn.textContent = showing ? t('pw.show','显示') : t('pw.hide','隐藏');
          });
        }
        toggleEye(curIn, root.querySelector('[data-toggle-cur]'));
        toggleEye(newIn, root.querySelector('[data-toggle-new]'));

        function validate() {
          const lv = scorePw(newIn.value);
          strength.dataset.level = String(lv);
          pwLbl.textContent = newIn.value ? pwLabel(lv) : '—';
          const match = !!confIn.value && confIn.value === newIn.value;
          confIn.classList.toggle('field--err', !!confIn.value && !match);
          confirmHint.classList.toggle('form-row__hint--err', !!confIn.value && !match);
          confirmHint.textContent = (!!confIn.value && !match) ? t('pw.err.mismatch','两次输入的密码不一致') : t('pw.confirm.hint','再次输入以确认无误');

          const meetsLen = newIn.value.length >= 8;
          const okBase = meetsLen && match && lv >= 2;
          primary.disabled = isApi ? !okBase : !(curIn.value.length >= 1 && okBase);
        }
        [curIn, newIn, confIn].forEach(el => el && el.addEventListener('input', validate));
        validate();

        primary.addEventListener('click', () => {
          // 真实 API 调用（仅 login 密码）
          if (!isApi && typeof MexionHttp !== 'undefined') {
            primary.disabled = true;
            Promise.reject(new Error(t('toast.pw.unsupported','演示版暂不支持修改密码'))).then(function() {
              var changedEl = document.querySelector('[data-field="password-changed"]');
              if (changedEl) changedEl.textContent = t('pw.justnow','刚刚修改');
              toast(t('toast.pw.changed','登录密码已更新 · 其他会话已退出'));
              close();
            }).catch(function(err) {
              primary.disabled = false;
              toast((err && err.message) || t('toast.pw.failed','密码修改失败'));
            });
            return;
          }
          if (isApi) {
            /* swap API row to "已设置 · 0 分钟前修改" */
            const status = document.querySelector('[data-field="apipass-status"]');
            const pill = document.querySelector('[data-field="apipass-pill"]');
            if (status) { status.textContent = t('apipass.set.bullet','••••••••'); status.style.color = 'var(--ink)'; }
            if (pill) { pill.textContent = t('apipass.set.pill','已设置'); pill.classList.remove('pending'); pill.style.color = 'var(--green-2)'; pill.style.background = 'var(--green-soft)'; }
            const action = document.querySelector('[data-action="set-apipass"] span');
            if (action) action.textContent = t('profile.action.update','修改');
            toast(t('toast.apipass.set','API 二级密码已设置'));
          } else {
            const changedEl = document.querySelector('[data-field="password-changed"]');
            if (changedEl) changedEl.textContent = t('pw.justnow','刚刚修改');
            toast(t('toast.pw.changed','登录密码已更新'));
          }
          close();
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     TIER BENEFITS
     ═══════════════════════════════════════════════════════════════ */
  function dlgTierBenefits() {
    const lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    const u = window.__mexionTierUser || {};
    const levels = window.__mexionTierLevels;
    const lvl = u.level || 0;
    const usd = (q) => (q ? (q / 500000) : 0);
    let bodyHtml, footHtml;

    const tierLive = Array.isArray(levels) && levels.length > 0;
    if (tierLive) {
      // 等级体系已上线：展示真实当前段位权益 + 下一级门槛
      let cur = null, next = null;
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].id <= lvl) cur = levels[i];
        else if (!next) next = levels[i];
      }
      const curName = cur ? cur.name : ((lang === 'zh' ? '等级 ' : 'Lv ') + lvl);
      const benefits = [];
      let gm = {}; try { gm = JSON.parse((cur && cur.group_multipliers) || '{}'); } catch (e) {}
      const gmKeys = Object.keys(gm).filter((k) => gm[k] > 0 && gm[k] !== 1);
      if (gmKeys.length) benefits.push({ k: lang === 'zh' ? '分组优惠' : 'Group discount', v: gmKeys.map((k) => (k === '*' ? (lang === 'zh' ? '全部分组' : 'all') : k) + ' ×' + gm[k]).join(' · ') });
      let conc = {}; try { conc = JSON.parse((cur && cur.concurrency_by_group) || '{}'); } catch (e) {}
      const concKeys = Object.keys(conc).filter((k) => conc[k] > 0);
      if (concKeys.length) benefits.push({ k: lang === 'zh' ? '并发额度' : 'Concurrency', v: concKeys.map((k) => (k === '' ? (lang === 'zh' ? '统一' : 'all') : k) + ': ' + conc[k]).join(' · ') });
      if (cur && (cur.checkin_min > 0 || cur.checkin_max > 0)) benefits.push({ k: lang === 'zh' ? '签到额度' : 'Check-in', v: '$' + usd(cur.checkin_min) + ' ~ $' + usd(cur.checkin_max) });
      if (!benefits.length) benefits.push({ k: lang === 'zh' ? '基础权益' : 'Base', v: lang === 'zh' ? '当前段位享默认分组价 · 升段解锁分组折扣、更高并发与签到额度' : 'Default group price · upgrade unlocks group discount, higher concurrency & check-in' });

      let nextHtml = '';
      if (next) {
        const reqs = [];
        if (next.req_used_token > 0) reqs.push((lang === 'zh' ? '总Token ' : 'Tokens ') + (u.used_token || 0) + '/' + next.req_used_token);
        if (next.req_used_quota > 0) reqs.push((lang === 'zh' ? '消耗 $' : 'Used $') + usd(u.used_quota).toFixed(2) + '/' + usd(next.req_used_quota));
        if (next.req_total_topup > 0) reqs.push((lang === 'zh' ? '充值 $' : 'Topup $') + usd(u.total_topup).toFixed(2) + '/' + usd(next.req_total_topup));
        nextHtml = '<div class="tier-coming__foot"><span>' + (lang === 'zh' ? '升至「' + next.name + '」还需：' : 'To ' + next.name + ': ') + (reqs.length ? reqs.join(' · ') : (lang === 'zh' ? '由管理员评定' : 'set by admin')) + '</span></div>';
      } else {
        nextHtml = '<div class="tier-coming__foot"><span>' + (lang === 'zh' ? '你已是最高段位 🏆' : 'Top tier 🏆') + '</span></div>';
      }
      const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
      bodyHtml = `
        <div class="tier-coming">
          <div class="tier-coming__hero"><div class="tier-coming__hero-bg" aria-hidden="true"></div>
            <div class="tier-coming__hero-inner">
              <span class="tier-coming__chip"><svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"><path d="M5 .8 6.2 3.6 9.2 4l-2.2 2.1.5 3L5 7.8 2.5 9.1l.5-3L.8 4l3-.4L5 .8Z"/></svg><span>${lang === 'zh' ? '你目前 · ' : 'You · '}${esc(curName)}</span></span>
              <div class="tier-coming__h">${esc(curName)}</div>
              <div class="tier-coming__sub">${lang === 'zh' ? '段位越高:分组价更低 · 并发更高 · 签到更多;按消费/充值/用量达标自动晋级,只升不降' : 'Higher tier: lower group price, more concurrency & check-in; auto-upgrade by usage/topup, never demoted'}</div>
            </div>
          </div>
          <ul class="tier-plan">
            ${benefits.map((p, i) => `<li class="tier-plan__row" style="--i:${i}"><span class="tier-plan__dot" aria-hidden="true"></span><div class="tier-plan__txt"><div class="tier-plan__k">${esc(p.k)}</div><div class="tier-plan__v">${esc(p.v)}</div></div></li>`).join('')}
          </ul>
          ${nextHtml}
        </div>`;
      footHtml = `<button class="btn btn--sm" type="button" data-modal-close>${t('modal.close', '关闭')}</button>`;
    } else {
      // 等级体系未配置(无已启用等级) → 占位
      const plans = [
        { k: t('tier.plan.rate', '全局倍率折扣'), v: t('tier.plan.rate.v', '分级阶梯优惠 · 等级越高单价越低') },
        { k: t('tier.plan.rpm', 'RPM / 并发额度'), v: t('tier.plan.rpm.v', '在高峰也能保持低延迟队列') },
        { k: t('tier.plan.gift', '签到 & 节庆福袋'), v: t('tier.plan.gift.v', '额外余额返还 · 节日礼包') },
      ];
      bodyHtml = `
        <div class="tier-coming">
          <div class="tier-coming__hero"><div class="tier-coming__hero-bg" aria-hidden="true"></div>
            <div class="tier-coming__hero-inner">
              <span class="tier-coming__chip"><span>${lang === 'zh' ? '你目前 · 等级 ' : 'You · Lv '}${lvl}</span></span>
              <div class="tier-coming__h">${t('tier.coming.h', '等级体系 <em>筹备中</em>')}</div>
              <div class="tier-coming__sub">${t('tier.coming.sub', '一个真的让人有动力升级、而不是堆叠功能的等级体系。')}</div>
            </div>
          </div>
          <ul class="tier-plan">
            ${plans.map((p, i) => `<li class="tier-plan__row" style="--i:${i}"><span class="tier-plan__dot" aria-hidden="true"></span><div class="tier-plan__txt"><div class="tier-plan__k">${p.k}</div><div class="tier-plan__v">${p.v}</div></div></li>`).join('')}
          </ul>
        </div>`;
      footHtml = `<button class="btn btn--sm" type="button" data-modal-close>${t('modal.close', '关闭')}</button>`;
    }
    const dlg = mountDialog({
      title: t('tier.dlg.title','等级 <em>体系</em>'),
      sub: tierLive ? (lang === 'zh' ? '段位越高省更多 · 消费/充值达标自动晋级(保级不降)' : 'Higher tier saves more · auto-upgrade by usage/topup (never demoted)') : t('tier.dlg.sub','后续开启 · 早期活跃将一并计入'),
      icon: 'tier',
      size: '',
      bodyHtml, footHtml,
      onMount: ({ root }) => {
        const btn = root.querySelector('[data-notify-tier]');
        if (btn) btn.addEventListener('click', () => {
          btn.disabled = true;
          btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.6 6.2L4.8 8.4l4.6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> ${t('tier.coming.notified','已记下 · 上线时通知')}`;
          btn.classList.add('is-confirmed');
          toast(t('toast.tier.notify','已记下 · 等级体系上线时第一时间通知你'));
        });
      }
    });
    return dlg;
  }

  /* ═══════════════════════════════════════════════════════════════
     BINDINGS manage / unlink / connect（真实 OAuth 绑定 + 自助解绑）
     ═══════════════════════════════════════════════════════════════ */
  function updateBindingsMeta() {
    const total = document.querySelectorAll('.bind').length;
    const linked = document.querySelectorAll('.bind:not([data-linked="false"])').length
                 - document.querySelectorAll('.bind .bind__act--connect').length;
    document.querySelectorAll('.panel__head .meta').forEach(m => {
      if (/\d+\s*\/\s*\d+/.test(m.textContent || '')) m.textContent = linked + ' / ' + total + (t('bindings.linked.suffix',' 已绑定'));
    });
  }

  function dlgBindingManage(row) {
    const name = row.dataset.bindName || '';
    const key = row.dataset.bind || '';
    const handle = row.dataset.bindHandle || '';
    const days = row.dataset.bindDays || '—';
    const primary = row.dataset.bindPrimary === 'true';
    const logoHTML = (row.querySelector('.bind__logo') || {}).outerHTML || '';

    const bodyHtml = `
      <div class="bind-card">
        ${logoHTML.replace('bind__logo','bind__logo bind-card__logo').replace('width="16"','width="22"').replace('height="16"','height="22"')}
        <div class="bind-card__info">
          <div class="bind-card__name">${name}${primary ? ` <span class="chip chip--green" style="font-size:10px;padding:1px 6px">${t('profile.bindings.primary','主登录')}</span>` : ''}</div>
          <div class="bind-card__handle">${handle || '—'}</div>
          <div class="bind-card__meta">${t('binding.linked.for','已绑定')} <b style="color:var(--ink-2)">${days}</b> ${t('binding.days','天')} · ${t('binding.last','已连接')}</div>
        </div>
        <span class="bind-card__status">${t('binding.connected','CONNECTED')}</span>
      </div>
      <div class="dlg-list dlg-list--info" style="margin-top:14px">
        <li>${primary ? t('binding.role.primary','该账号是当前主登录，解绑前需要先切换主登录方式。') : t('binding.role.aux','该账号仅用于附加登录或支付，可以随时解绑。')}</li>
        <li>${t('binding.scope','已授权范围：基础资料 · 邮箱 · 不会读取/发送任何代码或仓库内容')}</li>
        <li>${t('binding.security','若发现异常活动，先解绑再前往安全中心查看登录记录')}</li>
      </div>
    `;
    const unlinkLabel = primary ? t('binding.cant-unlink','切换主登录方式后解绑') : t('binding.unlink-btn','解绑该账号');
    const footHtml = `
      <button class="danger-link" type="button" data-do-unlink ${primary ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>${unlinkLabel}</button>
      <button class="btn btn--ghost btn--sm" type="button" data-modal-close>${t('modal.close','关闭')}</button>
    `;
    mountDialog({
      title: `${t('binding.dlg.title','管理 <em>已绑定</em>账号')} · ${name}`,
      sub: t('binding.dlg.sub','查看授权范围 · 解绑后该账号将无法用于登录或支付'),
      icon: 'link', size: 'sm',
      bodyHtml, footHtml,
      onMount: ({root, close}) => {
        const ub = root.querySelector('[data-do-unlink]');
        if (ub && !primary) ub.addEventListener('click', () => {
          close();
          dlgBindingUnlink(row);
        });
      }
    });
  }
  function dlgBindingUnlink(row) {
    const name = row.dataset.bindName || '';
    const provider = row.dataset.bind || '';
    if (provider === 'email' || !provider) {
      toast(t('binding.unlink.primary','主登录方式不可解绑'));
      return;
    }
    confirmDialog({
      title: `${t('binding.unlink.title','解绑')} <em>${name}</em>`,
      sub: t('binding.unlink.sub','解绑后该账号无法用于登录或支付，可随时重新连接'),
      icon: 'link',
      message: `${t('binding.unlink.msg','你确认要解绑')} <b>${name}</b> ${t('binding.unlink.msg2','吗？该账号将立即从你的账户中移除。')}`,
      primaryLabel: t('binding.unlink-btn','解绑该账号'),
      danger: true,
      onConfirm: () => {
        row.classList.add('is-changing');
        // 真实解绑：调用后端自助解绑端点（带「解绑后须仍有登录方式」守卫，失败把后端提示弹回）
        Promise.reject(new Error(t('binding.unlink.unsupported','演示版暂不支持解绑第三方账号'))).then(function () {
          const btn = row.querySelector('.bind__act');
          const sub = row.querySelector('.bind__sub');
          if (btn) {
            btn.className = 'bind__act bind__act--connect';
            btn.textContent = t('profile.bindings.connect','连接');
            btn.setAttribute('data-action', 'binding-connect');
          }
          if (sub) sub.textContent = t('profile.bindings.unbound','未绑定');
          row.dataset.linked = 'false';
          row.classList.remove('is-changing');
          updateBindingsMeta();
          rewireActions();
          toast(`${name} ${t('toast.binding.unlinked','已解绑')}`);
        }).catch(function (err) {
          row.classList.remove('is-changing');
          toast((err && err.message) ? err.message : t('binding.unlink.failed','解绑失败，请稍后重试'));
        });
      }
    });
  }
  function dlgBindingConnect(row) {
    const name = row.dataset.bindName || '';
    confirmDialog({
      title: `${t('binding.connect.title','连接')} <em>${name}</em>`,
      sub: t('binding.connect.sub','即将跳转到第三方授权 · 仅请求基础资料与邮箱'),
      icon: 'link',
      message: `${t('binding.connect.msg1','点击「确认连接」后将打开 <b>')} ${name} ${t('binding.connect.msg2','</b> 的授权页面。授权完成后会自动返回 Mexion 并绑定到当前账户。')}<br><br><span style="font-family:var(--f-mono);font-size:11px;color:var(--mute-2);text-transform:uppercase;letter-spacing:.08em">${t('binding.scope.req','请求范围')}</span><br><span style="font-size:12px;color:var(--ink-2)">${t('binding.scope.list','基础资料 · 邮箱 · 仅用于身份识别')}</span>`,
      primaryLabel: t('binding.connect.btn','确认连接'),
      onConfirm: () => {
        const provider = row.dataset.bind || '';
        if (provider !== 'github' && provider !== 'google') {
          toast(t('binding.connect.unsupported','该登录方式暂不支持自助绑定'));
          return;
        }
        toast(t('binding.connect.unsupported','该登录方式暂不支持自助绑定'));
        return;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     Action dispatcher — wires every [data-action] button
     ═══════════════════════════════════════════════════════════════ */
  /* Use event delegation so it survives data-action swaps (manage ↔ connect) */
  let actionDelegationWired = false;
  function rewireActions() {
    if (actionDelegationWired) return;
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const a = btn.dataset.action;
      if (!a) return;
      if (a === 'tier-benefits')        { e.preventDefault(); dlgTierBenefits(); }
      else if (a === 'change-password') { e.preventDefault(); dlgPasswordChange('login'); }
      else if (a === 'binding-manage')  { e.preventDefault(); dlgBindingManage(btn.closest('.bind')); }
      else if (a === 'binding-unlink')  { e.preventDefault(); dlgBindingUnlink(btn.closest('.bind')); }
      else if (a === 'binding-connect') { e.preventDefault(); dlgBindingConnect(btn.closest('.bind')); }
      /* edit-name 内联编辑 + signout(user-menu) 由各自模块/core.js 单独接线 */
    });
    actionDelegationWired = true;
  }

  function boot() {
    document.querySelectorAll('.select-wrap').forEach(initSelect);
    initModals();
    initCopy();
    initCodes();
    initCheckIn();
    initInlineEdit();
    initNotificationSettings();
    rewireActions();
    hideUnsupported();
    window.addEventListener('mexion:user-updated', function (event) {
      var user = event && event.detail ? event.detail.user : null;
      if (!user) return;
      applyProfileBalance(user, true);
      syncNotificationSettings(user);
    });
    loadProfile();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

