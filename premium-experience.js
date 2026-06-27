/* ============================================================
   BLUR premium experience layer
   Progressive enhancement: WebGL ambience, GSAP timing, cursor light,
   and physically restrained depth interactions.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var mobile = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  var smallScreen = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  var root = document.documentElement;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var scrollY = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function setPointer(e) {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    mouse.tx = (e.clientX / w) * 2 - 1;
    mouse.ty = (e.clientY / h) * 2 - 1;
    /* --mx/--my/--mxd/--myd intentionally not set here — global cursor tracking removed */
  }

  if (!reduce && window.Lenis) {
    var lenis = new Lenis({
      duration: 1.08,
      easing: function (t) { return 1 - Math.pow(1 - t, 4); },
      smoothWheel: true,
      wheelMultiplier: 0.86,
      touchMultiplier: 1.12
    });
    function lenisRaf(time) { lenis.raf(time); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
  }

  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });

    if (!reduce && !smallScreen) {
      /* Hero entrance — data-reveal owns opacity/transform; GSAP owns filter+tracking */
      gsap.fromTo('.hero h1',
        { filter: 'blur(10px)', letterSpacing: '0.022em' },
        { filter: 'blur(0px)', letterSpacing: '0em', duration: 1.8, delay: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo('.hero__sub',
        { filter: 'blur(6px)' },
        { filter: 'blur(0px)', duration: 1.2, delay: 0.85, ease: 'power2.out' }
      );
      gsap.fromTo('.hero .cta',
        { filter: 'blur(6px)' },
        { filter: 'blur(0px)', duration: 1.0, delay: 1.2, ease: 'power2.out' }
      );
    }

    if (!reduce && !smallScreen && window.ScrollTrigger) {
      gsap.utils.toArray('.section, .thresh, .order, .download').forEach(function (section) {
        gsap.fromTo(section, { '--sectionGlow': 0 }, {
          '--sectionGlow': 1,
          scrollTrigger: { trigger: section, start: 'top 78%', end: 'center 38%', scrub: 0.7 }
        });
      });

      gsap.utils.toArray('.phone').forEach(function (phone) {
        gsap.fromTo(phone, { y: 34, rotateX: 4, filter: 'saturate(.92)' }, {
          y: 0,
          rotateX: 0,
          filter: 'saturate(1.08)',
          scrollTrigger: { trigger: phone, start: 'top 92%', end: 'top 42%', scrub: 0.85 }
        });
      });

      gsap.utils.toArray('.stmt, .mf-sub, .mf-hero, .bf-hero, .bf-q, .download__brand').forEach(function (el) {
        gsap.fromTo(el, { letterSpacing: '0.018em', filter: 'blur(6px)' }, {
          letterSpacing: '0em',
          filter: 'blur(0px)',
          scrollTrigger: { trigger: el, start: 'top 86%', end: 'top 58%', scrub: 0.9 }
        });
      });
    }
  }

  function bindTilt(el, strength) {
    if (!finePointer || reduce || !el) return;
    var sx = strength || 8;
    var sy = sx * 0.72;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tiltX', (-ny * sy).toFixed(2) + 'deg');
      el.style.setProperty('--tiltY', (nx * sx).toFixed(2) + 'deg');
      el.style.setProperty('--cardMx', (e.clientX - r.left).toFixed(1) + 'px');
      el.style.setProperty('--cardMy', (e.clientY - r.top).toFixed(1) + 'px');
      el.classList.add('is-lit');
    }, { passive: true });
    el.addEventListener('pointerleave', function () {
      el.style.setProperty('--tiltX', '0deg');
      el.style.setProperty('--tiltY', '0deg');
      el.classList.remove('is-lit');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.phone, .foot__card, .ea__dialog'), function (el) { bindTilt(el, 5); });
  Array.prototype.forEach.call(document.querySelectorAll('.cta, .ea__submit, .store, .soc, .foot__row'), function (el) { bindTilt(el, 3); });

  /* bindMagnet removed — physical button movement on cursor was unwanted */

  var cursor = document.getElementById('premiumCursor');
  function updateCursor() {
    if (!cursor || !finePointer || reduce) return;
    var x = (mouse.x + 1) * 0.5 * window.innerWidth;
    var y = (mouse.y + 1) * 0.5 * window.innerHeight;
    cursor.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
  }

  function initThree() {
    var canvas = document.getElementById('premiumScene');
    if (!canvas || !window.THREE || reduce) return null;

    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.65));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    var warm = new THREE.Color(0xc9a96e);
    var rose = new THREE.Color(0x7c5362);
    var blue = new THREE.Color(0x526a82);
    var light = new THREE.PointLight(warm, 2.2, 18);
    light.position.set(2.5, 2, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xf5f0e8, 0.32));

    var count = mobile ? 260 : 680;
    var geom = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    var scales = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scales[i] = Math.random();
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    var mat = new THREE.PointsMaterial({ color: 0xc9a96e, size: mobile ? 0.016 : 0.022, transparent: true, opacity: 0.58, depthWrite: false, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geom, mat);
    scene.add(points);

    var torus = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending })
    );
    torus.rotation.set(1.18, 0.08, -0.24);
    scene.add(torus);

    var glass = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 1),
      new THREE.MeshPhysicalMaterial({ color: 0xf5f0e8, roughness: 0.18, metalness: 0.08, transparent: true, opacity: 0.08, transmission: 0.45, thickness: 0.8 })
    );
    glass.position.set(3.5, -1.45, -1.4);
    scene.add(glass);

    function resize() {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    return { renderer: renderer, scene: scene, camera: camera, points: points, torus: torus, glass: glass, light: light, colors: { warm: warm, rose: rose, blue: blue } };
  }

  var webgl = initThree();
  var last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = Math.min((t - last) || 16, 48) / 1000;
    last = t;
    mouse.x = lerp(mouse.x, mouse.tx, 0.075);
    mouse.y = lerp(mouse.y, mouse.ty, 0.075);
    scrollY = window.scrollY || window.pageYOffset || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var sp = clamp(scrollY / max, 0, 1);
    root.style.setProperty('--scrollP', sp.toFixed(4));
    root.style.setProperty('--scrollShiftX', (-sp * 12).toFixed(2) + 'vw');
    root.style.setProperty('--scrollShiftY', (sp * 8).toFixed(2) + 'vh');
    updateCursor();

    if (!webgl) return;
    var sceneTone = sp < 0.24 ? 0 : sp < 0.5 ? 1 : sp < 0.78 ? 2 : 3;
    var color = sceneTone === 1 ? webgl.colors.rose : sceneTone === 2 ? webgl.colors.blue : webgl.colors.warm;
    webgl.light.color.lerp(color, 0.035);
    webgl.light.position.x = 2.4 + mouse.x * 2.2;
    webgl.light.position.y = 1.8 - mouse.y * 1.4;
    webgl.camera.position.x = mouse.x * 0.45;
    webgl.camera.position.y = -mouse.y * 0.32;
    webgl.camera.position.z = 8.8 - sp * 1.7;
    webgl.camera.lookAt(0, 0, 0);
    webgl.points.rotation.y += dt * (0.018 + sp * 0.018);
    webgl.points.rotation.x = lerp(webgl.points.rotation.x, -mouse.y * 0.08, 0.03);
    webgl.torus.rotation.z += dt * 0.045;
    webgl.torus.rotation.x = 1.18 + mouse.y * 0.08 + sp * 0.5;
    webgl.torus.rotation.y = mouse.x * 0.12;
    webgl.glass.rotation.x += dt * 0.09;
    webgl.glass.rotation.y += dt * 0.12;
    webgl.glass.position.x = 3.5 - sp * 5.4 + mouse.x * 0.22;
    webgl.glass.position.y = -1.45 + Math.sin(t * 0.00045) * 0.16 - mouse.y * 0.18;
    webgl.renderer.render(webgl.scene, webgl.camera);
  }
  requestAnimationFrame(frame);
}());