/**
 * MOCRO — category.js | dynamic category page (/category.html?slug=…)
 */
(function () {
  'use strict';
  if (!window.Mocro) return;
  var M = window.Mocro;
  function url(p) { var b = window.MOCRO_CONFIG.SITE_BASE; if (b.slice(-1) !== '/') b += '/'; return b + p; }
  function qs(n) { var v = new URLSearchParams(window.location.search).get(n); if (v) return v; var p = window.location.pathname.replace(/\/+$/, ''); var seg = p.split('/'); return seg.pop() || ''; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function dateStr(iso) { if (!iso) return ''; try { return new Date(iso).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return iso.slice(0, 10); } }
  function readingTime(content) { var w = (content || '').trim().split(/\s+/).length; var m = Math.max(1, Math.round(w / 180)); return m + (m === 1 ? ' دقيقة' : ' دقائق'); }

  function chevron(cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    return s;
  }

  async function render() {
    // Normalize legacy ?slug= URLs to clean /category/:slug (preserve SEO equity).
    var legacy = new URLSearchParams(window.location.search).get('slug');
    if (legacy) {
      window.location.replace(url('category/' + encodeURIComponent(legacy)));
      return;
    }
    var slug = qs('slug');
    var grid = document.getElementById('listing-grid');
    var head = document.getElementById('page-head');
    if (!slug) { grid.innerHTML = '<div class="empty-state">لم يتم تحديد قسم.</div>'; return; }

    var cr = await M.categoryBySlug(slug);
    var cat = cr.data;
    if (!cat) { grid.innerHTML = '<div class="empty-state">القسم غير موجود.</div>'; return; }

    document.title = cat.name + ' — مُوكْرُو';
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', url('category/' + encodeURIComponent(cat.slug)));
    else { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); canon.setAttribute('href', url('category/' + encodeURIComponent(cat.slug))); document.head.appendChild(canon); }
    head.innerHTML = '';

    var bc = el('nav', 'breadcrumb');
    var homeLink = el('a', null, 'الرئيسية');
    homeLink.href = url('index.html');
    var sep = chevron('breadcrumb-arrow');
    var cur = el('span', 'breadcrumb-current', cat.name);
    bc.appendChild(homeLink);
    bc.appendChild(sep);
    bc.appendChild(cur);
    head.appendChild(bc);

    head.appendChild(el('h1', null, cat.name));
    if (cat.description) head.appendChild(el('div', 'page-desc', cat.description));

    var ar = await M.articlesByCategory(slug);
    var articles = (ar.data || []).map(M.normalize);
    grid.innerHTML = '';
    if (!articles.length) { grid.innerHTML = '<div class="empty-state">لا توجد مقالات منشورة في هذا القسم بعد.</div>'; return; }

    var list = el('div', 'journal-list');
    articles.forEach(function (a) {
      var item = el('article', 'search-result');
      var href = url('article/' + encodeURIComponent(a.slug));
      item.setAttribute('data-href', href);
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'link');
      item.setAttribute('aria-label', a.title);
      var body = el('div', 'sr-body');
      body.appendChild(el('div', 'sr-title', a.title));
      var meta = el('div', 'sr-meta');
      meta.appendChild(el('span', 'sr-date', dateStr(a.published_at)));
      meta.appendChild(el('span', null, ' · قراءة ' + readingTime(a.content)));
      body.appendChild(meta);
      item.appendChild(body);
      item.addEventListener('click', function () { window.location.href = href; });
      item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = href; } });
      list.appendChild(item);
    });
    grid.appendChild(list);
  }

  document.addEventListener('DOMContentLoaded', render);
})();
