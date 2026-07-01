(function () {
  'use strict';
  var fetched = {};
  var p = location.pathname.replace(/\.html$/, '');
  var current = (p === '' || p === '/') ? '/' : p;
  var cfProxy = location.protocol === 'https:';

  function prefetch(href) {
    if (cfProxy) return;
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('javascript')) return;
    if (fetched[href] || href === current) return;
    fetched[href] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }

  document.addEventListener('pointerenter', function (e) {
    if (!e.target || !e.target.closest) return;
    var a = e.target.closest('a[href]');
    if (a) prefetch(a.getAttribute('href'));
  }, { capture: true, passive: true });

  document.addEventListener('touchstart', function (e) {
    if (!e.target || !e.target.closest) return;
    var a = e.target.closest('a[href]');
    if (a) prefetch(a.getAttribute('href'));
  }, { capture: true, passive: true });

  document.addEventListener('mousedown', function (e) {
    if (!e.target || !e.target.closest) return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http')) return;
    if (href === current) return;
    if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
      a.style.opacity = '0.6';
      setTimeout(function(){ a.style.opacity = ''; }, 300);
    }
  }, { capture: true });
})();
