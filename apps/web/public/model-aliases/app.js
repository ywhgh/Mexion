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
      if (method === 'PATCH') return MexionHttp.patch(path, options.body || {});
      if (method === 'DELETE') return MexionHttp.delete(path);
      return MexionHttp.get(path);
    }
    return fetch('/api' + path, {
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
  function channelName(id) {
    var channel = channels.find(function(item) { return item.id === id; });
    return channel ? channel.name : '全局';
  }
  function renderChannelOptions() {
    var select = $('aliasChannel');
    if (!select) return;
    select.innerHTML = '<option value="">全局生效</option>' + channels.map(function(channel) {
      return '<option value="' + channel.id + '">' + esc(channel.name) + ' · ' + esc(channel.provider) + '</option>';
    }).join('');
  }
  function render() {
    var stats = $('aliasStats');
    var list = $('aliasList');
    if (stats) stats.textContent = '共 ' + aliases.length + ' 条模型别名，' + aliases.filter(function(item) { return item.enabled; }).length + ' 条启用。';
    renderChannelOptions();
    if (!list) return;
    if (!aliases.length) {
      list.innerHTML = '<div class="aliases-empty">暂无模型别名</div>';
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
    return Promise.all([api('/admin/model-aliases'), api('/admin/channels')]).then(function(results) {
      aliases = results[0].aliases || [];
      channels = results[1].channels || [];
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
    var sourceModel = $('aliasSource').value.trim();
    var targetModel = $('aliasTarget').value.trim();
    if (sourceModel && targetModel && sourceModel === targetModel) {
      toast('源模型与目标模型不能相同', 'error');
      return;
    }
    var body = {
      sourceModel: sourceModel,
      targetModel: targetModel,
      channelId: $('aliasChannel').value ? Number($('aliasChannel').value) : null
    };
    api('/admin/model-aliases', { method: 'POST', body: body }).then(function() {
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
        api('/admin/model-aliases/' + alias.id, { method: 'PATCH', body: { enabled: !alias.enabled } }).then(function() {
          toast('已更新', 'success');
          return load();
        }).catch(function(error) { toast(error.message, 'error'); });
        return;
      }
      if (!confirm('确认删除模型别名？')) return;
      api('/admin/model-aliases/' + alias.id, { method: 'DELETE' }).then(function() {
        toast('已删除', 'success');
        return load();
      }).catch(function(error) { toast(error.message, 'error'); });
    });
  });
})();
