const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const dropdowns = document.querySelectorAll(".nav-dropdown");
const lightboxImages = document.querySelectorAll(".news-card img, .gallery-item img");
const galleryFilters = document.querySelectorAll(".gallery-filter");
const galleryItems = document.querySelectorAll(".gallery-item");
const sponsorSlides = document.querySelectorAll(".sponsor-rotator img");

if (header && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
    });
  });
}

dropdowns.forEach((dropdown) => {
  const dropdownToggle = dropdown.querySelector(".nav-dropdown-toggle");
  const dropdownLinks = dropdown.querySelectorAll(".nav-dropdown-menu a");

  dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    dropdownToggle.setAttribute("aria-expanded", String(isOpen));
  });

  dropdownLinks.forEach((link) => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("is-open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("click", () => {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
  });
});

if (galleryFilters.length > 0 && galleryItems.length > 0) {
  const galleryFilterBar = document.querySelector(".gallery-filters");
  const applyGalleryFilter = (activeFilter) => {
    const filterToApply = activeFilter || "all";

    galleryFilters.forEach((button) => {
      const isActive = button.dataset.galleryFilter === filterToApply;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    galleryItems.forEach((item) => {
      const category = item.dataset.category || "";
      const isVisible = filterToApply === "all" || category === filterToApply;

      item.hidden = !isVisible;
      item.classList.toggle("is-hidden", !isVisible);
    });
  };

  galleryFilterBar?.addEventListener("click", (event) => {
    const filterButton = event.target.closest(".gallery-filter");

    if (!filterButton) {
      return;
    }

    applyGalleryFilter(filterButton.dataset.galleryFilter || "all");
  });

  const requestedFilter = new URLSearchParams(window.location.search).get("filter");
  const hasRequestedFilter = Array.from(galleryFilters).some((button) => button.dataset.galleryFilter === requestedFilter);

  if (hasRequestedFilter) {
    applyGalleryFilter(requestedFilter);
  }
}

if (lightboxImages.length > 0) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Bildansicht");
  lightbox.innerHTML = `
    <button type="button" aria-label="Bild schließen">&times;</button>
    <img src="" alt="" />
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector("button");

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  };

  lightboxImages.forEach((image) => {
    image.addEventListener("click", () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add("is-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

if (sponsorSlides.length > 1) {
  let activeSponsorIndex = 0;

  sponsorSlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeSponsorIndex);
  });

  setInterval(() => {
    sponsorSlides[activeSponsorIndex].classList.remove("is-active");
    activeSponsorIndex = (activeSponsorIndex + 1) % sponsorSlides.length;
    sponsorSlides[activeSponsorIndex].classList.add("is-active");
  }, 5000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  }
});
