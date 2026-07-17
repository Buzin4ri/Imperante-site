/* =========================================================
   Imperante — interatividade compartilhada
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Tema ---------- */
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("imperante-theme", next); } catch (e) {}
    });
  });

  /* ---------- Menu mobile ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMobile = document.querySelector(".nav-mobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var open = navMobile.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navMobile.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header com estado de scroll ---------- */
  var header = document.querySelector(".header");
  var progress = document.querySelector("[data-scroll-progress]");
  var toTop = document.querySelector("[data-to-top]");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    if (progress) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? y / max : 0;
      progress.style.transform = "scaleX(" + p + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Revelação ao rolar ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-stagger]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores animados ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }

    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Brilho que segue o cursor ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".card--glow").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Tilt 3D ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = 8;
      el.style.transition = "transform .2s var(--ease)";
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(800px) rotateY(" + (px * max) + "deg) rotateX(" + (-py * max) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "perspective(800px) rotateY(0) rotateX(0)";
      });
    });
  }

  /* ---------- Parallax dos blobs do hero ---------- */
  if (!reduceMotion) {
    var blobs = document.querySelectorAll(".hero__blob");
    if (blobs.length) {
      window.addEventListener("scroll", function () {
        var y = window.scrollY || 0;
        blobs.forEach(function (b, i) {
          var speed = (i + 1) * 0.06;
          b.style.transform = "translateY(" + (y * speed) + "px)";
        });
      }, { passive: true });
    }
  }

  /* ---------- Abas ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));
    var pill = root.querySelector(".tablist__pill");

    function movePill(tab) {
      if (!pill) return;
      pill.style.left = tab.offsetLeft + "px";
      pill.style.width = tab.offsetWidth + "px";
    }
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      movePill(tab);
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        if (idx !== null) { e.preventDefault(); tabs[idx].focus(); select(tabs[idx]); }
      });
    });
    var initial = root.querySelector("[role='tab'][aria-selected='true']") || tabs[0];
    if (initial) { requestAnimationFrame(function () { movePill(initial); }); }
    window.addEventListener("resize", function () {
      var cur = root.querySelector("[role='tab'][aria-selected='true']");
      if (cur) movePill(cur);
    });
  });

  /* ---------- Formulário de contato (demo) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("button[type='submit']");
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      setTimeout(function () {
        if (status) status.textContent = "Mensagem pronta! (demonstração — o back-end ainda não está conectado)";
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = "Enviar mensagem"; }
      }, 700);
    });
  }
})();
