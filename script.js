

(function () {
  "use strict";

  
  
  
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  const preloader      = $("#preloader");
  const preloaderFill  = $("#preloaderFill");
  const preloaderCount = $("#preloaderCount");
  const preloaderBrand = $$(".preloader__brand span");
  const header         = $("#header");
  const burger         = $("#burger");
  const mobileMenu     = $("#mobileMenu");
  const cursor         = $(".cursor");
  const cursorDot      = $("#cursorDot");
  const cursorRing     = $("#cursorRing");
  const cursorLabel    = $("#cursorLabel");
  const reviewViewport = $("#reviewsViewport");
  const reviewDots     = $("#reviewDots");
  const reserveForm    = $("#reserveForm");
  const reserveSuccess = $("#reserveSuccess");

  
  
  
  const isTouch  = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  
  
  
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.6,
    autoResize: true,
  });

  
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  
  lenis.stop();

  
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-scroll]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    closeMobileMenu();
  });

  
  
  
  
  function splitChars(el) {
    const text = el.textContent.trim();
    el.innerHTML = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((c) => {
      const wrap = document.createElement("span");
      wrap.classList.add("hero__char");
      const inner = document.createElement("span");
      inner.textContent = c === " " ? "\u00A0" : c;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  }

  
  function splitWords(el) {
    const source = el.innerHTML;
    const re = /(<em[^>]*>.*?<\/em>)|([^<\s]+)/g;
    const parts = [];
    let m;
    while ((m = re.exec(source)) !== null) {
      const html = m[1] || m[0];
      parts.push(`<span class="word">${html}</span>`);
    }
    el.innerHTML = parts.join(" ");
  }

  
  
  
  function finishPreloader() {
    document.body.classList.remove("is-loading");
    lenis.start();
    ScrollTrigger.refresh();
  }

  function runPreloader() {
    
    gsap.to(preloaderBrand, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power2.out", delay: 0.25 });

    
    gsap.to(preloaderFill, { scaleX: 1, duration: 2.2, ease: "power2.inOut", delay: 0.1 });

    
    const counter = { v: 0 };
    gsap.to(counter, {
      v: 100,
      duration: 2.2,
      ease: "power2.inOut",
      delay: 0.1,
      onUpdate: () => (preloaderCount.textContent = Math.round(counter.v)),
    });

    
    gsap.to(preloader, {
      y: "-100%",
      duration: 0.9,
      ease: "power4.in",
      delay: 2.35,
      force3D: true,
      onComplete: () => {
        preloader.style.display = "none";
        finishPreloader();
        runHeroIntro();
      },
    });
  }

  function hidePreloader() {
    gsap.set(preloader, { y: "-100%" });
    preloader.style.display = "none";
    finishPreloader();
    runHeroIntro();
  }

  
  
  
  
  function setHeroHidden() {
    gsap.set($$(".hero__char span"), { y: "115%", rotateX: 15, opacity: 0, filter: "blur(10px)" });
    gsap.set($$("[data-hero-item]"), { y: 40, opacity: 0 });
    gsap.set(header, { y: -40, opacity: 0 });
  }

  function runHeroIntro() {
    const heroChars = $$(".hero__char span");
    const heroItems = $$("[data-hero-item]");

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });

    
    tl.to(
      heroChars,
      {
        y: "0%",
        rotateX: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: { each: 0.05, from: "center" },
        duration: 0.95,
      },
      0
    );

    
    heroItems.forEach((el, i) => {
      tl.to(el, { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" }, 0.35 + i * 0.16);
    });

    
    tl.to(header, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.5);
  }

  
  
  
  function initScrollReveals() {
    $$("[data-reveal]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.95, ease: "power3.out" }),
        once: true,
      });
    });

    $$("[data-reveal-clip]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power3.inOut" }),
        once: true,
      });
    });

    const lead = $(".manifesto__lead");
    if (lead) {
      lead.querySelectorAll(".word").forEach((w) => {
        ScrollTrigger.create({
          trigger: w,
          start: "top 92%",
          onEnter: () => w.classList.add("is-in"),
          once: true,
        });
      });
    }
  }

  
  
  
  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el.closest(".manifesto__stat") || el,
        start: "top 85%",
        onEnter: () =>
          gsap.to(obj, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => (el.textContent = Math.round(obj.v)),
          }),
        once: true,
      });
    });
  }

  
  
  
  function initParallax() {
    $$("[data-parallax]").forEach((el) => {
      const scope = el.closest("section") || el.parentElement || el;
      ScrollTrigger.create({
        trigger: scope,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
        onUpdate: (self) => {
          const speed = parseFloat(el.dataset.speed) || 0.1;
          gsap.set(el, { y: self.progress * speed * 160 });
        },
      });
    });
  }

  
  
  
  function initReviews() {
    const reviews = $$(".review", reviewViewport);
    if (reviews.length < 2) return;

    let current = 0;
    let timer = null;
    const interval = 5000;

    reviewDots.innerHTML = reviews
      .map((_, i) => `<i class="${i === 0 ? "is-active" : ""}" data-idx="${i}"></i>`)
      .join("");

    function goTo(idx, dir) {
      if (idx === current) return;
      const leaving = reviews[current];
      const entering = reviews[idx];
      const fromX = dir === "next" ? 40 : -40;
      const toX   = dir === "next" ? -40 : 40;

      gsap.killTweensOf([leaving, entering]);

      gsap.fromTo(entering,
        { x: fromX, opacity: 0, visibility: "visible" },
        { x: 0, opacity: 1, visibility: "visible", duration: 0.65, ease: "power3.out" });

      gsap.to(leaving, {
        x: toX, opacity: 0, visibility: "hidden",
        duration: 0.55, ease: "power2.in",
        onComplete: () => leaving.classList.remove("is-active"),
      });

      reviews[current].classList.remove("is-active");
      reviews[idx].classList.add("is-active");
      current = idx;
      $$("i", reviewDots).forEach((d, i) => d.classList.toggle("is-active", i === current));
    }

    function next() { goTo((current + 1) % reviews.length, "next"); }
    function prev() { goTo((current - 1 + reviews.length) % reviews.length, "prev"); }

    function startAuto() { if (timer) clearInterval(timer); timer = setInterval(next, interval); }
    startAuto();

    $("#reviewPrev").addEventListener("click", () => { prev(); startAuto(); });
    $("#reviewNext").addEventListener("click", () => { next(); startAuto(); });

    reviewDots.addEventListener("click", (e) => {
      const dot = e.target.closest("i");
      if (!dot) return;
      const idx = parseInt(dot.dataset.idx, 10);
      goTo(idx, idx > current ? "next" : "prev");
      startAuto();
    });

    reviewViewport.addEventListener("pointerenter", () => clearInterval(timer));
    reviewViewport.addEventListener("pointerleave", startAuto);
  }

  
  
  
  function createRipple(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY || rect.top  + rect.height / 2) - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.4;

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.position = "absolute"; 
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }

  function initForm() {
    if (!reserveForm) return;

    reserveForm.addEventListener("submit", (e) => {
      e.preventDefault();
      createRipple(e, $("#reserveSubmit"));
      gsap.to(reserveSuccess, {
        opacity: 1, visibility: "visible", duration: 0.5, ease: "power3.out",
        onStart: () => reserveSuccess.classList.add("is-visible"),
      });
      setTimeout(() => {
        gsap.to(reserveSuccess, {
          opacity: 0, visibility: "hidden", duration: 0.4,
          onComplete: () => reserveSuccess.classList.remove("is-visible"),
        });
      }, 4200);
    });
  }

  
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    createRipple(e, btn);
  });

  
  
  
  let cursorX = 0, cursorY = 0;
  let ringX = 0,   ringY = 0;

  function initCursor() {
    if (isTouch) return;

    document.addEventListener("mousemove", (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;

      
      const target = document.elementFromPoint(cursorX, cursorY);
      const interactive = target && (target.closest("a") || target.closest("button") || target.closest("[data-cursor]"));
      if (interactive) {
        const holder = target.closest("[data-cursor]");
        const type = holder ? holder.dataset.cursor : null;
        cursor.classList.add("is-hover");
        cursor.classList.remove("is-view");
        if (type === "view") { cursor.classList.add("is-view"); cursorLabel.textContent = "VIEW"; }
        else if (type === "menu") { cursor.classList.add("is-view"); cursorLabel.textContent = "MENU"; }
        else if (type === "send") { cursor.classList.add("is-view"); cursorLabel.textContent = "SEND"; }
        else if (type === "down") { cursor.classList.add("is-view"); cursorLabel.textContent = "в–ј"; }
        else if (type === "reserve") { cursor.classList.add("is-view"); cursorLabel.textContent = "BOOK"; }
        else { cursorLabel.textContent = "VIEW"; }
      } else {
        cursor.classList.remove("is-view", "is-hover");
      }
    });

    
    gsap.ticker.add(() => {
      const dt = gsap.ticker.deltaRatio();
      const ringEase = 1 - Math.pow(0.08, dt);
      const dotEase  = 1 - Math.pow(0.02, dt);
      ringX += (cursorX - ringX) * ringEase;
      ringY += (cursorY - ringY) * ringEase;
      gsap.set(cursorRing, { x: ringX, y: ringY });
      gsap.set(cursorDot, { x: cursorX, y: cursorY });
      
    });
  }

  
  
  
  function initHeader() {
    ScrollTrigger.create({
      start: 80,
      end: Number.MAX_SAFE_INTEGER,
      onToggle: (self) => header.classList.toggle("is-scrolled", self.isActive),
    });
  }

  
  
  
  function initMobileMenu() {
    if (!burger || !mobileMenu) return;
    burger.addEventListener("click", () => {
      const open = !burger.classList.contains("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      mobileMenu.classList.toggle("is-open", open);
      mobileMenu.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  function closeMobileMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  
  
  
  function initGalleryParallax() {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      $$(".g-item").forEach((item, i) => {
        const img = item.querySelector("img");
        if (!img) return;
        const speed = 0.08 + i * 0.025;
        ScrollTrigger.create({
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.6,
          onUpdate: (self) => gsap.set(img, { y: (self.progress - 0.5) * speed * 180 }),
        });
      });
    });
  }

  
  
  
  function boot() {
    gsap.registerPlugin(ScrollTrigger);

    if (isReduced) {
      gsap.globalTimeline.timeScale(1000);
    }

    
    const titleEl = $("[data-split='chars']");
    if (titleEl) splitChars(titleEl);
    const leadEl = $("[data-split='words']");
    if (leadEl) splitWords(leadEl);

    
    setHeroHidden();

    
    initCursor();
    initHeader();
    initMobileMenu();
    initParallax();
    initScrollReveals();
    initCounters();
    initReviews();
    initForm();
    initGalleryParallax();

    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    
    if (isReduced) {
      hidePreloader();
    } else {
      runPreloader();
    }
  }

  
  if (window.matchMedia("(min-width: 1024px)").matches) {
    document.documentElement.style.setProperty("scrollbar-gutter", "stable");
  }

  boot();
})();