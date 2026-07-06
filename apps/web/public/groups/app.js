(function(){
  'use strict';

  var groups = [];
  var editing = null;
  var localOrder = Object.create(null);

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
  function rateText(group) {
    return (Number(group.rateMultiplier || 100) / 100).toFixed(2) + 'x';
  }
  function orderValue(group, index) {
    return Number(localOrder[group.id] || index + 1);
  }
  function sortedGroups() {
    return groups.map(function(group, index) {
      return { group: group, originalIndex: index, order: orderValue(group, index) };
    }).sort(function(a, b) {
      if (a.order !== b.order) return a.order - b.order;
      if (a.group.isDefault !== b.group.isDefault) return a.group.isDefault ? -1 : 1;
      return a.group.id - b.group.id;
    });
  }
  function render() {
    var stats = $('groupStats');
    var list = $('groupList');
    if (!stats || !list) return;
    var channelTotal = groups.reduce(function(sum, group) { return sum + Number(group.channelCount || 0); }, 0);
    var keyTotal = groups.reduce(function(sum, group) { return sum + Number(group.keyCount || 0); }, 0);
    stats.textContent = '共 ' + groups.length + ' 个分组，' + channelTotal + ' 个渠道，' + keyTotal + ' 把 API 密钥。';
    if (!groups.length) {
      list.innerHTML = '<div class="groups-empty">暂无分组</div>';
      return;
    }
    list.innerHTML = sortedGroups().map(function(entry, displayIndex) {
      var group = entry.group;
      return '<div class="groups-row" data-id="' + group.id + '">' +
        '<span><input class="groups-order" data-order-id="' + group.id + '" type="number" min="1" value="' + esc(orderValue(group, displayIndex)) + '" aria-label="排序 ' + esc(group.name) + '"></span>' +
        '<span class="groups-name">' + esc(group.name) + '</span>' +
        '<span class="groups-muted">' + esc(group.description || '—') + '</span>' +
        '<span class="groups-mono">' + rateText(group) + '</span>' +
        '<span>' + (group.isDefault ? '<span class="groups-pill">默认</span>' : '—') + '</span>' +
        '<span class="groups-mono">' + Number(group.channelCount || 0).toLocaleString() + '</span>' +
        '<span class="groups-mono">' + Number(group.keyCount || 0).toLocaleString() + '</span>' +
        '<span class="groups-actions"><button class="groups-action" data-act="edit" type="button">编辑</button><button class="groups-action" data-act="delete" type="button" ' + (group.isDefault ? 'disabled' : '') + '>删除</button></span>' +
      '</div>';
    }).join('');
  }
  function load() {
    return api('/admin/groups').then(function(data) {
      groups = data.groups || [];
      groups.forEach(function(group, index) {
        if (!localOrder[group.id]) localOrder[group.id] = index + 1;
      });
      render();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function open(group) {
    editing = group || null;
    $('groupModalTitle').textContent = group ? '编辑分组' : '新建分组';
    $('groupName').value = group ? group.name : '';
    $('groupDesc').value = group ? (group.description || '') : '';
    $('groupRate').value = ((group ? Number(group.rateMultiplier || 100) : 100) / 100).toFixed(2);
    $('groupDefault').checked = !!(group && group.isDefault);
    $('groupModal').hidden = false;
  }
  function close() {
    $('groupModal').hidden = true;
  }
  function save() {
    var body = {
      name: $('groupName').value.trim(),
      description: $('groupDesc').value.trim(),
      rateMultiplier: Math.round(Number($('groupRate').value || 1) * 100),
      isDefault: $('groupDefault').checked
    };
    api('/admin/groups' + (editing ? '/' + editing.id : ''), { method: editing ? 'PATCH' : 'POST', body: body }).then(function() {
      close();
      toast('已保存', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function findGroupFromEvent(event) {
    var row = event.target.closest('[data-id]');
    if (!row) return null;
    return groups.find(function(group) { return String(group.id) === row.dataset.id; }) || null;
  }

  document.addEventListener('DOMContentLoaded', function() {
    load();
    $('newGroupBtn').onclick = function() { open(null); };
    $('groupClose').onclick = close;
    $('groupCancel').onclick = close;
    $('groupSave').onclick = save;

    $('groupList').addEventListener('input', function(event) {
      var input = event.target.closest('[data-order-id]');
      if (!input) return;
      localOrder[input.dataset.orderId] = Number(input.value || 1);
      render();
      var refocus = document.querySelector('[data-order-id="' + input.dataset.orderId + '"]');
      if (refocus) refocus.focus();
    });
    $('groupList').addEventListener('click', function(event) {
      var button = event.target.closest('[data-act]');
      if (!button) return;
      var group = findGroupFromEvent(event);
      if (!group) return;
      if (button.dataset.act === 'edit') {
        open(group);
        return;
      }
      if (!confirm('确认删除分组？')) return;
      api('/admin/groups/' + group.id, { method: 'DELETE' }).then(function() {
        toast('已删除', 'success');
        return load();
      }).catch(function(error) { toast(error.message, 'error'); });
    });
  });
})();
