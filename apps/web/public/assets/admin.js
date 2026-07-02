(function () {
  'use strict';

  var API_BASE = '/api';
  var state = {
    admin: null,
    stats: null,
    channels: [],
    groups: [],
    aliases: []
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtInt(value) {
    var n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  }

  function fmtDate(value) {
    if (!value) return '未记录';
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('zh-CN', { hour12: false });
  }

  function api(path, options) {
    options = options || {};
    var init = {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: {}
    };
    if (options.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }
    return fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var json = null;
        if (text) {
          try { json = JSON.parse(text); } catch (err) { json = null; }
        }
        if (!res.ok || (json && json.ok === false) || (json && json.success === false)) {
          var message = (json && json.error && json.error.message) || (json && json.message) || ('HTTP ' + res.status);
          var error = new Error(message);
          error.status = res.status;
          throw error;
        }
        return json && json.data !== undefined ? json.data : json;
      });
    });
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
      if (button.dataset.previousHtml == null) button.dataset.previousHtml = button.innerHTML;
      button.disabled = true;
      button.textContent = label || '处理中';
    } else {
      button.disabled = false;
      if (button.dataset.previousHtml != null) button.innerHTML = button.dataset.previousHtml;
      delete button.dataset.previousHtml;
    }
  }

  function closestFromEvent(event, selector) {
    var target = event.target;
    if (!target) return null;
    if (target.nodeType !== 1) target = target.parentElement;
    return target && target.closest ? target.closest(selector) : null;
  }

  function setStatus(el, text, tone) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-ok', tone === 'ok');
    el.classList.toggle('is-warn', tone === 'warn');
  }

  function showBanner(text, tone) {
    var el = $('adminBanner');
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    el.classList.toggle('is-error', tone === 'error');
    el.classList.toggle('is-success', tone === 'success');
    clearTimeout(showBanner._timer);
    showBanner._timer = setTimeout(function () {
      el.hidden = true;
    }, 3200);
  }

  function findGroupName(id) {
    if (id == null) return 'unbound';
    var group = state.groups.find(function (item) { return item.id === id; });
    return group ? group.name : ('#' + id);
  }

  function findChannelName(id) {
    if (id == null) return 'auto';
    var channel = state.channels.find(function (item) { return item.id === id; });
    return channel ? channel.name : ('#' + id);
  }

  function statusBadge(status) {
    var s = status || 'active';
    var cls = s === 'active' ? 'admin-badge-active' : (s === 'error' ? 'admin-badge-error' : 'admin-badge-disabled');
    return '<span class="admin-badge ' + cls + '">' + esc(s) + '</span>';
  }

  function parseList(text) {
    var arr = String(text || '')
      .split(/[\n,]+/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
    return arr.length ? arr : null;
  }

  function renderSelects() {
    var channelGroup = $('channelGroup');
    if (channelGroup) {
      var current = channelGroup.value;
      channelGroup.innerHTML = '<option value="">不绑定分组</option>' + state.groups.map(function (group) {
        return '<option value="' + esc(group.id) + '">' + esc(group.name) + (group.isDefault ? ' · default' : '') + '</option>';
      }).join('');
      channelGroup.value = current;
    }

    var aliasChannel = $('aliasChannel');
    if (aliasChannel) {
      var selected = aliasChannel.value;
      aliasChannel.innerHTML = '<option value="">自动选择渠道</option>' + state.channels.map(function (channel) {
        return '<option value="' + esc(channel.id) + '">' + esc(channel.name) + ' · ' + esc(channel.provider) + '</option>';
      }).join('');
      aliasChannel.value = selected;
    }
  }

  function renderMetrics() {
    var totals = (state.stats && state.stats.totals) || {};
    var active = state.channels.filter(function (channel) { return channel.status === 'active'; }).length;
    var metricMap = {
      requests: fmtInt(totals.requests),
      channels: fmtInt(state.channels.length),
      activeChannels: fmtInt(active),
      latency: totals.avgLatencyMs ? fmtInt(totals.avgLatencyMs) + 'ms' : '0ms',
      groups: fmtInt(state.groups.length),
      aliases: fmtInt(state.aliases.length)
    };
    Object.keys(metricMap).forEach(function (key) {
      var el = document.querySelector('[data-metric="' + key + '"]');
      if (el) el.textContent = metricMap[key];
    });
  }

  function renderChannels() {
    var list = $('channelList');
    var count = $('channelCount');
    if (count) count.textContent = String(state.channels.length);
    if (!list) return;
    if (!state.channels.length) {
      list.innerHTML = '<div class="admin-empty">暂无渠道。先创建一个渠道，网关才能选择上游。</div>';
      return;
    }
    list.innerHTML = state.channels.map(function (channel) {
      var models = channel.modelList && channel.modelList.length ? channel.modelList.join(', ') : 'all models';
      var latency = channel.latencyMs == null ? 'latency n/a' : (channel.latencyMs + 'ms');
      var nextStatus = channel.status === 'active' ? 'disabled' : 'active';
      var toggleLabel = channel.status === 'active' ? '停用' : '启用';
      return [
        '<article class="admin-row" data-channel-id="' + esc(channel.id) + '">',
          '<div class="admin-row-main">',
            '<p class="admin-row-title"><strong>' + esc(channel.name) + '</strong>' + statusBadge(channel.status) + '</p>',
            '<p class="admin-row-meta">',
              '<span>#' + esc(channel.id) + '</span>',
              '<span>' + esc(channel.provider) + '</span>',
              '<span>priority ' + esc(channel.priority) + '</span>',
              '<span>group ' + esc(findGroupName(channel.groupId)) + '</span>',
              '<span>' + esc(latency) + '</span>',
              '<span>errors ' + esc(channel.errorCount) + '</span>',
            '</p>',
            '<p class="admin-row-sub"><span>' + esc(channel.baseUrl) + '</span><span>' + esc(models) + '</span><span>checked ' + esc(fmtDate(channel.lastCheckedAt)) + '</span></p>',
          '</div>',
          '<div class="admin-row-actions">',
            '<button class="admin-action" type="button" data-channel-action="status" data-status="' + esc(nextStatus) + '">' + toggleLabel + '</button>',
            '<button class="admin-action" type="button" data-channel-action="status" data-status="error">标记错误</button>',
            '<button class="admin-action admin-action-danger" type="button" data-channel-action="delete">删除</button>',
          '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderGroups() {
    var list = $('groupList');
    var count = $('groupCount');
    if (count) count.textContent = String(state.groups.length);
    if (!list) return;
    if (!state.groups.length) {
      list.innerHTML = '<div class="admin-empty">暂无分组。未绑定渠道仍可工作。</div>';
      return;
    }
    list.innerHTML = state.groups.map(function (group) {
      var badge = group.isDefault ? '<span class="admin-badge admin-badge-active">default</span>' : '';
      return [
        '<article class="admin-row" data-group-id="' + esc(group.id) + '">',
          '<div class="admin-row-main">',
            '<p class="admin-row-title"><strong>' + esc(group.name) + '</strong>' + badge + '</p>',
            '<p class="admin-row-meta"><span>#' + esc(group.id) + '</span><span>rate ' + esc(group.rateMultiplier) + '</span><span>created ' + esc(fmtDate(group.createdAt)) + '</span></p>',
            '<p class="admin-row-sub"><span>' + esc(group.description || 'no description') + '</span></p>',
          '</div>',
          '<div class="admin-row-actions">',
            '<button class="admin-action admin-action-danger" type="button" data-group-action="delete" ' + (group.isDefault ? 'disabled' : '') + '>删除</button>',
          '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderAliases() {
    var list = $('aliasList');
    var count = $('aliasCount');
    if (count) count.textContent = String(state.aliases.length);
    if (!list) return;
    if (!state.aliases.length) {
      list.innerHTML = '<div class="admin-empty">暂无模型别名。请求会直接使用原模型名选择渠道。</div>';
      return;
    }
    list.innerHTML = state.aliases.map(function (alias) {
      var enabled = alias.enabled ? '<span class="admin-badge admin-badge-active">enabled</span>' : '<span class="admin-badge admin-badge-disabled">disabled</span>';
      return [
        '<article class="admin-row" data-alias-id="' + esc(alias.id) + '">',
          '<div class="admin-row-main">',
            '<p class="admin-row-title"><strong>' + esc(alias.sourceModel) + ' → ' + esc(alias.targetModel) + '</strong>' + enabled + '</p>',
            '<p class="admin-row-meta"><span>#' + esc(alias.id) + '</span><span>channel ' + esc(findChannelName(alias.channelId)) + '</span><span>created ' + esc(fmtDate(alias.createdAt)) + '</span></p>',
          '</div>',
          '<div class="admin-row-actions">',
            '<button class="admin-action admin-action-danger" type="button" data-alias-action="delete">删除</button>',
          '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderAll() {
    renderSelects();
    renderMetrics();
    renderChannels();
    renderGroups();
    renderAliases();
  }

  function loadConsoleData(showSuccess) {
    return Promise.all([
      api('/stats/overview').catch(function () { return { stats: null }; }),
      api('/admin/channels'),
      api('/admin/groups'),
      api('/admin/model-aliases')
    ]).then(function (results) {
      state.stats = results[0] && results[0].stats ? results[0].stats : null;
      state.channels = (results[1] && results[1].channels) || [];
      state.groups = (results[2] && results[2].groups) || [];
      state.aliases = (results[3] && results[3].aliases) || [];
      renderAll();
      if (showSuccess) showBanner('已刷新管理台数据。', 'success');
    });
  }

  function requireAdminSession() {
    return api('/auth/me').then(function (data) {
      if (!data || !data.admin) {
        window.location.replace('/admin-login/');
        return Promise.reject(new Error('redirect'));
      }
      state.admin = data.admin;
      var pill = $('adminUserPill');
      if (pill) pill.textContent = data.admin.username;
      return data.admin;
    }).catch(function (err) {
      if (err && err.message === 'redirect') throw err;
      window.location.replace('/admin-login/');
      throw err;
    });
  }

  function bindConsoleEvents() {
    var refresh = $('adminRefresh');
    if (refresh) {
      refresh.addEventListener('click', function () {
        setBusy(refresh, true, '刷新中');
        loadConsoleData(true).catch(function (err) {
          showBanner(err.message || '刷新失败。', 'error');
        }).finally(function () {
          setBusy(refresh, false);
        });
      });
    }

    var signOut = $('adminSignOut');
    if (signOut) {
      signOut.addEventListener('click', function () {
        setBusy(signOut, true, '退出中');
        api('/auth/sign-out', { method: 'POST', body: {} }).finally(function () {
          window.location.replace('/admin-login/');
        });
      });
    }

    var channelForm = $('channelForm');
    if (channelForm) {
      channelForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!channelForm.reportValidity()) return;
        var button = channelForm.querySelector('button[type="submit"]');
        var groupValue = $('channelGroup').value;
        var payload = {
          name: $('channelName').value.trim(),
          provider: $('channelProvider').value,
          baseUrl: $('channelBaseUrl').value.trim(),
          secretValue: $('channelSecret').value,
          modelList: parseList($('channelModels').value),
          groupId: groupValue ? Number(groupValue) : null,
          priority: Number($('channelPriority').value || 0)
        };
        setBusy(button, true, '创建中');
        api('/admin/channels', { method: 'POST', body: payload }).then(function () {
          channelForm.reset();
          $('channelPriority').value = '0';
          showBanner('渠道已创建。', 'success');
          return loadConsoleData(false);
        }).catch(function (err) {
          showBanner(err.message || '创建渠道失败。', 'error');
        }).finally(function () {
          setBusy(button, false);
        });
      });
    }

    var groupForm = $('groupForm');
    if (groupForm) {
      groupForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!groupForm.reportValidity()) return;
        var button = groupForm.querySelector('button[type="submit"]');
        var payload = {
          name: $('groupName').value.trim(),
          description: $('groupDescription').value.trim(),
          rateMultiplier: Number($('groupRate').value || 100)
        };
        setBusy(button, true, '创建中');
        api('/admin/groups', { method: 'POST', body: payload }).then(function () {
          groupForm.reset();
          $('groupRate').value = '100';
          showBanner('分组已创建。', 'success');
          return loadConsoleData(false);
        }).catch(function (err) {
          showBanner(err.message || '创建分组失败。', 'error');
        }).finally(function () {
          setBusy(button, false);
        });
      });
    }

    var aliasForm = $('aliasForm');
    if (aliasForm) {
      aliasForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!aliasForm.reportValidity()) return;
        var button = aliasForm.querySelector('button[type="submit"]');
        var channelValue = $('aliasChannel').value;
        var payload = {
          sourceModel: $('aliasSource').value.trim(),
          targetModel: $('aliasTarget').value.trim(),
          channelId: channelValue ? Number(channelValue) : null
        };
        setBusy(button, true, '创建中');
        api('/admin/model-aliases', { method: 'POST', body: payload }).then(function () {
          aliasForm.reset();
          showBanner('模型别名已创建。', 'success');
          return loadConsoleData(false);
        }).catch(function (err) {
          showBanner(err.message || '创建模型别名失败。', 'error');
        }).finally(function () {
          setBusy(button, false);
        });
      });
    }

    var channelList = $('channelList');
    if (channelList) {
      channelList.addEventListener('click', function (event) {
        var btn = closestFromEvent(event, '[data-channel-action]');
        if (!btn) return;
        var row = btn.closest('[data-channel-id]');
        var id = row && row.getAttribute('data-channel-id');
        var action = btn.getAttribute('data-channel-action');
        if (!id) return;
        if (action === 'delete') {
          if (!window.confirm('确认删除这个渠道？')) return;
          setBusy(btn, true, '删除中');
          api('/admin/channels/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
            showBanner('渠道已删除。', 'success');
            return loadConsoleData(false);
          }).catch(function (err) {
            showBanner(err.message || '删除渠道失败。', 'error');
          }).finally(function () {
            setBusy(btn, false);
          });
          return;
        }
        if (action === 'status') {
          var status = btn.getAttribute('data-status');
          setBusy(btn, true, '更新中');
          api('/admin/channels/' + encodeURIComponent(id), { method: 'PATCH', body: { status: status } }).then(function () {
            showBanner('渠道状态已更新。', 'success');
            return loadConsoleData(false);
          }).catch(function (err) {
            showBanner(err.message || '更新渠道失败。', 'error');
          }).finally(function () {
            setBusy(btn, false);
          });
        }
      });
    }

    var groupList = $('groupList');
    if (groupList) {
      groupList.addEventListener('click', function (event) {
        var btn = closestFromEvent(event, '[data-group-action="delete"]');
        if (!btn || btn.disabled) return;
        var row = btn.closest('[data-group-id]');
        var id = row && row.getAttribute('data-group-id');
        if (!id || !window.confirm('确认删除这个分组？相关渠道会解除绑定。')) return;
        setBusy(btn, true, '删除中');
        api('/admin/groups/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
          showBanner('分组已删除。', 'success');
          return loadConsoleData(false);
        }).catch(function (err) {
          showBanner(err.message || '删除分组失败。', 'error');
        }).finally(function () {
          setBusy(btn, false);
        });
      });
    }

    var aliasList = $('aliasList');
    if (aliasList) {
      aliasList.addEventListener('click', function (event) {
        var btn = closestFromEvent(event, '[data-alias-action="delete"]');
        if (!btn) return;
        var row = btn.closest('[data-alias-id]');
        var id = row && row.getAttribute('data-alias-id');
        if (!id || !window.confirm('确认删除这个模型别名？')) return;
        setBusy(btn, true, '删除中');
        api('/admin/model-aliases/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
          showBanner('模型别名已删除。', 'success');
          return loadConsoleData(false);
        }).catch(function (err) {
          showBanner(err.message || '删除模型别名失败。', 'error');
        }).finally(function () {
          setBusy(btn, false);
        });
      });
    }
  }

  function initConsole() {
    bindConsoleEvents();
    requireAdminSession().then(function () {
      return loadConsoleData(false);
    }).catch(function (err) {
      if (err && err.message !== 'redirect') showBanner(err.message || '管理台加载失败。', 'error');
    });
  }

  function initLogin() {
    var form = $('adminLoginForm');
    var stateEl = $('adminLoginState');
    var errorEl = $('adminLoginError');
    var submit = $('adminLoginSubmit');
    var submitText = $('adminLoginSubmitText');
    var title = $('adminLoginTitle');
    var lead = $('adminLoginLead');
    var mode = 'sign-in';

    function setError(message) {
      if (!errorEl) return;
      if (!message) {
        errorEl.hidden = true;
        errorEl.textContent = '';
        return;
      }
      errorEl.hidden = false;
      errorEl.textContent = message;
    }

    var toggle = $('adminPasswordToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var input = $('adminPassword');
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.textContent = show ? '隐藏' : '显示';
        input.focus();
      });
    }

    api('/auth/me').then(function (data) {
      if (data && data.admin) {
        setStatus(stateEl, '已登录管理员账户，正在进入管理台。', 'ok');
        window.location.replace('/admin/');
        return;
      }
      if (data && data.bootstrapped === false) {
        mode = 'bootstrap';
        if (title) title.textContent = '初始化管理员';
        if (lead) lead.textContent = '当前实例还没有管理员。创建首个管理员后会自动进入管理台。';
        if (submitText) submitText.textContent = '创建并进入';
        setStatus(stateEl, '未初始化。请设置首个管理员账号和密码。', 'warn');
        return;
      }
      setStatus(stateEl, '实例已初始化，请使用管理员账号登录。', 'ok');
    }).catch(function () {
      setStatus(stateEl, '无法读取实例状态，仍可尝试登录。', 'warn');
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        setError('');
        if (!form.reportValidity()) return;
        var payload = {
          username: $('adminUsername').value.trim(),
          password: $('adminPassword').value
        };
        setBusy(submit, true, mode === 'bootstrap' ? '创建中' : '登录中');
        api('/auth/' + mode, { method: 'POST', body: payload }).then(function () {
          window.location.replace('/admin/');
        }).catch(function (err) {
          var msg = mode === 'bootstrap'
            ? (err.message || '初始化失败。')
            : '账号或密码错误。管理员账号不走 /sign-in/，请在本页登录。';
          setError(msg);
        }).finally(function () {
          setBusy(submit, false);
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-admin-page');
    if (page === 'login') initLogin();
    if (page === 'console') initConsole();
  });
})();
