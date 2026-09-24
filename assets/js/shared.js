/**
 * MOCRO — shared.js | category nav filler.
 */
(function () {
  'use strict';
  var M = window.Mocro || null;

  function base(path) {
    var b = (window.MOCRO_CONFIG && window.MOCRO_CONFIG.SITE_BASE) || '';
    if (b && b.slice(-1) !== '/') b += '/';
    if (b && path.slice(0, 5) !== 'http:' && path.slice(0, 6) !== 'https:') return b + path;
    return path;
  }
  function catUrl(c) { return base('category/' + encodeURIComponent(c.slug)); }

  function chevron(cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    return s;
  }

  function populateCategoryNav(categories) {
    var desktopSub = document.getElementById('nav-categories-desktop');
    var mobileMenu = document.getElementById('mobile-menu');
    var footerCats = document.getElementById('footer-categories');

    if (desktopSub) {
      desktopSub.innerHTML = '';
      categories.forEach(function (c, i) {
        var a = document.createElement('a');
        a.href = catUrl(c); a.setAttribute('role', 'menuitem');
        var span = document.createElement('span'); span.textContent = c.name; a.appendChild(span);
        var num = document.createElement('span'); num.className = 'sub-num';
        num.textContent = String(i + 1).padStart(2, '0'); a.appendChild(num);
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
        var span = document.createElement('span'); span.textContent = c.name; a.appendChild(span);
        a.appendChild(chevron('menu-arrow'));
        catBox.appendChild(a);
      });
    }

    if (footerCats && !footerCats.childElementCount) {
      footerCats.innerHTML = '';
      categories.forEach(function (c) {
        var a = document.createElement('a');
        a.href = catUrl(c); a.textContent = c.name;
        footerCats.appendChild(a);
      });
    }
  }

  function loadCategories() {
    if (!M) {
      setTimeout(loadCategories, 300);
      return;
    }
    M.listCategories().then(function (cr) {
      populateCategoryNav((cr && cr.data) || []);
    }).catch(function () {
      setTimeout(loadCategories, 1500);
    });
  }

  function init() {
    loadCategories();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.MocroShared = {
    populateCategoryNav: populateCategoryNav,
    base: base
  };
})();
