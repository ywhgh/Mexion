(function(){
  'use strict';

  var channels = [];
  var groups = [];
  var selected = null;
  var filter = 'all';
  var viewMode = 'list';
  var checkedIds = new Set();
  var testResults = Object.create(null);
  var monitors = [];

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
  function groupName(id) {
    var group = groups.find(function(item) { return item.id === id; });
    return group ? group.name : '未绑定';
  }
  function parseModelList(value) {
    return String(value || '').split(/[\n,]+/).map(function(item) { return item.trim(); }).filter(Boolean);
  }

  function uniqueList(list) {
    var seen = Object.create(null);
    return (Array.isArray(list) ? list : []).map(function(item) {
      return String(item == null ? '' : item).trim();
    }).filter(function(item) {
      if (!item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
  function normalizeModelValue(item) {
    if (typeof item === 'string') return item;
    if (!item || typeof item !== 'object') return '';
    return item.id || item.name || item.model || item.model_name || item.value || '';
  }
  function normalizeModelArray(value) {
    if (Array.isArray(value)) return uniqueList(value.map(normalizeModelValue));
    if (typeof value === 'string') return parseModelList(value);
    return [];
  }
  function readConfig(value) {
    if (!value) return {};
    if (typeof value === 'string') {
      try { return JSON.parse(value) || {}; } catch (e) { return {}; }
    }
    return typeof value === 'object' ? value : {};
  }
  function pricingEntries(channel) {
    if (!channel) return [];
    if (Array.isArray(channel.model_pricing)) return channel.model_pricing;
    if (Array.isArray(channel.modelPricing)) return channel.modelPricing;
    return [];
  }
  function modelsFromPricing(pricing) {
    var out = [];
    (Array.isArray(pricing) ? pricing : []).forEach(function(item) {
      if (!item) return;
      if (Array.isArray(item.models)) out = out.concat(item.models);
      else out.push(item.model || item.model_name || item.name || '');
    });
    return uniqueList(out);
  }
  function normalizeProvider(value) {
    if (value === 1 || value === '1' || value === 'openai') return 'openai';
    if (value === 3 || value === '3' || value === 'azure') return 'azure';
    if (value === 36 || value === '36' || value === 'anthropic') return 'anthropic';
    if (value === 40 || value === '40' || value === 'gemini' || value === 'google') return 'gemini';
    if (value === 'custom' || value === 0 || value === '0') return 'custom';
    return value ? String(value) : 'custom';
  }
  function providerPlatform(provider) {
    provider = normalizeProvider(provider);
    if (provider === 'custom' || provider === 'azure') return 'openai';
    return provider;
  }
  function providerToType(provider) {
    return { custom: 0, openai: 1, azure: 3, anthropic: 36, gemini: 40 }[provider] || 0;
  }
  function typeToProvider(value) {
    return normalizeProvider(value);
  }
  function normalizeGroup(group) {
    group = group || {};
    return { id: group.id, name: group.name || ('group_' + group.id) };
  }
  function normalizeChannel(channel) {
    channel = channel || {};
    var feature = readConfig(channel.features_config || channel.featuresConfig);
    var groupIds = Array.isArray(channel.group_ids) ? channel.group_ids : [];
    var pricing = pricingEntries(channel);
    var directModels = normalizeModelArray(channel.models || channel.modelList || feature.models);
    var models = directModels.length ? directModels : modelsFromPricing(pricing);
    var firstPricing = pricing[0] || {};
    var provider = normalizeProvider(feature.provider || channel.provider || channel.platform || firstPricing.platform || channel.type);
    return {
      id: channel.id,
      name: channel.name || ('channel_' + channel.id),
      provider: provider,
      baseUrl: channel.base_url || channel.baseUrl || feature.base_url || feature.baseUrl || feature.endpoint || channel.endpoint || channel.description || '—',
      groupId: channel.group_id != null ? channel.group_id : (groupIds.length ? groupIds[0] : null),
      modelList: models,
      status: channel.status === 'inactive' ? 'disabled' : (channel.status || 'active'),
      priority: channel.priority || channel.sort_order || 0,
      latencyMs: channel.latency_ms || channel.latencyMs || feature.latency_ms || null,
      lastCheckedAt: channel.last_checked_at || channel.updated_at || channel.created_at || '',
      errorCount: channel.error_count || 0,
      requestsLast24h: channel.requests_last_24h || 0,
      raw: channel
    };
  }
  function normalizeMonitor(monitor) {
    monitor = monitor || {};
    var extraModels = Array.isArray(monitor.extra_models) ? monitor.extra_models : (Array.isArray(monitor.extraModels) ? monitor.extraModels : []);
    var latency = monitor.primary_latency_ms != null ? monitor.primary_latency_ms : (monitor.primaryLatencyMs != null ? monitor.primaryLatencyMs : monitor.latency_ms);
    return {
      id: monitor.id,
      name: monitor.name || '',
      provider: normalizeProvider(monitor.provider || monitor.platform),
      endpoint: monitor.endpoint || monitor.base_url || monitor.baseUrl || '',
      groupName: monitor.group_name || monitor.groupName || '',
      primaryModel: monitor.primary_model || monitor.primaryModel || '',
      extraModels: extraModels,
      status: monitor.primary_status || monitor.status || '',
      latencyMs: latency,
      lastCheckedAt: monitor.last_checked_at || monitor.lastCheckedAt || monitor.updated_at || '',
      raw: monitor
    };
  }
  function monitorStatusToChannel(status) {
    status = String(status || '').toLowerCase();
    if (status === 'ok' || status === 'success' || status === 'healthy' || status === 'up') return 'active';
    if (status === 'error' || status === 'failed' || status === 'down' || status === 'timeout') return 'error';
    return '';
  }
  function monitorFor(channel) {
    if (!channel) return null;
    var raw = channel.raw || {};
    var explicitId = raw.monitor_id || raw.monitorId || raw.channel_monitor_id || raw.channelMonitorId;
    if (explicitId != null) {
      var explicit = monitors.find(function(monitor) { return String(monitor.id) === String(explicitId); });
      if (explicit) return explicit;
    }
    var name = String(channel.name || '').toLowerCase();
    var base = String(channel.baseUrl || '').replace(/\/+$/, '').toLowerCase();
    var models = Array.isArray(channel.modelList) ? channel.modelList.map(function(model) { return String(model).toLowerCase(); }) : [];
    return monitors.find(function(monitor) {
      var monitorName = String(monitor.name || '').toLowerCase();
      var endpoint = String(monitor.endpoint || '').replace(/\/+$/, '').toLowerCase();
      var primary = String(monitor.primaryModel || '').toLowerCase();
      if (name && monitorName && name === monitorName) return true;
      if (base && endpoint && (base === endpoint || base.indexOf(endpoint) === 0 || endpoint.indexOf(base) === 0)) return true;
      if (channel.provider === monitor.provider && primary && models.indexOf(primary) >= 0) return true;
      return false;
    }) || null;
  }
  function mergeMonitorState() {
    channels.forEach(function(channel) {
      var monitor = monitorFor(channel);
      if (!monitor) return;
      channel.monitorId = monitor.id;
      if (monitor.latencyMs != null) channel.latencyMs = monitor.latencyMs;
      if (monitor.lastCheckedAt) channel.lastCheckedAt = monitor.lastCheckedAt;
      var status = monitorStatusToChannel(monitor.status);
      if (status) channel.status = status;
    });
  }
  function channelPayloadFromForm(prefix) {
    var groupEl = prefix === 'edit' ? $('editChannelGroup') : $('channelGroup');
    var providerEl = prefix === 'edit' ? $('editChannelProvider') : $('channelProvider');
    var baseEl = prefix === 'edit' ? $('editChannelBaseUrl') : $('channelBaseUrl');
    var modelsEl = prefix === 'edit' ? $('editChannelModels') : $('channelModels');
    var nameEl = prefix === 'edit' ? $('editChannelName') : $('channelName');
    var priorityEl = prefix === 'edit' ? $('editChannelPriority') : $('channelPriority');
    var secretEl = prefix === 'edit' ? $('editChannelSecret') : $('channelSecret');
    var groupValue = groupEl ? groupEl.value : '';
    var providerValue = providerEl ? providerEl.value : 'custom';
    var baseUrl = baseEl ? baseEl.value.trim() : '';
    var models = parseModelList(modelsEl ? modelsEl.value : '');
    var platform = providerPlatform(providerValue);
    var priority = Number(priorityEl && priorityEl.value || 0);
    var body = {
      name: nameEl ? nameEl.value.trim() : '',
      description: baseUrl,
      status: 'active',
      group_ids: groupValue ? [Number(groupValue)] : [],
      restrict_models: models.length > 0,
      billing_model_source: 'upstream',
      features_config: { provider: providerValue, platform: platform, base_url: baseUrl, models: models, priority: priority },
      type: providerToType(providerValue),
      base_url: baseUrl,
      models: models,
      group_id: groupValue ? Number(groupValue) : null,
      priority: priority
    };
    if (models.length) {
      body.model_pricing = [{
        platform: platform,
        models: models,
        billing_mode: 'token'
      }];
    }
    if (secretEl && secretEl.value.trim()) {
      body.key = secretEl.value.trim();
      body.features_config.api_key_masked = secretEl.value.trim().slice(0, 4) + '***';
    }
    return body;
  }
  function modelText(value) {
    return Array.isArray(value) ? value.join(', ') : '';
  }
  function statusClass(status) {
    if (status === 'active') return 'is-active';
    if (status === 'error') return 'is-error';
    return 'is-disabled';
  }
  function pillClass(status) {
    if (status === 'active') return 'pill--ok';
    if (status === 'error') return 'pill--err';
    return 'pill--warn';
  }
  function statusText(status) {
    if (status === 'active') return '启用';
    if (status === 'error') return '错误';
    return '停用';
  }
  function formatDate(value) {
    if (!value) return '—';
    var date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('zh-CN', { hour12: false });
  }
  function relativeTime(value) {
    if (!value) return '未测速';
    var date = new Date(value);
    if (isNaN(date.getTime())) return '未测速';
    var diff = Date.now() - date.getTime();
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
    return formatDate(value);
  }
  function latencyHtml(value) {
    if (value == null || value === '') return '<span class="channels-muted">未测速</span>';
    var n = Number(value);
    var color = n < 500 ? 'var(--green)' : (n <= 2000 ? 'var(--amber)' : 'var(--verm)');
    return '<span class="channels-mono" style="color:' + color + '">' + n + 'ms</span>';
  }
  function errorCountHtml(value) {
    var n = Number(value || 0);
    if (!n) return '<span class="channels-muted">—</span>';
    return '<span class="channels-mono" style="color:var(--verm)">' + n + ' 次错误</span>';
  }
  function testResultHtml(channel) {
    if (!channel) return '';
    var result = testResults[channel.id];
    if (!result) return '<div class="channel-test-result is-idle">连通测试尚未执行</div>';
    if (result.loading) return '<div class="channel-test-result">测试中…</div>';
    if (result.ok) return '<div class="channel-test-result is-ok">✓ HTTP ' + esc(result.status) + ' · ' + esc(result.durationMs) + 'ms</div>';
    return '<div class="channel-test-result is-err">✗ 连接失败: ' + esc(result.message || ('HTTP ' + (result.status || 0))) + '</div>';
  }
  function visibleChannels() {
    var search = (($('channelSearch') && $('channelSearch').value) || '').toLowerCase();
    return channels.filter(function(channel) {
      if (filter !== 'all' && channel.provider !== filter) return false;
      return !search || [channel.name, channel.provider, channel.baseUrl, groupName(channel.groupId), channel.status].join(' ').toLowerCase().indexOf(search) >= 0;
    });
  }
  function syncCheckedIds() {
    var available = new Set(channels.map(function(channel) { return channel.id; }));
    Array.from(checkedIds).forEach(function(id) { if (!available.has(id)) checkedIds.delete(id); });
  }
  function checkedArray() {
    return Array.from(checkedIds);
  }
  function renderHealth() {
    var bar = $('channelHealthBar');
    if (!bar) return;
    var active = channels.filter(function(c) { return c.status === 'active'; }).length;
    var error = channels.filter(function(c) { return c.status === 'error'; }).length;
    var off = channels.filter(function(c) { return c.status === 'disabled'; }).length;
    bar.innerHTML = '<span class="pill pill--ok">' + active + ' 启用</span>' +
      (error ? '<span class="pill pill--err">' + error + ' 错误</span>' : '') +
      (off ? '<span class="pill pill--warn">' + off + ' 停用</span>' : '');
  }
  function renderBatch() {
    var batch = $('channelBatch');
    var count = $('batchCount');
    var total = checkedIds.size;
    if (batch) batch.hidden = total === 0;
    if (count) count.textContent = '已选 ' + total;
  }
  function renderViewTabs() {
    var tabs = $('channelViewTabs');
    if (!tabs) return;
    tabs.querySelectorAll('[data-view]').forEach(function(button) {
      button.setAttribute('aria-pressed', button.dataset.view === viewMode ? 'true' : 'false');
    });
  }
  function renderFilter() {
    var box = $('providerFilter');
    if (!box) return;
    var providers = ['all', 'openai', 'anthropic', 'gemini', 'azure', 'custom'];
    box.innerHTML = providers.map(function(provider) {
      return '<button class="channels-chip" type="button" data-provider="' + provider + '" aria-pressed="' + (filter === provider ? 'true' : 'false') + '">' + (provider === 'all' ? '全部' : provider) + '</button>';
    }).join('');
  }
  function channelRow(channel) {
    return '<div class="channels-row ' + (selected && selected.id === channel.id ? 'is-active' : '') + '" data-id="' + channel.id + '">' +
      '<input type="checkbox" class="channels-row-check" data-id="' + channel.id + '" aria-label="选择 ' + esc(channel.name) + '" ' + (checkedIds.has(channel.id) ? 'checked' : '') + '>' +
      '<span class="channels-row__dot ' + statusClass(channel.status) + '"></span>' +
      '<span class="channels-row__main"><span class="channels-row__name">' + esc(channel.name) + '</span><span class="channels-row__url">' + esc(channel.baseUrl) + '</span></span>' +
      '<span class="channels-mono">' + esc(channel.provider) + '</span>' +
      '<span class="channels-muted">' + esc(groupName(channel.groupId)) + '</span>' +
      '<span>' + latencyHtml(channel.latencyMs) + '</span>' +
      '<span class="channels-status ' + statusClass(channel.status) + '">' + esc(channel.status) + '</span>' +
      '<button class="channels-menu" type="button" aria-label="选择">›</button>' +
    '</div>';
  }
  function renderGroupedList(list, items) {
    if (!items.length) {
      list.innerHTML = '<div class="channels-empty">暂无匹配渠道</div>';
      return;
    }
    var buckets = [];
    groups.forEach(function(group) {
      var rows = items.filter(function(channel) { return channel.groupId === group.id; });
      if (rows.length) buckets.push({ id: group.id, name: group.name, rows: rows });
    });
    var unbound = items.filter(function(channel) { return channel.groupId == null || !groups.some(function(group) { return group.id === channel.groupId; }); });
    if (unbound.length) buckets.push({ id: 'none', name: '未绑定分组', rows: unbound });
    list.innerHTML = buckets.map(function(bucket) {
      var latencies = bucket.rows.map(function(channel) { return Number(channel.latencyMs); }).filter(function(value) { return Number.isFinite(value) && value > 0; });
      var avg = latencies.length ? Math.round(latencies.reduce(function(sum, value) { return sum + value; }, 0) / latencies.length) + 'ms' : '—';
      return '<div class="channels-group-section" data-group="' + esc(bucket.id) + '">' +
        '<div class="channels-group-header"><span class="channels-group-name">' + esc(bucket.name) + '</span><span class="pill pill--ok">' + bucket.rows.length + ' 个渠道</span><span class="channels-mono">' + avg + ' 均值</span></div>' +
        '<div class="channels-group-rows">' + bucket.rows.map(channelRow).join('') + '</div>' +
      '</div>';
    }).join('');
  }
  function renderList() {
    var list = $('channelList');
    var count = $('channelCount');
    var stats = $('channelStats');
    var items = visibleChannels();
    if (count) count.textContent = items.length + '/' + channels.length;
    if (stats) stats.textContent = '共 ' + channels.length + ' 个渠道，' + channels.filter(function(c) { return c.status === 'active'; }).length + ' 个启用。';
    renderHealth();
    renderBatch();
    if (!list) return;
    if (viewMode === 'group') {
      renderGroupedList(list, items);
      return;
    }
    if (!items.length) {
      list.innerHTML = '<div class="channels-empty">暂无匹配渠道</div>';
      return;
    }
    list.innerHTML = items.map(channelRow).join('');
  }
  function renderDetail() {
    var box = $('channelDetail');
    if (!box) return;
    if (!selected) {
      box.innerHTML = '<div class="channel-empty"><h3>选择渠道</h3><p>点击左侧渠道查看详情与配置</p></div>';
      return;
    }
    var models = Array.isArray(selected.modelList) && selected.modelList.length ? selected.modelList : [];
    var modelHtml = models.length ? models.map(function(model) {
      return '<span class="kd-model-chip">' + esc(model) + '</span>';
    }).join('') : '<span class="kd-model-chip">全部模型</span>';
    box.innerHTML =
      '<div class="kd-head"><h3 class="kd-title">' + esc(selected.name) + '</h3><span class="pill ' + pillClass(selected.status) + '">' + statusText(selected.status) + '</span></div>' +
      '<div class="kd-grid">' +
        '<div><span>Provider</span><b>' + esc(selected.provider) + '</b></div>' +
        '<div><span>Base URL</span><b>' + esc(selected.baseUrl) + '</b></div>' +
        '<div><span>分组</span><b>' + esc(groupName(selected.groupId)) + '</b></div>' +
        '<div><span>优先级</span><b>' + esc(selected.priority) + '</b></div>' +
        '<div><span>延迟</span><b>' + latencyHtml(selected.latencyMs) + '</b></div>' +
        '<div><span>上次测速</span><b title="' + esc(formatDate(selected.lastCheckedAt)) + '">' + esc(relativeTime(selected.lastCheckedAt)) + '</b></div>' +
        '<div><span>错误次数</span><b>' + errorCountHtml(selected.errorCount) + '</b></div>' +
        '<div><span>近 24h 调用</span><b>' + Number(selected.requestsLast24h || 0).toLocaleString() + '</b></div>' +
      '</div>' +
      '<div class="kd-models"><div class="kd-models-label">支持模型</div><div class="kd-models-list">' + modelHtml + '</div></div>' +
      testResultHtml(selected) +
      '<div class="channel-actions">' +
        '<button class="btn-secondary" data-act="edit" type="button">编辑</button>' +
        '<button class="btn-secondary" data-act="probe" type="button">测速</button>' +
        '<button class="btn-secondary" data-act="test" type="button">连通测试</button>' +
        '<button class="btn-secondary" data-act="toggle" type="button">' + (selected.status === 'active' ? '停用' : '启用') + '</button>' +
        '<button class="btn-secondary channels-btn-danger" data-act="delete" type="button">删除</button>' +
      '</div>';
  }
  function fillGroups(selectId, currentValue) {
    var select = $(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">不绑定分组</option>' + groups.map(function(group) {
      return '<option value="' + group.id + '">' + esc(group.name) + '</option>';
    }).join('');
    select.value = currentValue == null ? '' : String(currentValue);
  }
  function render() {
    syncCheckedIds();
    renderViewTabs();
    renderFilter();
    renderList();
    renderDetail();
    fillGroups('channelGroup', null);
    fillGroups('editChannelGroup', selected && selected.groupId);
  }
  function load() {
    return Promise.all([
      api('/admin/channels?page=1&page_size=100'),
      api('/admin/groups?page=1&page_size=100'),
      api('/admin/channel-monitors?page=1&page_size=100').catch(function() { return { items: [] }; })
    ]).then(function(results) {
      channels = ((results[0] && (results[0].items || results[0].channels)) || (Array.isArray(results[0]) ? results[0] : [])).map(normalizeChannel);
      groups = ((results[1] && (results[1].items || results[1].groups)) || (Array.isArray(results[1]) ? results[1] : [])).map(normalizeGroup);
      monitors = ((results[2] && (results[2].items || results[2].monitors)) || (Array.isArray(results[2]) ? results[2] : [])).map(normalizeMonitor);
      mergeMonitorState();
      if (selected) selected = channels.find(function(channel) { return channel.id === selected.id; }) || null;
      render();
    }).catch(function(error) { toast(error.message, 'error'); });
  }

  function setFetchHint(text, tone) {
    var el = $('fetchModelsHint');
    if (!el) return;
    el.textContent = text;
    el.setAttribute('data-tone', tone || '');
  }
  function fetchModels() {
    var button = $('fetchModelsBtn');
    var baseUrl = $('channelBaseUrl').value.trim();
    var apiKey = $('channelSecret').value;
    var provider = $('channelProvider').value;
    if (!baseUrl || !apiKey) {
      setFetchHint('请先填写 Base URL 和 API Key', 'error');
      toast('请先填写 Base URL 和 API Key', 'error');
      return;
    }
    if (button) { button.disabled = true; button.textContent = '探测中…'; }
    setFetchHint('正在请求上游模型列表…', '');
    api('/admin/accounts/models/sync-upstream-preview', { method: 'POST', body: { platform: providerPlatform(provider), type: 'apikey', base_url: baseUrl, api_key: apiKey } }).then(function(result) {
      var models = normalizeModelArray((result && (result.models || result.items)) || result || []);
      if (!models.length) {
        setFetchHint('上游返回成功，但没有发现模型', 'error');
        toast('未发现模型', 'error');
        return;
      }
      $('channelModels').value = models.join(', ');
      setFetchHint('已探测 ' + models.length + ' 个模型，来源 ' + (result.endpoint || baseUrl), 'ok');
      toast('已填入 ' + models.length + ' 个模型', 'success');
    }).catch(function(error) {
      setFetchHint(error.message || '探测失败', 'error');
      toast(error.message || '探测失败', 'error');
    }).finally(function() {
      if (button) { button.disabled = false; button.textContent = '从上游探测模型'; }
    });
  }

  function resetCreateForm() {
    ['channelName', 'channelBaseUrl', 'channelSecret', 'channelModels'].forEach(function(id) { var el = $(id); if (el) el.value = ''; });
    if ($('channelProvider')) $('channelProvider').value = 'openai';
    if ($('channelPriority')) $('channelPriority').value = '0';
    fillGroups('channelGroup', null);
    setFetchHint('调用 Base URL 的模型列表接口并自动填入', '');
  }
  function openCreateModal() { resetCreateForm(); var modal = $('createChannelModal'); if (modal) modal.hidden = false; }
  function closeCreateModal() { var modal = $('createChannelModal'); if (modal) modal.hidden = true; }
  function createChannel() {
    var body = channelPayloadFromForm('channel');
    api('/admin/channels', { method: 'POST', body: body }).then(function() {
      closeCreateModal();
      toast('渠道已创建', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }

  function openEditModal(channel) {
    if (!channel) return;
    fillGroups('editChannelGroup', channel.groupId);
    $('editChannelName').value = channel.name || '';
    $('editChannelProvider').value = channel.provider || 'openai';
    $('editChannelBaseUrl').value = channel.baseUrl || '';
    $('editChannelSecret').value = '';
    $('editChannelModels').value = modelText(channel.modelList);
    $('editChannelPriority').value = String(channel.priority || 0);
    var modal = $('editChannelModal');
    if (modal) modal.hidden = false;
  }
  function closeEditModal() { var modal = $('editChannelModal'); if (modal) modal.hidden = true; }
  function saveEdit() {
    if (!selected) return;
    var body = channelPayloadFromForm('edit');
    api('/admin/channels/' + selected.id, { method: 'PUT', body: body }).then(function() {
      closeEditModal();
      toast('渠道已更新', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function selectChannel(id) {
    selected = channels.find(function(channel) { return String(channel.id) === String(id); }) || null;
    render();
  }
  function runSerial(ids, task) {
    return ids.reduce(function(promise, id) { return promise.then(function() { return task(id); }); }, Promise.resolve());
  }
  function runMonitor(channel) {
    var monitor = monitorFor(channel);
    if (!monitor) {
      return Promise.reject(new Error('未找到同名渠道监控项，无法直接测速'));
    }
    return api('/admin/channel-monitors/' + monitor.id + '/run', { method: 'POST' }).then(function(result) {
      var rows = (result && (result.results || result.items)) || (Array.isArray(result) ? result : []);
      var first = rows[0] || {};
      var ok = rows.length ? rows.some(function(row) {
        var status = String(row.status || '').toLowerCase();
        return status === 'ok' || status === 'success' || status === 'healthy' || status === 'up';
      }) : true;
      var latency = first.latency_ms != null ? first.latency_ms : (first.latencyMs != null ? first.latencyMs : first.ping_latency_ms);
      return {
        ok: ok,
        status: first.status || (ok ? 'ok' : 'error'),
        durationMs: latency != null ? latency : 0,
        message: first.message || '',
        raw: result
      };
    });
  }
  function batchUpdate(status) {
    var ids = checkedArray();
    if (!ids.length) return;
    runSerial(ids, function(id) {
      return api('/admin/channels/' + id, { method: 'PUT', body: { status: status } });
    }).then(function() {
      checkedIds.clear();
      toast('批量更新完成', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function batchDelete() {
    var ids = checkedArray();
    if (!ids.length) return;
    if (!confirm('确认删除选中的 ' + ids.length + ' 个渠道？')) return;
    runSerial(ids, function(id) {
      return api('/admin/channels/' + id, { method: 'DELETE' });
    }).then(function() {
      checkedIds.clear();
      if (selected && ids.indexOf(selected.id) >= 0) selected = null;
      toast('批量删除完成', 'success');
      return load();
    }).catch(function(error) { toast(error.message, 'error'); });
  }
  function bind(id, event, handler) {
    var el = $(id);
    if (el) el.addEventListener(event, handler);
  }

  document.addEventListener('DOMContentLoaded', function() {
    load();
    bind('createChannelBtn', 'click', openCreateModal);
    bind('fetchModelsBtn', 'click', fetchModels);
    bind('createChannelClose', 'click', closeCreateModal);
    bind('createChannelCancel', 'click', closeCreateModal);
    bind('createChannelConfirm', 'click', createChannel);
    bind('editChannelClose', 'click', closeEditModal);
    bind('editChannelCancel', 'click', closeEditModal);
    bind('editChannelConfirm', 'click', saveEdit);
    bind('channelSearch', 'input', renderList);

    var providerFilter = $('providerFilter');
    if (providerFilter) providerFilter.addEventListener('click', function(event) {
      var button = event.target.closest('[data-provider]');
      if (!button) return;
      filter = button.dataset.provider;
      render();
    });

    var batch = $('channelBatch');
    if (batch) batch.addEventListener('click', function(event) {
      var button = event.target.closest('[data-batch]');
      if (!button) return;
      if (button.dataset.batch === 'enable') batchUpdate('active');
      if (button.dataset.batch === 'disable') batchUpdate('disabled');
      if (button.dataset.batch === 'delete') batchDelete();
    });

    var viewTabs = $('channelViewTabs');
    if (viewTabs) viewTabs.addEventListener('click', function(event) {
      var button = event.target.closest('[data-view]');
      if (!button) return;
      viewMode = button.dataset.view === 'group' ? 'group' : 'list';
      render();
    });

    var list = $('channelList');
    if (list) {
      list.addEventListener('change', function(event) {
        var checkbox = event.target.closest('.channels-row-check');
        if (!checkbox) return;
        var id = Number(checkbox.dataset.id);
        if (checkbox.checked) checkedIds.add(id);
        else checkedIds.delete(id);
        renderBatch();
      });
      list.addEventListener('click', function(event) {
        if (event.target.closest('.channels-row-check')) return;
        var row = event.target.closest('[data-id]');
        if (!row) return;
        selectChannel(row.dataset.id);
      });
      list.addEventListener('dblclick', function(event) {
        if (event.target.closest('.channels-row-check')) return;
        var row = event.target.closest('[data-id]');
        if (!row) return;
        selected = channels.find(function(channel) { return String(channel.id) === String(row.dataset.id); }) || null;
        render();
        openEditModal(selected);
      });
    }

    var detail = $('channelDetail');
    if (detail) detail.addEventListener('click', function(event) {
      var button = event.target.closest('[data-act]');
      if (!button || !selected) return;
      var act = button.dataset.act;
      if (act === 'edit') {
        openEditModal(selected);
        return;
      }
      if (act === 'delete') {
        if (!confirm('确认删除渠道？')) return;
        api('/admin/channels/' + selected.id, { method: 'DELETE' }).then(function() {
          selected = null;
          toast('已删除', 'success');
          return load();
        }).catch(function(error) { toast(error.message, 'error'); });
        return;
      }
      if (act === 'toggle') {
        api('/admin/channels/' + selected.id, { method: 'PUT', body: { status: selected.status === 'active' ? 'disabled' : 'active' } }).then(function() {
          toast('已更新', 'success');
          return load();
        }).catch(function(error) { toast(error.message, 'error'); });
        return;
      }
      if (act === 'probe') {
        button.disabled = true;
        button.textContent = '测速中…';
        runMonitor(selected).then(function(result) {
          testResults[selected.id] = result;
          toast(result.ok ? ('测速完成 ' + result.durationMs + 'ms') : (result.message || '测速未通过'), result.ok ? 'success' : 'error');
          return load();
        }).catch(function(error) { toast(error.message || '测速失败', 'error'); })
          .finally(function() { button.disabled = false; button.textContent = '测速'; });
        return;
      }
      if (act === 'test') {
        testResults[selected.id] = { loading: true };
        renderDetail();
        runMonitor(selected).then(function(result) {
          testResults[selected.id] = result;
          renderDetail();
        }).catch(function(error) {
          testResults[selected.id] = { ok: false, status: 0, durationMs: 0, message: error.message || '连接失败' };
          renderDetail();
        });
      }
    });
  });
})();
