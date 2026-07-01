(function () {
  function init(menu) {
    const trigger = menu.querySelector('.user');
    const panel = menu.querySelector('.user-menu__panel');
    if (!trigger || !panel) return;
    let isOpen = false;
    let closeTimer = null;

    function items() {
      return Array.from(panel.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])'));
    }
    function open() {
      if (isOpen) return;
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      panel.hidden = false;
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      });
      isOpen = true;
    }
    function close(returnFocus) {
      if (!isOpen) return;
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      isOpen = false;
      closeTimer = setTimeout(() => { if (!isOpen) panel.hidden = true; }, 180);
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen ? close(false) : open();
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        if (!isOpen) { e.preventDefault(); open(); requestAnimationFrame(() => { const list = items(); if (list[0]) list[0].focus(); }); }
      }
    });

    panel.addEventListener('keydown', (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (list[(i + 1) % list.length] || list[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (list[(i - 1 + list.length) % list.length] || list[list.length - 1]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0] && list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1] && list[list.length - 1].focus(); }
      else if (e.key === 'Tab') { close(false); }
    });

    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) close(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) { e.stopPropagation(); close(true); } });

    panel.querySelectorAll('[data-action="signout"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        close(false);
        const evt = new CustomEvent('user-menu:signout', { bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
      });
    });
  }

  function translateMenu() {
    if (typeof AxiomI18n === 'undefined') return;
    document.querySelectorAll('.user-menu__item').forEach(function(item) {
      var span = item.querySelector('span');
      if (!span) return;
      var href = item.getAttribute('href') || '';
      var action = item.getAttribute('data-action') || '';
      if (href.indexOf('profile') !== -1) span.textContent = AxiomI18n.t('shared.nav.profile');
      else if (href.indexOf('api-keys') !== -1) span.textContent = AxiomI18n.t('shared.nav.apikeys');
      else if (action === 'signout') span.textContent = AxiomI18n.t('shared.nav.signout');
    });
    document.querySelectorAll('.notif-bell').forEach(function(btn) {
      btn.setAttribute('title', AxiomI18n.t('shared.topbar.notify'));
    });
    document.querySelectorAll('[aria-label="账户菜单"]').forEach(function(el) {
      el.setAttribute('aria-label', AxiomI18n.t('shared.menu.account'));
    });
  }

  function injectCommunityBtn() {
    var bell = document.querySelector('.notif-bell-wrap');
    if (!bell || document.getElementById('communityBtn')) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative';
    var _commLabel = (typeof AxiomI18n !== 'undefined' && AxiomI18n.lang === 'en') ? 'Community' : '社群';
    wrap.innerHTML = '<button class="iconbtn iconbtn--labeled" id="communityBtn" title="社群" style="position:relative"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.6 3C3.6 3 2 4.3 2 6c0 .9.5 1.8 1.2 2.3l-.4 1.4 1.3-.7c.4.1.8.1 1.2.1h.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M10 6c2 0 3.5 1.3 3.5 3s-1.5 3-3.5 3c-.4 0-.8 0-1.2-.1l-1.3.7.4-1.4C7.2 10.8 6.5 9.9 6.5 9c0-1.7 1.6-3 3.5-3z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg><span>' + _commLabel + '</span></button>';
    bell.parentNode.insertBefore(wrap, bell);
    wrap.querySelector('#communityBtn').addEventListener('click', function() {
      var old = document.getElementById('communityPopup');
      if (old) { old.remove(); return; }
      var l = (typeof AxiomI18n!=='undefined'&&AxiomI18n.lang)||'zh';
      var popup = document.createElement('div');
      popup.id = 'communityPopup';
      popup.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(20,18,14,0.42);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px';
      popup.innerHTML =
        '<div style="background:var(--surface,#fff);border:1px solid var(--border,#E6E2D6);border-radius:14px;max-width:380px;width:100%;padding:28px 24px;box-shadow:0 24px 60px -16px rgba(20,18,14,0.3);animation:cpIn .25s ease-out;position:relative">' +
          '<style>@keyframes cpIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}</style>' +
          '<button onclick="this.closest(\'#communityPopup\').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;color:var(--mute-2,#94917F);font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px">&times;</button>' +
          '<div style="text-align:center"><div style="font-family:var(--f-display,Newsreader),serif;font-size:22px;font-weight:500;color:var(--ink,#14140F)">'+(l==='zh'?'加入社群':'Join Community')+'</div><p style="font-size:13px;color:var(--mute-2,#94917F);margin-top:6px;line-height:1.5">'+(l==='zh'?'获取最新动态、技术支持与专属优惠':'Updates, support & exclusive offers')+'</p></div>' +
          '<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">' +
            '<a href="https://qm.qq.com/cgi-bin/qm/qr?k=&group_code=826971943" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border,#E6E2D6);border-radius:10px;text-decoration:none;color:var(--ink,#14140F);transition:all .15s"><span style="width:36px;height:36px;border-radius:9px;background:#12B7F5;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 5.84 2 10.5c0 2.66 1.5 5.03 3.84 6.57l-.72 2.68 3.12-1.56c1.14.36 2.4.56 3.76.56 5.52 0 10-3.84 10-8.5S17.52 2 12 2z"/></svg></span><div style="flex:1"><div style="font-weight:500;font-size:14px">QQ '+(l==='zh'?'群':'Group')+'</div><div style="font-size:12px;color:var(--mute-2,#94917F)">826971943</div></div><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--mute-3)"><path d="M4.5 2L8.5 6 4.5 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></a>' +
            '<div id="wechatEntry" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border,#E6E2D6);border-radius:10px;color:var(--ink,#14140F);cursor:pointer;transition:all .15s"><span style="width:36px;height:36px;border-radius:9px;background:#07C160;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.68 4.025c-2.203 0-4.446.818-5.891 2.188-1.49 1.412-2.07 3.08-2.07 4.797 0 1.854.8 3.574 2.335 4.833.076.062.163.106.163.223 0 .056-.033.117-.048.171l-.296 1.049a.303.303 0 0 0-.019.122c0 .13.106.237.232.237a.26.26 0 0 0 .135-.044l1.422-.837a.69.69 0 0 1 .569-.077 8.3 8.3 0 0 0 2.28.308h.812c4.204 0 7.342-2.867 7.342-6.457 0-3.268-2.88-6.513-6.966-6.513zm-3.2 3.506c.527 0 .955.434.955.97a.963.963 0 0 1-.955.968.963.963 0 0 1-.955-.969c0-.535.428-.969.955-.969zm4.76 0c.528 0 .955.434.955.97a.963.963 0 0 1-.955.968.963.963 0 0 1-.956-.969c0-.535.428-.969.956-.969z"/></svg></span><div style="flex:1"><div style="font-weight:500;font-size:14px">'+(l==='zh'?'微信群':'WeChat Group')+'</div><div style="font-size:12px;color:var(--mute-2,#94917F)">'+(l==='zh'?'扫码入群':'Scan to join')+'</div></div><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--mute-3)"><path d="M4.5 2L8.5 6 4.5 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></div>' +
            '<a href="mailto:axiomcodeai@gmail.com" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border,#E6E2D6);border-radius:10px;text-decoration:none;color:var(--ink,#14140F);transition:all .15s"><span style="width:36px;height:36px;border-radius:9px;background:var(--ink,#14140F);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1" stroke="#fff" stroke-width="1.3"/><path d="M2 4l6 4.5L14 4" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div style="flex:1"><div style="font-weight:500;font-size:14px">'+(l==='zh'?'邮件联系':'Email')+'</div><div style="font-size:12px;color:var(--mute-2,#94917F)">axiomcodeai@gmail.com</div></div><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--mute-3)"><path d="M4.5 2L8.5 6 4.5 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></a>' +
          '</div>' +
          '<p style="text-align:center;font-size:11px;color:var(--mute-3,#BBB7A4);margin-top:14px">'+(l==='zh'?'欢迎反馈建议与合作咨询':'Feedback & partnerships welcome')+'</p>' +
        '</div>';
      document.body.appendChild(popup);
      popup.addEventListener('click', function(ev) { if (ev.target === popup) popup.remove(); });
      document.addEventListener('keydown', function h(ev) { if (ev.key === 'Escape') { popup.remove(); document.removeEventListener('keydown', h); } });

      // 页面加载时预加载 SVG 到内存
      var _wcSvg = '';
      var _wcImg = new Image();
      _wcImg.src = '/assets/wechat-group/qr.svg?v=3';

      var wechatBtn = document.getElementById('wechatEntry');
      if (wechatBtn) wechatBtn.addEventListener('click', function() {
        var ov = document.createElement('div');
        ov.className = 'wc-overlay';
        ov.innerHTML =
          '<div class="wc-card">' +
            '<div class="wc-card__head"><div class="wc-card__brand"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5.5L11 3l1 1.5.5 1.5V8l-.5 1.5L11 11l-1.5 1-1.5.5H6.5L5 12 3.5 11l-1-1.5L2 8V6.5L2.5 5 3.5 3.5 5 2.5 6.5 2z" stroke="currentColor" stroke-width="1.2"/></svg><span>Axiom</span></div><div class="wc-card__tag"><span class="wc-dot"></span>WeChat</div></div>' +
            '<div class="wc-card__body"><div class="wc-qr"><img src="/assets/wechat-group/qr.svg?v=3" alt="WeChat QR"></div></div>' +
            '<div class="wc-card__foot"><div class="wc-foot-left"><div class="wc-foot-title">'+(l==='zh'?'微信扫码入群':'Scan to Join')+'</div><div class="wc-foot-sub">'+(l==='zh'?'Axiom 用户交流群':'Axiom Community')+'</div></div><button class="wc-close" onclick="this.closest(\'.wc-overlay\').remove()">'+(l==='zh'?'关闭':'Close')+'</button></div>' +
          '</div>';
        document.body.appendChild(ov);
        requestAnimationFrame(function(){ ov.classList.add('is-open'); });
        ov.addEventListener('click', function(ev){ if(ev.target===ov) ov.remove(); });
      });
    });
  }

  function boot() {
    document.querySelectorAll('.user-menu').forEach(init);
    translateMenu();
    injectCommunityBtn();
    if (typeof AxiomI18n !== 'undefined') AxiomI18n.onChange(translateMenu);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
