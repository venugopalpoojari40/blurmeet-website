/* ============================================================
   BLUR — motion & behavior
   Animation reveals meaning. Nothing here is decoration.
   Scroll-driven (no IntersectionObserver) so reveals are
   reliable in every embedding / preview context.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = function () { return window.innerHeight || document.documentElement.clientHeight; };

  function inView(el, ratio) {
    var r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0) return false;
    var trigger = vh() * (ratio == null ? 0.86 : ratio);
    return r.top < trigger && r.bottom > 0;
  }

  /* ---- generic reveal ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  /* ---- living profile (disc-style, fades through the days) ---- */
  var states = [
    { label: "Monday feels like", vibe: "chasing something bigger than myself" },
    { label: "Friday feels like", vibe: "ready to forget the week entirely" },
    { label: "Sunday feels like", vibe: "slow, honest, in no hurry" },
    { label: "Tonight feels like", vibe: "just wanting a real conversation" }
  ];
  var screenEl = document.querySelector(".is-living");
  var labelEl = document.getElementById("livingLabel");
  var vibeEl = document.getElementById("livingVibe");
  var phone = screenEl ? screenEl.closest(".phone") : document.querySelector(".phone");
  var pIdx = 0, pTimer = null, pVisible = false;

  function paint(i) {
    if (!vibeEl) return;
    labelEl.textContent = states[i].label;
    vibeEl.textContent = states[i].vibe;
  }
  function advance() {
    pIdx = (pIdx + 1) % states.length;
    if (reduce) { paint(pIdx); return; }
    screenEl.classList.add("is-swapping");
    setTimeout(function () { paint(pIdx); screenEl.classList.remove("is-swapping"); }, 460);
  }
  function ensureRotation() {
    if (pTimer || !screenEl) return;
    pTimer = setInterval(function () { if (pVisible) advance(); }, 3800);
  }

  /* ---- why now progressive lighting ---- */
  var whyItems = Array.prototype.slice.call(document.querySelectorAll(".whynow__list p"));
  var whyLit = false;
  function lightWhy() {
    if (whyLit) return; whyLit = true;
    whyItems.forEach(function (p, n) {
      setTimeout(function () { p.classList.add("lit"); }, reduce ? 0 : n * 260 + 150);
    });
  }

  /* ---- discover: typewriter vibe ---- */
  var th = document.querySelector(".thresh");
  var typeEl = document.getElementById("discType");
  var vibes = [
    "would rather watch the rain together than keep texting",
    "more honest about what i don't know than most are comfortable with",
    "here for the kind of quiet that doesn't need filling"
  ];
  var typeStarted = false;
  function startTyping() {
    if (typeStarted || !typeEl) return; typeStarted = true;
    if (reduce) { typeEl.textContent = vibes[0]; return; }
    var vi = 0;
    function typeLine() {
      var line = vibes[vi], i = 0;
      (function tick() {
        typeEl.textContent = line.slice(0, i);
        if (i <= line.length) { i++; setTimeout(tick, 44); }
        else { setTimeout(eraseLine, 2600); }
      })();
    }
    function eraseLine() {
      var line = typeEl.textContent, i = line.length;
      (function tick() {
        typeEl.textContent = line.slice(0, i);
        if (i >= 0) { i--; setTimeout(tick, 17); }
        else { vi = (vi + 1) % vibes.length; setTimeout(typeLine, 380); }
      })();
    }
    typeLine();
  }

  /* ---- download payoff ---- */
  var dl = document.getElementById("download");
  var dlDone = false;
  var youAudio = document.getElementById("youAudio");
  var youAudioStarted = false;
  function revealDownload() {
    if (dlDone || !dl) return; dlDone = true;
    setTimeout(function () { dl.classList.add("revealed"); }, reduce ? 0 : 320);
  }
  function tickYouAudio() {
    if (!youAudio || reduce) return;
    if (window.matchMedia("(max-width:860px)").matches) return;
    var inDl = dl && inView(dl, 0.45);
    if (inDl) {
      if (!youAudioStarted) { youAudio.volume = 0.04; youAudio.loop = true; youAudioStarted = true; }
      if (youAudio.paused) youAudio.play().catch(function () {});
    } else {
      if (!youAudio.paused) youAudio.pause();
    }
  }

  /* ---- living profile: scroll-to-know-more reflections reveal ---- */
  var livingSection = document.querySelector(".living");
  var lpCard = document.getElementById("lpCard");
  var lpTrack = document.getElementById("lpTrack");
  var lpPhoto = document.getElementById("lpPhoto");
  var lpReflect = document.querySelector(".lp-reflect");
  var lpHint = document.getElementById("lpHint");
  function sizeLP() {
    if (!lpCard || !lpPhoto) return;
    var h = lpCard.clientHeight;
    lpPhoto.style.height = h + "px";
    if (lpReflect) lpReflect.style.minHeight = h + "px";
  }
  function updateLP() {
    if (!lpCard || !livingSection) return;
    if (!lpPhoto.style.height || lpPhoto.offsetHeight < lpCard.clientHeight - 1) sizeLP();
    var vhh = vh();
    var r = livingSection.getBoundingClientRect();
    // 0 while the phone sits centered (photo + hint), 1 once you've scrolled a little further
    var p = (vhh * 0.42 - r.top) / (vhh * 0.7);
    p = Math.max(0, Math.min(1, p));
    var maxScroll = Math.max(0, lpTrack.scrollHeight - lpCard.clientHeight);
    lpTrack.style.transform = "translateY(" + (-p * maxScroll).toFixed(1) + "px)";
    lpHint.style.opacity = p > 0.05 ? "0" : "1";
  }

  /* ---- thresh (static profile problem): scroll to reveal profile ---- */
  var threshSection = document.querySelector(".thresh");
  var threshCard = document.getElementById("threshCard");
  var threshTrack = document.getElementById("threshTrack");
  var threshPhoto = threshCard ? threshCard.querySelector(".lp-photo") : null;
  function sizeThresh() {
    if (!threshCard || !threshPhoto) return;
    var h = threshCard.clientHeight;
    threshPhoto.style.height = Math.round(h * 1.5) + "px";
  }
  function updateThresh() {
    if (!threshCard || !threshSection) return;
    if (!threshPhoto.style.height || threshPhoto.offsetHeight < threshCard.clientHeight - 1) sizeThresh();
    var vhh = vh();
    var r = threshSection.getBoundingClientRect();
    var p = (vhh * 0.42 - r.top) / (vhh * 0.7);
    p = Math.max(0, Math.min(1, p));
    var maxScroll = Math.max(0, threshTrack.scrollHeight - threshCard.clientHeight);
    threshTrack.style.transform = "translateY(" + (-p * maxScroll).toFixed(1) + "px)";
  }

  /* ---- editorial parallax: the words drift; devices stay still ---- */
  var mfWrap = document.querySelector(".manifesto");
  var mfSection = document.querySelector(".living");
  var bfWrap = document.querySelector(".belief");
  var bfSection = document.querySelector(".thresh");
  function driftParallax(wrap, section, dist) {
    if (reduce || !wrap || !section) return;
    var r = section.getBoundingClientRect();
    // 0 as the section enters from below, 1 as it exits past the top
    var p = (vh() - r.top) / (vh() + r.height);
    p = Math.max(0, Math.min(1, p));
    wrap.style.transform = "translate3d(0," + (-dist * p).toFixed(2) + "px,0)";
  }
  function manifestoParallax() {
    driftParallax(mfWrap, mfSection, 24);
    driftParallax(bfWrap, bfSection, 24);
  }

  /* ---- THE ORDER OF THINGS: scroll-scrubbed unblur ---- */
  var orderTrack = document.querySelector(".order__track");
  var orderPortrait = document.querySelector(".order__device");
  var orderImg = orderPortrait ? orderPortrait.querySelector(".order__img") : null;
  var orderIntro = document.querySelector(".order__intro");
  var orderPhases = orderPortrait ? Array.prototype.slice.call(orderPortrait.querySelectorAll(".ophase")) : [];
  var orderVibeEl = document.getElementById("orderVibe");
  var orderVibeBox = orderPortrait ? orderPortrait.querySelector(".order__phone .disc__vibe") : null;
  var orderVibes = [
    "here for the kind of quiet that doesn't need filling",
    "ask me the question you're actually curious about",
    "two people talking like no one's watching",
    "we talked for a week before anyone asked for a photo",
    "no longer a stranger"
  ];
  var orderBeats = Array.prototype.slice.call(document.querySelectorAll(".order__beat"));
  var orderJourney = orderPortrait ? orderPortrait.querySelector(".ojourney") : null;
  var orderCard = orderPortrait ? orderPortrait.querySelector(".order__card") : null;
  var orderProfile = orderJourney ? orderJourney.querySelector(".ophase__profile") : null;
  var orderBtlEl = orderJourney ? orderJourney.querySelector(".ojourney__btl") : null;
  var orderBtlTop = 0; // cached offsetTop — lazy-measured on first call, reset on resize
  var orderProg = document.querySelector(".order__progress span");
  var orderActive = -1;
  function restartMatchAnim(overlay) {
    if (!overlay || reduce) return;
    overlay.classList.remove("match--run");
    void overlay.offsetWidth; // force reflow so CSS animations restart cleanly
    overlay.classList.add("match--run");
  }
  var trustAnimTimer = null;
  function positionTrustHand(phase) {
    var hand = phase.querySelector('.tov__hand');
    var btn  = phase.querySelector('.chat__reveal-btn');
    if (!hand || !btn) return;
    var pr = phase.getBoundingClientRect();
    var br = btn.getBoundingClientRect();
    hand.style.left = Math.round(br.left - pr.left + (br.width - hand.offsetWidth) / 2) + 'px';
    hand.style.top  = Math.round(br.top  - pr.top) + 'px';
  }
  function restartTrustAnim(phase) {
    if (!phase || reduce) return;
    positionTrustHand(phase);
    phase.classList.remove("trust--run");
    void phase.offsetWidth;
    phase.classList.add("trust--run");
  }
  function scheduleTrustAnim(phase) {
    if (trustAnimTimer) { clearTimeout(trustAnimTimer); trustAnimTimer = null; }
    trustAnimTimer = setTimeout(function () { trustAnimTimer = null; restartTrustAnim(phase); }, 520);
  }
  function cancelTrustAnim() {
    if (trustAnimTimer) { clearTimeout(trustAnimTimer); trustAnimTimer = null; }
  }

  function smoothstep(a, b, t) {
    t = (t - a) / (b - a);
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }
  function updateOrder() {
    if (!orderTrack || !orderImg) return;
    if (window.matchMedia("(max-width:860px)").matches) return; // handled by beatObserver on mobile
    if (reduce) { orderImg.style.filter = "blur(0) brightness(.96)"; orderImg.style.transform = "scale(1)"; return; }
    var r = orderTrack.getBoundingClientRect();
    var total = r.height - vh();
    var p = total > 0 ? (-r.top) / total : 0;
    p = Math.max(0, Math.min(1, p));

    // continuous focus-pull: silhouette -> face (holds full blur through the Silhouette beat)
    var rev = smoothstep(0.30, 0.90, p);
    var blur = (1 - rev) * 34;
    var bright = 0.46 + smoothstep(0.28, 0.92, p) * 0.5;
    var scale = 1.08 - smoothstep(0, 1, p) * 0.08;
    orderImg.style.filter = "blur(" + blur.toFixed(2) + "px) brightness(" + bright.toFixed(3) + ")";
    orderImg.style.transform = "scale(" + scale.toFixed(4) + ")";
    if (orderProg) orderProg.style.transform = "scaleX(" + p.toFixed(4) + ")";

    // profile drifts into view during silhouette beat; completes before card scroll accelerates
    if (orderProfile) {
      var jp = (p - 0.18) / (0.28 - 0.18);
      jp = Math.max(0, Math.min(1, jp));
      jp = jp * jp * (3 - 2 * jp);
      orderProfile.style.transform = "translateY(" + ((1 - jp) * 52).toFixed(1) + "px)";
    }
    // card scroll: wide range (0.26→0.52) for a cinematic, unhurried reveal of BTL content
    if (orderJourney) {
      if (!orderBtlTop && orderBtlEl) orderBtlTop = orderBtlEl.offsetTop;
      var sp = (p - 0.26) / (0.52 - 0.26);
      sp = Math.max(0, Math.min(1, sp));
      sp = sp * sp * sp * (sp * (sp * 6 - 15) + 10); // smootherstep: zero velocity + acceleration at ends
      orderJourney.style.transform = "translateY(-" + (sp * orderBtlTop).toFixed(1) + "px)";
    }

    // opening statement fades out as the silhouette fades in
    var introO = 1 - smoothstep(0.07, 0.15, p);
    if (orderIntro) {
      orderIntro.style.opacity = introO.toFixed(3);
      orderIntro.style.transform = "translateY(" + ((1 - introO) * -16).toFixed(1) + "px)";
      orderIntro.classList.toggle("is-active", p < 0.13);
    }
    if (orderPortrait) orderPortrait.style.opacity = smoothstep(0.05, 0.16, p).toFixed(3);

    // beats: (intro) -> silhouette -> curiosity -> connection -> trust -> (unblur) the face was never the beginning
    var beat = p < 0.15 ? -1 : p < 0.32 ? 0 : p < 0.49 ? 1 : p < 0.66 ? 2 : p < 0.83 ? 3 : 4;
    if (beat !== orderActive) {
      orderActive = beat;
      for (var i = 0; i < orderBeats.length; i++) {
        orderBeats[i].classList.toggle("is-active", i === beat);
      }
      // beats 0+1 both keep journey active (card scroll reveals BTL); beat 2+ shifts to chat
      var phase = beat <= 1 ? 0 : beat - 1;
      for (var k = 0; k < orderPhases.length; k++) {
        orderPhases[k].classList.toggle("is-active", +orderPhases[k].getAttribute("data-phase") === phase);
      }
      var vibeIdx = Math.max(0, beat);
      if (orderVibeEl && orderVibes[vibeIdx]) orderVibeEl.textContent = orderVibes[vibeIdx];
      if (orderVibeBox) orderVibeBox.style.opacity = (beat >= 2 ? "0" : "1");
      if (beat === 2) restartMatchAnim(orderPortrait ? orderPortrait.querySelector(".match__overlay") : null);
      if (beat === 3) scheduleTrustAnim(orderPortrait ? orderPortrait.querySelector(".ophase[data-phase='2']") : null);
      if (beat !== 3) cancelTrustAnim();
      if (beat === 4 && isDesktopWide) markStorySeen();
    }
  }


  /* ---- mobile order: horizontal carousel + dot sync ---- */
  if (window.matchMedia("(max-width:860px)").matches) {
    var carousel = document.querySelector(".order__beats");
    var dotsEl   = document.querySelector(".order__dots");
    if (carousel && dotsEl) {
      var slides   = carousel.children;
      var slideN   = slides.length;
      for (var di = 0; di < slideN; di++) {
        var dot = document.createElement("span");
        dot.className = "order__dot" + (di === 0 ? " is-active" : "");
        dotsEl.appendChild(dot);
      }
      var dotNodes = dotsEl.children;
      var lastDot  = 0;
      function syncDots() {
        var idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
        idx = Math.max(0, Math.min(slideN - 1, idx));
        if (idx === lastDot) return;
        dotNodes[lastDot].classList.remove("is-active");
        dotNodes[idx].classList.add("is-active");
        lastDot = idx;
        // restart match animation when swiping to the connection slide (6th child, index 5)
        if (idx === 5) restartMatchAnim(slides[5] ? slides[5].querySelector(".match__overlay") : null);
        // restart trust overlay when swiping to the trust slide (8th child, index 7)
        if (idx === 7) scheduleTrustAnim(slides[7] ? slides[7].querySelector(".ophase--chat") : null);
        if (idx !== 7) cancelTrustAnim();
      }
      carousel.addEventListener("scroll", syncDots, { passive: true });
    }
  }

  /* ---- chapter indicator + story TOC ---- */
  var chapterIndicator = document.getElementById("chapterIndicator");
  var chapterLabel     = document.getElementById("chapterLabel");
  var storyToc         = document.getElementById("storyToc");
  var skipStoryBtn     = document.getElementById("skipStory");
  var isDesktopWide    = window.matchMedia("(min-width:1024px)").matches;
  var storySeen        = false;
  try { storySeen = localStorage.getItem("blur_story_seen") === "true"; } catch(e) {}
  var chapterSections = [
    { el: document.querySelector(".hero"),     label: "The Mistake" },
    { el: document.querySelector(".living"),   label: "Knowing"     },
    { el: document.querySelector(".feeling"),  label: "Feeling"     },
    { el: document.querySelector(".thresh"),   label: "Seeing"      },
    { el: document.querySelector(".order"),    label: "Meeting"     },
    { el: document.querySelector(".download"), label: "You"         }
  ];
  var activeChapter = "";
  var chapterSwapTimer = null;

  function setChapter(label) {
    if (label === activeChapter || !chapterIndicator) return;
    activeChapter = label;
    if (chapterSwapTimer) { clearTimeout(chapterSwapTimer); chapterSwapTimer = null; }
    if (!label) { chapterIndicator.classList.remove("is-visible"); return; }
    var wasVisible = chapterIndicator.classList.contains("is-visible");
    if (wasVisible) {
      chapterIndicator.classList.remove("is-visible");
      chapterSwapTimer = setTimeout(function () {
        chapterLabel.textContent = label;
        chapterIndicator.classList.add("is-visible");
      }, 300);
    } else {
      chapterLabel.textContent = label;
      chapterIndicator.classList.add("is-visible");
    }
  }

  function updateChapter() {
    var mid = vh() * 0.15;
    var found = "";
    for (var ci = 0; ci < chapterSections.length; ci++) {
      if (!chapterSections[ci].el) continue;
      if (chapterSections[ci].el.getBoundingClientRect().top < mid) {
        found = chapterSections[ci].label;
      }
    }
    if (storySeen && isDesktopWide && storyToc) {
      var tocItems = storyToc.querySelectorAll(".stoc-item");
      for (var ti = 0; ti < chapterSections.length && ti < tocItems.length; ti++) {
        tocItems[ti].classList.toggle("is-active", chapterSections[ti].label === found);
      }
    } else {
      if (!chapterIndicator) return;
      setChapter(found);
      if (skipStoryBtn && !storySeen && isDesktopWide && orderTrack) {
        var or = orderTrack.getBoundingClientRect();
        var inOrder = or.top <= 4 && or.bottom >= vh() - 4;
        skipStoryBtn.classList.toggle("is-visible", inOrder);
      }
    }
  }

  function markStorySeen() {
    if (storySeen) return;
    try { localStorage.setItem("blur_story_seen", "true"); } catch(e) {}
    storySeen = true;
    if (isDesktopWide) activateReturnMode();
  }

  function activateReturnMode() {
    if (chapterIndicator) { chapterIndicator.classList.remove("is-visible"); chapterIndicator.style.display = "none"; }
    if (skipStoryBtn) skipStoryBtn.classList.remove("is-visible");
    if (storyToc) { storyToc.classList.add("is-active"); storyToc.removeAttribute("aria-hidden"); }
    updateChapter();
  }

  /* TOC click handlers */
  if (storyToc) {
    var tocTargetEls = [
      document.querySelector(".hero"),
      document.querySelector(".living"),
      document.querySelector(".feeling"),
      document.querySelector(".thresh"),
      document.querySelector(".order"),
      document.querySelector(".download")
    ];
    var tocLinks = storyToc.querySelectorAll(".stoc-item");
    for (var tci = 0; tci < tocLinks.length; tci++) {
      (function(link, target) {
        link.addEventListener("click", function(e) {
          e.preventDefault();
          if (!target) return;
          var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
          window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
        });
      })(tocLinks[tci], tocTargetEls[tci]);
    }
  }

  /* Skip story button */
  if (skipStoryBtn) {
    skipStoryBtn.addEventListener("click", function() {
      markStorySeen();
      var dlSection = document.querySelector(".download");
      if (dlSection) {
        var top = dlSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      }
    });
  }

  /* init: activate return mode immediately if returning desktop visitor */
  if (storySeen && isDesktopWide) activateReturnMode();

  /* ---- single scroll pass ---- */
  var firstPass = true;
  function check() {
    for (var i = reveals.length - 1; i >= 0; i--) {
      if (inView(reveals[i])) {
        // anything already on-screen at load reveals instantly (never stuck hidden);
        // elements scrolled into view later get the soft fade.
        if (firstPass) reveals[i].classList.add("instant");
        reveals[i].classList.add("in");
        reveals.splice(i, 1);
      }
    }
    if (phone) { pVisible = inView(phone, 0.7); if (pVisible) ensureRotation(); }
    if (whyItems.length && inView(whyItems[0], 0.7)) lightWhy();
    if (th && inView(th, 0.45)) startTyping();
    if (dl && inView(dl, 0.55)) revealDownload();
    tickYouAudio();
    updateLP();
    updateThresh();
    updateOrder();
    manifestoParallax();
    updateChapter();
    firstPass = false;
  }

  window.addEventListener("resize", function() { check(); orderBtlTop = 0; });
  window.addEventListener("load", check);
  // continuous RAF loop — keeps phone-scroll parallax smooth on iOS
  // where scroll events are batched during momentum
  (function loop() { check(); requestAnimationFrame(loop); })();
  // settle passes for fonts / layout
  setTimeout(check, 120);
  setTimeout(check, 600);

  /* ---- early access modal ---- */
  var ea = document.getElementById("ea");
  var eaForm = document.getElementById("eaForm");
  var eaBody = ea ? ea.querySelector(".ea__body") : null;
  var eaDone = document.getElementById("eaDone");
  var eaError = document.getElementById("eaError");
  var eaLastFocus = null;

  /* ============================================================
     GOOGLE FORM CONNECTION  (blurmeet.com → modal → Google Form → Sheet)
     ------------------------------------------------------------
     TO ACTIVATE: open your "EarlyAccess UsersList" form → ⋮ →
     "Get pre-filled link", fill dummy values, copy the link, and read
     the entry IDs from it (e.g. ...&entry.123456=NAME&entry.789=EMAIL).
     Paste the form ID + each entry ID below. Until then, submissions
     are still captured locally as a backup (nothing is lost).
     ============================================================ */
  var GFORM = {
    id: "1FAIpQLSdyU_V6pYsv4uoDJvO3zkF2JJicBh0Gb_5fcOwzZTgh5wi0NQ",
    entry: {
      name:   "entry.1236505130",
      email:  "entry.1658026701",
      mobile: "entry.1081336978",
      intent: "entry.1375619699"
    }
  };
  function submitToGoogleForm(entry) {
    try {
      var url = "https://docs.google.com/forms/d/e/" + GFORM.id + "/formResponse";
      var data = new URLSearchParams();
      data.append(GFORM.entry.intent, entry.intent);
      data.append(GFORM.entry.name,   entry.name);
      data.append(GFORM.entry.email,  entry.email);
      if (entry.mobile) data.append(GFORM.entry.mobile, entry.mobile);
      // no-cors: response is opaque — fire-and-forget is intentional
      fetch(url, { method: "POST", mode: "no-cors", body: data }).catch(function () {});
    } catch (err) {}
  }

  function openEA() {
    if (!ea) return;
    eaLastFocus = document.activeElement;
    // always present the form fresh
    if (eaBody && eaDone) { eaBody.hidden = false; eaDone.hidden = true; }
    if (eaError) eaError.hidden = true;
    ea.classList.add("is-open");
    ea.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var focusEl = eaForm && eaForm.querySelector("input");
    setTimeout(function () { if (focusEl) focusEl.focus(); }, 120);
  }
  function closeEA() {
    if (!ea) return;
    ea.classList.remove("is-open");
    ea.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (eaLastFocus && eaLastFocus.focus) eaLastFocus.focus();
  }

  if (ea) {
    document.querySelectorAll(".cta, .store").forEach(function (b) {
      b.style.cursor = "pointer";
      b.addEventListener("click", function (e) { e.preventDefault(); openEA(); });
    });
    ea.querySelectorAll("[data-ea-close]").forEach(function (b) {
      b.addEventListener("click", closeEA);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ea.classList.contains("is-open")) closeEA();
    });
  }

  if (eaForm) {
    var eaSubmitting = false;
    var eaSubmitBtn = eaForm.querySelector(".ea__submit");

    function isAlreadyRegistered(email) {
      try {
        var list = JSON.parse(localStorage.getItem("blur_early_access_list") || "[]");
        return list.some(function (e) { return e.email.toLowerCase() === email.toLowerCase(); });
      } catch (err) { return false; }
    }

    function showSuccess(firstName) {
      var sub = document.getElementById("eaDoneSub");
      if (sub) sub.textContent = "The first conversations begin soon, " + firstName + ".";
      if (eaBody && eaDone) { eaBody.hidden = true; eaDone.hidden = false; }
      var done = eaDone && eaDone.querySelector("button");
      if (done) done.focus();
      setTimeout(closeEA, 2800);
    }

    // if modal is opened and this device already submitted, skip straight to success
    function openEAWithDupeCheck() {
      openEA();
      try {
        var last = JSON.parse(localStorage.getItem("blur_early_access") || "null");
        if (last && last.email) {
          setTimeout(function () { showSuccess(last.name.split(" ")[0]); }, 80);
        }
      } catch (err) {}
    }

    // re-wire CTA buttons to use the dupe-aware open
    document.querySelectorAll(".cta, .store").forEach(function (b) {
      b.style.cursor = "pointer";
      // remove previous listener by cloning; then re-attach
      var fresh = b.cloneNode(true);
      b.parentNode.replaceChild(fresh, b);
      fresh.addEventListener("click", function (e) { e.preventDefault(); openEAWithDupeCheck(); });
    });

    eaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (eaSubmitting) return;

      var name   = eaForm.name.value.trim();
      var email  = eaForm.email.value.trim();
      var mobile = eaForm.mobile.value.trim();
      var intent = (eaForm.intent && eaForm.intent.value) || "Dating";
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      eaForm.email.classList.toggle("is-invalid", !emailOk && email.length > 0);
      eaForm.name.classList.toggle("is-invalid", name.length === 0);
      if (!name || !emailOk) {
        eaError.textContent = !name ? "Please tell us your name." : "Please enter a valid email.";
        eaError.hidden = false;
        return;
      }
      eaError.hidden = true;

      // already registered on this device — show success without re-submitting
      if (isAlreadyRegistered(email)) {
        showSuccess(name.split(" ")[0]);
        return;
      }

      // disable button + loading state
      eaSubmitting = true;
      if (eaSubmitBtn) {
        eaSubmitBtn.disabled = true;
        eaSubmitBtn.textContent = "Sending…";
      }

      var entry = { name: name, email: email, mobile: mobile, intent: intent, at: new Date().toISOString() };

      // 1) persist locally first — deduplication source of truth
      try {
        localStorage.setItem("blur_early_access", JSON.stringify(entry));
        var all = JSON.parse(localStorage.getItem("blur_early_access_list") || "[]");
        all.push(entry);
        localStorage.setItem("blur_early_access_list", JSON.stringify(all));
      } catch (err) {}

      // 2) send to Google Form (no-cors — response is opaque; show success regardless)
      submitToGoogleForm(entry);

      // 3) brief delay for "Sending…" feedback, then show success
      setTimeout(function () {
        eaSubmitting = false;
        if (eaSubmitBtn) {
          eaSubmitBtn.disabled = false;
          eaSubmitBtn.innerHTML = "Request Early Access <span class=\"arrow\">→</span>";
        }
        showSuccess(name.split(" ")[0]);
      }, 600);
    });
  }

  /* ---- invite: copy blurmeet.com ---- */
  var eaCopy = document.getElementById("eaCopy");
  if (eaCopy) {
    eaCopy.addEventListener("click", function () {
      var url = eaCopy.getAttribute("data-url") || "blurmeet.com";
      var act = document.getElementById("eaCopyAct");
      function flash() {
        eaCopy.classList.add("is-copied");
        if (act) act.textContent = "Copied";
        setTimeout(function () {
          eaCopy.classList.remove("is-copied");
          if (act) act.textContent = "Copy";
        }, 1900);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(flash).catch(function () { fallback(); });
      } else { fallback(); }
      function fallback() {
        try {
          var ta = document.createElement("textarea");
          ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          flash();
        } catch (e) {}
      }
    });
  }

  /* ---- keyboard slide navigation: one arrow = one stop ----
     Each section is a stop; the pinned "Order of Things" track
     is expanded into its four beats so Curiosity / Connection /
     Trust / final each advance with a single keypress. */
  var navSections = [
    document.querySelector(".hero"),
    document.querySelector(".living"),
    document.querySelector(".feeling"),
    document.querySelector(".thresh"),
    document.querySelector(".order"),
    document.querySelector(".download")
  ].filter(Boolean);
  var orderBeatP = [0.05, 0.235, 0.405, 0.575, 0.745, 0.915]; // intro + 5 beats, centered in track progress

  function navStops() {
    var sy = window.scrollY || window.pageYOffset;
    var stops = [];
    for (var i = 0; i < navSections.length; i++) {
      var el = navSections[i];
      if (orderTrack && el.contains(orderTrack)) {
        var total = orderTrack.getBoundingClientRect().height - vh();
        var otop = orderTrack.getBoundingClientRect().top + sy;
        for (var b = 0; b < orderBeatP.length; b++) {
          stops.push(otop + orderBeatP[b] * Math.max(0, total));
        }
      } else {
        stops.push(el.getBoundingClientRect().top + sy);
      }
    }
    stops.sort(function (a, c) { return a - c; });
    return stops;
  }

  function goStop(dir) {
    var stops = navStops();
    var sy = window.scrollY || window.pageYOffset;
    var max = (document.documentElement.scrollHeight - vh());
    var tol = Math.max(6, vh() * 0.04);
    var target = null, i;
    if (dir > 0) {
      for (i = 0; i < stops.length; i++) { if (stops[i] > sy + tol) { target = stops[i]; break; } }
    } else {
      for (i = stops.length - 1; i >= 0; i--) { if (stops[i] < sy - tol) { target = stops[i]; break; } }
    }
    if (target == null) return false;
    target = Math.max(0, Math.min(max, Math.round(target)));
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    return true;
  }

  window.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    var k = e.key;
    var down = (k === "ArrowDown" || k === "PageDown" || k === "ArrowRight");
    var up = (k === "ArrowUp" || k === "PageUp" || k === "ArrowLeft");
    if (!down && !up) return;
    if (goStop(down ? 1 : -1)) e.preventDefault();
  });

  /* ---- wheel snap: one scroll = one beat inside the Order pinned section ---- */
  (function () {
    if (!orderTrack) return;
    var lock = false;
    var acc = 0;
    window.addEventListener("wheel", function (e) {
      if (window.matchMedia("(max-width:860px)").matches) return;
      var r = orderTrack.getBoundingClientRect();
      /* only active while the track is pinned (spans the full viewport) */
      if (r.top > 4 || r.bottom < vh() - 4) { acc = 0; return; }
      e.preventDefault();
      if (lock) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 40) return; /* ignore tiny trackpad drift */
      var dir = acc > 0 ? 1 : -1;
      acc = 0;
      if (!goStop(dir)) return; /* at a boundary — no lock, let next scroll exit */
      lock = true;
      setTimeout(function () { lock = false; }, 750);
    }, { passive: false });
  }());
})();
