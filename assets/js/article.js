/**
 * MOCRO — article.js | dynamic article page (/article.html?slug=…)
 * Same visual language as home: monochrome + gold, editorial, RTL.
 * No emoji icons — only inline Material-style SVG icons.
 */
(function () {
  'use strict';
  if (!window.Mocro) return;
  var M = window.Mocro;

  function url(p) { var b = window.MOCRO_CONFIG.SITE_BASE; if (b && b.slice(-1) !== '/') b += '/'; return (b || '') + p; }
  function qs(n) { var v = new URLSearchParams(window.location.search).get(n); if (v) return v; var p = window.location.pathname.replace(/\/+$/, ''); var seg = p.split('/'); return seg.pop() || ''; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  var ICON_PATHS = {
    'person': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'verified': '<path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>',
    'chevron': '<polyline points="15 18 9 12 15 6"/>'
  };
  function icon(name, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICON_PATHS[name] || '';
    return s;
  }

  function verifiedBadge() {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon verified-badge');
    s.setAttribute('viewBox', '0 -960 960 960');
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'موثّق');
    s.innerHTML = ICON_PATHS['verified'] || '';
    return s;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function inlineMD(text) {
    var t = esc(text);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, src) {
      return '<img src="' + src + '" alt="' + esc(alt) + '" loading="lazy">';
    });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, href) {
      var safe = /^https?:\/\//i.test(href) || href.indexOf('javascript:') === -1;
      return safe ? '<a href="' + esc(href) + '"' + (/^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a>' : txt;
    });
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
    return t;
  }

  function renderContent(md) {
    if (!md) return '';
    var lines = md.split(/\r?\n/);
    var html = '';
    var listOpen = null;
    function closeList() { if (listOpen) { html += '</' + listOpen + '>'; listOpen = null; } }

    lines.forEach(function (line) {
      var t = line.trim();
      if (!t) { closeList(); return; }

      var h3 = t.match(/^###\s+(.*)/);
      if (h3) { closeList(); html += '<h3>' + inlineMD(h3[1]) + '</h3>'; return; }
      var h2 = t.match(/^##\s+(.*)/);
      if (h2) { closeList(); html += '<h2>' + inlineMD(h2[1]) + '</h2>'; return; }
      var h1 = t.match(/^#\s+(.*)/);
      if (h1) { closeList(); html += '<h2>' + inlineMD(h1[1]) + '</h2>'; return; }
      var hr = t.match(/^([-*_])\s*\1\s*\1\s*$/);
      if (hr) { closeList(); html += '<hr>'; return; }
      var ul = t.match(/^[-*]\s+(.*)/);
      if (ul) { if (listOpen !== 'ul') { closeList(); listOpen = 'ul'; html += '<ul>'; } html += '<li>' + inlineMD(ul[1]) + '</li>'; return; }
      var ol = t.match(/^\d+[.)]\s+(.*)/);
      if (ol) { if (listOpen !== 'ol') { closeList(); listOpen = 'ol'; html += '<ol>'; } html += '<li>' + inlineMD(ol[1]) + '</li>'; return; }
      var bq = t.match(/^>\s?(.*)/);
      if (bq) { closeList(); html += '<blockquote>' + inlineMD(bq[1]) + '</blockquote>'; return; }
      closeList();
      html += '<p>' + inlineMD(t) + '</p>';
    });
    closeList();
    return html;
  }

  function renderRelated(articles) {
    var grid = document.getElementById('related-grid');
    var nav = document.getElementById('related-nav');
    if (!grid) return;
    grid.innerHTML = '';
    if (nav) nav.innerHTML = '';
    if (!articles.length) { grid.innerHTML = '<div class="empty-state">لا توجد مقالات ذات صلة بعد.</div>'; return; }
    articles.forEach(function (a, i) {
      var item = el('article', 'related-item');
      var href = url('article/' + encodeURIComponent(a.slug));
      item.setAttribute('data-rslide', '');
      item.setAttribute('data-href', href);
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'link');
      item.setAttribute('aria-label', a.title);
      if (a.featured_image) {
        var thumb = el('div', 'related-thumb');
        var img = document.createElement('img');
        img.src = a.featured_image; img.alt = a.title; img.loading = 'lazy';
        thumb.appendChild(img);
        item.appendChild(thumb);
      }
      var body = el('div', 'journal-body');
      body.appendChild(el('h3', null, a.title));
      if (a.excerpt) body.appendChild(el('p', null, a.excerpt));
      item.appendChild(body);
      item.addEventListener('click', function () { window.location.href = href; });
      item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = href; } });
      grid.appendChild(item);
    });
    initRelatedSlider();
  }

  function initRelatedSlider() {
    var grid = document.getElementById('related-grid');
    var nav = document.getElementById('related-nav');
    if (!grid || !nav) return;
    var slides = Array.prototype.slice.call(grid.querySelectorAll('[data-rslide]'));
    if (!slides.length) return;
    var idx = 0;

    nav.innerHTML = '';
    slides.forEach(function (s, i) {
      var d = document.createElement('button');
      d.className = 'related-dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('type', 'button');
      d.setAttribute('aria-label', 'مقال ' + (i + 1));
      d.addEventListener('click', function () { showSlide(i); });
      nav.appendChild(d);
    });

    function showSlide(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, x) { s.classList.toggle('is-visible', x === idx); });
      var dots = nav.querySelectorAll('.related-dot');
      dots.forEach(function (d, x) { d.classList.toggle('is-active', x === idx); });
    }

    var sx = null, sy = null, lock = false;
    grid.style.touchAction = 'pan-y';
    grid.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      sx = ev.clientX; sy = ev.clientY; lock = false;
      try { grid.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    grid.addEventListener('pointermove', function (ev) {
      if (sx === null) return;
      var dx = ev.clientX - sx; var dy = ev.clientY - sy;
      if (!lock && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { sx = null; sy = null; return; }
      lock = true;
    });
    grid.addEventListener('pointerup', function (ev) {
      if (sx === null) { sx = null; sy = null; return; }
      var dx = ev.clientX - sx;
      var isRTL = document.documentElement.getAttribute('dir') === 'rtl' || (getComputedStyle && getComputedStyle(document.body).direction === 'rtl');
      if (Math.abs(dx) > 50) {
        if ((dx < 0 && !isRTL) || (dx > 0 && isRTL)) showSlide(idx + 1);
        else showSlide(idx - 1);
      }
      sx = null; sy = null;
    });
    grid.addEventListener('pointercancel', function () { sx = null; sy = null; });

    showSlide(0);
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) {
      return d.toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  function renderAuthorCard(author, publishedAt) {
    if (!author) return '';
    var wrap = el('div', 'author-card container');
    var inner = el('div', 'author-card-inner');

    var avatar;
    if (author.avatar) {
      avatar = document.createElement('img');
      avatar.className = 'author-card-avatar';
      avatar.src = author.avatar;
      avatar.alt = author.name || 'الكاتب';
      avatar.loading = 'lazy';
    } else {
      avatar = el('span', 'author-card-avatar placeholder');
      avatar.appendChild(icon('person'));
    }
    inner.appendChild(avatar);

    var body = el('div', 'author-card-body');
    var nameWrap = el('div', 'author-card-name');
    var nameSpan = el('span', null, author.name || '');
    nameWrap.appendChild(nameSpan);
    nameWrap.appendChild(verifiedBadge());
    body.appendChild(nameWrap);
    if (author.bio) body.appendChild(el('div', 'author-card-bio', author.bio));

    var dateStr = formatDate(publishedAt);
    if (dateStr) {
      var dateRow = el('div', 'author-card-date');
      dateRow.appendChild(el('span', null, dateStr));
      body.appendChild(dateRow);
    }

    inner.appendChild(body);

    wrap.appendChild(inner);
    return wrap;
  }

  function registerView(slug) {
    try {
      var key = 'mocro-viewed:' + slug; var last = localStorage.getItem(key); var now = Date.now();
      if (last && (now - parseInt(last, 10)) < 30 * 60 * 1000) return;
      localStorage.setItem(key, String(now));
      M.incrementView(slug).then(function () {}).catch(function () {});
    } catch (e) {}
  }

  async function render() {
    // Normalize legacy ?slug= URLs to clean /article/:slug (preserve SEO equity).
    var legacy = new URLSearchParams(window.location.search).get('slug');
    if (legacy) {
      window.location.replace(url('article/' + encodeURIComponent(legacy)));
      return;
    }
    var slug = qs('slug');
    var root = document.getElementById('article-root');
    if (!slug) { root.innerHTML = '<div class="container empty-state">لم يتم تحديد مقال.</div>'; return; }

    var res;
    try { res = await M.articleBySlug(slug); }
    catch (e) { root.innerHTML = '<div class="container empty-state">تعذّر تحميل المقال. حاول مرة أخرى.</div>'; return; }

    var a = M.normalize(res && res.data ? res.data : null);
    if (!a) { root.innerHTML = '<div class="container empty-state">المقال غير موجود أو غير منشور.</div>'; return; }

    document.title = a.title + ' — مُوكْرُو';
    if (a.excerpt) { var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', a.excerpt); }
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', url('article/' + encodeURIComponent(a.slug)));
    else { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); canon.setAttribute('href', url('article/' + encodeURIComponent(a.slug))); document.head.appendChild(canon); }

    root.innerHTML = '';

    var head = el('div', 'article-head container');

    if (a.category) {
      var bc = el('nav', 'breadcrumb');
      var homeLink = el('a', null, 'الرئيسية');
      homeLink.href = url('index.html');
      var sep = icon('chevron', 'breadcrumb-arrow');
      var catCrumb = el('a', null, a.category.name);
      catCrumb.href = url('category/' + encodeURIComponent(a.category.slug));
      bc.appendChild(homeLink);
      bc.appendChild(sep);
      bc.appendChild(catCrumb);
      head.appendChild(bc);
    }

    head.appendChild(el('h1', null, a.title));
    if (a.excerpt) head.appendChild(el('p', 'article-deck', a.excerpt));

    root.appendChild(head);

    var hero = el('div', 'article-hero container');
    if (a.featured_image) {
      var media = el('div', 'article-hero-media');
      var himg = document.createElement('img');
      himg.src = a.featured_image; himg.alt = a.title;
      himg.setAttribute('fetchpriority', 'high'); himg.decoding = 'async';
      media.appendChild(himg);
      hero.appendChild(media);
    }
    root.appendChild(hero);

    var body = el('div', 'article-body container');
    var content = el('div', 'article-content');
    content.innerHTML = renderContent(a.content);
    body.appendChild(content);

    var tags = a.tags || [];
    if (tags.length) {
      var tagWrap = el('div', 'article-tags');
      tags.forEach(function (t) { if (t) tagWrap.appendChild(el('span', 'tag-chip', t.name || t)); });
      body.appendChild(tagWrap);
    }

    root.appendChild(body);

    if (a.author) root.appendChild(renderAuthorCard(a.author, a.published_at));

    var rel;
    try { rel = await M.relatedArticles(a, 6); } catch (e) { rel = { data: [] }; }
    renderRelated((rel.data || []).map(M.normalize));

    registerView(a.slug);
  }

  document.addEventListener('DOMContentLoaded', render);
})();
