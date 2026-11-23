/* Polygraph pages: the small script behind the guide, press kit, licence and refunds pages.
   Everything here is an extra: with scripts off the pages read the same, the clips show their
   posters with ordinary controls, and every link works. */
(function () {
  var doc = document, still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function make(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- launch: Tuesday, December 8, 2026 at 18:00 Istanbul time (15:00 UTC) ----------
     The same moment and rules as /assets/js/launch.js on the main site, so change both together.
     Before launch a store link leads to the email sign-up under "Polygraph comes out on December 8" on the home page.
     Superhive publishes by itself at 9am Central and its buttons wait ten more minutes. Blender Extensions goes
     live when its review passes: set EXTENSIONS_LIVE to true once https://extensions.blender.org/add-ons/polygraph/
     opens for everyone. After launch a store that isn't open yet loses its button; the Gumroad one beside it stays. */
  var LAUNCH = Date.UTC(2026, 11, 8, 15), SUPERHIVE_OPENS = LAUNCH + 10 * 60 * 1000, EXTENSIONS_LIVE = false;
  var now = Date.now(), launched = now >= LAUNCH;
  all('a[href*="gumroad.com/l/"], a[href*="superhivemarket.com/products/"], a[href*="extensions.blender.org/add-ons/"]').forEach(function (a) {
    var h = a.href;
    var open = h.indexOf('extensions.blender.org') > -1 ? launched && EXTENSIONS_LIVE : h.indexOf('superhivemarket.com') > -1 ? now >= SUPERHIVE_OPENS : launched;
    if (open) return;
    if (launched) { a.style.display = 'none'; return; }
    a.setAttribute('href', '/#news');
    a.title = 'On sale from December 8. Leave your email and we\'ll tell you the moment it is out.';
  });

  /* Opened straight from a folder (file://) a link to "license/" shows a file listing, not the page.
     Point such links at the index.html inside. On the web the addresses stay clean. */
  if (location.protocol === 'file:') {
    all('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|#)/.test(h)) return;
      var m = h.match(/^([^#?]*)(#.*)?$/); if (!m) return;
      if (m[1] === '' || /\/$/.test(m[1]) || m[1] === '.' || m[1] === '..') a.setAttribute('href', m[1].replace(/\/?$/, '/') + 'index.html' + (m[2] || ''));
    });
  }

  /* ---------- clips ----------
     The short loops play, muted, while they are on screen, and each has its own pause button.
     For anyone who has asked for less motion nothing starts by itself: the poster shows, with controls. */
  var loops = all('video.loop'), io = null, held = [];
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  loops.forEach(function (v, i) {
    var box = make('div', 'loopbox'); v.parentNode.insertBefore(box, v); box.appendChild(v);
    var cap = v.closest('figure') && v.closest('figure').querySelector('figcaption b');
    var name = cap ? cap.textContent.replace(/\.$/, '') : 'clip ' + (i + 1);
    var b = make('button', 'loop-btn'); b.type = 'button'; box.appendChild(b);
    function label() { var off = held[i] || v.paused; b.textContent = off ? '▶ PLAY' : '❚❚ PAUSE'; b.setAttribute('aria-label', (off ? 'Play' : 'Pause') + ' the clip: ' + name); }
    b.addEventListener('click', function () { if (v.paused) { held[i] = false; play(v); } else { held[i] = true; v.pause(); } label(); });
    v.addEventListener('play', label); v.addEventListener('pause', label); label();
    v.setAttribute('aria-label', 'Clip: ' + name);
    /* a click on the picture opens it full screen, to read the panel up close */
    v.addEventListener('click', function () {
      if (v.controls) return;
      if (doc.fullscreenElement) { doc.exitFullscreen(); return; }
      if (v.requestFullscreen) { var p = v.requestFullscreen(); if (p && p.catch) p.catch(function () {}); }
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
  });
  function setup() {
    if (io) { io.disconnect(); io = null; }
    if (!loops.length) return;
    if (still && still.matches) { loops.forEach(function (v) { v.pause(); v.controls = true; }); return; }
    loops.forEach(function (v) { v.controls = false; v.muted = true; });
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = loops.indexOf(e.target);
        if (e.isIntersecting) { if (!held[i]) { e.target.preload = 'auto'; play(e.target); } } else e.target.pause();
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { io.observe(v); });
  }
  setup();
  if (still && still.addEventListener) still.addEventListener('change', setup);

  /* ---------- contents: mark the section being read ---------- */
  var links = all('.index a[href^="#"]'), secs = links.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
  if (links.length && 'IntersectionObserver' in window) {
    var seen = {}, spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var hit = -1; secs.forEach(function (s, i) { if (s && seen[s.id] && hit < 0) hit = i; });
      if (hit < 0) return;
      links.forEach(function (a, i) { if (i === hit) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-15% 0px -70% 0px' });
    secs.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- budgets: find one by name, or show only the ones in Free ---------- */
  var table = doc.querySelector('table.budgets');
  if (table) {
    var rows = all('tbody tr', table), wrap = table.closest('.tablewrap') || table;
    var bar = make('div', 'finder'), l1 = make('label', '', 'Find a budget '), q = make('input'), l2 = make('label'), free = make('input'), out = make('output');
    q.type = 'search'; q.placeholder = 'Quest, VRChat, Roblox…'; q.autocomplete = 'off'; q.spellcheck = false; l1.appendChild(q);
    free.type = 'checkbox'; l2.appendChild(free); l2.appendChild(doc.createTextNode('Only the five in Free'));
    out.setAttribute('aria-live', 'polite');
    bar.appendChild(l1); bar.appendChild(l2); bar.appendChild(out); wrap.parentNode.insertBefore(bar, wrap);
    var sift = function () {
      var s = q.value.trim().toLowerCase(), n = 0;
      rows.forEach(function (r) {
        var ok = (!s || r.textContent.toLowerCase().indexOf(s) >= 0) && (!free.checked || r.querySelector('.tag.free'));
        r.hidden = !ok; if (ok) n++;
      });
      out.textContent = n === rows.length ? 'All ' + n + ' budgets' : n === 0 ? 'No budget matches' : n + ' of ' + rows.length + ' budgets';
    };
    q.addEventListener('input', sift); free.addEventListener('change', sift); sift();
  }

  /* ---------- press kit: copy the ready-made descriptions ---------- */
  if (navigator.clipboard && navigator.clipboard.writeText) {
    all('blockquote.copy').forEach(function (bq) {
      var b = make('button', 'copy-btn', 'COPY THIS TEXT'); b.type = 'button'; bq.appendChild(b);
      b.addEventListener('click', function () {
        navigator.clipboard.writeText(bq.querySelector('p').textContent.trim()).then(function () {
          b.textContent = 'COPIED ✓'; setTimeout(function () { b.textContent = 'COPY THIS TEXT'; }, 2200);
        }, function () { b.textContent = 'COULD NOT COPY. SELECT IT INSTEAD.'; });
      });
    });
  }
})();
