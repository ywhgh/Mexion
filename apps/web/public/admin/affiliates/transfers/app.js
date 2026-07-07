/* Generic sub2api admin resource page. Generated per page to avoid adding a new global JS. */
(function(){
  'use strict';
  var cfg = window.MexionResourceConfig || {};
  var state = { rows: [], filtered: [], selected: null, mode: 'create', objectData: null };
  function $(id){ return document.getElementById(id); }
  function toast(msg, tone){ if(window.MexionToast) window.MexionToast.show(msg,{tone:tone||'default'}); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function asArray(data){
    if(Array.isArray(data)) return data;
    data = data || {};
    var keys = cfg.arrayKeys || ['items','data','records','users','groups','channels','accounts','subscriptions','orders','plans','proxies','codes','announcements','logs','transfers','rebates','invites','monitors','promo_codes'];
    for(var i=0;i<keys.length;i++) if(Array.isArray(data[keys[i]])) return data[keys[i]];
    return [];
  }
  function idOf(row){ var keys = cfg.idKeys || ['id','uuid','code','name','key']; for(var i=0;i<keys.length;i++) if(row && row[keys[i]] != null) return row[keys[i]]; return null; }
  function getVal(obj, key){
    if(!key) return '';
    return String(key).split('.').reduce(function(acc,k){ return acc && acc[k] != null ? acc[k] : ''; }, obj || {});
  }
  function fmt(v){
    if(v == null || v === '') return '—';
    if(typeof v === 'boolean') return v ? '是' : '否';
    if(typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
  function columns(){
    return cfg.columns || [
      {key:'id', label:'ID'}, {key:'name', label:'名称'}, {key:'status', label:'状态'}, {key:'created_at', label:'创建时间'}
    ];
  }
  function endpointFor(action, row){
    var base = cfg[action + 'Endpoint'] || cfg.endpoint;
    var id = row ? idOf(row) : null;
    if(action === 'create') return base;
    if(base && base.indexOf(':id') >= 0) return base.replace(':id', encodeURIComponent(id));
    return base && id != null ? base.replace(/\/$/,'') + '/' + encodeURIComponent(id) : base;
  }
  function setBusy(on){
    ['resourceRefresh','resourceCreate','resourceEdit','resourceDelete','resourceRun','resourceModalConfirm'].forEach(function(id){ var el=$(id); if(el) el.disabled=!!on; });
  }
  function setDetail(value, label){
    state.selected = value || null;
    var detail = $('resourceDetail');
    if(detail) detail.textContent = value ? JSON.stringify(value, null, 2) : '等待数据…';
    var meta = $('detailMeta');
    if(meta) meta.textContent = label || (value ? '已选择' : '选择一行查看 JSON');
  }
  function renderStats(data){
    var el = $('resourceStats');
    if(!el) return;
    var stats = [];
    if(data && typeof data === 'object' && !Array.isArray(data)) {
      ['total','page','page_size','count','active','enabled','disabled','success','failed'].forEach(function(k){ if(data[k] != null) stats.push([k, data[k]]); });
    }
    if(cfg.stats && Array.isArray(cfg.stats)) cfg.stats.forEach(function(k){ if(data && data[k] != null) stats.push([k, data[k]]); });
    if(!stats.length){ el.innerHTML=''; return; }
    el.innerHTML = stats.slice(0,8).map(function(p){ return '<div style="background:var(--surface);padding:14px 16px"><div style="font:11px var(--f-mono);color:var(--muted);text-transform:uppercase;letter-spacing:.08em">'+esc(p[0])+'</div><div style="font:24px var(--f-display);color:var(--ink);margin-top:4px">'+esc(fmt(p[1]))+'</div></div>'; }).join('');
  }
  function renderTable(){
    var list = $('resourceList');
    var count = $('resourceCount');
    if(count) count.innerHTML = '<span class="pill__dot"></span>' + state.filtered.length + ' 条';
    if(!list) return;
    if(cfg.objectMode){
      var obj = state.objectData || {};
      var rows = Object.keys(obj).sort().map(function(k){ return '<tr><td style="padding:10px 12px;border-bottom:1px solid var(--border);font-family:var(--f-mono);white-space:nowrap">'+esc(k)+'</td><td style="padding:10px 12px;border-bottom:1px solid var(--border);font-family:var(--f-mono)">'+esc(fmt(obj[k]))+'</td></tr>'; }).join('');
      list.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);color:var(--muted)">键</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);color:var(--muted)">值</th></tr></thead><tbody>'+rows+'</tbody></table>';
      setDetail(obj, '配置对象');
      return;
    }
    var cols = columns();
    if(!state.filtered.length){ list.innerHTML = '<div style="padding:24px;color:var(--muted)">暂无数据或接口返回为空。</div>'; return; }
    var head = cols.map(function(c){ return '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em">'+esc(c.label||c.key)+'</th>'; }).join('');
    var body = state.filtered.map(function(row, idx){
      var cells = cols.map(function(c){ var v=getVal(row,c.key); var cls = c.mono === false ? '' : 'font-family:var(--f-mono);'; return '<td style="padding:10px 12px;border-bottom:1px solid var(--border);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'+cls+'">'+esc(fmt(v))+'</td>'; }).join('');
      return '<tr data-idx="'+idx+'" tabindex="0" style="cursor:pointer;background:var(--surface)">'+cells+'</tr>';
    }).join('');
    list.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr>'+head+'</tr></thead><tbody>'+body+'</tbody></table>';
    Array.prototype.forEach.call(list.querySelectorAll('tr[data-idx]'), function(tr){
      tr.addEventListener('click', function(){ var row = state.filtered[Number(tr.getAttribute('data-idx'))]; setDetail(row, 'ID: '+fmt(idOf(row))); });
      tr.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tr.click(); }});
    });
    if(!state.selected && state.filtered[0]) setDetail(state.filtered[0], 'ID: '+fmt(idOf(state.filtered[0])));
  }
  function applyFilter(){
    var q = (($('resourceSearch') && $('resourceSearch').value) || '').trim().toLowerCase();
    state.filtered = !q ? state.rows.slice() : state.rows.filter(function(r){ return JSON.stringify(r).toLowerCase().indexOf(q) >= 0; });
    renderTable();
  }
  function fetchAll(){
    if(!window.MexionHttp || !cfg.endpoint) return;
    setBusy(true);
    var url = cfg.endpoint;
    if(cfg.pageSize && url.indexOf('?') < 0) url += '?page=1&page_size=' + encodeURIComponent(cfg.pageSize);
    return MexionHttp.get(url).then(function(data){
      if(cfg.objectMode){ state.objectData = data || {}; state.rows = []; state.filtered = []; }
      else { state.rows = asArray(data); state.filtered = state.rows.slice(); }
      renderStats(data);
      var sub = $('resourceSubtitle'); if(sub) sub.textContent = cfg.subtitle || ('已连接 ' + cfg.endpoint);
      var meta = $('resourceMeta'); if(meta) meta.textContent = cfg.endpoint;
      renderTable();
      return data;
    }).catch(function(err){
      var list = $('resourceList'); if(list) list.innerHTML = '<div style="padding:24px;color:var(--verm)">加载失败：'+esc(err && err.message || err)+'</div>';
      toast('加载失败：' + (err && err.message || err), 'error');
    }).finally(function(){ setBusy(false); });
  }
  function openModal(mode){
    state.mode = mode;
    var modal = $('resourceModal'); var title = $('resourceModalTitle'); var ta = $('resourceJson');
    if(title) title.textContent = mode === 'create' ? '新建' : '编辑 JSON';
    var value = mode === 'create' ? (cfg.createTemplate || {}) : (cfg.objectMode ? state.objectData : state.selected);
    if(ta) ta.value = JSON.stringify(value || {}, null, 2);
    if(modal) { modal.hidden = false; modal.classList.add('is-open'); }
  }
  function closeModal(){ var modal=$('resourceModal'); if(modal){ modal.classList.remove('is-open'); modal.hidden = true; } }
  function submitModal(){
    var ta = $('resourceJson'); var payload;
    try { payload = JSON.parse((ta && ta.value) || '{}'); } catch(e){ toast('JSON 格式错误', 'error'); return; }
    setBusy(true);
    var p;
    if(state.mode === 'create') p = MexionHttp.post(endpointFor('create'), payload);
    else if(cfg.objectMode) p = MexionHttp.put(endpointFor('update'), payload);
    else p = MexionHttp.put(endpointFor('update', state.selected), payload);
    p.then(function(){ closeModal(); toast('已提交', 'success'); return fetchAll(); }).catch(function(err){ toast('提交失败：' + (err && err.message || err), 'error'); }).finally(function(){ setBusy(false); });
  }
  function del(){
    if(!state.selected) { toast('先选择一行', 'error'); return; }
    if(!confirm('确认删除选中数据？')) return;
    setBusy(true);
    MexionHttp.delete(endpointFor('delete', state.selected)).then(function(){ state.selected=null; toast('已删除','success'); return fetchAll(); }).catch(function(err){ toast('删除失败：'+(err&&err.message||err),'error'); }).finally(function(){ setBusy(false); });
  }
  function run(){
    if(!state.selected || !cfg.runAction) { toast('先选择一行', 'error'); return; }
    setBusy(true);
    var ep = cfg.runAction.replace(':id', encodeURIComponent(idOf(state.selected)));
    MexionHttp.post(ep, {}).then(function(data){ setDetail(data || state.selected, '执行结果'); toast('执行完成','success'); return fetchAll(); }).catch(function(err){ toast('执行失败：'+(err&&err.message||err),'error'); }).finally(function(){ setBusy(false); });
  }
  function init(){
    var r=$('resourceRefresh'); if(r) r.addEventListener('click', fetchAll);
    var c=$('resourceCreate'); if(c) c.addEventListener('click', function(){ openModal('create'); });
    var e=$('resourceEdit'); if(e) e.addEventListener('click', function(){ if(cfg.objectMode || state.selected) openModal('edit'); else toast('先选择一行','error'); });
    var d=$('resourceDelete'); if(d) d.addEventListener('click', del);
    var runBtn=$('resourceRun'); if(runBtn) runBtn.addEventListener('click', run);
    var cp=$('resourceCopy'); if(cp) cp.addEventListener('click', function(){ navigator.clipboard.writeText(($('resourceDetail')&&$('resourceDetail').textContent)||'').then(function(){toast('已复制','success');}); });
    var s=$('resourceSearch'); if(s) s.addEventListener('input', applyFilter);
    ['resourceModalClose','resourceModalCancel'].forEach(function(id){ var b=$(id); if(b) b.addEventListener('click', closeModal); });
    var ok=$('resourceModalConfirm'); if(ok) ok.addEventListener('click', submitModal);
    fetchAll();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
