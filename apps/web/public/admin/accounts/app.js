(function(){
  'use strict';

  var aliases = [];
  var channels = [];

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch];
    });
  }
  function api(path, options) {
    options = options || {};
    var method = options.method || 'GET';
    if (window.MexionHttp) {
      if (method === 'POST') return MexionHttp.post(path, options.body || {});
      if (method === 'PATCH' || method === 'PUT') return MexionHttp.put(path, options.body || {});
      if (method === 'DELETE') return MexionHttp.delete(path);
      return MexionHttp.get(path);
    }
    return fetch('/api/v1' + path, {
      method: method,
      credentials: 'same-origin',
      headers: options.body ? { 'Content-Type': 'application/json' } : {},
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function(res) {
      return res.json().then(function(json) {
        if (!res.ok || json.ok === false) throw new Error((json.error && json.error.message) || json.message || ('HTTP ' + res.status));
        return json.data || json;
      });
    });
  }
  function toast(message, tone) {
    if (window.MexionToast) MexionToast.show(message, { tone: tone || 'default' });
  }
  function normalizeGroup(group) {
    group = group || {};
    return { id: group.id, name: group.name || ('group_' + group.id), provider: group.platform || '' };
  }
  function normalizeAccount(account) {
    account = account || {};
    var groupIds = Array.isArray(account.group_ids) ? account.group_ids : [];
    return {
      id: account.id,
      sourceModel: account.name || ('account_' + account.id),
      targetModel: (account.platform || 'openai') + ' · ' + (account.type || 'apikey'),
      channelId: account.group_id != null ? account.group_id : (groupIds.length ? groupIds[0] : null),
      enabled: account.status !== 'inactive' && account.status !== 'disabled',
      status: account.status || 'active',
      raw: account
    };
  }
  function accountPayload() {
    var name = $('aliasSource').value.trim();
    var key = $('aliasTarget').value.trim();
    var groupId = $('aliasChannel').value ? Number($('aliasChannel').value) : null;
    return {
      name: name,
      platform: 'openai',
      type: 'apikey',
      credentials: key ? { api_key: key } : {},
      group_ids: groupId ? [groupId] : [],
      status: 'active'
    };
  }
  function channelName(id) {
    var channel = channels.find(function(item) { return item.id === id; });
    return channel ? channel.name : '未分组';
  }
  function renderChannelOptions() {
    var select = $('aliasChannel');
    if (!select) return;
    select.innerHTML = '<option value="">不绑定分组</option>' + channels.map(function(channel) {
      return '<option value="' + channel.id + '">' + esc(channel.name) + (channel.provider ? ' · ' + esc(channel.provider) : '') + '</option>';
    }).join('');
  }
  function render() {
    var stats = $('aliasStats');
    var list = $('aliasList');
    if (stats) stats.textContent = '共 ' + aliases.length + ' 个账号，' + aliases.filter(function(item) { return item.enabled; }).length + ' 个启用。';
    renderChannelOptions();
    if (!list) return;
    if (!aliases.length) {
      list.innerHTML = '<div class="aliases-empty">暂无账号</div>';
      return;
    }
    list.innerHTML = aliases.map(function(alias) {
      return '<div class="aliases-row" data-id="' + alias.id + '">' +
        '<span class="aliases-mono">' + esc(alias.sourceModel) + '</span>' +
        '<span class="aliases-mono">' + esc(alias.targetModel) + '</span>' +
        '<span class="aliases-mono">' + esc(channelName(alias.channelId)) + '</span>' +
        '<span><span class="pill ' + (alias.enabled ? 'pill--ok' : 'pill--warn') + '">' + (alias.enabled ? '启用' : '已禁用') + '</span></span>' +
        '<span class="aliases-actions"><button class="aliases-action" data-act="toggle" type="button">' + (alias.enabled ? '禁用' : '启用') + '</button><button class="aliases-action aliases-action--danger" data-act="delete" type="button">删除</button></span>' +
      '</div>';
    }).join('');
  }
  function load() {
    return Promise.all([api('/admin/accounts?page=1&page_size=50'), api('/admin/groups?page=1&page_size=100')]).then(function(results) {
      aliases = ((results[0] && (results[0].items || results[0].accounts || results[0].aliases)) || (Array.isArray(results[0]) ? results[0] : [])).map(normalizeAccount);
      channels = ((results[1] && (results[1].items || results[1].groups)) || (Array.isArray(results[1]) ? results[1] : [])).map(normalizeGroup);
      render();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function open() {
    $('aliasSource').value = '';
    $('aliasTarget').value = '';
    renderChannelOptions();
    $('aliasChannel').value = '';
    $('aliasModal').hidden = false;
  }
  function close() {
    $('aliasModal').hidden = true;
  }
  function createAlias() {
    var body = accountPayload();
    if (!body.name) { toast('请输入账号名称', 'error'); return; }
    api('/admin/accounts', { method: 'POST', body: body }).then(function() {
      close();
      toast('已创建', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function aliasByEvent(event) {
    var row = event.target.closest('[data-id]');
    if (!row) return null;
    return aliases.find(function(alias) { return String(alias.id) === row.dataset.id; }) || null;
  }

  document.addEventListener('DOMContentLoaded', function() {
    load();
    $('newAliasBtn').onclick = open;
    $('aliasClose').onclick = close;
    $('aliasCancel').onclick = close;
    $('aliasSave').onclick = createAlias;
    $('aliasList').addEventListener('click', function(event) {
      var button = event.target.closest('[data-act]');
      if (!button) return;
      var alias = aliasByEvent(event);
      if (!alias) return;
      if (button.dataset.act === 'toggle') {
        api('/admin/accounts/' + alias.id, { method: 'PUT', body: { status: alias.enabled ? 'inactive' : 'active' } }).then(function() {
          toast('已更新', 'success');
          return load();
        }).catch(function(error) { toast(error.message, 'error'); });
        return;
      }
      if (!confirm('确认删除账号？')) return;
      api('/admin/accounts/' + alias.id, { method: 'DELETE' }).then(function() {
        toast('已删除', 'success');
        return load();
      }).catch(function(error) { toast(error.message, 'error'); });
    });
  });
})();
