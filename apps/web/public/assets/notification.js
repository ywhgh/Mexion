(function () {
  'use strict';

  var STORAGE_KEY = 'axiom_dismissed_announcements';
  var READ_KEY = 'axiom_read_announcements';
  var POLL_INTERVAL = 300000;
  var announcements = [];
  var bellBtn = null;
  var badge = null;
  var readerEl = null;
  var selectedId = null;

  function getDismissed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e) { return []; }
  }
  function setDismissed(ids) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
  function getRead() {
    try { return JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch(e) { return []; }
  }
  function setRead(ids) { localStorage.setItem(READ_KEY, JSON.stringify(ids)); }
  function markAsRead(id) {
    var r = getRead(); if (r.indexOf(id) === -1) { r.push(id); setRead(r); }
  }

  function unreadCount() {
    var r = getRead();
    return announcements.filter(function(a) { return r.indexOf(a.id) === -1; }).length;
  }

  function updateBadge() {
    if (!badge) return;
    var n = unreadCount();
    badge.textContent = n > 0 ? (n > 9 ? '9+' : n) : '';
    badge.style.display = n > 0 ? '' : 'none';
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var diff = Math.floor((now - d) / 1000);
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    if (diff < 60) return zh ? '刚刚' : 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + (zh ? ' 分钟前' : 'm ago');
    if (diff < 86400) return Math.floor(diff / 3600) + (zh ? ' 小时前' : 'h ago');
    if (diff < 604800) return Math.floor(diff / 86400) + (zh ? ' 天前' : 'd ago');
    var mm = String(d.getMonth()+1).padStart(2,'0');
    var dd = String(d.getDate()).padStart(2,'0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function fmtFullDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    var mm = String(d.getMonth()+1).padStart(2,'0');
    var dd = String(d.getDate()).padStart(2,'0');
    var hh = String(d.getHours()).padStart(2,'0');
    var mi = String(d.getMinutes()).padStart(2,'0');
    if (zh) return d.getFullYear() + ' 年 ' + (d.getMonth()+1) + ' 月 ' + d.getDate() + ' 日 ' + hh + ':' + mi;
    return mm + '/' + dd + '/' + d.getFullYear() + ' ' + hh + ':' + mi;
  }

  function md(raw) {
    var s = esc(raw);
    var lines = s.split('\n');
    var out = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];

      if (/^---$/.test(line)) {
        out.push('<hr class="nr-hr">');
        i++; continue;
      }
      if (/^### (.+)$/.test(line)) {
        out.push('<h4 class="nr-h4">' + RegExp.$1 + '</h4>');
        i++; continue;
      }
      if (/^## (.+)$/.test(line)) {
        out.push('<h3 class="nr-h3">' + RegExp.$1 + '</h3>');
        i++; continue;
      }
      if (/^# (.+)$/.test(line)) {
        out.push('<h2 class="nr-h2">' + RegExp.$1 + '</h2>');
        i++; continue;
      }
      if (/^&gt; (.+)$/.test(line)) {
        var bq = [RegExp.$1];
        while (i + 1 < lines.length && /^&gt; (.+)$/.test(lines[i+1])) { i++; bq.push(RegExp.$1); }
        out.push('<blockquote class="nr-bq">' + bq.join('<br>') + '</blockquote>');
        i++; continue;
      }
      if (/^(\d+)\. (.+)$/.test(line)) {
        var items = [];
        while (i < lines.length && /^(\d+)\. (.+)$/.test(lines[i])) {
          lines[i].match(/^(\d+)\. (.+)$/);
          items.push({ n: RegExp.$1, t: RegExp.$2 });
          i++;
        }
        out.push('<ol class="nr-ol">' + items.map(function(it) { return '<li value="' + it.n + '">' + inlineFormat(it.t) + '</li>'; }).join('') + '</ol>');
        continue;
      }
      if (/^[-*] (.+)$/.test(line)) {
        var lis = [];
        while (i < lines.length && /^[-*] (.+)$/.test(lines[i])) {
          lines[i].match(/^[-*] (.+)$/);
          lis.push(RegExp.$1);
          i++;
        }
        out.push('<ul class="nr-ul">' + lis.map(function(t) { return '<li>' + inlineFormat(t) + '</li>'; }).join('') + '</ul>');
        continue;
      }
      if (line.trim() === '') {
        out.push('<div class="nr-gap"></div>');
        i++; continue;
      }
      out.push('<p class="nr-p">' + inlineFormat(line) + '</p>');
      i++;
    }
    return out.join('');
  }

  function inlineFormat(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="nr-code">$1</code>');
  }

  function plainPreview(s, max) {
    return String(s)
      .replace(/^#{1,4}\s+/gm, '').replace(/^---$/gm, '')
      .replace(/^>\s*/gm, '').replace(/^[-*]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '').replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\n+/g, ' ').trim()
      .slice(0, max || 60) + (String(s).length > (max || 60) ? '…' : '');
  }

  /* ── Build reader overlay ── */
  function buildReader() {
    if (readerEl) return;
    readerEl = document.createElement('div');
    readerEl.className = 'nr-overlay';
    readerEl.innerHTML =
      '<div class="nr-reader">' +
        '<div class="nr-sidebar">' +
          '<div class="nr-sidebar__head">' +
            '<span class="nr-sidebar__title"></span>' +
            '<button class="nr-sidebar__mark" type="button"></button>' +
          '</div>' +
          '<div class="nr-sidebar__list"></div>' +
        '</div>' +
        '<div class="nr-content">' +
          '<div class="nr-content__empty"></div>' +
        '</div>' +
        '<button class="nr-close" type="button">' +
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(readerEl);

    readerEl.querySelector('.nr-close').addEventListener('click', closeReader);
    readerEl.addEventListener('click', function(e) { if (e.target === readerEl) closeReader(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && readerEl.classList.contains('is-open')) closeReader(); });
  }

  function openReader() {
    buildReader();
    renderSidebar();
    if (announcements.length > 0) {
      selectAnnouncement(announcements[0].id);
    } else {
      renderEmptyContent();
    }
    requestAnimationFrame(function() {
      readerEl.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeReader() {
    if (!readerEl) return;
    readerEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderSidebar() {
    if (!readerEl) return;
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    var read = getRead();
    var head = readerEl.querySelector('.nr-sidebar__head');
    var un = unreadCount();
    head.querySelector('.nr-sidebar__title').innerHTML =
      (zh ? '通知' : 'Notifications') +
      (un > 0 ? ' <span class="nr-sidebar__badge">' + un + '</span>' : '');
    var markBtn = head.querySelector('.nr-sidebar__mark');
    markBtn.textContent = zh ? '全部已读' : 'Mark all read';
    markBtn.style.display = un > 0 ? '' : 'none';
    markBtn.onclick = function() {
      announcements.forEach(function(a) { markAsRead(a.id); });
      updateBadge();
      renderSidebar();
    };

    var list = readerEl.querySelector('.nr-sidebar__list');
    if (announcements.length === 0) {
      list.innerHTML = '<div class="nr-sidebar__empty">' + (zh ? '暂无通知' : 'No notifications') + '</div>';
      return;
    }
    list.innerHTML = announcements.map(function(a) {
      var isRead = read.indexOf(a.id) !== -1;
      var isSel = a.id === selectedId;
      var tag = guessTag(a);
      return '<div class="nr-item' + (isSel ? ' is-sel' : '') + (isRead ? '' : ' is-unread') + '" data-id="' + a.id + '">' +
        '<div class="nr-item__dot"></div>' +
        '<div class="nr-item__body">' +
          '<div class="nr-item__head-row"><span class="nr-item__title">' + esc(a.title) + '</span></div>' +
          '<div class="nr-item__preview">' + esc(plainPreview(a.content)) + '</div>' +
          '<div class="nr-item__foot"><span class="nr-item__time">' + fmtDate(a.created_at || a.updated_at) + '</span><span class="nr-tag nr-tag--sm ' + tag.cls + '">' + tag.label + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('');

    list.querySelectorAll('.nr-item').forEach(function(el) {
      el.addEventListener('click', function() {
        selectAnnouncement(parseInt(el.dataset.id, 10));
      });
    });
  }

  function selectAnnouncement(id) {
    selectedId = id;
    var a = announcements.find(function(x) { return x.id === id; });
    if (!a) return;
    markAsRead(id);
    updateBadge();
    renderSidebar();
    renderContent(a);
  }

  function guessTag(a) {
    var t = (a.title || '') + (a.content || '');
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    if (/维护|升级|migration|maintenance/i.test(t)) return { label: zh ? '维护' : 'Maintenance', cls: 'nr-tag--warn' };
    if (/邀请|活动|奖|reward|invite|event/i.test(t)) return { label: zh ? '活动' : 'Event', cls: 'nr-tag--green' };
    if (/新功能|上线|launch|feature|update/i.test(t)) return { label: zh ? '新功能' : 'New', cls: 'nr-tag--blue' };
    return { label: zh ? '公告' : 'Notice', cls: 'nr-tag--default' };
  }

  function renderContent(a) {
    if (!readerEl) return;
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    var tag = guessTag(a);
    var content = readerEl.querySelector('.nr-content');
    content.innerHTML =
      '<div class="nr-article">' +
        '<div class="nr-article__head">' +
          '<div class="nr-article__eyebrow">' +
            '<span class="nr-article__dot"></span>' +
            (zh ? '公告' : 'Announcement') +
            '<span class="nr-tag ' + tag.cls + '">' + tag.label + '</span>' +
          '</div>' +
          '<h1 class="nr-article__title">' + esc(a.title) + '</h1>' +
          '<div class="nr-article__meta">' +
            '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="color:var(--mute-3)"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' +
            '<span>' + fmtFullDate(a.created_at || a.updated_at) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="nr-article__body">' + md(a.content) + '</div>' +
      '</div>';
  }

  function renderEmptyContent() {
    if (!readerEl) return;
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';
    readerEl.querySelector('.nr-content').innerHTML =
      '<div class="nr-content__empty">' +
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="color:var(--mute-3);margin-bottom:12px"><circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="1.5"/><path d="M14 17h12M14 23h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '<div style="font-size:14px;color:var(--muted)">' + (zh ? '暂无通知' : 'No notifications') + '</div>' +
      '</div>';
  }

  /* ── Popup (auto-show for new popup-mode announcements) ── */
  function showPopup(a) {
    var dismissed = getDismissed();
    if (dismissed.indexOf(a.id) !== -1) return;
    var zh = typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'zh';

    var overlay = document.createElement('div');
    overlay.className = 'nr-popup-overlay';
    overlay.innerHTML =
      '<div class="nr-popup">' +
        '<div class="nr-popup__head">' +
          '<div class="nr-article__eyebrow"><span class="nr-article__dot"></span>' + (zh ? '新公告' : 'New Announcement') + '</div>' +
          '<h2 class="nr-popup__title">' + esc(a.title) + '</h2>' +
        '</div>' +
        '<div class="nr-popup__body">' + md(a.content) + '</div>' +
        '<div class="nr-popup__foot">' +
          '<button class="nr-popup__btn" type="button">' + (zh ? '知道了' : 'Got it') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { requestAnimationFrame(function() { overlay.classList.add('is-open'); }); });

    function dismiss() {
      var d = getDismissed(); if (d.indexOf(a.id) === -1) { d.push(a.id); setDismissed(d); }
      markAsRead(a.id);
      overlay.classList.remove('is-open');
      setTimeout(function() { overlay.remove(); }, 300);
      updateBadge();
    }
    overlay.querySelector('.nr-popup__btn').addEventListener('click', dismiss);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
  }

  /* ── Fetch ── */
  function fetchAnnouncements() {
    if (typeof AxiomHttp === 'undefined') return;
    AxiomHttp.get('/notice').then(function(raw) {
      var data = [];
      if (typeof raw === 'string' && raw.length > 0) {
        data = [{ id: 1, title: 'Notice', content: raw, type: 'banner', notify_mode: 'banner' }];
      } else if (Array.isArray(raw)) {
        data = raw;
      }
      return data;
    }).then(function(data) {
      var list = Array.isArray(data) ? data : [];
      var prevIds = announcements.map(function(a) { return a.id; });
      announcements = list;
      updateBadge();
      if (readerEl && readerEl.classList.contains('is-open')) {
        renderSidebar();
        if (selectedId) {
          var sel = announcements.find(function(a) { return a.id === selectedId; });
          if (sel) renderContent(sel);
        }
      }
      list.forEach(function(a) {
        if (a.notify_mode === 'popup' && prevIds.indexOf(a.id) === -1) showPopup(a);
      });
    }).catch(function() {});
  }

  /* ── Init ── */
  function init() {
    bellBtn = document.querySelector('.notif-bell');
    if (!bellBtn) return;

    badge = document.createElement('span');
    badge.className = 'notif-bell__badge';
    badge.style.display = 'none';
    bellBtn.style.position = 'relative';
    bellBtn.appendChild(badge);

    bellBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openReader();
    });

    fetchAnnouncements();
    var _poll = setInterval(fetchAnnouncements, POLL_INTERVAL);
    window.addEventListener('beforeunload', function() { clearInterval(_poll); }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
