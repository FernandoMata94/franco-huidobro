// Interacciones pequeñas del wireframe
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      toggle.textContent = isOpen ? "×" : "☰";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
        toggle.textContent = "☰";
      });
    });
  }

  // Resalta enlaces internos al navegar por secciones.
  const sectionLinks = [...document.querySelectorAll('.main-nav a[href*="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href").replace(/^.*#/, "#")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionLinks.forEach((link) => {
            const target = link.getAttribute("href").split("#").pop();
            link.classList.toggle("active", target === entry.target.id);
          });
        }
      });
    }, { rootMargin: "-25% 0px -60% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  try {
    initScrollAnimations();
  } catch (err) {
    console.error("Animaciones desactivadas:", err);
    document.documentElement.classList.remove("has-gsap");
  }
});

// ---------- Animaciones de scroll (GSAP + ScrollTrigger) ----------
// Si cambias selectores aquí, actualiza también la regla .has-gsap al final de style.css.
function initScrollAnimations() {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("has-gsap"); // sin librería: el contenido se queda visible
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const $ = (selector) => gsap.utils.toArray(selector);

    // Revela elementos por lotes cuando entran al viewport (una sola vez, con cascada).
    const reveal = (selector, from, to, start = "top 88%") => {
      const els = $(selector);
      if (!els.length) return;
      gsap.set(els, from);
      ScrollTrigger.batch(els, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { duration: 0.9, ease: "power3.out", stagger: 0.12, overwrite: true, ...to }),
      });
    };

    // 1) Hero: secuencia de entrada al cargar la página
    if (document.querySelector(".hero")) {
      const heroText = $(".hero .eyebrow, .hero h1, .hero-copy h2, .hero-copy p:not(.eyebrow), .hero .button-row");
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(heroText, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, clearProps: "transform" })
        .fromTo(".hero .accent-line", { scaleX: 0, opacity: 0, transformOrigin: "left center" }, { scaleX: 1, opacity: 1, duration: 0.7 }, 0.35)
        .fromTo(".hero .portrait-placeholder", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "back.out(1.4)" }, 0.1);

      // Parallax suave del retrato mientras se hace scroll
      gsap.to(".hero .portrait-placeholder", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }

    // 2) Títulos de sección
    reveal(".section-heading > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, clearProps: "transform" });

    // 3) Bloques de texto
    reveal(
      ".body-copy p, .education-item, .skills-panel h3, .skills-panel ul, .center, .site-footer > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, clearProps: "transform" }
    );

    // 4) Tarjetas (proyectos, reconocimientos, liderazgo)
    reveal(".project-card, .honor-card, .mini-card", { y: 50, opacity: 0 }, { y: 0, opacity: 1, clearProps: "transform" });

    // 5) Etiquetas de skills, una tras otra
    reveal(".tag-list span", { y: 16, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, clearProps: "transform" });

    // 6) Imágenes: se descubren de arriba hacia abajo con un leve zoom
    //    (las de .project-image entran junto con su tarjeta)
    reveal(
      ".image-placeholder:not(.project-image)",
      { opacity: 0, scale: 1.08, clipPath: "inset(0% 0% 100% 0%)" },
      { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut", stagger: 0.15, clearProps: "transform,clipPath" }
    );

    // Todo ya tiene su estado inicial inline: se puede quitar la regla CSS de ocultado
    root.classList.remove("has-gsap");
  });

  // Recalcula posiciones cuando carguen imágenes/fuentes reales
  window.addEventListener("load", () => ScrollTrigger.refresh());
}