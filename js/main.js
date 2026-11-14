(function () {
  var h = document.documentElement;

  // Idioma ES/EN
  function setLang(v) {
    h.dataset.lang = v; h.lang = v;
    try { localStorage.setItem('lang', v); } catch (e) {}
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.set); });
  });

  // Cabecera sólida al hacer scroll
  var head = document.querySelector('header');
  function onScroll() { head.classList.toggle('solid', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Año del pie
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  // Deslizador fotografía real / render
  var ba = document.getElementById('ba');
  if (ba) {
    var input = ba.querySelector('input'), dragging = false;
    function setP(p) {
      p = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--p', p + '%'); input.value = Math.round(p);
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      setP((e.clientX - r.left) / r.width * 100);
    }
    ba.addEventListener('pointerdown', function (e) {
      dragging = true; fromEvent(e);
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) { ba.addEventListener(t, function () { dragging = false; }); });
    input.addEventListener('input', function () { setP(+input.value); });
  }

  // Vídeo pequeño: siempre sin sonido y en bucle
  var v = document.getElementById('promo'), vmOpen = false;
  var tryPlay = function (el) { var p = el.play(); if (p && p.catch) p.catch(function () {}); };
  if (v) {
    v.muted = true; v.loop = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting && !vmOpen) tryPlay(v); else v.pause(); });
      }, { threshold: 0.2 }).observe(v);
    } else { tryPlay(v); }
  }

  // Vídeo en grande, con sonido y desde el principio
  var vm = document.getElementById('vm'), openBtn = document.getElementById('promo-open');
  if (vm && openBtn) {
    var big = vm.querySelector('video'), vmLast = null;
    var openVideo = function () {
      vmLast = document.activeElement; vmOpen = true;
      if (v) v.pause();
      if (!big.getAttribute('src')) big.src = big.dataset.src;
      try { big.currentTime = 0; } catch (e) {}
      big.muted = false; big.volume = 1;
      vm.classList.add('open'); document.body.style.overflow = 'hidden';
      tryPlay(big); // dentro del clic, para que el móvil permita el sonido
      vm.querySelector('.x').focus();
    };
    var closeVideo = function () {
      if (!vmOpen) return;
      vmOpen = false; big.pause();
      try { big.currentTime = 0; } catch (e) {}
      vm.classList.remove('open'); document.body.style.overflow = '';
      if (v) tryPlay(v);
      if (vmLast) vmLast.focus();
    };
    openBtn.addEventListener('click', openVideo);
    vm.querySelector('.x').addEventListener('click', closeVideo);
    vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });
    big.addEventListener('ended', closeVideo);
    big.addEventListener('webkitendfullscreen', function () { if (big.ended) closeVideo(); });
    document.addEventListener('keydown', function (e) { if (vmOpen && e.key === 'Escape') closeVideo(); });
  }

  // Visor de imágenes de la galería
  var lb = document.getElementById('lb');
  if (!lb) return;
  var lbImg = lb.querySelector('img');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gal button')), cur = 0, last = null;
  function show(i) {
    cur = (i + items.length) % items.length;
    lbImg.src = items[cur].dataset.full;
    lbImg.alt = items[cur].querySelector('img').alt;
  }
  function open(i) { last = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
  items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.pv').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  lb.querySelector('.nx').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();
