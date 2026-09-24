/**
 * MOCRO — search.js | live search inside the mobile menu.
 * Results appear below the field as you type (max 6, scrollable).
 */
(function () {
  'use strict';
  if (!window.Mocro) return;
  var M = window.Mocro;

  var MAX_RESULTS = 6;

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function url(p) { var b = window.MOCRO_CONFIG.SITE_BASE; if (b.slice(-1) !== '/') b += '/'; return b + p; }

  function renderInto(results, container) {
    container.innerHTML = '';
    if (!results || !results.length) {
      container.innerHTML = '<div class="search-empty">لا نتائج مطابقة.</div>';
      return;
    }
    var list = results.slice(0, MAX_RESULTS);
    list.forEach(function (a) {
      var row = el('a', 'search-result');
      row.href = url('article/' + encodeURIComponent(a.slug));
      var body = el('div', 'sr-body');
      body.appendChild(el('div', 'sr-title', a.title));
      body.appendChild(el('div', 'sr-meta', a.categories ? a.categories.name : ''));
      row.appendChild(body);
      container.appendChild(row);
    });
  }

  function bind(input, results) {
    if (!input || !results) return;
    var debounce = null;
    function syncVisibility(q) {
      var hasQuery = q && q.length > 0;
      var catBox = document.getElementById('menu-categories');
      if (catBox) catBox.style.display = hasQuery ? 'none' : '';
      if (results) results.style.display = hasQuery ? '' : 'none';
    }
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var q = input.value.trim();
      if (!q) {
        results.innerHTML = '';
        syncVisibility('');
        return;
      }
      syncVisibility(q);
      debounce = setTimeout(function () {
        M.search(q, 20).then(function (res) { renderInto(res.data || [], results); })
          .catch(function () { results.innerHTML = '<div class="search-empty">حدث خطأ.</div>'; });
      }, 250);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var menuInput = document.getElementById('menu-search-input');
    var menuResults = document.getElementById('menu-search-results');
    if (menuResults) menuResults.style.display = 'none';
    bind(menuInput, menuResults);
  });
})();
