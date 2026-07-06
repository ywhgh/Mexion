(function(){
  'use strict';

  var users = [];
  var auditLogs = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function api(path, options) {
    options = options || {};
    if (window.MexionHttp) {
      if ((options.method || 'GET') === 'PATCH') return MexionHttp.patch(path, options.body || {});
      if ((options.method || 'GET') === 'POST') return MexionHttp.post(path, options.body || {});
      if ((options.method || 'GET') === 'DELETE') return MexionHttp.delete(path);
      return MexionHttp.get(path);
    }
    return fetch('/api' + path, {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: options.body ? { 'Content-Type': 'application/json' } : {},
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function(r) {
      return r.json().then(function(j) {
        if (!r.ok || j.ok === false) throw new Error((j.error && j.error.message) || j.message || ('HTTP ' + r.status));
        return j.data || j;
      });
    });
  }
  function toast(message, tone) {
    if (window.MexionToast) MexionToast.show(message, { tone: tone || 'default' });
  }
  function date(value) {
    var d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', { hour12: false });
  }
  function renderUsers() {
    var stats = $('userStats');
    var list = $('userList');
    if (!stats || !list) return;
    stats.textContent = '共 ' + users.length + ' 个用户，' + users.filter(function(u) { return u.status === 'active'; }).length + ' 个 active。';
    list.innerHTML = users.length ? users.map(function(u) {
      return '<div class="users-row" data-id="' + u.id + '">' +
        '<span class="users-mono">' + u.id + '</span>' +
        '<span class="users-mono">' + esc(u.username) + '</span>' +
        '<span class="users-muted">' + esc(u.email || '—') + '</span>' +
        '<span>' + (u.role === 'admin' ? '<span class="pill pill--warn">admin</span>' : '<span class="users-mono">user</span>') + '</span>' +
        '<span><span class="pill ' + (u.status === 'active' ? 'pill--ok' : 'pill--err') + '">' + esc(u.status) + '</span></span>' +
        '<span class="users-mono">' + Number(u.balance || 0).toLocaleString() + '</span>' +
        '<span class="users-mono">' + Number(u.used_quota || u.quotaUsed || 0).toLocaleString() + '</span>' +
        '<span class="users-muted">' + date(u.createdAt) + '</span>' +
        '<span class="users-actions"><button class="users-action" data-act="status">' + (u.status === 'active' ? '封禁' : '解封') + '</button><button class="users-action" data-act="balance">调余额</button></span>' +
      '</div>';
    }).join('') : '<div class="users-empty">暂无用户</div>';
  }
  function actionLabel(action) {
    var labels = {
      'channel.delete': '删除渠道',
      'group.delete': '删除分组',
      'alias.delete': '删除别名',
      'user.update': '更新用户'
    };
    return labels[action] || action;
  }
  function renderAuditLogs() {
    var list = $('auditLogList');
    if (!list) return;
    list.innerHTML = auditLogs.length ? auditLogs.map(function(log) {
      return '<div class="audit-row">' +
        '<span class="audit-time">' + esc(date(log.ts)) + '</span>' +
        '<span class="audit-action">' + esc(actionLabel(log.action)) + '</span>' +
        '<span class="audit-target">' + esc(log.targetType) + ' #' + esc(log.targetId) + '</span>' +
        '<span class="audit-ip">' + esc(log.ip || '—') + '</span>' +
      '</div>';
    }).join('') : '<div class="users-empty">暂无操作日志</div>';
  }
  function loadUsers() {
    return api('/admin/users').then(function(data) {
      users = data.users || [];
      renderUsers();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function loadAuditLogs() {
    return api('/admin/audit-logs?limit=50').then(function(data) {
      auditLogs = data.logs || [];
      renderAuditLogs();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function refresh() {
    loadUsers();
    loadAuditLogs();
  }

  document.addEventListener('DOMContentLoaded', function() {
    refresh();
    var userList = $('userList');
    if (!userList) return;
    userList.onclick = function(e) {
      var button = e.target.closest('[data-act]');
      if (!button) return;
      var id = Number(button.closest('[data-id]').dataset.id);
      var user = users.find(function(item) { return item.id === id; });
      if (!user) return;
      if (button.dataset.act === 'status') {
        api('/admin/users/' + id, { method: 'PATCH', body: { status: user.status === 'active' ? 'banned' : 'active' } }).then(function() {
          toast('已更新', 'success');
          refresh();
        }).catch(function(error) { toast(error.message, 'error'); });
        return;
      }
      var value = prompt('输入新的余额', String(user.balance || 0));
      if (value == null) return;
      api('/admin/users/' + id, { method: 'PATCH', body: { balance: Number(value) } }).then(function() {
        toast('已更新', 'success');
        refresh();
      }).catch(function(error) { toast(error.message, 'error'); });
    };
  });
})();
