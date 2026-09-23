/* =========================================================
   Safe Streets Squad — script.js
   Navigation, scroll effects, counters, lightbox,
   custom audio players and newsletter form.
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var progressBar = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");

  /* ---------- Mobile navigation ---------- */
  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  document.addEventListener("click", function (e) {
    if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMenu();
    }
  });

  /* ---------- Scroll: header shadow, progress bar, back-to-top ---------- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 8);
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    backToTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Active nav link based on section in view ---------- */
  // Sections that belong to each nav item
  var navMap = {
    home: "home",
    issue: "issue",
    findings: "issue",
    solutions: "solutions",
    research: "research",
    interviews: "research",
    campaign: "research",
    survey: "survey"
  };

  function setActive(id) {
    var target = navMap[id] || id;
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + target);
    });
  }

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    Object.keys(navMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".counter");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lastFocus = null;

  function openLightbox(src, caption, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || caption || "";
    lbCap.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lbImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      openLightbox(btn.getAttribute("data-lightbox"), btn.getAttribute("data-caption"), img ? img.alt : "");
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Only one media element plays at a time ---------- */
  var allMedia = Array.prototype.slice.call(document.querySelectorAll(".media-el"));
  allMedia.forEach(function (m) {
    m.addEventListener("play", function () {
      allMedia.forEach(function (other) {
        if (other !== m && !other.paused) other.pause();
      });
    });
  });

  /* ---------- Custom audio players ---------- */
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  // Deterministic pseudo-random bar heights so each player looks unique
  function seededBars(seed, count) {
    var bars = [];
    var x = seed * 9301 + 49297;
    for (var i = 0; i < count; i++) {
      x = (x * 9301 + 49297) % 233280;
      var r = x / 233280;
      var wave = Math.sin(i / 3 + seed) * 0.25 + 0.55;
      bars.push(Math.max(0.18, Math.min(1, wave * 0.6 + r * 0.55)));
    }
    return bars;
  }

  var speeds = [1, 1.25, 1.5, 2, 0.75];

  document.querySelectorAll("[data-player]").forEach(function (player, idx) {
    var audio = player.querySelector("audio");
    var playBtn = player.querySelector(".play-btn");
    var seek = player.querySelector(".seek");
    var cur = player.querySelector(".cur");
    var dur = player.querySelector(".dur");
    var speedBtn = player.querySelector(".speed-btn");
    var wave = player.querySelector(".wave");
    var card = player.closest(".audio-card");
    var label = playBtn.getAttribute("aria-label") || "Play";
    var speedIndex = 0;

    // Build waveform bars
    var count = 48;
    var heights = seededBars(idx + 1, count);
    var bars = heights.map(function (h) {
      var b = document.createElement("i");
      b.style.height = Math.round(h * 100) + "%";
      wave.appendChild(b);
      return b;
    });

    function paintProgress(ratio) {
      var lit = Math.round(ratio * count);
      for (var i = 0; i < count; i++) bars[i].classList.toggle("on", i < lit);
    }

    audio.addEventListener("loadedmetadata", function () {
      dur.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      var ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      seek.value = ratio * 100;
      cur.textContent = formatTime(audio.currentTime);
      paintProgress(ratio);
    });

    audio.addEventListener("play", function () {
      player.classList.add("playing");
      if (card) card.classList.add("is-playing");
      playBtn.setAttribute("aria-label", label.replace("Play", "Pause"));
    });

    audio.addEventListener("pause", function () {
      player.classList.remove("playing");
      if (card) card.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", label);
    });

    audio.addEventListener("ended", function () {
      audio.currentTime = 0;
      paintProgress(0);
    });

    playBtn.addEventListener("click", function () {
      if (audio.paused) {
        var p = audio.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      } else {
        audio.pause();
      }
    });

    seek.addEventListener("input", function () {
      if (audio.duration) {
        audio.currentTime = (seek.value / 100) * audio.duration;
        paintProgress(seek.value / 100);
      }
    });

    speedBtn.addEventListener("click", function () {
      speedIndex = (speedIndex + 1) % speeds.length;
      audio.playbackRate = speeds[speedIndex];
      speedBtn.textContent = speeds[speedIndex] + "x";
    });
  });

  /* ---------- Newsletter form (static site: confirms on the page) ---------- */
  var form = document.getElementById("newsletterForm");
  var emailInput = document.getElementById("newsEmail");
  var formMsg = document.getElementById("formMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = emailInput.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    if (!valid) {
      emailInput.classList.add("invalid");
      formMsg.className = "form-msg err";
      formMsg.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }

    emailInput.classList.remove("invalid");
    formMsg.className = "form-msg ok";
    formMsg.textContent = "Thank you for joining us! We'll keep you posted on safer streets.";
    form.reset();
  });

  emailInput.addEventListener("input", function () {
    emailInput.classList.remove("invalid");
    if (formMsg.classList.contains("err")) formMsg.textContent = "";
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
