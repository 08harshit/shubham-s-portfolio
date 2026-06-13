import { projects, flatGallery } from "./projects.js";

const nav = document.querySelector("#siteNav");
const navToggle = document.querySelector("#navToggle");
const navLinks = document.querySelectorAll(".nav-links a");
const gallery = document.querySelector("#gallery");
const filterButtons = document.querySelectorAll(".filter-btn");
const preview = document.querySelector("#preview");
const previewSource = document.querySelector("#previewSource");
const previewImage = document.querySelector("#previewImage");
const previewTitle = document.querySelector("#previewTitle");
const previewCategory = document.querySelector("#previewCategory");
const closePreview = document.querySelector("#closePreview");
const previousImage = document.querySelector("#previousImage");
const nextImage = document.querySelector("#nextImage");

const categoryLabels = {
  exterior: "Exterior",
  interior: "Interior",
  masterplan: "Masterplan",
  commercial: "Commercial",
};

let activeFilter = "all";
let visibleGallery = [];
let activeImageIndex = 0;

function pictureMarkup({ webp, jpg, alt = "", loading = "lazy", className = "" }) {
  return `
    <picture>
      <source srcset="${webp}" type="image/webp" />
      <img src="${jpg}" alt="${alt}" loading="${loading}" decoding="async" class="${className}" />
    </picture>
  `;
}

function renderGallery() {
  gallery.innerHTML = projects
    .map((project) => {
      const hidden = activeFilter !== "all" && project.category !== activeFilter;
      return `
        <figure
          class="project-card${hidden ? " is-hidden" : ""}"
          role="listitem"
          data-project-id="${project.id}"
          data-category="${project.category}"
        >
          ${pictureMarkup({
            webp: project.cover.webp,
            jpg: project.cover.jpg,
            alt: `${project.title} — ${categoryLabels[project.category]} visualization`,
          })}
          <figcaption>
            <h3>${project.title}</h3>
            <p>${categoryLabels[project.category]}</p>
          </figcaption>
        </figure>
      `;
    })
    .join("");

  updateVisibleGallery();
  bindGalleryCards();
}

function updateVisibleGallery() {
  visibleGallery = flatGallery.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );
}

function bindGalleryCards() {
  gallery.querySelectorAll(".project-card:not(.is-hidden)").forEach((card) => {
    card.addEventListener("click", () => {
      const projectId = card.dataset.projectId;
      const index = visibleGallery.findIndex((item) => item.projectId === projectId);
      if (index >= 0) {
        openPreview(index);
      }
    });
  });
}

function setPreviewImage(index) {
  activeImageIndex = (index + visibleGallery.length) % visibleGallery.length;
  const item = visibleGallery[activeImageIndex];
  previewTitle.textContent = item.projectTitle;
  previewCategory.textContent = categoryLabels[item.category];

  previewSource.srcset = item.webp;
  previewImage.src = item.jpg;
  previewImage.alt = item.alt;
}

function openPreview(index) {
  setPreviewImage(index);
  preview.classList.add("is-open");
  preview.setAttribute("aria-hidden", "false");
  document.body.classList.add("preview-open");
}

function hidePreview() {
  preview.classList.remove("is-open");
  preview.setAttribute("aria-hidden", "true");
  document.body.classList.remove("preview-open");
}

function showPreviousImage() {
  setPreviewImage(activeImageIndex - 1);
}

function showNextImage() {
  setPreviewImage(activeImageIndex + 1);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderGallery();
  });
});

closePreview.addEventListener("click", hidePreview);
previousImage.addEventListener("click", showPreviousImage);
nextImage.addEventListener("click", showNextImage);

preview.addEventListener("click", (event) => {
  if (event.target === preview) {
    hidePreview();
  }
});

document.addEventListener("keydown", (event) => {
  const isPreviewOpen = preview.classList.contains("is-open");

  if (event.key === "Escape") {
    hidePreview();
    document.body.classList.remove("nav-open");
  }

  if (!isPreviewOpen) {
    return;
  }

  if (event.key === "ArrowLeft") {
    showPreviousImage();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }
});

navToggle.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  });
});

const sections = [...document.querySelectorAll("section[id]")];

function updateNavState() {
  nav.classList.toggle("is-scrolled", window.scrollY > 24);

  const scrollPosition = window.scrollY + nav.offsetHeight + 80;
  let currentSection = sections[0]?.id ?? "";

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("is-active", href === `#${currentSection}`);
  });
}

window.addEventListener("scroll", updateNavState, { passive: true });
updateNavState();
renderGallery();
