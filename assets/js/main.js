/* ============ MOCRO — Main JavaScript (production, DB-driven) ============ */
(function () {
  'use strict';

  // Theme is intentionally hard-locked to light (القالب نهار/أبيض فقط).

  var burger = document.querySelector('[data-burger]');
  var menu = document.getElementById('mobile-menu');
  var lastFocused = null;
  function openMenu() { if (!menu) return; lastFocused = document.activeElement; menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); if (burger) { burger.classList.add('is-active'); burger.setAttribute('aria-expanded', 'true'); } document.addEventListener('keydown', handleEscape); }
  function closeMenu() { if (!menu) return; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); if (burger) { burger.classList.remove('is-active'); burger.setAttribute('aria-expanded', 'false'); } document.removeEventListener('keydown', handleEscape); if (lastFocused) { lastFocused.focus(); lastFocused = null; } }
  function handleEscape(e) { if (e.key === 'Escape') closeMenu(); }
  if (burger) burger.addEventListener('click', function (e) { e.stopPropagation(); menu && menu.classList.contains('is-open') ? closeMenu() : openMenu(); });
  if (menu) {
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
      var link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (link) closeMenu();
    });
    document.addEventListener('click', function (e) { if (menu.classList.contains('is-open') && !menu.contains(e.target) && e.target !== burger) closeMenu(); });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id && id.length > 1) { var target = document.querySelector(id); if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); closeMenu(); } }
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); ro.unobserve(en.target); } }); }, { threshold: 0.12 });
    revealEls.forEach(function (e) { ro.observe(e); });
  } else { revealEls.forEach(function (e) { e.classList.add('in-view'); }); }

  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item.has-sub'));
  function closeAllDropdowns() { navItems.forEach(function (item) { item.classList.remove('open'); var t = item.querySelector('.nav-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }); }
  navItems.forEach(function (item) {
    var trigger = item.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) { e.stopPropagation(); var isOpen = item.classList.contains('open'); closeAllDropdowns(); if (!isOpen) { item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); } });
    item.addEventListener('mouseenter', function () { closeAllDropdowns(); item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); });
    item.addEventListener('mouseleave', function () { item.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllDropdowns(); });
})();
