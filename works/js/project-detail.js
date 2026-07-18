(function () {
  "use strict";

  const DATA_URL = "../data/projects.json";

  const els = {
    loading: document.getElementById("project-loading"),
    missing: document.getElementById("project-missing"),
    content: document.getElementById("project-content"),
    title: document.getElementById("project-title"),
    tag: document.getElementById("project-tag"),
    description: document.getElementById("project-description"),
    summary: document.getElementById("project-summary"),
    stacks: document.getElementById("project-stacks"),
    contribution: document.getElementById("project-contribution"),
    contributionWrap: document.getElementById("project-contribution-wrap"),
    actions: document.getElementById("project-actions"),
    gallery: document.getElementById("project-gallery"),
    galleryWrap: document.getElementById("project-gallery-wrap"),
    lightbox: document.getElementById("project-lightbox"),
    lightboxImg: document.getElementById("project-lightbox-img"),
    lightboxClose: document.getElementById("project-lightbox-close"),
    lightboxPrev: document.getElementById("project-lightbox-prev"),
    lightboxNext: document.getElementById("project-lightbox-next"),
    lightboxCounter: document.getElementById("project-lightbox-counter"),
    metaDesc: document.querySelector('meta[name="description"]'),
  };

  let galleryShots = [];
  let lightboxIndex = 0;

  function getSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    let slug = parts[parts.length - 1] || "";
    if (slug.toLowerCase() === "index.html") {
      slug = parts[parts.length - 2] || "";
    }
    return slug.toLowerCase();
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderStacks(stacks) {
    if (!els.stacks) return;
    els.stacks.innerHTML = (stacks || [])
      .map((s) => `<span class="chip">${escapeHtml(s)}</span>`)
      .join("");
  }

  function renderContribution(items) {
    if (!els.contribution || !els.contributionWrap) return;
    if (!items || !items.length) {
      hide(els.contributionWrap);
      return;
    }
    show(els.contributionWrap);
    els.contribution.innerHTML = items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  function renderActions(project) {
    if (!els.actions) return;
    const bits = [];
    if (project.live) {
      bits.push(
        `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener noreferrer" class="btn-primary">Visit live <span aria-hidden="true">↗</span></a>`
      );
    }
    if (project.github) {
      bits.push(
        `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer" class="btn-ghost">GitHub <span aria-hidden="true">↗</span></a>`
      );
    }
    els.actions.innerHTML = bits.join("");
    els.actions.hidden = bits.length === 0;
  }

  function updateLightboxNav() {
    const total = galleryShots.length;
    const multi = total > 1;
    if (els.lightboxPrev) {
      els.lightboxPrev.hidden = !multi;
      els.lightboxPrev.disabled = !multi;
    }
    if (els.lightboxNext) {
      els.lightboxNext.hidden = !multi;
      els.lightboxNext.disabled = !multi;
    }
    if (els.lightboxCounter) {
      if (multi) {
        els.lightboxCounter.hidden = false;
        els.lightboxCounter.textContent = `${lightboxIndex + 1} / ${total}`;
      } else {
        els.lightboxCounter.hidden = true;
      }
    }
  }

  function showLightboxAt(index) {
    if (!galleryShots.length || !els.lightbox || !els.lightboxImg) return;
    lightboxIndex = ((index % galleryShots.length) + galleryShots.length) % galleryShots.length;
    const shot = galleryShots[lightboxIndex];
    els.lightboxImg.src = shot.src;
    els.lightboxImg.alt = shot.alt || "";
    updateLightboxNav();
  }

  function openLightbox(index) {
    if (!els.lightbox || !els.lightboxImg || !galleryShots.length) return;
    showLightboxAt(index);
    show(els.lightbox);
    document.body.style.overflow = "hidden";
    els.lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!els.lightbox || !els.lightboxImg) return;
    hide(els.lightbox);
    els.lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  function lightboxPrev() {
    showLightboxAt(lightboxIndex - 1);
  }

  function lightboxNext() {
    showLightboxAt(lightboxIndex + 1);
  }

  function renderGallery(shots) {
    if (!els.gallery || !els.galleryWrap) return;
    galleryShots = (shots || []).map((shot, i) => ({
      src: shot.src,
      alt: shot.alt || `Screenshot ${i + 1}`,
    }));

    if (!galleryShots.length) {
      hide(els.galleryWrap);
      return;
    }
    show(els.galleryWrap);
    els.gallery.innerHTML = galleryShots
      .map((shot, i) => {
        const src = escapeHtml(shot.src);
        const alt = escapeHtml(shot.alt);
        return `<button type="button" class="shot" data-index="${i}" aria-label="View ${alt}">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
        </button>`;
      })
      .join("");

    els.gallery.querySelectorAll(".shot").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLightbox(Number(btn.getAttribute("data-index")));
      });
    });
  }

  function animateIn() {
    if (!window.gsap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = document.querySelectorAll("#project-content [data-anim]");
    window.gsap.from(nodes, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
    });
  }

  function render(project) {
    document.title = `${project.title} | Divyadharshini N`;
    if (els.metaDesc) {
      els.metaDesc.setAttribute("content", project.description || "");
    }
    if (els.title) els.title.textContent = project.title;
    if (els.tag) els.tag.textContent = project.tag || "";
    if (els.description) els.description.textContent = project.description || "";
    if (els.summary) els.summary.textContent = project.summary || "";

    renderStacks(project.stacks);
    renderContribution(project.contribution);
    renderActions(project);
    renderGallery(project.screenshots);

    hide(els.loading);
    hide(els.missing);
    show(els.content);
    animateIn();
  }

  function renderMissing() {
    hide(els.loading);
    hide(els.content);
    show(els.missing);
    document.title = "Project not found | Divyadharshini N";
  }

  function bindLightbox() {
    els.lightboxClose?.addEventListener("click", closeLightbox);
    els.lightboxPrev?.addEventListener("click", (e) => {
      e.stopPropagation();
      lightboxPrev();
    });
    els.lightboxNext?.addEventListener("click", (e) => {
      e.stopPropagation();
      lightboxNext();
    });
    els.lightbox?.addEventListener("click", (e) => {
      if (e.target === els.lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!els.lightbox || els.lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    });
  }

  async function init() {
    bindLightbox();
    const slug = getSlug();
    if (!slug) {
      renderMissing();
      return;
    }

    try {
      const res = await fetch(DATA_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || [];
      const project = list.find((p) => (p.slug || "").toLowerCase() === slug);
      if (!project) {
        renderMissing();
        return;
      }
      render(project);
    } catch (err) {
      console.error("Failed to load project data:", err);
      renderMissing();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
