/**
 * MOCRO — home.js | Homepage renderer (all data from Supabase).
 */
(function () {
  'use strict';
  if (!window.Mocro) return;
  var M = window.Mocro;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function url(path) { var b = M.client !== undefined ? window.MOCRO_CONFIG.SITE_BASE : ''; if (b && b.slice(-1) !== '/') b += '/'; return b + path; }
  function dateStr(iso) { if (!iso) return ''; try { return new Date(iso).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return iso.slice(0, 10); } }
  function readingTime(content) { var w = (content || '').trim().split(/\s+/).length; var m = Math.max(1, Math.round(w / 180)); return m + (m === 1 ? ' دقيقة' : ' دقائق'); }
  function artUrl(a) { return url('article/' + encodeURIComponent(a.slug)); }
  function catUrl(c) { return url('category/' + encodeURIComponent(c.slug)); }

  function chevron(cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    return s;
  }

  function renderNav(categories) {
    var desktopSub = document.getElementById('nav-categories-desktop');
    var mobileMenu = document.getElementById('mobile-menu');
    var footerCats = document.getElementById('footer-categories');

    if (desktopSub) {
      desktopSub.innerHTML = '';
      categories.forEach(function (c, i) {
        var a = document.createElement('a');
        a.href = catUrl(c); a.setAttribute('role', 'menuitem');
        a.appendChild(el('span', null, c.name));
        var num = el('span', 'sub-num', String(i + 1).padStart(2, '0'));
        a.appendChild(num);
        desktopSub.appendChild(a);
      });
    }

    if (mobileMenu) {
      var catBox = mobileMenu.querySelector('#menu-categories');
      var menuSearch = mobileMenu.querySelector('.menu-search');
      if (!catBox) {
        catBox = document.createElement('div');
        catBox.id = 'menu-categories';
        catBox.className = 'menu-categories';
        if (menuSearch && menuSearch.nextSibling) mobileMenu.insertBefore(catBox, menuSearch.nextSibling);
        else mobileMenu.appendChild(catBox);
      }
      catBox.innerHTML = '';
      categories.forEach(function (c) {
        var a = document.createElement('a');
        a.href = catUrl(c); a.setAttribute('data-cat', '');
        a.appendChild(el('span', null, c.name));
        a.appendChild(chevron('menu-arrow'));
        catBox.appendChild(a);
      });
    }

    if (footerCats) {
      footerCats.innerHTML = '';
      categories.forEach(function (c) {
        var a = document.createElement('a'); a.href = catUrl(c); a.textContent = c.name; footerCats.appendChild(a);
      });
    }
  }

  // حالة الفلترة + البيانات
  var cats = [];
  var all = [];
  var curFilter = 'all';

  function categoryIdBySlug(slug) {
    for (var i = 0; i < cats.length; i++) { if (cats[i].slug === slug) return cats[i].id; }
    return null;
  }

  function renderCard(a) {
    var item = el('article', 'search-result');
    var href = artUrl(a);
    item.setAttribute('data-href', href);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'link');
    item.setAttribute('aria-label', a.title);
    var body = el('div', 'sr-body');
    body.appendChild(el('div', 'sr-title', a.title));
    body.appendChild(el('div', 'sr-meta', dateStr(a.published_at) + ' · قراءة ' + readingTime(a.content)));
    item.appendChild(body);
    item.addEventListener('click', function () { window.location.href = href; });
    item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = href; } });
    return item;
  }

  function renderFilterBar() {
    var host = document.getElementById('home-filter');
    if (!host) return;
    host.innerHTML = '';
    var chips = [{ slug: 'all', name: 'الكل' }].concat(cats.map(function (c) { return { slug: c.slug, name: c.name }; }));
    chips.forEach(function (ch) {
      var b = el('button', 'filter-chip' + (curFilter === ch.slug ? ' is-active' : ''), ch.name);
      b.setAttribute('type', 'button');
      b.addEventListener('click', function () { curFilter = ch.slug; renderCardList(); renderFilterBar(); });
      host.appendChild(b);
    });
  }

  function renderCardList() {
    var host = document.getElementById('home-cards');
    if (!host) return;
    host.innerHTML = '';
    var items = curFilter === 'all' ? all : all.filter(function (a) { return a && a.category_id === categoryIdBySlug(curFilter); });
    if (!items.length) { host.appendChild(el('div', 'empty-state', 'لا توجد مقالات بعد.')); return; }
    items.forEach(function (a) { host.appendChild(renderCard(a)); });
  }

  async function renderHome() {
    try {
      var results = await Promise.all([
        M.listCategories(), M.latestArticles(200)
      ]);
      cats = results[0].data || [];
      all = (results[1].data || []).map(M.normalize);

      renderNav(cats);
      renderFilterBar();
      renderCardList();
    } catch (err) {
      console.error('MOCRO home render error:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', renderHome);
})();
