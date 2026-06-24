(function () {
  'use strict';

  var scene = document.getElementById('cStackScene');
  if (!scene) return;
  var cardA = document.getElementById('cCardA');
  var cardB = document.getElementById('cCardB');
  if (!cardA || !cardB) return;
  var cards = [cardA, cardB];

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  function mob() { return window.innerWidth <= 900; }

  /* ---- Base states -------------------------------------------------- */
  var FRONT = { tx: 0,   ty: 0,  tz: 40,  rx: 2, ry: -10, s: 1,   o: 1    };
  var BACK  = { tx: -40, ty: 20, tz: -80, rx: 3, ry: -16, s: .92, o: .75  };
  var EXIT  = { tx: 120, ty: 0,  tz: -100,rx: 2, ry: -18, s: .92, o: 0    };

  /* ---- Runtime state ------------------------------------------------- */
  var frontIdx  = 0;
  var animating = false;
  var hovered   = false;

  /* Spring */
  var tRX = 0, tRY = 0, cRX = 0, cRY = 0, vX = 0, vY = 0;

  /* Drag */
  var dragX0 = null, dragLive = 0;

  /* Time */
  var breathT = 0, lastTs = 0;

  /* ---- Helpers ------------------------------------------------------- */
  function cp(o) { return Object.assign({}, o); }

  function applyState(card, s) {
    card.style.transform =
      'translateX(' + s.tx.toFixed(1) + 'px)' +
      'translateY(' + s.ty.toFixed(1) + 'px)' +
      'translateZ(' + s.tz.toFixed(1) + 'px)' +
      'rotateX('    + s.rx.toFixed(2) + 'deg)' +
      'rotateY('    + s.ry.toFixed(2) + 'deg)' +
      'scale('      + s.s.toFixed(4)  + ')';
    card.style.opacity = s.o.toFixed(3);
    card.style.zIndex  = s.tz >= 0 ? 2 : 1;
  }

  /* ---- RAF loop ------------------------------------------------------ */
  function tick(ts) {
    requestAnimationFrame(tick);
    if (mob()) return;

    var dt = Math.min((ts - lastTs) * .001, .05);
    lastTs = ts;
    breathT += dt;

    /* Spring toward mouse target (stiffness 0.08, damping 0.72) */
    vX = vX * .72 + (tRX - cRX) * .08;
    vY = vY * .72 + (tRY - cRY) * .08;
    cRX += vX;
    cRY += vY;

    if (animating) return;

    var sin = Math.sin(breathT * Math.PI * 2 / 9); /* 9 s period */

    cards.forEach(function (card, i) {
      var front = (i === frontIdx);
      var base  = front ? FRONT : BACK;
      var bs    = front ? sin : -sin; /* opposite breath phase */

      var hTz = hovered ? (front ? 25 : -60) : 0;
      var hS  = (hovered && front) ? .02 : 0;

      applyState(card, {
        tx: base.tx + (front ? dragLive * .4 : dragLive * .15),
        ty: base.ty + bs * 3,
        tz: base.tz + hTz,
        rx: base.rx + cRX,
        ry: base.ry + bs * .8 + cRY,
        s:  base.s  + hS,
        o:  base.o
      });
    });
  }

  /* ---- Card swap ----------------------------------------------------- */
  function rotate() {
    if (animating || mob()) return;
    animating = true;

    var fc  = cards[frontIdx];
    var bi  = 1 - frontIdx;
    var bc  = cards[bi];
    var dur = '700ms';
    var ez  = 'cubic-bezier(.22,1,.36,1)';
    var tr  = 'transform ' + dur + ' ' + ez + ', opacity ' + dur + ' ' + ez;

    /* Set z-index before transitions so back rises above front */
    fc.style.zIndex = 1;
    bc.style.zIndex = 2;

    fc.style.transition = tr;
    bc.style.transition = tr;

    /* Front exits, back rises — overlap start */
    applyState(fc, cp(EXIT));
    applyState(bc, Object.assign(cp(FRONT), { o: 1 }));

    setTimeout(function () {
      frontIdx = bi;
      /* Snap exited card to back position instantly */
      fc.style.transition = 'none';
      applyState(fc, cp(BACK));
      setTimeout(function () {
        fc.style.transition = '';
        bc.style.transition = '';
        animating = false;
      }, 60);
    }, 760);
  }

  /* ---- Mouse tilt ---------------------------------------------------- */
  var cstack = document.getElementById('cStack');
  cstack.addEventListener('mouseenter', function () { hovered = true; });
  cstack.addEventListener('mouseleave', function () {
    hovered = false;
    tRX = 0;
    tRY = 0;
  });
  cstack.addEventListener('mousemove', function (e) {
    var r  = cstack.getBoundingClientRect();
    var nx = (e.clientX - r.left - r.width  * .5) / (r.width  * .5);
    var ny = (e.clientY - r.top  - r.height * .5) / (r.height * .5);
    tRY =  nx * 6;  /* ±6 deg */
    tRX = -ny * 4;  /* ±4 deg */
  });

  /* ---- Click back card to promote ------------------------------------ */
  cards.forEach(function (card, i) {
    card.addEventListener('click', function () {
      if (Math.abs(dragLive) > 5) return; /* suppress after drag */
      if (!animating && i !== frontIdx) rotate();
    });
  });

  /* ---- Drag (mouse) -------------------------------------------------- */
  cstack.addEventListener('mousedown', function (e) {
    dragX0 = e.clientX;
    dragLive = 0;
  });
  window.addEventListener('mousemove', function (e) {
    if (dragX0 === null) return;
    dragLive = Math.max(-40, Math.min(40, e.clientX - dragX0));
  });
  window.addEventListener('mouseup', function (e) {
    if (dragX0 === null) return;
    var dx = e.clientX - dragX0;
    dragX0 = null;
    if (Math.abs(dx) > 30) { dragLive = 0; rotate(); }
    else dragLive = 0;
  });

  /* ---- Drag (touch) -------------------------------------------------- */
  cstack.addEventListener('touchstart', function (e) {
    dragX0 = e.touches[0].clientX;
    dragLive = 0;
  }, { passive: true });
  cstack.addEventListener('touchmove', function (e) {
    if (dragX0 === null) return;
    dragLive = Math.max(-40, Math.min(40, e.touches[0].clientX - dragX0));
  }, { passive: true });
  cstack.addEventListener('touchend', function (e) {
    if (dragX0 === null) return;
    var dx = (e.changedTouches[0] || { clientX: dragX0 }).clientX - dragX0;
    dragX0 = null;
    if (Math.abs(dx) > 30) { dragLive = 0; rotate(); }
    else dragLive = 0;
  }, { passive: true });

  /* ---- Auto rotation every 7 s -------------------------------------- */
  function startAuto() {
    setInterval(function () { if (!mob()) rotate(); }, 7000);
  }

  /* ---- Init ---------------------------------------------------------- */
  if (reduce || mob()) {
    /* Static: show front card only */
    applyState(cardA, { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, s: 1, o: 1 });
    applyState(cardB, { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, s: 1, o: 0 });
    return;
  }

  /* Small defer so CSS initial slant renders first, then JS takes over */
  setTimeout(function () {
    cardA.style.transition = 'none';
    cardB.style.transition = 'none';
    applyState(cardA, cp(FRONT));
    applyState(cardB, cp(BACK));
    requestAnimationFrame(tick);
    startAuto();
  }, 50);

}());
